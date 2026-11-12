import { FormData, Course } from '@/types/formTypes';
import { ApiScores, num } from '@/lib/scoring';

export interface Issue {
  tab: string;
  level: 'error' | 'warning';
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function courseIssues(list: Course[], semester: string): Issue[] {
  const out: Issue[] = [];
  list.forEach((c, i) => {
    const label = c.courseCode || c.courseTitle || `Course ${i + 1}`;
    if (num(c.engaged) > num(c.scheduled) && num(c.scheduled) > 0) {
      out.push({ tab: 'teaching', level: 'error', message: `${semester} semester – ${label}: engaged classes (${c.engaged}) exceed scheduled classes (${c.scheduled}).` });
    }
    if ((c.engaged || c.scheduled) && !c.courseCode && !c.courseTitle) {
      out.push({ tab: 'teaching', level: 'warning', message: `${semester} semester – Course ${i + 1} has class counts but no course code or title.` });
    }
  });
  return out;
}

export function validateForm(d: FormData, scores: ApiScores): Issue[] {
  const issues: Issue[] = [];

  if (!d.name.trim()) issues.push({ tab: 'personal', level: 'error', message: 'Name is required.' });
  if (!d.department) issues.push({ tab: 'personal', level: 'error', message: 'Department is required.' });
  if (!d.designation) issues.push({ tab: 'personal', level: 'error', message: 'Present designation is required.' });
  if (d.email && !EMAIL_RE.test(d.email.trim())) {
    issues.push({ tab: 'personal', level: 'error', message: 'Email address does not look valid.' });
  }
  if (d.joiningDate && new Date(d.joiningDate) > new Date()) {
    issues.push({ tab: 'personal', level: 'error', message: 'University joining date cannot be in the future.' });
  }

  issues.push(...courseIssues(d.oddSemester, 'Odd'), ...courseIssues(d.evenSemester, 'Even'));

  d.programs.forEach((p, i) => {
    if (p.title && !p.attendedOrganized) {
      issues.push({ tab: 'programs', level: 'warning', message: `Programme ${i + 1}: choose the type of participation.` });
    }
  });
  d.publications.forEach((p, i) => {
    if (p.title && !p.type) issues.push({ tab: 'research', level: 'warning', message: `Publication ${i + 1}: choose the publication type.` });
  });
  d.researchProjects.forEach((p, i) => {
    if (p.title && !p.amount) issues.push({ tab: 'projects', level: 'warning', message: `Project ${i + 1}: amount sanctioned is missing.` });
  });

  for (const row of scores.rows) {
    if (row.claimed > row.counted) {
      issues.push({
        tab: tabForScore(row.key),
        level: 'warning',
        message: `Item ${row.item}: ${row.claimed} points claimed, but only ${row.counted} can be counted under the cap.`,
      });
    }
  }

  return issues;
}

function tabForScore(key: string): string {
  switch (key) {
    case 'classes':
    case 'resources':
      return 'teaching';
    case 'publications':
    case 'books':
      return 'research';
    case 'membership':
    case 'achievements':
      return 'other';
    default:
      return key;
  }
}
