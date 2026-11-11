
// Form Types
export interface Program {
  title: string;
  dates: string;
  agency: string;
  attendedOrganized: string;
  duration: string;
  api: string;
}

export interface Course {
  courseCode: string;
  courseTitle: string;
  contactHours: string;
  scheduled: string;
  engaged: string;
}

export interface Resource {
  courseCode: string;
  consulted: string;
  prescribed: string;
  additional: string;
}

export interface Activity {
  activity: string;
  api: string;
}

export interface Publication {
  authors: string;
  title: string;
  reference: string;
  type: string;
  api: string;
}

export interface ResearchProject {
  title: string;
  agency: string;
  duration: string;
  amount: string;
  role: string;
  api: string;
}

export interface Guidance {
  enrolName: string;
  title: string;
  jointSupervisors: string;
  level: string;
  status: string;
  api: string;
}

export interface Membership {
  body: string;
  idNumber: string;
  api: string;
}

export interface FormData {
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
  programs: Program[];
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
  questionPapersSet: { ug: { t1: string; t2: string; t3: string }; pg: { t1: string; t2: string; t3: string } };
  abEvaluated: { ug: string; pg: string };
  studentsExamined: { ug: string; pg: string };
  invigilation: { allotted: { t1: string; t2: string; t3: string }; performed: { t1: string; t2: string; t3: string } };
  examinationApi: string;
  studentActivities: Activity[];
  departmentActivities: Activity[];
  instituteActivities: Activity[];
  lectures: string;
  articles: string;
  publications: Publication[];
  books: Publication[];
  researchProjects: ResearchProject[];
  guidance: Guidance[];
  membership: Membership[];
  otherInfo: string;
  enclosures: string;
}

export const initialFormData: FormData = {
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
  programs: [{ title: '', dates: '', agency: '', attendedOrganized: '', duration: '', api: '' }],
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
  questionPapersSet: { ug: { t1: '', t2: '', t3: '' }, pg: { t1: '', t2: '', t3: '' } },
  abEvaluated: { ug: '', pg: '' },
  studentsExamined: { ug: '', pg: '' },
  invigilation: { allotted: { t1: '', t2: '', t3: '' }, performed: { t1: '', t2: '', t3: '' } },
  examinationApi: '',
  studentActivities: [{ activity: '', api: '' }],
  departmentActivities: [{ activity: '', api: '' }],
  instituteActivities: [{ activity: '', api: '' }],
  lectures: '',
  articles: '',
  publications: [{ authors: '', title: '', reference: '', type: '', api: '' }],
  books: [{ authors: '', title: '', reference: '', type: '', api: '' }],
  researchProjects: [{ title: '', agency: '', duration: '', amount: '', role: '', api: '' }],
  guidance: [{ enrolName: '', title: '', jointSupervisors: '', level: '', status: '', api: '' }],
  membership: [{ body: '', idNumber: '', api: '' }],
  otherInfo: '',
  enclosures: ''
};

// Dropdown Options
export const departmentOptions = [
  { label: 'CSE & IT', value: 'CSE&IT' },
  { label: 'Electronics & Communication', value: 'ECE' },
  { label: 'Civil Engineering', value: 'CE' },
  { label: 'Biotechnology & Bioinformatics', value: 'BT' },
  { label: 'Mathematics', value: 'MATH' },
  { label: 'Physics', value: 'PHY' },
  { label: 'Humanities & Social Sciences', value: 'HSS' },
];

export const designationOptions = [
  { label: 'Professor', value: 'Professor' },
  { label: 'Associate Professor', value: 'Associate Professor' },
  { label: 'Assistant Professor (Senior Grade)', value: 'AP (SG)' },
  { label: 'Assistant Professor', value: 'Assistant Professor' },
  { label: 'Lecturer', value: 'Lecturer' },
];

export const qualificationOptions = [
  { label: 'Ph.D.', value: 'PhD' },
  { label: 'M.Tech', value: 'MTech' },
  { label: 'M.E.', value: 'ME' },
  { label: 'M.Sc.', value: 'MSc' },
  { label: 'M.Phil', value: 'MPhil' },
  { label: 'M.B.A.', value: 'MBA' },
];

export const participationOptions = [
  { label: 'Attended', value: 'Attended' },
  { label: 'Organized', value: 'Organized' },
  { label: 'Resource Person', value: 'Resource Person' },
  { label: 'Chief/Principal Organizer', value: 'Chief Organizer' },
];

export const durationOptions = [
  { label: 'Less than one week', value: 'Less than one week' },
  { label: 'One week', value: 'One week' },
  { label: 'Two or more weeks', value: 'Two or more weeks' },
  { label: 'Seminar/Conference (1 day)', value: 'Seminar (1 day)' },
  { label: 'Seminar/Conference (2-3 days)', value: 'Seminar (2-3 days)' },
  { label: 'Seminar/Conference (>3 days)', value: 'Seminar (>3 days)' },
];

export const publicationTypes = [
  { label: 'IJ - International Journal', value: 'IJ' },
  { label: 'NJ - National Journal', value: 'NJ' },
  { label: 'OJ - Other Journal', value: 'OJ' },
  { label: 'IC - International Conference', value: 'IC' },
  { label: 'NC - National Conference', value: 'NC' },
  { label: 'LC - Local/Regional Conference', value: 'LC' },
  { label: 'PN - Presented but Not Published', value: 'PN' },
  { label: 'OA - Only Abstract Published', value: 'OA' },
];

export const bookTypes = [
  { label: 'International Publisher (Peer Reviewed)', value: 'International' },
  { label: 'National Publisher with ISBN/ISSN', value: 'National' },
  { label: 'Local Publisher with ISBN/ISSN', value: 'Local' },
  { label: 'Chapter in Book', value: 'Chapter' },
];

export const roleOptions = [
  { label: 'Chief/Principal Investigator', value: 'Chief' },
  { label: 'Co-Investigator', value: 'Co-Investigator' },
  { label: 'Team Member', value: 'Team Member' },
];

export const levelOptions = [
  { label: 'Ph.D.', value: 'PhD' },
  { label: 'D.D.', value: 'DD' },
  { label: 'M.Tech', value: 'MTech' },
  { label: 'M.Phil', value: 'MPhil' },
  { label: 'M.S.', value: 'MS' },
];

export const statusOptions = [
  { label: 'Completed - Degree Awarded', value: 'Completed' },
  { label: 'Thesis Submitted', value: 'Submitted' },
  { label: 'Ongoing (>6 months)', value: 'Ongoing' },
  { label: 'Recently Registered', value: 'New' },
];
