
import { FormField } from '@/components/assesment/FormField';
import { useFormContext } from '@/context/FormContext';

export default function ExaminationPage() {
  const { formData, isEditing, handleEdit, handleChange, handleNestedChange } = useFormContext();

  return (
    <div>
      <h2 className="page-title">Examination and Evaluation Duties</h2>
      
      <div className="info-message">
        API Score for items 12.3 & 12.4 combined is limited to maximum 30 points.
      </div>

      <h3 className="section-title">No. of Question Papers Set</h3>
      <div className="course-fields">
        <FormField
          label="UG T1"
          value={formData.questionPapersSet.ug.t1}
          placeholder="Enter number"
          isEditing={isEditing['qps-ug-t1']}
          onEdit={() => handleEdit('qps-ug-t1')}
          onChange={(val) => handleNestedChange('questionPapersSet', 'ug', 't1', val)}
        />
        <FormField
          label="UG T2"
          value={formData.questionPapersSet.ug.t2}
          placeholder="Enter number"
          isEditing={isEditing['qps-ug-t2']}
          onEdit={() => handleEdit('qps-ug-t2')}
          onChange={(val) => handleNestedChange('questionPapersSet', 'ug', 't2', val)}
        />
        <FormField
          label="UG T3"
          value={formData.questionPapersSet.ug.t3}
          placeholder="Enter number"
          isEditing={isEditing['qps-ug-t3']}
          onEdit={() => handleEdit('qps-ug-t3')}
          onChange={(val) => handleNestedChange('questionPapersSet', 'ug', 't3', val)}
        />
        <FormField
          label="PG T1"
          value={formData.questionPapersSet.pg.t1}
          placeholder="Enter number"
          isEditing={isEditing['qps-pg-t1']}
          onEdit={() => handleEdit('qps-pg-t1')}
          onChange={(val) => handleNestedChange('questionPapersSet', 'pg', 't1', val)}
        />
        <FormField
          label="PG T2"
          value={formData.questionPapersSet.pg.t2}
          placeholder="Enter number"
          isEditing={isEditing['qps-pg-t2']}
          onEdit={() => handleEdit('qps-pg-t2')}
          onChange={(val) => handleNestedChange('questionPapersSet', 'pg', 't2', val)}
        />
        <FormField
          label="PG T3"
          value={formData.questionPapersSet.pg.t3}
          placeholder="Enter number"
          isEditing={isEditing['qps-pg-t3']}
          onEdit={() => handleEdit('qps-pg-t3')}
          onChange={(val) => handleNestedChange('questionPapersSet', 'pg', 't3', val)}
        />
      </div>

      <h3 className="section-title">No. of A/B Evaluated</h3>
      <div className="course-fields">
        <FormField
          label="UG"
          value={formData.abEvaluated.ug}
          placeholder="Enter number"
          isEditing={isEditing['ab-ug']}
          onEdit={() => handleEdit('ab-ug')}
          onChange={(val) => handleNestedChange('abEvaluated', 'ug', '', val)}
        />
        <FormField
          label="PG"
          value={formData.abEvaluated.pg}
          placeholder="Enter number"
          isEditing={isEditing['ab-pg']}
          onEdit={() => handleEdit('ab-pg')}
          onChange={(val) => handleNestedChange('abEvaluated', 'pg', '', val)}
        />
      </div>

      <h3 className="section-title">No. of Students Examined (Practical/Seminar/Project)</h3>
      <div className="course-fields">
        <FormField
          label="UG"
          value={formData.studentsExamined.ug}
          placeholder="Enter number"
          isEditing={isEditing['se-ug']}
          onEdit={() => handleEdit('se-ug')}
          onChange={(val) => handleNestedChange('studentsExamined', 'ug', '', val)}
        />
        <FormField
          label="PG"
          value={formData.studentsExamined.pg}
          placeholder="Enter number"
          isEditing={isEditing['se-pg']}
          onEdit={() => handleEdit('se-pg')}
          onChange={(val) => handleNestedChange('studentsExamined', 'pg', '', val)}
        />
      </div>

      <h3 className="section-title">No. of Examination Invigilation Duties</h3>
      <div className="course-fields">
        <FormField
          label="Allotted T1"
          value={formData.invigilation.allotted.t1}
          placeholder="Enter number"
          isEditing={isEditing['inv-all-t1']}
          onEdit={() => handleEdit('inv-all-t1')}
          onChange={(val) => handleNestedChange('invigilation', 'allotted', 't1', val)}
        />
        <FormField
          label="Allotted T2"
          value={formData.invigilation.allotted.t2}
          placeholder="Enter number"
          isEditing={isEditing['inv-all-t2']}
          onEdit={() => handleEdit('inv-all-t2')}
          onChange={(val) => handleNestedChange('invigilation', 'allotted', 't2', val)}
        />
        <FormField
          label="Allotted T3"
          value={formData.invigilation.allotted.t3}
          placeholder="Enter number"
          isEditing={isEditing['inv-all-t3']}
          onEdit={() => handleEdit('inv-all-t3')}
          onChange={(val) => handleNestedChange('invigilation', 'allotted', 't3', val)}
        />
        <FormField
          label="Performed T1"
          value={formData.invigilation.performed.t1}
          placeholder="Enter number"
          isEditing={isEditing['inv-per-t1']}
          onEdit={() => handleEdit('inv-per-t1')}
          onChange={(val) => handleNestedChange('invigilation', 'performed', 't1', val)}
        />
        <FormField
          label="Performed T2"
          value={formData.invigilation.performed.t2}
          placeholder="Enter number"
          isEditing={isEditing['inv-per-t2']}
          onEdit={() => handleEdit('inv-per-t2')}
          onChange={(val) => handleNestedChange('invigilation', 'performed', 't2', val)}
        />
        <FormField
          label="Performed T3"
          value={formData.invigilation.performed.t3}
          placeholder="Enter number"
          isEditing={isEditing['inv-per-t3']}
          onEdit={() => handleEdit('inv-per-t3')}
          onChange={(val) => handleNestedChange('invigilation', 'performed', 't3', val)}
        />
      </div>

      <FormField
        label="Self-Assessed API Score for Examination"
        value={formData.examinationApi}
        placeholder="Enter API score (max 30 combined with 12.3)"
        isEditing={isEditing.examinationApi}
        onEdit={() => handleEdit('examinationApi')}
        onChange={(val) => handleChange('examinationApi', val)}
      />
    </div>
  );
}
