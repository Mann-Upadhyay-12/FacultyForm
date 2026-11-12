import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback, useMemo } from 'react';
import { FormData, initialFormData, normalizeFormData } from '@/types/formTypes';
import { ApiScores, computeScores } from '@/lib/scoring';
import { Issue, validateForm } from '@/lib/validation';
import { useAuth } from '@/hooks/use-auth';
import { API_URL, apiFetch, ApiError } from '@/lib/api';

/** Keys of FormData whose value is an array of row objects. */
export type ArrayKey = {
  [K in keyof FormData]: FormData[K] extends Array<object> ? K : never;
}[keyof FormData];

/** Keys of FormData whose value is a plain string. */
export type StringKey = {
  [K in keyof FormData]: FormData[K] extends string ? K : never;
}[keyof FormData];

export type NestedKey = 'questionPapersSet' | 'abEvaluated' | 'studentsExamined' | 'invigilation';

type Row<K extends ArrayKey> = FormData[K][number];

export interface SubmissionInfo {
  submittedAt: string;
  id?: string;
  mode: 'server' | 'local';
}

export interface SubmitResult {
  ok: boolean;
  message: string;
}

interface FormContextType {
  formData: FormData;
  lastSaved: Date | null;
  isSaving: boolean;
  submission: SubmissionInfo | null;
  apiScores: ApiScores;
  issues: Issue[];
  handleChange: (field: StringKey, value: string) => void;
  setCertified: (value: boolean) => void;
  handleNestedChange: (section: NestedKey, subSection: string, key: string, value: string) => void;
  handleArrayChange: <K extends ArrayKey>(arrayName: K, index: number, field: keyof Row<K> & string, value: string) => void;
  addArrayItem: <K extends ArrayKey>(arrayName: K, template: Row<K>) => void;
  removeArrayItem: <K extends ArrayKey>(arrayName: K, index: number, template: Row<K>) => void;
  submitForm: () => Promise<SubmitResult>;
  /** Saves locally right away and to the signed-in account. */
  saveDraftNow: () => Promise<void>;
  resetForm: () => void;
  exportJSON: () => void;
  importJSON: (file: File) => Promise<SubmitResult>;
  /** Saves the draft to the account, clears this browser's copy, then logs out. */
  signOut: () => Promise<void>;
  userEmail: string;
}

// Drafts written before login existed used these shared keys. Each account now
// gets its own `${LEGACY_KEY}:${userId}` keys.
const LEGACY_KEY = 'juit_faculty_assessment_draft_v1';

function storageKeys(userId: string) {
  const base = `${LEGACY_KEY}:${userId}`;
  return { draft: base, timestamp: `${base}_timestamp`, submitted: `${base}_submitted` };
}

interface ServerAssessment {
  id: string;
  status: string;
  formData: unknown;
  submittedAt: string | null;
  updatedAt: string | null;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn('localStorage unavailable:', err);
    return false;
  }
}

/** Hands a draft saved before login existed to the first account that signs in on this browser. */
function migrateLegacyDraft(keys: ReturnType<typeof storageKeys>) {
  const legacy = readStorage(LEGACY_KEY);
  if (legacy === null) return;
  if (readStorage(keys.draft) === null) {
    writeStorage(keys.draft, legacy);
    const t = readStorage(`${LEGACY_KEY}_timestamp`);
    if (t) writeStorage(keys.timestamp, t);
    const s = readStorage(`${LEGACY_KEY}_submitted`);
    if (s) writeStorage(keys.submitted, s);
  }
  writeStorage(LEGACY_KEY, null);
  writeStorage(`${LEGACY_KEY}_timestamp`, null);
  writeStorage(`${LEGACY_KEY}_submitted`, null);
}

function readSubmission(key: string): SubmissionInfo | null {
  const raw = readStorage(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.submittedAt === 'string') return parsed;
  } catch {
    // v1 stored a bare ISO timestamp
    if (!isNaN(Date.parse(raw))) return { submittedAt: raw, mode: 'local' };
  }
  return null;
}

export function FormProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const keys = useMemo(() => storageKeys(user?.id ?? 'anonymous'), [user?.id]);
  const STORAGE_KEY = keys.draft;
  const TIMESTAMP_KEY = keys.timestamp;
  const SUBMITTED_KEY = keys.submitted;

  const [formData, setFormData] = useState<FormData>(() => {
    migrateLegacyDraft(keys);
    const saved = readStorage(STORAGE_KEY);
    if (!saved) return initialFormData;
    try {
      return normalizeFormData(JSON.parse(saved));
    } catch (err) {
      console.warn('Failed to restore draft from localStorage:', err);
      return initialFormData;
    }
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const t = readStorage(TIMESTAMP_KEY);
    return t ? new Date(t) : null;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [submission, setSubmission] = useState<SubmissionInfo | null>(() => readSubmission(SUBMITTED_KEY));
  const lastWritten = useRef<string>(JSON.stringify(formData));
  // What the form held when it was loaded, to tell "user typed" from "restored".
  const loadedJson = useRef<string>(lastWritten.current);
  const localSavedAt = useRef<number | null>(lastSaved ? lastSaved.getTime() : null);

  const persist = useCallback((data: FormData) => {
    const json = JSON.stringify(data);
    const ok = writeStorage(STORAGE_KEY, json);
    if (ok) {
      lastWritten.current = json;
      const now = new Date();
      writeStorage(TIMESTAMP_KEY, now.toISOString());
      setLastSaved(now);
    }
  }, []);

  // Debounced auto-save. Only runs when the data actually differs from what
  // was last written, so opening the page never writes a draft.
  const pending = useRef(false);
  useEffect(() => {
    if (JSON.stringify(formData) === lastWritten.current) {
      // e.g. an edit was undone before the debounce fired
      pending.current = false;
      setIsSaving(false);
      return;
    }
    pending.current = true;
    setIsSaving(true);
    const timer = setTimeout(() => {
      persist(formData);
      pending.current = false;
      setIsSaving(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [formData, persist]);


  // Flush an unsaved edit if the tab is closed during the debounce window.
  // Only when one is pending, so an idle tab never overwrites a newer draft.
  const latest = useRef(formData);
  latest.current = formData;
  useEffect(() => {
    const flush = () => {
      if (pending.current) writeStorage(STORAGE_KEY, JSON.stringify(latest.current));
    };
    window.addEventListener('beforeunload', flush);
    return () => window.removeEventListener('beforeunload', flush);
  }, []);

  // Restore the account's saved assessment from the server (works across devices),
  // unless this browser holds newer local edits the server hasn't seen.
  useEffect(() => {
    let cancelled = false;
    apiFetch<{ data: ServerAssessment | null }>('/api/assessments/me')
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.status === 'submitted' && data.submittedAt) {
          const info: SubmissionInfo = { submittedAt: data.submittedAt, id: data.id, mode: 'server' };
          writeStorage(SUBMITTED_KEY, JSON.stringify(info));
          setSubmission(info);
        }
        const serverTime = data.updatedAt ? Date.parse(data.updatedAt) : 0;
        const localIsNewer = localSavedAt.current !== null && localSavedAt.current > serverTime;
        const userEdited = JSON.stringify(latest.current) !== loadedJson.current;
        if (localIsNewer || userEdited) return;
        const restored = normalizeFormData(data.formData);
        const json = JSON.stringify(restored);
        lastWritten.current = json;
        loadedJson.current = json;
        setFormData(restored);
      })
      .catch((err) => console.warn('Could not load saved assessment from server:', err));
    return () => {
      cancelled = true;
    };
  }, [SUBMITTED_KEY]);

  // Free hosting tiers put the API to sleep when idle; waking it now means
  // it's ready by the time the teacher submits.
  useEffect(() => {
    if (API_URL) fetch(`${API_URL}/health`, { mode: 'cors' }).catch(() => {});
  }, []);

  const handleChange = useCallback((field: StringKey, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setCertified = useCallback((value: boolean) => {
    setFormData((prev) => ({ ...prev, certified: value }));
  }, []);

  const handleNestedChange = useCallback((section: NestedKey, subSection: string, key: string, value: string) => {
    setFormData((prev) => {
      const sectionData = prev[section] as unknown as Record<string, unknown>;
      const next = key
        ? { ...sectionData, [subSection]: { ...(sectionData[subSection] as Record<string, string>), [key]: value } }
        : { ...sectionData, [subSection]: value };
      return { ...prev, [section]: next };
    });
  }, []);

  const handleArrayChange = useCallback(
    <K extends ArrayKey>(arrayName: K, index: number, field: keyof Row<K> & string, value: string) => {
      setFormData((prev) => {
        const arr = [...(prev[arrayName] as unknown as Record<string, string>[])];
        arr[index] = { ...arr[index], [field]: value };
        return { ...prev, [arrayName]: arr };
      });
    },
    []
  );

  const addArrayItem = useCallback(<K extends ArrayKey>(arrayName: K, template: Row<K>) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] as unknown as object[]), { ...template }],
    }));
  }, []);

  /** Removes a row; removing the last remaining row clears it instead. */
  const removeArrayItem = useCallback(<K extends ArrayKey>(arrayName: K, index: number, template: Row<K>) => {
    setFormData((prev) => {
      const arr = prev[arrayName] as unknown as object[];
      const next = arr.length <= 1 ? [{ ...template }] : arr.filter((_, i) => i !== index);
      return { ...prev, [arrayName]: next };
    });
  }, []);

  const apiScores = useMemo(() => computeScores(formData), [formData]);
  const issues = useMemo(() => validateForm(formData, apiScores), [formData, apiScores]);

  const saveDraftToServer = useCallback(
    () =>
      apiFetch('/api/assessments/me', {
        method: 'PUT',
        body: JSON.stringify({
          academicYear: formData.academicYear,
          formData,
          apiScores: { total: apiScores.total, claimedTotal: apiScores.claimedTotal },
        }),
      }),
    [formData, apiScores]
  );

  const saveDraftNow = useCallback(async () => {
    persist(formData);
    try {
      await saveDraftToServer();
    } catch (err) {
      console.warn('Draft saved in this browser; saving to your account failed:', err);
    }
  }, [formData, persist, saveDraftToServer]);

  const signOut = useCallback(async () => {
    try {
      await saveDraftToServer();
      // Only remove this browser's copy once the account has it.
      writeStorage(STORAGE_KEY, null);
      writeStorage(TIMESTAMP_KEY, null);
      writeStorage(SUBMITTED_KEY, null);
    } catch (err) {
      console.warn('Could not sync the draft before logging out; keeping the copy in this browser:', err);
    }
    await logout();
  }, [saveDraftToServer, logout, STORAGE_KEY, TIMESTAMP_KEY, SUBMITTED_KEY]);

  const resetForm = useCallback(() => {
    if (!window.confirm('Reset all form fields? This permanently clears the draft saved in this browser.')) return;
    setFormData({ ...initialFormData });
    writeStorage(STORAGE_KEY, null);
    writeStorage(TIMESTAMP_KEY, null);
    writeStorage(SUBMITTED_KEY, null);
    setLastSaved(null);
    setSubmission(null);
  }, [STORAGE_KEY, TIMESTAMP_KEY, SUBMITTED_KEY]);

  const exportJSON = useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const who = formData.name.trim() ? formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_') : 'draft';
      anchor.href = url;
      anchor.download = `faculty_assessment_${who}_${formData.academicYear}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Export JSON error:', err);
    }
  }, [formData]);

  const importJSON = useCallback(async (file: File): Promise<SubmitResult> => {
    try {
      const parsed = JSON.parse(await file.text());
      const data = normalizeFormData(parsed?.formData ?? parsed);
      setFormData(data);
      return { ok: true, message: `Loaded data for ${data.name || 'unnamed faculty'} (${data.academicYear}).` };
    } catch {
      return { ok: false, message: 'That file is not a valid assessment backup (.json).' };
    }
  }, []);

  const submitForm = useCallback(async (): Promise<SubmitResult> => {
    const errors = issues.filter((i) => i.level === 'error');
    if (errors.length) {
      return { ok: false, message: `Please fix ${errors.length} error${errors.length > 1 ? 's' : ''} before submitting.` };
    }
    if (!formData.certified) {
      return { ok: false, message: 'Please tick the certification box before submitting.' };
    }

    persist(formData);
    const payload = {
      id: submission?.id,
      academicYear: formData.academicYear,
      status: 'submitted',
      formData,
      apiScores: {
        total: apiScores.total,
        claimedTotal: apiScores.claimedTotal,
        breakdown: Object.fromEntries(apiScores.rows.map((r) => [r.key, r.counted])),
      },
    };

    // The server links the submission to the signed-in account.
    let info: SubmissionInfo;
    try {
      const body = await apiFetch<{ data?: { id?: string; submittedAt?: string } }>('/api/assessments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      info = { submittedAt: body.data?.submittedAt || new Date().toISOString(), id: body.data?.id, mode: 'server' };
    } catch (err) {
      const e = err as ApiError;
      if (e.code === 'NETWORK') {
        return { ok: false, message: 'Could not reach the server. Your draft is saved — try again, or print/export a copy.' };
      }
      return { ok: false, message: e.message || 'Submission failed. Please try again.' };
    }

    writeStorage(SUBMITTED_KEY, JSON.stringify(info));
    setSubmission(info);
    return {
      ok: true,
      message:
        info.mode === 'server'
          ? 'Your assessment has been submitted for HoD verification.'
          : 'Your assessment has been finalised on this device. Print or export it to hand in.',
    };
  }, [issues, formData, apiScores, submission, persist, SUBMITTED_KEY]);

  return (
    <FormContext.Provider
      value={{
        formData,
        lastSaved,
        isSaving,
        submission,
        apiScores,
        issues,
        handleChange,
        setCertified,
        handleNestedChange,
        handleArrayChange,
        addArrayItem,
        removeArrayItem,
        submitForm,
        saveDraftNow,
        resetForm,
        exportJSON,
        importJSON,
        signOut,
        userEmail: user?.email ?? '',
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}
