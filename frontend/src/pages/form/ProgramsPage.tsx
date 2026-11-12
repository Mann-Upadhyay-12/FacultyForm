import { ApiField, FormField } from '@/components/assesment/FormField';
import { PointsBadge, RepeatableList, SectionTotal } from '@/components/assesment/RepeatableList';
import { useFormContext } from '@/context/FormContext';
import { suggestProgram } from '@/lib/scoring';
import { durationOptions, modeOptions, participationOptions, programTypeOptions, templates } from '@/types/formTypes';

export default function ProgramsPage() {
  const { apiScores } = useFormContext();
  const score = apiScores.byKey.programs;

  return (
    <div>
      <h2 className="page-title">Orientation / Refresher Courses & Programmes</h2>
      <p className="subtitle">
        Item 11 — Summer/Winter Schools, FDPs, Short-term courses, Seminars, Conferences and Workshops attended or organised.
      </p>

      <div className="info-message">
        <strong>API points guide</strong>
        <br />• Attended: 1 / 3 / 5 for &lt;1 week / 1 week / 2+ weeks
        <br />• Organised: 5 / 10 / 20, plus 5 extra if Chief Organiser
        <br />• Seminars attended without presentation: 2 each (max 5 in total)
      </div>

      <RepeatableList
        name="programs"
        template={templates.programs}
        itemLabel="Programme"
        badge={(p) => <PointsBadge value={p.api} />}
      >
        {(p, _i, set) => (
          <>
            <FormField label="Title" value={p.title} placeholder="e.g., FDP on Outcome Based Education" onChange={(v) => set('title', v)} wide />
            <FormField label="Programme type" type="select" value={p.programType} options={programTypeOptions} onChange={(v) => set('programType', v)} />
            <FormField label="Mode" type="select" value={p.mode} options={modeOptions} onChange={(v) => set('mode', v)} />
            <FormField label="Dates" value={p.dates} placeholder="e.g., 11-06-2025 to 30-06-2025" onChange={(v) => set('dates', v)} />
            <FormField
              label="Sponsoring agency, organiser & place"
              value={p.agency}
              placeholder="e.g., AICTE-ATAL, JUIT Solan"
              onChange={(v) => set('agency', v)}
            />
            <FormField label="Type of participation" type="radio" value={p.attendedOrganized} options={participationOptions} onChange={(v) => set('attendedOrganized', v)} />
            <FormField label="Programme duration" type="select" value={p.duration} options={durationOptions} onChange={(v) => set('duration', v)} />
            <ApiField value={p.api} onChange={(v) => set('api', v)} suggested={suggestProgram(p)} />
          </>
        )}
      </RepeatableList>

      <SectionTotal label="Item 11 total" claimed={score.claimed} counted={score.counted} />
    </div>
  );
}
