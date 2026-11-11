import { FormField } from '../FormField';
import { SectionCard } from '../SectionCard';
import type { FormData } from '@/types/assessment';

interface ExaminationTabProps {
  formData: FormData;
  isEditing: (field: string) => boolean;
  toggleEdit: (field: string) => void;
  handleChange: (field: keyof FormData, value: string) => void;
  handleNestedChange: (
    section: keyof FormData,
    subSection: string,
    key: string,
    value: string
  ) => void;
}

export function ExaminationTab({
  formData,
  isEditing,
  toggleEdit,
  handleChange,
  handleNestedChange,
}: ExaminationTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Question Papers Set"
        description="Number of question papers prepared (Item 12.4)"
        infoMessage="Record the number of question papers set for each term (T1, T2, T3) for UG and PG levels."
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Undergraduate (UG)</h4>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="T1 Papers"
                value={formData.questionPapersSet.ug.t1}
                placeholder="0"
                isEditing={isEditing('qps-ug-t1')}
                onEdit={() => toggleEdit('qps-ug-t1')}
                onChange={(val) => handleNestedChange('questionPapersSet', 'ug', 't1', val)}
                type="number"
              />
              <FormField
                label="T2 Papers"
                value={formData.questionPapersSet.ug.t2}
                placeholder="0"
                isEditing={isEditing('qps-ug-t2')}
                onEdit={() => toggleEdit('qps-ug-t2')}
                onChange={(val) => handleNestedChange('questionPapersSet', 'ug', 't2', val)}
                type="number"
              />
              <FormField
                label="T3 Papers"
                value={formData.questionPapersSet.ug.t3}
                placeholder="0"
                isEditing={isEditing('qps-ug-t3')}
                onEdit={() => toggleEdit('qps-ug-t3')}
                onChange={(val) => handleNestedChange('questionPapersSet', 'ug', 't3', val)}
                type="number"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Postgraduate (PG)</h4>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="T1 Papers"
                value={formData.questionPapersSet.pg.t1}
                placeholder="0"
                isEditing={isEditing('qps-pg-t1')}
                onEdit={() => toggleEdit('qps-pg-t1')}
                onChange={(val) => handleNestedChange('questionPapersSet', 'pg', 't1', val)}
                type="number"
              />
              <FormField
                label="T2 Papers"
                value={formData.questionPapersSet.pg.t2}
                placeholder="0"
                isEditing={isEditing('qps-pg-t2')}
                onEdit={() => toggleEdit('qps-pg-t2')}
                onChange={(val) => handleNestedChange('questionPapersSet', 'pg', 't2', val)}
                type="number"
              />
              <FormField
                label="T3 Papers"
                value={formData.questionPapersSet.pg.t3}
                placeholder="0"
                isEditing={isEditing('qps-pg-t3')}
                onEdit={() => toggleEdit('qps-pg-t3')}
                onChange={(val) => handleNestedChange('questionPapersSet', 'pg', 't3', val)}
                type="number"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Answer Books Evaluated"
        description="Number of A/B answer books evaluated"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="UG Answer Books"
            value={formData.abEvaluated.ug}
            placeholder="e.g., 88"
            isEditing={isEditing('ab-ug')}
            onEdit={() => toggleEdit('ab-ug')}
            onChange={(val) => handleNestedChange('abEvaluated', 'ug', '', val)}
            type="number"
          />
          <FormField
            label="PG Answer Books"
            value={formData.abEvaluated.pg}
            placeholder="e.g., 25"
            isEditing={isEditing('ab-pg')}
            onEdit={() => toggleEdit('ab-pg')}
            onChange={(val) => handleNestedChange('abEvaluated', 'pg', '', val)}
            type="number"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Students Examined"
        description="Practical/Seminar/Project examinations conducted"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="UG Students Examined"
            value={formData.studentsExamined.ug}
            placeholder="Number of UG students"
            isEditing={isEditing('se-ug')}
            onEdit={() => toggleEdit('se-ug')}
            onChange={(val) => handleNestedChange('studentsExamined', 'ug', '', val)}
            type="number"
          />
          <FormField
            label="PG Students Examined"
            value={formData.studentsExamined.pg}
            placeholder="Number of PG students"
            isEditing={isEditing('se-pg')}
            onEdit={() => toggleEdit('se-pg')}
            onChange={(val) => handleNestedChange('studentsExamined', 'pg', '', val)}
            type="number"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Examination Invigilation Duties"
        description="Invigilation duties allotted and performed"
      >
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Duties Allotted</h4>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="T1"
                value={formData.invigilation.allotted.t1}
                placeholder="0"
                isEditing={isEditing('inv-all-t1')}
                onEdit={() => toggleEdit('inv-all-t1')}
                onChange={(val) => handleNestedChange('invigilation', 'allotted', 't1', val)}
                type="number"
              />
              <FormField
                label="T2"
                value={formData.invigilation.allotted.t2}
                placeholder="0"
                isEditing={isEditing('inv-all-t2')}
                onEdit={() => toggleEdit('inv-all-t2')}
                onChange={(val) => handleNestedChange('invigilation', 'allotted', 't2', val)}
                type="number"
              />
              <FormField
                label="T3"
                value={formData.invigilation.allotted.t3}
                placeholder="0"
                isEditing={isEditing('inv-all-t3')}
                onEdit={() => toggleEdit('inv-all-t3')}
                onChange={(val) => handleNestedChange('invigilation', 'allotted', 't3', val)}
                type="number"
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Duties Performed</h4>
            <div className="grid grid-cols-3 gap-4">
              <FormField
                label="T1"
                value={formData.invigilation.performed.t1}
                placeholder="0"
                isEditing={isEditing('inv-perf-t1')}
                onEdit={() => toggleEdit('inv-perf-t1')}
                onChange={(val) => handleNestedChange('invigilation', 'performed', 't1', val)}
                type="number"
              />
              <FormField
                label="T2"
                value={formData.invigilation.performed.t2}
                placeholder="0"
                isEditing={isEditing('inv-perf-t2')}
                onEdit={() => toggleEdit('inv-perf-t2')}
                onChange={(val) => handleNestedChange('invigilation', 'performed', 't2', val)}
                type="number"
              />
              <FormField
                label="T3"
                value={formData.invigilation.performed.t3}
                placeholder="0"
                isEditing={isEditing('inv-perf-t3')}
                onEdit={() => toggleEdit('inv-perf-t3')}
                onChange={(val) => handleNestedChange('invigilation', 'performed', 't3', val)}
                type="number"
              />
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Total Examination API Score"
        description="Combined API for items 12.3 and 12.4 (Maximum: 30)"
      >
        <FormField
          label="Self-Assessed API Score"
          value={formData.examinationApi}
          placeholder="Enter total API (max 30)"
          isEditing={isEditing('examinationApi')}
          onEdit={() => toggleEdit('examinationApi')}
          onChange={(val) => handleChange('examinationApi', val)}
          type="number"
          tooltip="Combined score for project guidance and examination duties. Maximum: 30 points."
        />
      </SectionCard>
    </div>
  );
}
