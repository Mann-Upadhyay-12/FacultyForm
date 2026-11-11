import { ApiField, FormField } from '@/components/assesment/FormField';
import { SectionTotal } from '@/components/assesment/RepeatableList';
import { useFormContext, NestedKey } from '@/context/FormContext';
import { CAPS, num } from '@/lib/scoring';

const TERMS = ['t1', 't2', 't3'] as const;
const TERM_LABEL = { t1: 'T1', t2: 'T2', t3: 'T3' };

function CountInput({ label, value, onChange, error }: { label: string; value: string; onChange: (v: string) => void; error?: string }) {
  return <FormField label={label} type="number" min={0} step={1} value={value} placeholder="0" onChange={onChange} error={error} />;
}

export default function ExaminationPage() {
  const { formData, handleChange, handleNestedChange, apiScores } = useFormContext();
  const nested = (section: NestedKey, sub: string, key = '') => (v: string) => handleNestedChange(section, sub, key, v);
  const score = apiScores.byKey.examination;

  return (
    <div>
      <h2 className="page-title">Project Guidance & Examination Duties</h2>
      <p className="subtitle">Items 12.3 – 12.4. The combined API for these two items is limited to {CAPS.examPlusGuidance} points.</p>

      <h3 className="section-title">Project guidance at UG level (12.3)</h3>
      <div className="field-grid">
        <CountInput label="Number of projects guided" value={formData.projectsGuided} onChange={(v) => handleChange('projectsGuided', v)} />
        <CountInput label="Number of students guided" value={formData.studentsGuided} onChange={(v) => handleChange('studentsGuided', v)} />
        <ApiField label="Self-assessed API for 12.3" value={formData.projectGuidanceApi} onChange={(v) => handleChange('projectGuidanceApi', v)} max={CAPS.projectGuidance} />
      </div>

      <h3 className="section-title">Question papers set (12.4)</h3>
      <div className="exam-table">
        <div className="exam-row exam-head">
          <span />
          {TERMS.map((t) => (
            <span key={t}>{TERM_LABEL[t]}</span>
          ))}
        </div>
        {(['ug', 'pg'] as const).map((lvl) => (
          <div className="exam-row" key={lvl}>
            <span className="exam-row-label">{lvl.toUpperCase()}</span>
            {TERMS.map((t) => (
              <CountInput
                key={t}
                label={`${lvl.toUpperCase()} ${TERM_LABEL[t]}`}
                value={formData.questionPapersSet[lvl][t]}
                onChange={nested('questionPapersSet', lvl, t)}
              />
            ))}
          </div>
        ))}
      </div>

      <h3 className="section-title">Answer books evaluated</h3>
      <div className="field-grid">
        <CountInput label="UG answer books" value={formData.abEvaluated.ug} onChange={nested('abEvaluated', 'ug')} />
        <CountInput label="PG answer books" value={formData.abEvaluated.pg} onChange={nested('abEvaluated', 'pg')} />
      </div>

      <h3 className="section-title">Students examined (practical / seminar / project / viva)</h3>
      <div className="field-grid">
        <CountInput label="UG students" value={formData.studentsExamined.ug} onChange={nested('studentsExamined', 'ug')} />
        <CountInput label="PG students" value={formData.studentsExamined.pg} onChange={nested('studentsExamined', 'pg')} />
      </div>

      <h3 className="section-title">Examination invigilation duties</h3>
      <div className="exam-table">
        <div className="exam-row exam-head">
          <span />
          {TERMS.map((t) => (
            <span key={t}>{TERM_LABEL[t]}</span>
          ))}
        </div>
        {(['allotted', 'performed'] as const).map((row) => (
          <div className="exam-row" key={row}>
            <span className="exam-row-label">{row === 'allotted' ? 'Allotted' : 'Performed'}</span>
            {TERMS.map((t) => {
              const over =
                row === 'performed' &&
                num(formData.invigilation.allotted[t]) > 0 &&
                num(formData.invigilation.performed[t]) > num(formData.invigilation.allotted[t]);
              return (
                <CountInput
                  key={t}
                  label={`${row === 'allotted' ? 'Allotted' : 'Performed'} ${TERM_LABEL[t]}`}
                  value={formData.invigilation[row][t]}
                  onChange={nested('invigilation', row, t)}
                  error={over ? 'More than allotted' : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="field-grid">
        <ApiField
          label="Self-assessed API for examination duties (12.4)"
          value={formData.examinationApi}
          onChange={(v) => handleChange('examinationApi', v)}
          max={CAPS.examPlusGuidance}
        />
      </div>

      <SectionTotal label="Items 12.3 + 12.4" claimed={score.claimed} counted={score.counted} cap={CAPS.examPlusGuidance} />
    </div>
  );
}
