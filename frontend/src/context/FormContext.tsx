import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { FormData, initialFormData } from '@/types/formTypes';

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
  handleSubmit: (e?: React.FormEvent) => void;
  saveDraftNow: () => void;
  resetForm: () => void;
  exportJSON: () => void;
}

const STORAGE_KEY = 'juit_faculty_assessment_draft_v1';

const FormContext = createContext<FormContextType | undefined>(undefined);

const parseApi = (val?: string): number => {
  if (!val) return 0;
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
};

export function FormProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage if present
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
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

  // Auto-save debounced to localStorage
  useEffect(() => {
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
  }, [formData]);

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

  const saveDraftNow = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      const now = new Date();
      localStorage.setItem(`${STORAGE_KEY}_timestamp`, now.toISOString());
      setLastSaved(now);
    } catch (err) {
      console.warn('Manual draft save error:', err);
    }
  }, [formData]);

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
  }, []);

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

  const handleSubmit = useCallback((e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validation check for primary identification
    if (!formData.name.trim()) {
      alert('Please enter your Faculty Name in the Personal Info section before submitting.');
      return;
    }

    setIsSubmitted(true);
    console.log('Assessment Form ready for backend submission:', {
      formData,
      apiScores,
      submittedAt: new Date().toISOString()
    });

    // Also persist submitted state to storage
    try {
      localStorage.setItem(`${STORAGE_KEY}_submitted`, new Date().toISOString());
    } catch (err) {
      console.warn(err);
    }
  }, [formData, apiScores]);

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
      exportJSON
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
