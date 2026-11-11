import { useState, useCallback } from 'react';
import type { FormData } from '@/types/assessment';

const initialFormData: FormData = {
  // Personal Info
  name: '',
  department: '',
  qualifications: '',
  designation: '',
  joiningDate: '',
  firstDesignation: '',
  payScale: '',
  specialization: '',
  additionalQualification: '',
  higherStudies: '',

  // Programs
  programs: [{ title: '', dates: '', agency: '', attendedOrganized: '', duration: '', api: '' }],

  // Teaching
  oddSemester: [{ courseCode: '', courseTitle: '', contactHours: '', scheduled: '', engaged: '' }],
  evenSemester: [{ courseCode: '', courseTitle: '', contactHours: '', scheduled: '', engaged: '' }],
  oddExcessApi: '',
  evenExcessApi: '',
  resources: [{ courseCode: '', consulted: '', prescribed: '', additional: '' }],
  participatory: '',
  modification: '',
  coverageBeyond: '',
  teachingApi: '',
  projectsGuided: '',
  studentsGuided: '',
  projectGuidanceApi: '',

  // Examination
  questionPapersSet: { ug: { t1: '', t2: '', t3: '' }, pg: { t1: '', t2: '', t3: '' } },
  abEvaluated: { ug: '', pg: '' },
  studentsExamined: { ug: '', pg: '' },
  invigilation: { allotted: { t1: '', t2: '', t3: '' }, performed: { t1: '', t2: '', t3: '' } },
  examinationApi: '',

  // Activities
  studentActivities: [{ activity: '', api: '' }],
  departmentActivities: [{ activity: '', api: '' }],
  instituteActivities: [{ activity: '', api: '' }],
  lectures: '',
  articles: '',

  // Research
  publications: [{ authors: '', title: '', reference: '', type: '', api: '' }],
  books: [{ authors: '', title: '', reference: '', type: '', api: '' }],

  // Projects
  researchProjects: [{ title: '', agency: '', duration: '', amount: '', role: '', api: '' }],

  // Guidance
  guidance: [{ enrolName: '', title: '', jointSupervisors: '', level: '', status: '', api: '' }],

  // Other
  membership: [{ body: '', idNumber: '', api: '' }],
  otherInfo: '',
  enclosures: ''
};

export function useFormState() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingFields, setEditingFields] = useState<Record<string, boolean>>({});

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData((prev: FormData) => ({ ...prev, [field]: value }));
  }, []);

  const handleNestedChange = useCallback((
    section: keyof FormData,
    subSection: string,
    key: string,
    value: string
  ) => {
    setFormData((prev: FormData) => {
      const sectionData = prev[section] as unknown as Record<string, unknown>;
      if (key) {
        return {
          ...prev,
          [section]: {
            ...sectionData,
            [subSection]: {
              ...(sectionData[subSection] as Record<string, unknown>),
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

  const handleArrayChange = useCallback(<T extends Record<string, unknown>>(
    arrayName: keyof FormData,
    index: number,
    field: keyof T,
    value: string
  ) => {
    setFormData((prev: FormData) => {
      const arr = prev[arrayName] as unknown as T[];
      const newArray = [...arr];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [arrayName]: newArray };
    });
  }, []);

  const addArrayItem = useCallback(<T extends Record<string, unknown>>(
    arrayName: keyof FormData,
    template: T
  ) => {
    setFormData((prev: FormData) => {
      const arr = prev[arrayName] as unknown as T[];
      return {
        ...prev,
        [arrayName]: [...arr, template]
      };
    });
  }, []);

  const removeArrayItem = useCallback((arrayName: keyof FormData, index: number) => {
    setFormData((prev: FormData) => {
      const arr = prev[arrayName] as unknown as unknown[];
      return {
        ...prev,
        [arrayName]: arr.filter((_, i) => i !== index)
      };
    });
  }, []);

  const toggleEdit = useCallback((field: string) => {
    setEditingFields(prev => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const isEditing = useCallback((field: string) => {
    return editingFields[field] || false;
  }, [editingFields]);

  return {
    formData,
    handleChange,
    handleNestedChange,
    handleArrayChange,
    addArrayItem,
    removeArrayItem,
    toggleEdit,
    isEditing,
    setFormData
  };
}
