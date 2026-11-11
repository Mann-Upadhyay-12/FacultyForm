
// Types for Faculty Self Assessment Form

export interface Program {
  title: string;
  dates: string;
  agency: string;
  attendedOrganized: string;
  duration: string;
  api: string;
  [key: string]: string;
}

export interface Course {
  courseCode: string;
  courseTitle: string;
  contactHours: string;
  scheduled: string;
  engaged: string;
  [key: string]: string;
}

export interface Resource {
  courseCode: string;
  consulted: string;
  prescribed: string;
  additional: string;
  [key: string]: string;
}

export interface QuestionPapers {
  ug: { t1: string; t2: string; t3: string };
  pg: { t1: string; t2: string; t3: string };
}

export interface EvaluatedData {
  ug: string;
  pg: string;
}

export interface InvigilationData {
  allotted: { t1: string; t2: string; t3: string };
  performed: { t1: string; t2: string; t3: string };
}

export interface Activity {
  activity: string;
  api: string;
  [key: string]: string;
}

export interface Publication {
  authors: string;
  title: string;
  reference: string;
  type: string;
  api: string;
  [key: string]: string;
}

export interface ResearchProject {
  title: string;
  agency: string;
  duration: string;
  amount: string;
  role: string;
  api: string;
  [key: string]: string;
}

export interface Guidance {
  enrolName: string;
  title: string;
  jointSupervisors: string;
  level: string;
  status: string;
  api: string;
  [key: string]: string;
}

export interface Membership {
  body: string;
  idNumber: string;
  api: string;
  [key: string]: string;
}

export interface FormData {
  // Personal Info (Items 1-10)
  name: string;
  department: string;
  qualifications: string;
  designation: string;
  joiningDate: string;
  firstDesignation: string;
  payScale: string;
  specialization: string;
  additionalQualification: string;
  higherStudies: string;

  // Programs (Item 11)
  programs: Program[];

  // Teaching Activities (Item 12)
  oddSemester: Course[];
  evenSemester: Course[];
  oddExcessApi: string;
  evenExcessApi: string;
  resources: Resource[];
  participatory: string;
  modification: string;
  coverageBeyond: string;
  teachingApi: string;
  projectsGuided: string;
  studentsGuided: string;
  projectGuidanceApi: string;

  // Examination (Item 12.4)
  questionPapersSet: QuestionPapers;
  abEvaluated: EvaluatedData;
  studentsExamined: EvaluatedData;
  invigilation: InvigilationData;
  examinationApi: string;

  // Activities (Item 13)
  studentActivities: Activity[];
  departmentActivities: Activity[];
  instituteActivities: Activity[];
  lectures: string;
  articles: string;

  // Research (Item 14-15)
  publications: Publication[];
  books: Publication[];

  // Projects (Item 16)
  researchProjects: ResearchProject[];

  // Guidance (Item 17)
  guidance: Guidance[];

  // Other (Item 18-19)
  membership: Membership[];
  otherInfo: string;
  enclosures: string;
}

export type TabId = 
  | 'personal' 
  | 'programs' 
  | 'teaching' 
  | 'examination' 
  | 'activities' 
  | 'research' 
  | 'projects' 
  | 'guidance' 
  | 'other';

export interface Tab {
  id: TabId;
  label: string;
  icon: string;
  description: string;
}
