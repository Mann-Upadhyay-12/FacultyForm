import { ApiField, FormField } from '@/components/assesment/FormField';
import { RepeatableList, SectionTotal } from '@/components/assesment/RepeatableList';
import { useFormContext } from '@/context/FormContext';
import { attendanceStats, CAPS, num, suggestClasses } from '@/lib/scoring';
import { Course, courseLevelOptions, courseTypeOptions, excessClassOptions, templates } from '@/types/formTypes';

function CourseFields({ course, set }: { course: Course; set: (f: keyof Course & string, v: string) => void }) {
  const over = num(course.scheduled) > 0 && num(course.engaged) > num(course.scheduled);
  const pct = num(course.scheduled) > 0 ? Math.round((num(course.engaged) / num(course.scheduled)) * 100) : null;
  return (
    <>
      <FormField label="Course code" value={course.courseCode} placeholder="e.g., 18B11CI311 / 18B11HS111" onChange={(v) => set('courseCode', v)} />
      <FormField label="Course title" value={course.courseTitle} placeholder="e.g., Data Structures / Professional Communication" onChange={(v) => set('courseTitle', v)} />
      <FormField label="Level" type="select" value={course.level} options={courseLevelOptions} onChange={(v) => set('level', v)} />
      <FormField label="Component" type="select" value={course.courseType} options={courseTypeOptions} onChange={(v) => set('courseType', v)} />
      <FormField label="Contact hours / week" type="number" min={0} max={40} value={course.contactHours} placeholder="e.g., 3" onChange={(v) => set('contactHours', v)} />
      <FormField label="Classes scheduled" type="number" min={0} value={course.scheduled} placeholder="e.g., 42" onChange={(v) => set('scheduled', v)} />
      <FormField
        label="Classes engaged"
        type="number"
        min={0}
        value={course.engaged}
        placeholder="e.g., 41"
        onChange={(v) => set('engaged', v)}
        error={over ? 'Cannot be more than classes scheduled.' : undefined}
        hint={pct !== null ? `${pct}% of scheduled classes engaged` : undefined}
      />
    </>
  );
}

export default function TeachingPage() {
  const { formData, handleChange, apiScores } = useFormContext();
  const stats = attendanceStats([...formData.oddSemester, ...formData.evenSemester]);

  return (
    <div>
      <h2 className="page-title">Teaching, Learning and Evaluation Activities</h2>
      <p className="subtitle">Items 12.1 – 12.2</p>

      <div className="info-message">
        <strong>API scoring (12.1):</strong> 25 points if 95%+ of scheduled classes were engaged, 15 if 80%+, 0 below 80%.
        +5 per semester for classes engaged in excess of norms.
      </div>

      <section className="semester-section">
        <h3 className="section-title">Odd semester (July – December)</h3>
        <RepeatableList name="oddSemester" template={templates.course} itemLabel="Course" addLabel="Add odd-semester course">
          {(c, _i, set) => <CourseFields course={c} set={set} />}
        </RepeatableList>
        <div className="field-grid">
          <FormField
            label="Classes engaged in excess of norms (odd semester)"
            type="select"
            value={formData.oddExcessApi}
            options={excessClassOptions}
            onChange={(v) => handleChange('oddExcessApi', v)}
          />
        </div>
      </section>

      <section className="semester-section">
        <h3 className="section-title">Even semester (January – June)</h3>
        <RepeatableList name="evenSemester" template={templates.course} itemLabel="Course" addLabel="Add even-semester course">
          {(c, _i, set) => <CourseFields course={c} set={set} />}
        </RepeatableList>
        <div className="field-grid">
          <FormField
            label="Classes engaged in excess of norms (even semester)"
            type="select"
            value={formData.evenExcessApi}
            options={excessClassOptions}
            onChange={(v) => handleChange('evenExcessApi', v)}
          />
        </div>
      </section>

      <div className="calc-box">
        <div>
          <span className="calc-label">Classes engaged / scheduled (both semesters)</span>
          <strong>
            {stats.engaged} / {stats.scheduled}
            {stats.percent !== null && ` · ${stats.percent.toFixed(1)}%`}
          </strong>
        </div>
        <ApiField
          label="Self-assessed API for classes engaged (12.1)"
          value={formData.classesApi}
          onChange={(v) => handleChange('classesApi', v)}
          suggested={suggestClasses(formData)}
          max={CAPS.classes}
        />
      </div>

      <h3 className="section-title">Reading / instructional material (12.2)</h3>
      <div className="info-message">Maximum API: 35 points. Score up to 10 for each sub-component below.</div>

      <RepeatableList name="resources" template={templates.resources} itemLabel="Course material">
        {(r, _i, set) => (
          <>
            <FormField
              label="Course code"
              value={r.courseCode}
              placeholder="Select or type a course code"
              suggestions={[...formData.oddSemester, ...formData.evenSemester].map((c) => c.courseCode).filter(Boolean)}
              onChange={(v) => set('courseCode', v)}
            />
            <FormField label="Knowledge resources consulted" type="textarea" value={r.consulted} placeholder="Books, journals, archives, online sources…" onChange={(v) => set('consulted', v)} />
            <FormField label="Prescribed resources" type="textarea" value={r.prescribed} placeholder="Textbooks / readers prescribed to students" onChange={(v) => set('prescribed', v)} />
            <FormField label="Additional resources provided" type="textarea" value={r.additional} placeholder="PPTs, notes, case studies, reading packs, videos…" onChange={(v) => set('additional', v)} />
          </>
        )}
      </RepeatableList>

      <div className="field-grid">
        <FormField
          label="Participatory / innovative teaching-learning methods"
          type="textarea"
          value={formData.participatory}
          placeholder="e.g., flipped classroom, case method, role play, field visits, peer review"
          onChange={(v) => handleChange('participatory', v)}
        />
        <FormField label="Any modification / addition to syllabus" type="textarea" value={formData.modification} placeholder="Give brief details" onChange={(v) => handleChange('modification', v)} />
        <FormField label="Any coverage / introduction beyond syllabus" type="textarea" value={formData.coverageBeyond} placeholder="Give brief details" onChange={(v) => handleChange('coverageBeyond', v)} />
        <ApiField label="Self-assessed API for 12.2" value={formData.teachingApi} onChange={(v) => handleChange('teachingApi', v)} max={CAPS.teachingResources} />
      </div>

      <SectionTotal label="Items 12.1 – 12.2 total" claimed={apiScores.byKey.classes.claimed + apiScores.byKey.resources.claimed} counted={apiScores.byKey.classes.counted + apiScores.byKey.resources.counted} />
    </div>
  );
}
