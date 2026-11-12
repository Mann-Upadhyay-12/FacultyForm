// ============================================================================
// Faculty Annual Self-Assessment (PBAS) — form types, defaults & dropdowns
// ============================================================================

export interface Program {
  title: string;
  programType: string;
  dates: string;
  agency: string;
  mode: string;
  attendedOrganized: string;
  duration: string;
  api: string;
}

export interface Course {
  courseCode: string;
  courseTitle: string;
  level: string;
  courseType: string;
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
  role: string;
  api: string;
}

export interface Lecture {
  title: string;
  venue: string;
  date: string;
  api: string;
}

export interface Article {
  title: string;
  level: string;
  api: string;
}

export interface Publication {
  authors: string;
  title: string;
  reference: string;
  type: string;
  indexing: string;
  impactFactor: string;
  authorRole: string;
  authorCount: string;
  api: string;
}

export interface Book {
  authors: string;
  title: string;
  reference: string;
  kind: string;
  type: string;
  authorRole: string;
  authorCount: string;
  api: string;
}

export interface ResearchProject {
  title: string;
  kind: string;
  agency: string;
  duration: string;
  status: string;
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
  role: string;
  api: string;
}

export interface Achievement {
  description: string;
  category: string;
  api: string;
}

export interface FormData {
  academicYear: string;
  name: string;
  employeeId: string;
  email: string;
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
  classesApi: string;
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
  lectures: Lecture[];
  articles: Article[];
  publications: Publication[];
  books: Book[];
  researchProjects: ResearchProject[];
  guidance: Guidance[];
  membership: Membership[];
  achievements: Achievement[];
  otherInfo: string;
  enclosures: string;
  certified: boolean;
}

// ----------------------------------------------------------------------------
// Academic year helpers
// ----------------------------------------------------------------------------

/** The assessment is filed for the academic year that most recently ended (July–June). */
export function defaultAcademicYear(now = new Date()): string {
  const y = now.getFullYear();
  // Jul–Dec: the year that ended in June of this calendar year; Jan–Jun: the one before.
  const end = now.getMonth() >= 6 ? y : y - 1;
  return `${end - 1}-${end}`;
}

export function academicYearOptions(now = new Date()) {
  const end = now.getFullYear() + 1;
  const opts = [];
  for (let e = end; e >= end - 6; e--) {
    opts.push({ label: `${e - 1} – ${e}`, value: `${e - 1}-${e}` });
  }
  return opts;
}

// ----------------------------------------------------------------------------
// Empty row templates (used for both initial data and "+ Add" buttons)
// ----------------------------------------------------------------------------

export const templates = {
  programs: { title: '', programType: '', dates: '', agency: '', mode: '', attendedOrganized: '', duration: '', api: '' } as Program,
  course: { courseCode: '', courseTitle: '', level: '', courseType: '', contactHours: '', scheduled: '', engaged: '' } as Course,
  resources: { courseCode: '', consulted: '', prescribed: '', additional: '' } as Resource,
  activity: { activity: '', role: '', api: '' } as Activity,
  lectures: { title: '', venue: '', date: '', api: '' } as Lecture,
  articles: { title: '', level: '', api: '' } as Article,
  publications: { authors: '', title: '', reference: '', type: '', indexing: '', impactFactor: '', authorRole: '', authorCount: '', api: '' } as Publication,
  books: { authors: '', title: '', reference: '', kind: '', type: '', authorRole: '', authorCount: '', api: '' } as Book,
  researchProjects: { title: '', kind: '', agency: '', duration: '', status: '', amount: '', role: '', api: '' } as ResearchProject,
  guidance: { enrolName: '', title: '', jointSupervisors: '', level: '', status: '', api: '' } as Guidance,
  membership: { body: '', idNumber: '', role: '', api: '' } as Membership,
  achievements: { description: '', category: '', api: '' } as Achievement,
};

export const initialFormData: FormData = {
  academicYear: defaultAcademicYear(),
  name: '',
  employeeId: '',
  email: '',
  department: '',
  qualifications: '',
  designation: '',
  joiningDate: '',
  firstDesignation: '',
  payScale: '',
  specialization: '',
  additionalQualification: '',
  higherStudies: '',
  programs: [{ ...templates.programs }],
  oddSemester: [{ ...templates.course }],
  evenSemester: [{ ...templates.course }],
  classesApi: '',
  oddExcessApi: '',
  evenExcessApi: '',
  resources: [{ ...templates.resources }],
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
  studentActivities: [{ ...templates.activity }],
  departmentActivities: [{ ...templates.activity }],
  instituteActivities: [{ ...templates.activity }],
  lectures: [{ ...templates.lectures }],
  articles: [{ ...templates.articles }],
  publications: [{ ...templates.publications }],
  books: [{ ...templates.books }],
  researchProjects: [{ ...templates.researchProjects }],
  guidance: [{ ...templates.guidance }],
  membership: [{ ...templates.membership }],
  achievements: [{ ...templates.achievements }],
  otherInfo: '',
  enclosures: '',
  certified: false,
};

// ----------------------------------------------------------------------------
// Restoring drafts / imported JSON safely
// ----------------------------------------------------------------------------

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

function normalizeRows<T extends object>(raw: unknown, template: T): T[] {
  if (!Array.isArray(raw)) return [{ ...template }];
  const rows = raw.filter(isObj).map((row) => {
    const out = { ...template } as Record<string, unknown>;
    for (const key of Object.keys(template)) out[key] = str(row[key]);
    return out as T;
  });
  return rows.length ? rows : [{ ...template }];
}

function normalizeNested<T>(raw: unknown, template: T): T {
  if (!isObj(template)) return str(raw) as T;
  const src = isObj(raw) ? raw : {};
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(template)) {
    out[key] = normalizeNested(src[key], (template as Record<string, unknown>)[key]);
  }
  return out as T;
}

/**
 * Deep-merges untrusted data (an older draft or an imported JSON file) onto the
 * current schema, so missing nested keys can never crash a page and fields
 * from older versions of the form are migrated.
 */
export function normalizeFormData(raw: unknown): FormData {
  const src = isObj(raw) ? raw : {};
  const base = initialFormData;

  // v1 stored 13D/13E as free text. Carry that text into the first row.
  const legacyText = (v: unknown) => (typeof v === 'string' && v.trim() ? [v] : null);
  const lecturesLegacy = legacyText(src.lectures);
  const articlesLegacy = legacyText(src.articles);

  // v1 stored "Chapter" as a publisher type for books.
  const books = normalizeRows(src.books, templates.books).map((b) =>
    b.type === 'Chapter' ? { ...b, kind: 'Chapter', type: '' } : b
  );

  return {
    academicYear: str(src.academicYear) || base.academicYear,
    name: str(src.name),
    employeeId: str(src.employeeId),
    email: str(src.email),
    department: str(src.department),
    qualifications: str(src.qualifications),
    designation: str(src.designation),
    joiningDate: str(src.joiningDate),
    firstDesignation: str(src.firstDesignation),
    payScale: str(src.payScale),
    specialization: str(src.specialization),
    additionalQualification: str(src.additionalQualification),
    higherStudies: str(src.higherStudies),
    programs: normalizeRows(src.programs, templates.programs),
    oddSemester: normalizeRows(src.oddSemester, templates.course),
    evenSemester: normalizeRows(src.evenSemester, templates.course),
    classesApi: str(src.classesApi),
    oddExcessApi: str(src.oddExcessApi),
    evenExcessApi: str(src.evenExcessApi),
    resources: normalizeRows(src.resources, templates.resources),
    participatory: str(src.participatory),
    modification: str(src.modification),
    coverageBeyond: str(src.coverageBeyond),
    teachingApi: str(src.teachingApi),
    projectsGuided: str(src.projectsGuided),
    studentsGuided: str(src.studentsGuided),
    projectGuidanceApi: str(src.projectGuidanceApi),
    questionPapersSet: normalizeNested(src.questionPapersSet, base.questionPapersSet),
    abEvaluated: normalizeNested(src.abEvaluated, base.abEvaluated),
    studentsExamined: normalizeNested(src.studentsExamined, base.studentsExamined),
    invigilation: normalizeNested(src.invigilation, base.invigilation),
    examinationApi: str(src.examinationApi),
    studentActivities: normalizeRows(src.studentActivities, templates.activity),
    departmentActivities: normalizeRows(src.departmentActivities, templates.activity),
    instituteActivities: normalizeRows(src.instituteActivities, templates.activity),
    lectures: lecturesLegacy
      ? [{ ...templates.lectures, title: lecturesLegacy[0] }]
      : normalizeRows(src.lectures, templates.lectures),
    articles: articlesLegacy
      ? [{ ...templates.articles, title: articlesLegacy[0] }]
      : normalizeRows(src.articles, templates.articles),
    publications: normalizeRows(src.publications, templates.publications),
    books,
    researchProjects: normalizeRows(src.researchProjects, templates.researchProjects),
    guidance: normalizeRows(src.guidance, templates.guidance),
    membership: normalizeRows(src.membership, templates.membership),
    achievements: normalizeRows(src.achievements, templates.achievements),
    otherInfo: str(src.otherInfo),
    enclosures: str(src.enclosures),
    certified: src.certified === true,
  };
}

// ----------------------------------------------------------------------------
// Dropdown options
// ----------------------------------------------------------------------------

export interface Option {
  label: string;
  value: string;
}

export const labelFor = (options: Option[], value: string) =>
  options.find((o) => o.value === value)?.label || value;

export const departmentOptions: Option[] = [
  { label: 'Computer Science & Engineering and IT', value: 'CSE&IT' },
  { label: 'Electronics & Communication Engineering', value: 'ECE' },
  { label: 'Civil Engineering', value: 'CE' },
  { label: 'Biotechnology & Bioinformatics', value: 'BT' },
  { label: 'Mathematics', value: 'MATH' },
  { label: 'Physics & Materials Science', value: 'PHY' },
  { label: 'Humanities & Social Sciences', value: 'HSS' },
  { label: 'Management', value: 'MGMT' },
  { label: 'Other', value: 'OTHER' },
];

/** Departments that use the lower HSS/Management grant thresholds for projects. */
export const HSS_LIKE_DEPARTMENTS = ['HSS', 'MGMT'];

export const designationOptions: Option[] = [
  { label: 'Professor', value: 'Professor' },
  { label: 'Associate Professor', value: 'Associate Professor' },
  { label: 'Assistant Professor (Senior Grade)', value: 'AP (SG)' },
  { label: 'Assistant Professor (Grade I)', value: 'AP (Grade I)' },
  { label: 'Assistant Professor (Grade II)', value: 'AP (Grade II)' },
  { label: 'Assistant Professor', value: 'Assistant Professor' },
  { label: 'Senior Lecturer', value: 'Senior Lecturer' },
  { label: 'Lecturer', value: 'Lecturer' },
  { label: 'Teaching Assistant / Research Associate', value: 'TA/RA' },
];

export const qualificationOptions: Option[] = [
  { label: 'Ph.D.', value: 'PhD' },
  { label: 'Ph.D. (thesis submitted)', value: 'PhD (Submitted)' },
  { label: 'Ph.D. (pursuing)', value: 'PhD (Pursuing)' },
  { label: 'M.Phil.', value: 'MPhil' },
  { label: 'M.Tech.', value: 'MTech' },
  { label: 'M.E.', value: 'ME' },
  { label: 'M.Sc.', value: 'MSc' },
  { label: 'M.A.', value: 'MA' },
  { label: 'M.Com.', value: 'MCom' },
  { label: 'M.B.A.', value: 'MBA' },
  { label: 'M.C.A.', value: 'MCA' },
  { label: 'M.S.W. / M.Ed. / LL.M.', value: 'Other PG' },
  { label: 'Other', value: 'Other' },
];

export const programTypeOptions: Option[] = [
  { label: 'Orientation Programme', value: 'Orientation' },
  { label: 'Refresher Course', value: 'Refresher' },
  { label: 'Faculty Development Programme (FDP)', value: 'FDP' },
  { label: 'Short Term Course (STC)', value: 'STC' },
  { label: 'Summer / Winter School', value: 'School' },
  { label: 'Workshop', value: 'Workshop' },
  { label: 'Seminar', value: 'Seminar' },
  { label: 'Conference / Symposium', value: 'Conference' },
  { label: 'MOOC / Online Certification (NPTEL, SWAYAM…)', value: 'MOOC' },
  { label: 'Other', value: 'Other' },
];

export const modeOptions: Option[] = [
  { label: 'Offline', value: 'Offline' },
  { label: 'Online', value: 'Online' },
  { label: 'Hybrid', value: 'Hybrid' },
];

export const participationOptions: Option[] = [
  { label: 'Attended', value: 'Attended' },
  { label: 'Organized', value: 'Organized' },
  { label: 'Resource Person', value: 'Resource Person' },
  { label: 'Chief/Principal Organizer', value: 'Chief Organizer' },
];

export const durationOptions: Option[] = [
  { label: 'Less than one week', value: 'Less than one week' },
  { label: 'One week', value: 'One week' },
  { label: 'Two or more weeks', value: 'Two or more weeks' },
  { label: 'Seminar/Conference (1 day)', value: 'Seminar (1 day)' },
  { label: 'Seminar/Conference (2-3 days)', value: 'Seminar (2-3 days)' },
  { label: 'Seminar/Conference (>3 days)', value: 'Seminar (>3 days)' },
];

export const courseLevelOptions: Option[] = [
  { label: 'UG', value: 'UG' },
  { label: 'PG', value: 'PG' },
  { label: 'Ph.D. coursework', value: 'PhD' },
];

export const courseTypeOptions: Option[] = [
  { label: 'Lecture', value: 'L' },
  { label: 'Tutorial', value: 'T' },
  { label: 'Lab / Practical', value: 'P' },
  { label: 'Lecture + Tutorial', value: 'L+T' },
  { label: 'Lecture + Lab', value: 'L+P' },
  { label: 'Seminar / Studio', value: 'S' },
];

export const excessClassOptions: Option[] = [
  { label: 'No excess classes (0)', value: '0' },
  { label: 'Engaged in excess of norms (+5)', value: '5' },
];

export const studentActivityRoles: Option[] = [
  { label: 'Lead role / Coordinator (10)', value: 'Lead' },
  { label: 'Participant / Member (5)', value: 'Member' },
];

export const departmentActivityRoles: Option[] = [
  { label: 'In-charge / Chairman (5)', value: 'In-charge' },
  { label: 'Member (3)', value: 'Member' },
];

export const instituteActivityRoles: Option[] = [
  { label: 'Director / Dean / HoD level (10)', value: 'Head' },
  { label: 'Committee member (5)', value: 'Member' },
];

export const lectureVenueOptions: Option[] = [
  { label: 'Outside the institute (10)', value: 'Outside' },
  { label: 'Within the institute (5)', value: 'Within' },
];

export const articleLevelOptions: Option[] = [
  { label: 'International (3)', value: 'International' },
  { label: 'National (2)', value: 'National' },
  { label: 'Local / Institutional (1)', value: 'Local' },
];

export const publicationTypes: Option[] = [
  { label: 'IJ - International Journal', value: 'IJ' },
  { label: 'NJ - National Journal', value: 'NJ' },
  { label: 'OJ - Other Journal', value: 'OJ' },
  { label: 'IC - International Conference', value: 'IC' },
  { label: 'NC - National Conference', value: 'NC' },
  { label: 'LC - Local/Regional Conference', value: 'LC' },
  { label: 'PN - Presented but Not Published', value: 'PN' },
  { label: 'OA - Only Abstract Published', value: 'OA' },
];

export const indexingOptions: Option[] = [
  { label: 'Not indexed', value: 'None' },
  { label: 'Scopus', value: 'Scopus' },
  { label: 'Web of Science (SCI/SCIE/SSCI/A&HCI)', value: 'WoS' },
  { label: 'UGC-CARE List', value: 'UGC-CARE' },
  { label: 'Scopus + Web of Science', value: 'Scopus+WoS' },
  { label: 'Other recognised index (ABDC, ERIH, MLA…)', value: 'Other' },
];

export const impactFactorOptions: Option[] = [
  { label: 'No impact factor / below 1', value: 'None' },
  { label: 'IF 1 – 2 (+10)', value: '1-2' },
  { label: 'IF 2 – 5 (+15)', value: '2-5' },
  { label: 'IF above 5 (+25)', value: '>5' },
];

export const authorRoleOptions: Option[] = [
  { label: 'Sole author', value: 'Sole' },
  { label: 'First / Principal author', value: 'First' },
  { label: 'Corresponding author', value: 'Corresponding' },
  { label: 'Co-author', value: 'Co-author' },
];

export const bookKindOptions: Option[] = [
  { label: 'Authored book', value: 'Book' },
  { label: 'Edited volume', value: 'Edited' },
  { label: 'Chapter in book', value: 'Chapter' },
  { label: 'Translation (book)', value: 'Translation' },
];

export const bookTypes: Option[] = [
  { label: 'International Publisher (Peer Reviewed)', value: 'International' },
  { label: 'National Publisher with ISBN/ISSN', value: 'National' },
  { label: 'Local Publisher with ISBN/ISSN', value: 'Local' },
];

export const projectKindOptions: Option[] = [
  { label: 'Sponsored research project', value: 'Research' },
  { label: 'Consultancy work', value: 'Consultancy' },
];

export const projectStatusOptions: Option[] = [
  { label: 'Sanctioned (new)', value: 'Sanctioned' },
  { label: 'Ongoing', value: 'Ongoing' },
  { label: 'Completed', value: 'Completed' },
];

export const roleOptions: Option[] = [
  { label: 'Chief/Principal Investigator', value: 'Chief' },
  { label: 'Co-Investigator', value: 'Co-Investigator' },
  { label: 'Team Member', value: 'Team Member' },
];

export const levelOptions: Option[] = [
  { label: 'Ph.D.', value: 'PhD' },
  { label: 'D.D.', value: 'DD' },
  { label: 'M.Tech', value: 'MTech' },
  { label: 'M.Phil', value: 'MPhil' },
  { label: 'M.S.', value: 'MS' },
];

export const statusOptions: Option[] = [
  { label: 'Completed - Degree Awarded', value: 'Completed' },
  { label: 'Thesis Submitted', value: 'Submitted' },
  { label: 'Ongoing (>6 months)', value: 'Ongoing' },
  { label: 'Recently Registered', value: 'New' },
];

export const membershipRoleOptions: Option[] = [
  { label: 'Member (7)', value: 'Member' },
  { label: 'Chairman / Office bearer (10)', value: 'Chairman' },
];

/** Typeahead suggestions — teachers can still type any body not listed. */
export const professionalBodySuggestions = [
  'IEEE', 'ACM', 'Computer Society of India (CSI)', 'ISTE', 'IETE', 'Institution of Engineers (India)',
  'Indian Science Congress Association', 'Indian Society for Technical Education', 'American Mathematical Society',
  'Indian Mathematical Society', 'Indian Physics Association', 'Society for Industrial and Applied Mathematics (SIAM)',
  'Biotech Research Society of India', 'Indian Sociological Society', 'Indian Economic Association',
  'Indian Political Science Association', 'Indian Psychological Association', 'Modern Language Association (MLA)',
  'Indian Association for English Studies', 'Linguistic Society of India', 'All India Management Association (AIMA)',
  'Indian Commerce Association', 'Academy of Management',
];

export const sponsoringAgencySuggestions = [
  'DST', 'SERB / ANRF', 'DBT', 'CSIR', 'ICMR', 'AICTE', 'UGC', 'ICSSR', 'ICHR', 'ICPR', 'MeitY', 'DRDO', 'ISRO',
  'HP State Council for Science, Technology & Environment', 'Industry', 'International agency',
];

export const achievementCategoryOptions: Option[] = [
  { label: 'Patent granted / filed — National (30)', value: 'PatentNational' },
  { label: 'Patent granted / filed — International (50)', value: 'PatentInternational' },
  { label: 'Technology transfer — National (30)', value: 'TechNational' },
  { label: 'Technology transfer — International (50)', value: 'TechInternational' },
  { label: 'Product / process developed — National (30)', value: 'ProductNational' },
  { label: 'Product / process developed — International (50)', value: 'ProductInternational' },
  { label: 'Award / fellowship / other achievement (up to 30)', value: 'Other' },
];
