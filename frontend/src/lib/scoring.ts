// ============================================================================
// PBAS API scoring rules.
//
// Every "suggest*" function returns the points the rules give for one entry
// (or null when the rules don't fix a number). Faculty still type their own
// self-assessed score; suggestions are offered as a one-click "Use" chip.
// computeScores() applies the category caps, so the grand total can never
// exceed what the rules allow even if larger numbers are typed.
// ============================================================================
import {
  Activity,
  Article,
  Book,
  Course,
  FormData,
  Guidance,
  HSS_LIKE_DEPARTMENTS,
  Lecture,
  Membership,
  Program,
  Publication,
  ResearchProject,
  Achievement,
} from '@/types/formTypes';

export const num = (val?: string): number => {
  if (!val) return 0;
  const n = parseFloat(val);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const sum = <T,>(rows: T[], pick: (r: T) => number) => rows.reduce((acc, r) => acc + pick(r), 0);
const sumApi = (rows: { api: string }[]) => sum(rows, (r) => num(r.api));

// ---------------------------------------------------------------------------
// Caps (from the info boxes on each page of the form)
// ---------------------------------------------------------------------------
export const CAPS = {
  classes: 25, // 12.1 classes engaged
  excessPerSemester: 5,
  teachingResources: 35, // 12.2
  projectGuidance: 10, // 12.3
  examPlusGuidance: 30, // 12.3 + 12.4 combined
  seminarsAttended: 5,
  activityEach: 20, // 13A, 13B, 13C, 13D
  articles: 10, // 13E
  activitiesTotal: 60, // item 13
  membership: 20, // item 18
  otherAchievement: 30, // item 19 "other" row
};

// ---------------------------------------------------------------------------
// Item 11 – programmes
// ---------------------------------------------------------------------------
const isSeminar = (p: Program) => p.duration.startsWith('Seminar');

export function suggestProgram(p: Program): number | null {
  const d = p.duration;
  if (!p.attendedOrganized || !d) return null;
  const weekBand = d === 'Two or more weeks' ? 2 : d === 'One week' ? 1 : 0;
  if (p.attendedOrganized === 'Attended') {
    if (isSeminar(p)) return 2;
    return [1, 3, 5][weekBand];
  }
  if (p.attendedOrganized === 'Organized' || p.attendedOrganized === 'Chief Organizer') {
    const base = [5, 10, 20][weekBand];
    return p.attendedOrganized === 'Chief Organizer' ? base + 5 : base;
  }
  return null; // Resource person: not fixed by the rules
}

// ---------------------------------------------------------------------------
// Item 12.1 – classes engaged
// ---------------------------------------------------------------------------
export function attendanceStats(courses: Course[]) {
  const scheduled = sum(courses, (c) => num(c.scheduled));
  const engaged = sum(courses, (c) => num(c.engaged));
  const percent = scheduled > 0 ? (engaged / scheduled) * 100 : null;
  return { scheduled, engaged, percent };
}

export function suggestClasses(data: FormData): number | null {
  const { percent } = attendanceStats([...data.oddSemester, ...data.evenSemester]);
  if (percent === null) return null;
  if (percent >= 95) return 25;
  if (percent >= 80) return 15;
  return 0;
}

// ---------------------------------------------------------------------------
// Item 13 – activities
// ---------------------------------------------------------------------------
const ROLE_POINTS: Record<'student' | 'department' | 'institute', Record<string, number>> = {
  student: { Lead: 10, Member: 5 },
  department: { 'In-charge': 5, Member: 3 },
  institute: { Head: 10, Member: 5 },
};

export function suggestActivity(kind: keyof typeof ROLE_POINTS, a: Activity): number | null {
  return ROLE_POINTS[kind][a.role] ?? null;
}

export function suggestLecture(l: Lecture): number | null {
  return l.venue === 'Outside' ? 10 : l.venue === 'Within' ? 5 : null;
}

export function suggestArticle(a: Article): number | null {
  return ({ International: 3, National: 2, Local: 1 } as Record<string, number>)[a.level] ?? null;
}

// ---------------------------------------------------------------------------
// Items 14–15 – publications & books (joint-author sharing)
// ---------------------------------------------------------------------------

/** First/corresponding author gets 60 %, remaining authors share 40 %. */
export function authorShare(role: string, authorCount: string): number {
  const n = Math.max(1, Math.floor(num(authorCount)) || (role === 'Sole' ? 1 : 2));
  if (role === 'Sole' || n === 1) return 1;
  if (role === 'First' || role === 'Corresponding') return 0.6;
  return 0.4 / (n - 1);
}

const PUB_BASE: Record<string, number> = { IJ: 15, NJ: 10, OJ: 7, IC: 10, NC: 8, LC: 6, PN: 4, OA: 2 };
const IF_BONUS: Record<string, number> = { '1-2': 10, '2-5': 15, '>5': 25 };

export function suggestPublication(p: Publication): number | null {
  const base = PUB_BASE[p.type];
  if (base === undefined || !p.authorRole) return null;
  const indexed = p.indexing && p.indexing !== 'None' ? 5 : 0;
  const bonus = IF_BONUS[p.impactFactor] ?? 0;
  return round1((base + indexed + bonus) * authorShare(p.authorRole, p.authorCount));
}

const BOOK_BASE: Record<string, number> = { International: 50, National: 25, Local: 15 };

export function suggestBook(b: Book): number | null {
  const base = BOOK_BASE[b.type];
  if (base === undefined || !b.authorRole) return null;
  if (b.kind === 'Book') return round1(base * authorShare(b.authorRole, b.authorCount));
  if (b.kind === 'Chapter') return round1(base * 0.2 * authorShare(b.authorRole, b.authorCount));
  return null; // edited volumes / translations: decided by the committee
}

// ---------------------------------------------------------------------------
// Item 16 – projects (HSS / Management have lower grant thresholds)
// ---------------------------------------------------------------------------
export const isHssLike = (department: string) => HSS_LIKE_DEPARTMENTS.includes(department);

/** Amount is entered in lakhs; very large numbers are assumed to be rupees. */
export function amountInLakhs(amount: string): number {
  const v = num(amount.replace(/[,₹\s]/g, ''));
  return v >= 1000 ? v / 100000 : v;
}

export function projectThresholds(department: string, kind: string) {
  const t = isHssLike(department) ? [3, 1, 0.25] : [10, 4, 0.5];
  const factor = kind === 'Consultancy' ? 0.5 : 1;
  return t.map((x) => x * factor);
}

export function suggestProject(p: ResearchProject, department: string): number | null {
  const lakhs = amountInLakhs(p.amount);
  if (!p.kind || lakhs <= 0) return null;
  const [high, mid, low] = projectThresholds(department, p.kind);
  const pts = lakhs >= high ? 20 : lakhs >= mid ? 15 : lakhs >= low ? 10 : 0;
  return p.kind === 'Consultancy' ? pts / 2 : pts;
}

// ---------------------------------------------------------------------------
// Item 17 – guidance
// ---------------------------------------------------------------------------
export function suggestGuidance(g: Guidance): number | null {
  if (!g.level || !g.status) return null;
  const phd = g.level === 'PhD';
  switch (g.status) {
    case 'Completed':
      return phd ? 10 : 5;
    case 'Submitted':
      return phd ? 7 : 0;
    case 'Ongoing':
      return phd ? 3 : 0;
    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Items 18–19
// ---------------------------------------------------------------------------
export function suggestMembership(m: Membership): number | null {
  return m.role === 'Chairman' ? 10 : m.role === 'Member' ? 7 : null;
}

export function suggestAchievement(a: Achievement): number | null {
  if (!a.category || a.category === 'Other') return null;
  return a.category.endsWith('International') ? 50 : 30;
}

// ---------------------------------------------------------------------------
// Totals
// ---------------------------------------------------------------------------
export interface ScoreRow {
  key: string;
  item: string;
  label: string;
  claimed: number; // what the teacher typed
  counted: number; // after caps
  cap?: number;
}

export interface ApiScores {
  rows: ScoreRow[];
  byKey: Record<string, ScoreRow>;
  total: number;
  claimedTotal: number;
}

const capped = (v: number, cap?: number) => (cap === undefined ? v : Math.min(v, cap));

export function computeScores(d: FormData): ApiScores {
  // 11 – seminars attended without presentation are capped at 5 in total.
  const seminarRows = d.programs.filter((p) => p.attendedOrganized === 'Attended' && isSeminar(p));
  const otherProgramRows = d.programs.filter((p) => !seminarRows.includes(p));
  const programsClaimed = sumApi(d.programs);
  const programsCounted = sumApi(otherProgramRows) + capped(sumApi(seminarRows), CAPS.seminarsAttended);

  // 12.1 / 12.2
  const classesClaimed = num(d.classesApi) + num(d.oddExcessApi) + num(d.evenExcessApi);
  const classesCounted =
    capped(num(d.classesApi), CAPS.classes) +
    capped(num(d.oddExcessApi), CAPS.excessPerSemester) +
    capped(num(d.evenExcessApi), CAPS.excessPerSemester);
  const resourcesClaimed = num(d.teachingApi);
  const resourcesCounted = capped(resourcesClaimed, CAPS.teachingResources);

  // 12.3 + 12.4 combined
  const examClaimed = num(d.projectGuidanceApi) + num(d.examinationApi);
  const examCounted = capped(
    capped(num(d.projectGuidanceApi), CAPS.projectGuidance) + num(d.examinationApi),
    CAPS.examPlusGuidance
  );

  // 13
  const a = sumApi(d.studentActivities);
  const b = sumApi(d.departmentActivities);
  const c = sumApi(d.instituteActivities);
  const lec = sumApi(d.lectures);
  const art = sumApi(d.articles);
  const activitiesClaimed = a + b + c + lec + art;
  const activitiesCounted = capped(
    capped(a, CAPS.activityEach) +
      capped(b, CAPS.activityEach) +
      capped(c, CAPS.activityEach) +
      capped(lec, CAPS.activityEach) +
      capped(art, CAPS.articles),
    CAPS.activitiesTotal
  );

  const pubs = sumApi(d.publications);
  const books = sumApi(d.books);
  const projects = sumApi(d.researchProjects);
  const guidance = sumApi(d.guidance);
  const membershipClaimed = sumApi(d.membership);
  const achievementsClaimed = sumApi(d.achievements);
  const achievementsCounted = sum(d.achievements, (r) =>
    r.category === 'Other' ? capped(num(r.api), CAPS.otherAchievement) : num(r.api)
  );

  const rows: ScoreRow[] = [
    { key: 'programs', item: '11', label: 'Orientation, Refresher, FDPs, Seminars & Courses', claimed: programsClaimed, counted: programsCounted },
    { key: 'classes', item: '12.1', label: 'Classes engaged (incl. excess classes)', claimed: classesClaimed, counted: classesCounted, cap: CAPS.classes + 2 * CAPS.excessPerSemester },
    { key: 'resources', item: '12.2', label: 'Reading material, innovation & syllabus work', claimed: resourcesClaimed, counted: resourcesCounted, cap: CAPS.teachingResources },
    { key: 'examination', item: '12.3–12.4', label: 'UG project guidance + examination duties', claimed: examClaimed, counted: examCounted, cap: CAPS.examPlusGuidance },
    { key: 'activities', item: '13', label: 'Co-curricular, departmental & institute activities', claimed: activitiesClaimed, counted: activitiesCounted, cap: CAPS.activitiesTotal },
    { key: 'publications', item: '14', label: 'Research papers published / presented', claimed: pubs, counted: pubs },
    { key: 'books', item: '15', label: 'Books & chapters', claimed: books, counted: books },
    { key: 'projects', item: '16', label: 'Sponsored projects & consultancy', claimed: projects, counted: projects },
    { key: 'guidance', item: '17', label: 'Research guidance', claimed: guidance, counted: guidance },
    { key: 'membership', item: '18', label: 'Professional body memberships', claimed: membershipClaimed, counted: capped(membershipClaimed, CAPS.membership), cap: CAPS.membership },
    { key: 'achievements', item: '19', label: 'Patents, technology transfer & other achievements', claimed: achievementsClaimed, counted: achievementsCounted },
  ].map((r) => ({ ...r, claimed: round1(r.claimed), counted: round1(r.counted) }));

  const byKey = Object.fromEntries(rows.map((r) => [r.key, r]));
  return {
    rows,
    byKey,
    total: round1(sum(rows, (r) => r.counted)),
    claimedTotal: round1(sum(rows, (r) => r.claimed)),
  };
}

/** Points for a single tab in the sidebar. */
export const TAB_SCORE_KEYS: Record<string, string[]> = {
  personal: [],
  programs: ['programs'],
  teaching: ['classes', 'resources'],
  examination: ['examination'],
  activities: ['activities'],
  research: ['publications', 'books'],
  projects: ['projects'],
  guidance: ['guidance'],
  other: ['membership', 'achievements'],
};
