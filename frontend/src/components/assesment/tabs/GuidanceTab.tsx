import { FormField } from '../FormField';
import { SectionCard } from '../SectionCard';
import { ArrayFieldGroup } from '../ArrayFieldGroup';
import type { FormData, Guidance } from '@/types/assessment';

interface GuidanceTabProps {
  formData: FormData;
  isEditing: (field: string) => boolean;
  toggleEdit: (field: string) => void;
  handleArrayChange: <T extends Record<string, unknown>>(
    arrayName: keyof FormData,
    index: number,
    field: keyof T,
    value: string
  ) => void;
  addArrayItem: <T extends Record<string, unknown>>(
    arrayName: keyof FormData,
    template: T
  ) => void;
  removeArrayItem: (arrayName: keyof FormData, index: number) => void;
}

const levelOptions = [
  { label: 'Ph.D.', value: 'PhD' },
  { label: 'D.D. (Doctor of Design)', value: 'DD' },
  { label: 'M.Tech', value: 'MTech' },
  { label: 'M.Phil', value: 'MPhil' },
  { label: 'M.S.', value: 'MS' },
];

const statusOptions = [
  { label: 'Completed - Degree Awarded', value: 'Completed' },
  { label: 'Thesis Submitted', value: 'Submitted' },
  { label: 'Ongoing (>6 months)', value: 'Ongoing' },
  { label: 'Recently Registered (<6 months)', value: 'New' },
];

const emptyGuidance: Guidance = {
  enrolName: '',
  title: '',
  jointSupervisors: '',
  level: '',
  status: '',
  api: ''
};

export function GuidanceTab({
  formData,
  isEditing,
  toggleEdit,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
}: GuidanceTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Research Guidance"
        description="Ph.D., M.Tech, M.S., and other research supervision (Item 17)"
        infoMessage="API Points: Ph.D. awarded-10, Ph.D. submitted-7, M.Tech/M.Phil awarded-5, Ongoing Ph.D. (>6 months)-3. Joint guidance: share points as per book authorship rules."
      >
        <ArrayFieldGroup<Guidance>
          items={formData.guidance}
          onAdd={() => addArrayItem('guidance', emptyGuidance)}
          onRemove={(index) => removeArrayItem('guidance', index)}
          addLabel="Add Research Guidance"
          itemLabel="Guidance"
          renderItem={(guide, index) => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Enrollment No. & Name of Student"
                  value={guide.enrolName}
                  placeholder="e.g., 2020PhD1234 - Mr. John Doe"
                  isEditing={isEditing(`guide-enrol-${index}`)}
                  onEdit={() => toggleEdit(`guide-enrol-${index}`)}
                  onChange={(val) => handleArrayChange('guidance', index, 'enrolName', val)}
                />
                <FormField
                  label="Joint Supervisors (if any)"
                  value={guide.jointSupervisors}
                  placeholder="e.g., Prof. A Kumar, Dr. B Singh"
                  isEditing={isEditing(`guide-joint-${index}`)}
                  onEdit={() => toggleEdit(`guide-joint-${index}`)}
                  onChange={(val) => handleArrayChange('guidance', index, 'jointSupervisors', val)}
                  tooltip="Enter names of co-supervisors if applicable"
                />
              </div>
              <FormField
                label="Title of Thesis/Dissertation/Project"
                value={guide.title}
                placeholder="Enter the research title"
                isEditing={isEditing(`guide-title-${index}`)}
                onEdit={() => toggleEdit(`guide-title-${index}`)}
                onChange={(val) => handleArrayChange('guidance', index, 'title', val)}
                multiline
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Level"
                  value={guide.level}
                  placeholder="Select level"
                  isEditing={isEditing(`guide-level-${index}`)}
                  onEdit={() => toggleEdit(`guide-level-${index}`)}
                  onChange={(val) => handleArrayChange('guidance', index, 'level', val)}
                  type="select"
                  options={levelOptions}
                />
                <FormField
                  label="Status"
                  value={guide.status}
                  placeholder="Select status"
                  isEditing={isEditing(`guide-status-${index}`)}
                  onEdit={() => toggleEdit(`guide-status-${index}`)}
                  onChange={(val) => handleArrayChange('guidance', index, 'status', val)}
                  type="select"
                  options={statusOptions}
                />
                <FormField
                  label="Self-Assessed API Score"
                  value={guide.api}
                  placeholder="Enter API"
                  isEditing={isEditing(`guide-api-${index}`)}
                  onEdit={() => toggleEdit(`guide-api-${index}`)}
                  onChange={(val) => handleArrayChange('guidance', index, 'api', val)}
                  type="number"
                  tooltip="Ph.D. awarded: 10pts, Submitted: 7pts, M.Tech: 5pts, Ongoing: 3pts"
                />
              </div>
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}
