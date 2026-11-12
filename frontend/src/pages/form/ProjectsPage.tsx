import { ApiField, FormField } from '@/components/assesment/FormField';
import { PointsBadge, RepeatableList, SectionTotal } from '@/components/assesment/RepeatableList';
import { useFormContext } from '@/context/FormContext';
import { amountInLakhs, isHssLike, suggestProject } from '@/lib/scoring';
import { projectKindOptions, projectStatusOptions, roleOptions, sponsoringAgencySuggestions, templates } from '@/types/formTypes';

export default function ProjectsPage() {
  const { formData, apiScores } = useFormContext();
  const hss = isHssLike(formData.department);

  return (
    <div>
      <h2 className="page-title">Research Projects & Consultancy</h2>
      <p className="subtitle">Item 16</p>

      <div className="info-message">
        <strong>Sponsored research projects</strong>
        <br />• ≥ ₹10 lakh (≥ ₹3 lakh for HSS / Management): 20 points
        <br />• ₹4–10 lakh (₹1–3 lakh for HSS / Management): 15 points
        <br />• ₹0.5–4 lakh (₹0.25–1 lakh for HSS / Management): 10 points
        <br />
        <strong>Consultancy:</strong> 50% of the above amounts and points. <strong>Joint projects:</strong> shared as per book authorship rules.
        <br />
        <em>
          {formData.department
            ? hss
              ? 'Using HSS / Management thresholds for your department.'
              : 'Using Science & Engineering thresholds for your department.'
            : 'Choose your department under Personal Info so the right thresholds are used.'}
        </em>
      </div>

      <RepeatableList name="researchProjects" template={templates.researchProjects} itemLabel="Project" badge={(r) => <PointsBadge value={r.api} />}>
        {(p, _i, set) => {
          const lakhs = amountInLakhs(p.amount);
          return (
            <>
              <FormField label="Title of the project / consultancy" value={p.title} placeholder="Project title" onChange={(v) => set('title', v)} wide />
              <FormField label="Kind" type="select" value={p.kind} options={projectKindOptions} onChange={(v) => set('kind', v)} />
              <FormField
                label="Sponsoring agency"
                value={p.agency}
                placeholder="Select or type, e.g., ICSSR, DST, Industry"
                suggestions={sponsoringAgencySuggestions}
                onChange={(v) => set('agency', v)}
              />
              <FormField label="Duration & sanction date" value={p.duration} placeholder="e.g., 2 years, sanctioned 01-04-2025" onChange={(v) => set('duration', v)} />
              <FormField label="Status" type="select" value={p.status} options={projectStatusOptions} onChange={(v) => set('status', v)} />
              <FormField
                label="Amount sanctioned (₹ in lakhs)"
                type="number"
                min={0}
                step="any"
                value={p.amount}
                placeholder="e.g., 4.5"
                onChange={(v) => set('amount', v)}
                hint={lakhs > 0 && String(lakhs) !== p.amount ? `Read as ₹${lakhs.toFixed(2)} lakh` : undefined}
              />
              <FormField label="Your role" type="radio" value={p.role} options={roleOptions} onChange={(v) => set('role', v)} />
              <ApiField
                value={p.api}
                onChange={(v) => set('api', v)}
                suggested={suggestProject(p, formData.department)}
                hint={p.role && p.role !== 'Chief' ? 'Suggested points are for the whole project — apply your share.' : undefined}
              />
            </>
          );
        }}
      </RepeatableList>

      <SectionTotal label="Item 16 total" claimed={apiScores.byKey.projects.claimed} />
    </div>
  );
}
