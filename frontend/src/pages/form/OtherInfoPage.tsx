import { ApiField, FormField } from '@/components/assesment/FormField';
import { PointsBadge, RepeatableList, SectionTotal } from '@/components/assesment/RepeatableList';
import { useFormContext } from '@/context/FormContext';
import { CAPS, suggestAchievement, suggestMembership } from '@/lib/scoring';
import { achievementCategoryOptions, membershipRoleOptions, professionalBodySuggestions, templates } from '@/types/formTypes';

export default function OtherInfoPage() {
  const { formData, handleChange, setCertified, apiScores } = useFormContext();
  const mem = apiScores.byKey.membership;

  return (
    <div>
      <h2 className="page-title">Other Information</h2>
      <p className="subtitle">Items 18 – 19, enclosures and certification.</p>

      <h3 className="section-title">Membership of professional bodies / committees (item 18)</h3>
      <div className="info-message">7 API points per membership, 10 for chairmanship / office bearer. Maximum {CAPS.membership} points.</div>

      <RepeatableList name="membership" template={templates.membership} itemLabel="Membership" badge={(r) => <PointsBadge value={r.api} />}>
        {(m, _i, set) => (
          <>
            <FormField
              label="Professional body"
              value={m.body}
              placeholder="Select or type, e.g., IEEE, Indian Sociological Society"
              suggestions={professionalBodySuggestions}
              onChange={(v) => set('body', v)}
            />
            <FormField label="Membership ID / number" value={m.idNumber} placeholder="e.g., LM-12345" onChange={(v) => set('idNumber', v)} />
            <FormField label="Role" type="select" value={m.role} options={membershipRoleOptions} onChange={(v) => set('role', v)} />
            <ApiField value={m.api} onChange={(v) => set('api', v)} suggested={suggestMembership(m)} />
          </>
        )}
      </RepeatableList>
      <SectionTotal label="Item 18 total" claimed={mem.claimed} counted={mem.counted} cap={CAPS.membership} />

      <h3 className="section-title">Patents, technology transfer & other achievements (item 19)</h3>
      <div className="info-message">
        Patents, technology transfer, products / processes: 30 points (national) or 50 (international) each. Other achievements — awards,
        fellowships, creative work, policy contributions — up to 30 points based on importance, novelty and effort.
      </div>

      <RepeatableList name="achievements" template={templates.achievements} itemLabel="Achievement" badge={(r) => <PointsBadge value={r.api} />}>
        {(a, _i, set) => (
          <>
            <FormField label="Details" type="textarea" value={a.description} placeholder="e.g., Indian patent 2025/123456 ‘…’; or Sahitya Akademi translation prize" onChange={(v) => set('description', v)} />
            <FormField label="Category" type="select" value={a.category} options={achievementCategoryOptions} onChange={(v) => set('category', v)} />
            <ApiField value={a.api} onChange={(v) => set('api', v)} suggested={suggestAchievement(a)} max={a.category === 'Other' ? CAPS.otherAchievement : undefined} />
          </>
        )}
      </RepeatableList>
      <SectionTotal label="Item 19 total" claimed={apiScores.byKey.achievements.claimed} counted={apiScores.byKey.achievements.counted} />

      <div className="field-grid">
        <FormField
          label="Any other information"
          type="textarea"
          value={formData.otherInfo}
          placeholder="Anything else the committee should know"
          onChange={(v) => handleChange('otherInfo', v)}
        />
        <FormField
          label="List of enclosures"
          type="textarea"
          value={formData.enclosures}
          placeholder="One per line — e.g., FDP certificate, paper first pages, sanction letter"
          onChange={(v) => handleChange('enclosures', v)}
        />
      </div>

      <label className={`certification-box ${formData.certified ? 'is-checked' : ''}`}>
        <input type="checkbox" checked={formData.certified} onChange={(e) => setCertified(e.target.checked)} />
        <span>
          <strong>Certification:</strong> I certify that the above data is correct and I shall be responsible for any inaccurate/incorrect data
          and shall be liable for suitable action for the same, as decided by the authorities.
        </span>
      </label>
    </div>
  );
}
