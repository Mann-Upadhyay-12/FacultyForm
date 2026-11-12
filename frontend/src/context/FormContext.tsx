import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo, useRef } from 'react';
import { FormData, initialFormData } from '@/types/formTypes';
import { useAuth } from '@/hooks/use-auth';
import { apiFetch, ApiError } from '@/lib/api';

export interface ApiScores {
  programs: number;
  teaching: number;
  examination: number;
  activities: number;
  research: number;
  projects: number;
  guidance: number;
  other: number;
  total: number;
}

interface FormContextType {
  formData: FormData;
  isEditing: Record<string, boolean>;
  lastSaved: Date | null;
  isSaving: boolean;
  isSubmitted: boolean;
  apiScores: ApiScores;
  handleEdit: (field: string) => void;
  handleChange: (field: keyof FormData, value: string) => void;
  handleNestedChange: (section: string, subSection: string, key: string, value: string) => void;
  handleArrayChange: (arrayName: keyof FormData, index: number, field: string, value: string) => void;
  addArrayItem: (arrayName: keyof FormData, template: Record<string, string>) => void;
  removeArrayItem: (arrayName: keyof FormData, index: number) => void;
  /** Saves to the signed-in account; resolves to an error message, or null on success. */
  handleSubmit: (e?: React.FormEvent) => Promise<string | null>;
  saveDraftNow: () => Promise<void>;
  resetForm: () => void;
  exportJSON: () => void;
  /** Saves the draft to the account, clears this browser's copy, then logs out. */
  signOut: () => Promise<void>;
  userEmail: string;
}

// Base key for the local draft cache. Each account gets its own `${BASE}:${userId}` key.
const LEGACY_STORAGE_KEY = 'juit_faculty_assessment_draft_v1';
const ACADEMIC_YEAR = '2023-2024';

interface ServerAssessment {
  formData: Partial<FormData>;
  status: string;
  updatedAt: string;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const parseApi = (val?: string): number => {
  if (!val) return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

export function FormProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const STORAGE_KEY = `${LEGACY_STORAGE_KEY}:${user?.id ?? 'anonymous'}`;

  // Initialize from this account's local draft if present
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      let saved = localStorage.getItem(STORAGE_KEY);
      // One-time migration: drafts written before login existed used a shared key.
      // Hand that draft to the first account that signs in on this browser.
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!saved && legacy) {
        saved = legacy;
        localStorage.setItem(STORAGE_KEY, legacy);
        const legacyTime = localStorage.getItem(`${LEGACY_STORAGE_KEY}_timestamp`);
        if (legacyTime) localStorage.setItem(`${STORAGE_KEY}_timestamp`, legacyTime);
      }
      if (legacy) {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        localStorage.removeItem(`${LEGACY_STORAGE_KEY}_timestamp`);
        localStorage.removeItem(`${LEGACY_STORAGE_KEY}_submitted`);
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...initialFormData, ...parsed };
      }
    } catch (err) {
      console.warn('Failed to restore draft from localStorage:', err);
    }
    return initialFormData;
  });

  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    try {
      const savedTime = localStorage.getItem(`${STORAGE_KEY}_timestamp`);
      return savedTime ? new Date(savedTime) : null;
    } catch {
      return null;
    }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Local draft time as it was when the page loaded (before autosave touches it).
  const initialLocalSavedAt = useRef<number | null>(lastSaved ? lastSaved.getTime() : null);
  // The last form value that came from storage/server rather than from the user.
  const loadedFormData = useRef<FormData>(formData);
  const editedSinceLoad = useRef(false);

  // Restore the account's saved assessment from the server (works across devices).
  useEffect(() => {
    let cancelled = false;
    apiFetch<{ data: ServerAssessment | null }>(`/api/assessments/me?academicYear=${ACADEMIC_YEAR}`)
      .then(({ data }) => {
        if (cancelled || !data) return;
        if (data.status === 'submitted') setIsSubmitted(true);
        const serverTime = new Date(data.updatedAt).getTime();
        const localIsNewer = initialLocalSavedAt.current !== null && initialLocalSavedAt.current > serverTime;
        // Never clobber edits made locally that the server hasn't seen yet.
        if (!localIsNewer && !editedSinceLoad.current) {
          const restored = { ...initialFormData, ...data.formData };
          loadedFormData.current = restored;
          setFormData(restored);
        }
      })
      .catch((err) => console.warn('Could not load saved assessment from server:', err));
    return () => {
      cancelled = true;
    };
  }, []);

  // Auto-save debounced to localStorage
  useEffect(() => {
    if (formData === loadedFormData.current) return; // nothing changed by the user yet
    editedSinceLoad.current = true;
    setIsSaving(true);
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        const now = new Date();
        localStorage.setItem(`${STORAGE_KEY}_timestamp`, now.toISOString());
        setLastSaved(now);
      } catch (err) {
        console.warn('Error saving to localStorage:', err);
      } finally {
        setIsSaving(false);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData, STORAGE_KEY]);

  const handleEdit = useCallback((field: string) => {
    setIsEditing((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleNestedChange = useCallback((section: string, subSection: string, key: string, value: string) => {
    setFormData((prev) => {
      const sectionData = (prev[section as keyof FormData] || {}) as Record<string, unknown>;
      if (key) {
        const subData = ((sectionData[subSection] as Record<string, unknown>) || {});
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [subSection]: {
              ...subData,
              [key]: value
            }
          }
        };
      }
      return {
        ...prev,
        [section]: {
          ...sectionData,
          [subSection]: value
        }
      };
    });
  }, []);

  const handleArrayChange = useCallback((arrayName: keyof FormData, index: number, field: string, value: string) => {
    setFormData((prev) => {
      const arr = [...((prev[arrayName] as unknown as Record<string, string>[]) || [])];
      arr[index] = { ...(arr[index] || {}), [field]: value };
      return { ...prev, [arrayName]: arr };
    });
  }, []);

  const addArrayItem = useCallback((arrayName: keyof FormData, template: Record<string, string>) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...((prev[arrayName] as unknown as Record<string, string>[]) || []), template]
    }));
  }, []);

  const removeArrayItem = useCallback((arrayName: keyof FormData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: ((prev[arrayName] as unknown as Record<string, string>[]) || []).filter((_, i) => i !== index)
    }));
  }, []);

  // Compute API Scores across all sections
  const apiScores: ApiScores = useMemo(() => {
    const programs = (formData.programs || []).reduce((acc, p) => acc + parseApi(p.api), 0);
    const teaching =
      parseApi(formData.oddExcessApi) +
      parseApi(formData.evenExcessApi) +
      parseApi(formData.teachingApi) +
      parseApi(formData.projectGuidanceApi);
    const examination = parseApi(formData.examinationApi);
    const activities =
      (formData.studentActivities || []).reduce((acc, a) => acc + parseApi(a.api), 0) +
      (formData.departmentActivities || []).reduce((acc, a) => acc + parseApi(a.api), 0) +
      (formData.instituteActivities || []).reduce((acc, a) => acc + parseApi(a.api), 0);
    const research =
      (formData.publications || []).reduce((acc, pub) => acc + parseApi(pub.api), 0) +
      (formData.books || []).reduce((acc, b) => acc + parseApi(b.api), 0);
    const projects = (formData.researchProjects || []).reduce((acc, p) => acc + parseApi(p.api), 0);
    const guidance = (formData.guidance || []).reduce((acc, g) => acc + parseApi(g.api), 0);
    const other = (formData.membership || []).reduce((acc, m) => acc + parseApi(m.api), 0);

    const total = programs + teaching + examination + activities + research + projects + guidance + other;

    return {
      programs,
      teaching,
      examination,
      activities,
      research,
      projects,
      guidance,
      other,
      total
    };
  }, [formData]);

  const saveDraftToServer = useCallback(
    () =>
      apiFetch('/api/assessments/me', {
        method: 'PUT',
        body: JSON.stringify({ formData, apiScores, academicYear: ACADEMIC_YEAR })
      }),
    [formData, apiScores]
  );

  const saveDraftNow = useCallback(async () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      const now = new Date();
      localStorage.setItem(`${STORAGE_KEY}_timestamp`, now.toISOString());
      setLastSaved(now);
    } catch (err) {
      console.warn('Manual draft save error:', err);
    }
    setIsSaving(true);
    try {
      await saveDraftToServer();
    } catch (err) {
      console.warn('Draft saved locally; server save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [formData, saveDraftToServer, STORAGE_KEY]);

  const signOut = useCallback(async () => {
    try {
      await saveDraftToServer();
      // Only remove this browser's copy once the account has it.
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`${STORAGE_KEY}_timestamp`);
      localStorage.removeItem(`${STORAGE_KEY}_submitted`);
    } catch (err) {
      console.warn('Could not sync draft before logout; keeping local copy:', err);
    }
    await logout();
  }, [saveDraftToServer, logout, STORAGE_KEY]);

  const resetForm = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all form fields? This will clear your current draft.')) {
      setFormData(initialFormData);
      setIsEditing({});
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}_timestamp`);
      } catch (e) {
        console.warn(e);
      }
      setLastSaved(null);
      setIsSubmitted(false);
    }
  }, [STORAGE_KEY]);

  const exportJSON = useCallback(() => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(formData, null, 2));
      const downloadAnchor = document.createElement('a');
      const filename = `faculty_assessment_${formData.name ? formData.name.toLowerCase().replace(/\s+/g, '_') : 'draft'}_2024.json`;
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Export JSON error:', err);
    }
  }, [formData]);

  const handleSubmit = useCallback(async (e?: React.FormEvent): Promise<string | null> => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validation check for primary identification
    if (!formData.name.trim()) {
      return 'Please enter your Faculty Name in the Personal Info section before submitting.';
    }

    try {
      // The server links the submission to the signed-in account.
      await apiFetch('/api/assessments', {
        method: 'POST',
        body: JSON.stringify({ formData, apiScores, academicYear: ACADEMIC_YEAR })
      });
    } catch (err) {
      return (err as ApiError).message || 'Submission failed. Please try again.';
    }

    setIsSubmitted(true);
    try {
      localStorage.setItem(`${STORAGE_KEY}_submitted`, new Date().toISOString());
    } catch (err) {
      console.warn(err);
    }
    return null;
  }, [formData, apiScores, STORAGE_KEY]);

  return (
    <FormContext.Provider value={{
      formData,
      isEditing,
      lastSaved,
      isSaving,
      isSubmitted,
      apiScores,
      handleEdit,
      handleChange,
      handleNestedChange,
      handleArrayChange,
      addArrayItem,
      removeArrayItem,
      handleSubmit,
      saveDraftNow,
      resetForm,
      exportJSON,
      signOut,
      userEmail: user?.email ?? ''
    }}>
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
