import { ApiField, FormField } from '@/components/assesment/FormField';
import { PointsBadge, RepeatableList, SectionTotal } from '@/components/assesment/RepeatableList';
import { useFormContext } from '@/context/FormContext';
import { CAPS, num, suggestActivity, suggestArticle, suggestLecture } from '@/lib/scoring';
import {
  articleLevelOptions,
  departmentActivityRoles,
  instituteActivityRoles,
  lectureVenueOptions,
  Option,
  studentActivityRoles,
  templates,
} from '@/types/formTypes';

type ActivityKey = 'studentActivities' | 'departmentActivities' | 'instituteActivities';
const KIND: Record<ActivityKey, 'student' | 'department' | 'institute'> = {
  studentActivities: 'student',
  departmentActivities: 'department',
  instituteActivities: 'institute',
};

function ActivityBlock({ name, title, subtitle, roles, placeholder }: { name: ActivityKey; title: string; subtitle: string; roles: Option[]; placeholder: string }) {
  const { formData } = useFormContext();
  const total = formData[name].reduce((a, r) => a + num(r.api), 0);
  return (
    <section>
      <h3 className="section-title">{title}</h3>
      <p className="subtitle">{subtitle}</p>
      <RepeatableList name={name} template={templates.activity} itemLabel="Activity" badge={(r) => <PointsBadge value={r.api} />}>
        {(a, _i, set) => (
          <>
            <FormField label="Activity description" type="textarea" value={a.activity} placeholder={placeholder} onChange={(v) => set('activity', v)} />
            <FormField label="Your role" type="select" value={a.role} options={roles} onChange={(v) => set('role', v)} />
            <ApiField value={a.api} onChange={(v) => set('api', v)} suggested={suggestActivity(KIND[name], a)} />
          </>
        )}
      </RepeatableList>
      <SectionTotal label="Sub-total" claimed={total} counted={Math.min(total, CAPS.activityEach)} cap={CAPS.activityEach} />
    </section>
  );
}

export default function ActivitiesPage() {
  const { formData, apiScores } = useFormContext();
  const score = apiScores.byKey.activities;
  const lectureTotal = formData.lectures.reduce((a, r) => a + num(r.api), 0);
  const articleTotal = formData.articles.reduce((a, r) => a + num(r.api), 0);

  return (
    <div>
      <h2 className="page-title">Co-Curricular Activities & Contributions</h2>
      <p className="subtitle">Item 13</p>

      <div className="info-message">
        <strong>Total API for item 13 is capped at {CAPS.activitiesTotal} points.</strong>
        <br />
        13A / 13B / 13C / 13D: max 20 points each. 13E: max 10 points.
      </div>

      <ActivityBlock
        name="studentActivities"
        title="13A · Students’ extra-curricular & co-curricular activities"
        subtitle="5 API points per activity, 10 if in a lead role. Maximum 20."
        roles={studentActivityRoles}
        placeholder="e.g., Faculty coordinator, literary/debating society; NSS camp; tech fest"
      />
      <ActivityBlock
        name="departmentActivities"
        title="13B · Departmental activities & development"
        subtitle="5 API as In-charge / Chairman, 3 as member. Maximum 20."
        roles={departmentActivityRoles}
        placeholder="e.g., Timetable in-charge; NBA/NAAC documentation; department newsletter"
      />
      <ActivityBlock
        name="instituteActivities"
        title="13C · Institute activities & development"
        subtitle="10 API at Director / Dean / HoD level, 5 for committee membership. Maximum 20."
        roles={instituteActivityRoles}
        placeholder="e.g., Member, Anti-ragging committee; Warden; Chief proctor"
      />

      <section>
        <h3 className="section-title">13D · Special / extension / expert / invited lectures delivered</h3>
        <p className="subtitle">10 points outside the institute, 5 within. Maximum 20.</p>
        <RepeatableList name="lectures" template={templates.lectures} itemLabel="Lecture" badge={(r) => <PointsBadge value={r.api} />}>
          {(l, _i, set) => (
            <>
              <FormField label="Topic, host institution & place" value={l.title} placeholder="e.g., ‘Partition literature’, Panjab University, Chandigarh" onChange={(v) => set('title', v)} wide />
              <FormField label="Where" type="select" value={l.venue} options={lectureVenueOptions} onChange={(v) => set('venue', v)} />
              <FormField label="Date" type="date" value={l.date} onChange={(v) => set('date', v)} />
              <ApiField value={l.api} onChange={(v) => set('api', v)} suggested={suggestLecture(l)} />
            </>
          )}
        </RepeatableList>
        <SectionTotal label="Sub-total" claimed={lectureTotal} counted={Math.min(lectureTotal, CAPS.activityEach)} cap={CAPS.activityEach} />
      </section>

      <section>
        <h3 className="section-title">13E · Articles, monographs, technical reports, reviews written</h3>
        <p className="subtitle">Includes book reviews, newspaper/popular articles, policy briefs and translations of articles. 1 / 2 / 3 points by level. Maximum 10.</p>
        <RepeatableList name="articles" template={templates.articles} itemLabel="Article" badge={(r) => <PointsBadge value={r.api} />}>
          {(a, _i, set) => (
            <>
              <FormField label="Title & where published" type="textarea" value={a.title} placeholder="e.g., Review of ‘…’, The Book Review, Vol. 48" onChange={(v) => set('title', v)} />
              <FormField label="Level" type="select" value={a.level} options={articleLevelOptions} onChange={(v) => set('level', v)} />
              <ApiField value={a.api} onChange={(v) => set('api', v)} suggested={suggestArticle(a)} />
            </>
          )}
        </RepeatableList>
        <SectionTotal label="Sub-total" claimed={articleTotal} counted={Math.min(articleTotal, CAPS.articles)} cap={CAPS.articles} />
      </section>

      <SectionTotal label="Item 13 total" claimed={score.claimed} counted={score.counted} cap={CAPS.activitiesTotal} />
    </div>
  );
}
