
import { FormField } from '../FormField';
import { SectionCard } from '../SectionCard';
import { ArrayFieldGroup } from '../ArrayFieldGroup';
import type { FormData, ResearchProject } from '@/types/assessment';

interface ProjectsTabProps {
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

const roleOptions = [
  { label: 'Chief/Principal Investigator', value: 'Chief' },
  { label: 'Co-Investigator', value: 'Co-Investigator' },
  { label: 'Team Member', value: 'Team Member' },
];

const emptyProject: ResearchProject = {
  title: '',
  agency: '',
  duration: '',
  amount: '',
  role: '',
  api: ''
};

export function ProjectsTab({
  formData,
  isEditing,
  toggleEdit,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
}: ProjectsTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Research Projects and Consultancy Works"
        description="Sponsored projects and consultancy (Item 16)"
        infoMessage="API Points based on grant amount: ≥10L→20pts, 4-10L→15pts, 0.5-4L→10pts. Consultancy: 50% of research project points. HSS/Management: Different thresholds apply."
      >
        <ArrayFieldGroup<ResearchProject>
          items={formData.researchProjects}
          onAdd={() => addArrayItem('researchProjects', emptyProject)}
          onRemove={(index) => removeArrayItem('researchProjects', index)}
          addLabel="Add Project"
          itemLabel="Project"
          renderItem={(project, index) => (
            <div className="space-y-4">
              <FormField
                label="Title of Research Project/Consultancy Work"
                value={project.title}
                placeholder="Enter project title"
                isEditing={isEditing(`proj-title-${index}`)}
                onEdit={() => toggleEdit(`proj-title-${index}`)}
                onChange={(val) => handleArrayChange('researchProjects', index, 'title', val)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Sponsoring Agency Details"
                  value={project.agency}
                  placeholder="e.g., DST, AICTE, Industry Name"
                  isEditing={isEditing(`proj-agency-${index}`)}
                  onEdit={() => toggleEdit(`proj-agency-${index}`)}
                  onChange={(val) => handleArrayChange('researchProjects', index, 'agency', val)}
                />
                <FormField
                  label="Duration, Sanction Date & Status"
                  value={project.duration}
                  placeholder="e.g., 3 years, 01-04-2022, Ongoing"
                  isEditing={isEditing(`proj-duration-${index}`)}
                  onEdit={() => toggleEdit(`proj-duration-${index}`)}
                  onChange={(val) => handleArrayChange('researchProjects', index, 'duration', val)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Amount Sanctioned (₹)"
                  value={project.amount}
                  placeholder="e.g., 10,00,000"
                  isEditing={isEditing(`proj-amount-${index}`)}
                  onEdit={() => toggleEdit(`proj-amount-${index}`)}
                  onChange={(val) => handleArrayChange('researchProjects', index, 'amount', val)}
                  tooltip="Enter the total sanctioned amount in rupees"
                />
                <FormField
                  label="Role"
                  value={project.role}
                  placeholder="Select role"
                  isEditing={isEditing(`proj-role-${index}`)}
                  onEdit={() => toggleEdit(`proj-role-${index}`)}
                  onChange={(val) => handleArrayChange('researchProjects', index, 'role', val)}
                  type="select"
                  options={roleOptions}
                />
                <FormField
                  label="Self-Assessed API Score"
                  value={project.api}
                  placeholder="Enter API"
                  isEditing={isEditing(`proj-api-${index}`)}
                  onEdit={() => toggleEdit(`proj-api-${index}`)}
                  onChange={(val) => handleArrayChange('researchProjects', index, 'api', val)}
                  type="number"
                  tooltip="Calculate based on grant amount and role. Joint projects: share points as per book authorship rules."
                />
              </div>
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}
