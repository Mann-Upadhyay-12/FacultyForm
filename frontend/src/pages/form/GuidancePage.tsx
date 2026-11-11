import { ApiField, FormField } from '@/components/assesment/FormField';
import { PointsBadge, RepeatableList, SectionTotal } from '@/components/assesment/RepeatableList';
import { useFormContext } from '@/context/FormContext';
import { suggestGuidance } from '@/lib/scoring';
import { levelOptions, statusOptions, templates } from '@/types/formTypes';

export default function GuidancePage() {
  const { apiScores } = useFormContext();

  return (
    <div>
      <h2 className="page-title">Research Guidance</h2>
      <p className="subtitle">Item 17</p>

      <div className="info-message">
        <strong>API points</strong>
        <br />• M.Tech / M.Phil / D.D. / M.S. degree awarded: 5
        <br />• Ph.D. degree awarded: 10 · Ph.D. thesis submitted: 7 · Ongoing Ph.D. (&gt;6 months): 3
        <br />
        <strong>Joint guidance:</strong> shared as per book authorship rules.
      </div>

      <RepeatableList name="guidance" template={templates.guidance} itemLabel="Student" badge={(r) => <PointsBadge value={r.api} />}>
        {(g, _i, set) => (
          <>
            <FormField label="Enrolment no. & name of the student" value={g.enrolName} placeholder="e.g., 236HS001 – Ms. Priya Thakur" onChange={(v) => set('enrolName', v)} wide />
            <FormField label="Title of thesis / dissertation / project" type="textarea" value={g.title} placeholder="Title" onChange={(v) => set('title', v)} />
            <FormField label="Joint supervisors" value={g.jointSupervisors} placeholder="Names, or NA" onChange={(v) => set('jointSupervisors', v)} />
            <FormField label="Level" type="select" value={g.level} options={levelOptions} onChange={(v) => set('level', v)} />
            <FormField label="Status" type="radio" value={g.status} options={statusOptions} onChange={(v) => set('status', v)} />
            <ApiField
              value={g.api}
              onChange={(v) => set('api', v)}
              suggested={suggestGuidance(g)}
              hint={g.jointSupervisors && !/^na$/i.test(g.jointSupervisors.trim()) ? 'Joint guidance — apply your share.' : undefined}
            />
          </>
        )}
      </RepeatableList>

      <SectionTotal label="Item 17 total" claimed={apiScores.byKey.guidance.claimed} />
    </div>
  );
}
