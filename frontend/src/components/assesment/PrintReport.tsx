import React from 'react';
import { useFormContext } from '@/context/FormContext';
import {
  achievementCategoryOptions,
  articleLevelOptions,
  authorRoleOptions,
  bookKindOptions,
  bookTypes,
  courseLevelOptions,
  courseTypeOptions,
  departmentActivityRoles,
  departmentOptions,
  designationOptions,
  durationOptions,
  impactFactorOptions,
  indexingOptions,
  instituteActivityRoles,
  labelFor,
  lectureVenueOptions,
  levelOptions,
  membershipRoleOptions,
  Option,
  participationOptions,
  programTypeOptions,
  projectKindOptions,
  projectStatusOptions,
  qualificationOptions,
  roleOptions,
  statusOptions,
  studentActivityRoles,
} from '@/types/formTypes';

type Col<T> = { head: string; get: (row: T) => React.ReactNode; options?: undefined } | { head: string; key: keyof T; options?: Option[] };

function Table<T extends object>({ rows, cols }: { rows: T[]; cols: Col<T>[] }) {
  const filled = rows.filter((r) => Object.values(r).some(Boolean));
  if (!filled.length) return <p className="pr-empty">Nil</p>;
  return (
    <table className="pr-table">
      <thead>
        <tr>
          <th>#</th>
          {cols.map((c) => (
            <th key={c.head}>{c.head}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {filled.map((row, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            {cols.map((c) => {
              let v: React.ReactNode;
              if ('key' in c) {
                const raw = String(row[c.key] ?? '');
                v = c.options ? labelFor(c.options, raw) : raw;
              } else v = c.get(row);
              return <td key={c.head}>{v || '—'}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function KV({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <dl className="pr-kv">
      {items.map(([k, v]) => (
        <React.Fragment key={k}>
          <dt>{k}</dt>
          <dd>{v || '—'}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}

function H({ children }: { children: React.ReactNode }) {
  return <h3 className="pr-h">{children}</h3>;
}

/** Hidden on screen; this is what window.print() produces. */
export function PrintReport() {
  const { formData: d, apiScores, submission } = useFormContext();
  const ay = d.academicYear.replace('-', ' – ');

  return (
    <div className="print-report" aria-hidden="true">
      <header className="pr-header">
        <h1>Jaypee University of Information Technology</h1>
        <h2>Annual Self Assessment – Faculty (PBAS) · Academic Year {ay}</h2>
        {submission && <p>Finalised on {new Date(submission.submittedAt).toLocaleString()}{submission.id ? ` · Ref ${submission.id}` : ''}</p>}
      </header>

      <H>1–10 · Personal information</H>
      <KV
        items={[
          ['Name', d.name],
          ['Employee ID', d.employeeId],
          ['Email', d.email],
          ['Department', labelFor(departmentOptions, d.department)],
          ['Highest qualification', labelFor(qualificationOptions, d.qualifications)],
          ['Present designation', labelFor(designationOptions, d.designation)],
          ['First designation', labelFor(designationOptions, d.firstDesignation)],
          ['Joining date', d.joiningDate],
          ['Pay scale & pay', d.payScale],
          ['Specialization', d.specialization],
          ['Additional qualification', d.additionalQualification],
          ['Pursuing higher studies', d.higherStudies],
        ]}
      />

      <H>11 · Programmes attended / organised</H>
      <Table
        rows={d.programs}
        cols={[
          { head: 'Title', key: 'title' },
          { head: 'Type', key: 'programType', options: programTypeOptions },
          { head: 'Dates', key: 'dates' },
          { head: 'Agency & place', key: 'agency' },
          { head: 'Mode', key: 'mode' },
          { head: 'Participation', key: 'attendedOrganized', options: participationOptions },
          { head: 'Duration', key: 'duration', options: durationOptions },
          { head: 'API', key: 'api' },
        ]}
      />

      <H>12.1 · Courses taught</H>
      {(['oddSemester', 'evenSemester'] as const).map((sem) => (
        <div key={sem}>
          <h4 className="pr-sub">{sem === 'oddSemester' ? 'Odd semester' : 'Even semester'}</h4>
          <Table
            rows={d[sem]}
            cols={[
              { head: 'Code', key: 'courseCode' },
              { head: 'Title', key: 'courseTitle' },
              { head: 'Level', key: 'level', options: courseLevelOptions },
              { head: 'Component', key: 'courseType', options: courseTypeOptions },
              { head: 'Hrs/wk', key: 'contactHours' },
              { head: 'Scheduled', key: 'scheduled' },
              { head: 'Engaged', key: 'engaged' },
            ]}
          />
        </div>
      ))}
      <KV
        items={[
          ['API – classes engaged', d.classesApi],
          ['API – excess (odd / even)', `${d.oddExcessApi || 0} / ${d.evenExcessApi || 0}`],
        ]}
      />

      <H>12.2 · Reading / instructional material</H>
      <Table
        rows={d.resources}
        cols={[
          { head: 'Course', key: 'courseCode' },
          { head: 'Consulted', key: 'consulted' },
          { head: 'Prescribed', key: 'prescribed' },
          { head: 'Additional', key: 'additional' },
        ]}
      />
      <KV
        items={[
          ['Innovative methods', d.participatory],
          ['Syllabus modification', d.modification],
          ['Beyond syllabus', d.coverageBeyond],
          ['API – 12.2', d.teachingApi],
        ]}
      />

      <H>12.3–12.4 · Project guidance & examination duties</H>
      <KV
        items={[
          ['UG projects / students guided', `${d.projectsGuided || 0} / ${d.studentsGuided || 0}`],
          ['API – 12.3', d.projectGuidanceApi],
          ['Question papers UG (T1/T2/T3)', `${d.questionPapersSet.ug.t1 || 0} / ${d.questionPapersSet.ug.t2 || 0} / ${d.questionPapersSet.ug.t3 || 0}`],
          ['Question papers PG (T1/T2/T3)', `${d.questionPapersSet.pg.t1 || 0} / ${d.questionPapersSet.pg.t2 || 0} / ${d.questionPapersSet.pg.t3 || 0}`],
          ['Answer books UG / PG', `${d.abEvaluated.ug || 0} / ${d.abEvaluated.pg || 0}`],
          ['Students examined UG / PG', `${d.studentsExamined.ug || 0} / ${d.studentsExamined.pg || 0}`],
          ['Invigilation allotted (T1/T2/T3)', `${d.invigilation.allotted.t1 || 0} / ${d.invigilation.allotted.t2 || 0} / ${d.invigilation.allotted.t3 || 0}`],
          ['Invigilation performed (T1/T2/T3)', `${d.invigilation.performed.t1 || 0} / ${d.invigilation.performed.t2 || 0} / ${d.invigilation.performed.t3 || 0}`],
          ['API – 12.4', d.examinationApi],
        ]}
      />

      <H>13 · Co-curricular activities</H>
      {(
        [
          ['13A Student activities', 'studentActivities', studentActivityRoles],
          ['13B Departmental activities', 'departmentActivities', departmentActivityRoles],
          ['13C Institute activities', 'instituteActivities', instituteActivityRoles],
        ] as const
      ).map(([title, key, roles]) => (
        <div key={key}>
          <h4 className="pr-sub">{title}</h4>
          <Table rows={d[key]} cols={[{ head: 'Activity', key: 'activity' }, { head: 'Role', key: 'role', options: roles }, { head: 'API', key: 'api' }]} />
        </div>
      ))}
      <h4 className="pr-sub">13D Invited lectures</h4>
      <Table rows={d.lectures} cols={[{ head: 'Lecture', key: 'title' }, { head: 'Where', key: 'venue', options: lectureVenueOptions }, { head: 'Date', key: 'date' }, { head: 'API', key: 'api' }]} />
      <h4 className="pr-sub">13E Articles, reviews, reports</h4>
      <Table rows={d.articles} cols={[{ head: 'Article', key: 'title' }, { head: 'Level', key: 'level', options: articleLevelOptions }, { head: 'API', key: 'api' }]} />

      <H>14 · Research papers</H>
      <Table
        rows={d.publications}
        cols={[
          { head: 'Authors', key: 'authors' },
          { head: 'Title', key: 'title' },
          { head: 'Reference', key: 'reference' },
          { head: 'Type', key: 'type' },
          { head: 'Indexing', key: 'indexing', options: indexingOptions },
          { head: 'IF', key: 'impactFactor', options: impactFactorOptions },
          { head: 'Authorship', get: (p) => [labelFor(authorRoleOptions, p.authorRole), p.authorCount && `of ${p.authorCount}`].filter(Boolean).join(' ') },
          { head: 'API', key: 'api' },
        ]}
      />

      <H>15 · Books & chapters</H>
      <Table
        rows={d.books}
        cols={[
          { head: 'Authors', key: 'authors' },
          { head: 'Title', key: 'title' },
          { head: 'Publisher / ISBN', key: 'reference' },
          { head: 'Kind', key: 'kind', options: bookKindOptions },
          { head: 'Category', key: 'type', options: bookTypes },
          { head: 'Authorship', get: (b) => [labelFor(authorRoleOptions, b.authorRole), b.authorCount && `of ${b.authorCount}`].filter(Boolean).join(' ') },
          { head: 'API', key: 'api' },
        ]}
      />

      <H>16 · Research projects & consultancy</H>
      <Table
        rows={d.researchProjects}
        cols={[
          { head: 'Title', key: 'title' },
          { head: 'Kind', key: 'kind', options: projectKindOptions },
          { head: 'Agency', key: 'agency' },
          { head: 'Duration', key: 'duration' },
          { head: 'Status', key: 'status', options: projectStatusOptions },
          { head: '₹ lakh', key: 'amount' },
          { head: 'Role', key: 'role', options: roleOptions },
          { head: 'API', key: 'api' },
        ]}
      />

      <H>17 · Research guidance</H>
      <Table
        rows={d.guidance}
        cols={[
          { head: 'Student', key: 'enrolName' },
          { head: 'Title', key: 'title' },
          { head: 'Joint supervisors', key: 'jointSupervisors' },
          { head: 'Level', key: 'level', options: levelOptions },
          { head: 'Status', key: 'status', options: statusOptions },
          { head: 'API', key: 'api' },
        ]}
      />

      <H>18 · Professional memberships</H>
      <Table rows={d.membership} cols={[{ head: 'Body', key: 'body' }, { head: 'ID', key: 'idNumber' }, { head: 'Role', key: 'role', options: membershipRoleOptions }, { head: 'API', key: 'api' }]} />

      <H>19 · Patents, technology transfer & other achievements</H>
      <Table rows={d.achievements} cols={[{ head: 'Details', key: 'description' }, { head: 'Category', key: 'category', options: achievementCategoryOptions }, { head: 'API', key: 'api' }]} />
      <KV items={[['Other information', d.otherInfo], ['Enclosures', d.enclosures]]} />

      <H>API score summary</H>
      <table className="pr-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Category</th>
            <th>Claimed</th>
            <th>Counted (after caps)</th>
            <th>Verified by HoD</th>
          </tr>
        </thead>
        <tbody>
          {apiScores.rows.map((r) => (
            <tr key={r.key}>
              <td>{r.item}</td>
              <td>{r.label}</td>
              <td>{r.claimed}</td>
              <td>{r.counted}</td>
              <td />
            </tr>
          ))}
          <tr className="pr-total">
            <td colSpan={2}>Grand total</td>
            <td>{apiScores.claimedTotal}</td>
            <td>{apiScores.total}</td>
            <td />
          </tr>
        </tbody>
      </table>

      <p className="pr-cert">
        {d.certified ? '☑' : '☐'} I certify that the above data is correct and I shall be responsible for any inaccurate/incorrect data and shall be
        liable for suitable action for the same, as decided by the authorities.
      </p>
      <div className="pr-signatures">
        <span>Signature of faculty</span>
        <span>Signature of HoD</span>
        <span>Date</span>
      </div>
    </div>
  );
}
