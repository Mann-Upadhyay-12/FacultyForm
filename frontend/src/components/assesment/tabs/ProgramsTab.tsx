
import { FormField } from '../FormField';
import { SectionCard } from '../SectionCard';
import { ArrayFieldGroup } from '../ArrayFieldGroup';
import type { FormData, Program } from '@/types/assessment';

interface ProgramsTabProps {
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

const participationTypes = [
  { label: 'Attended', value: 'Attended' },
  { label: 'Organized', value: 'Organized' },
  { label: 'Resource Person', value: 'Resource Person' },
  { label: 'Chief/Principal Organizer', value: 'Chief Organizer' },
];

const durationOptions = [
  { label: 'Less than one week', value: 'Less than one week' },
  { label: 'One week', value: 'One week' },
  { label: 'Two or more weeks', value: 'Two or more weeks' },
  { label: 'Seminar/Conference (1 day)', value: 'Seminar (1 day)' },
  { label: 'Seminar/Conference (2-3 days)', value: 'Seminar (2-3 days)' },
  { label: 'Seminar/Conference (>3 days)', value: 'Seminar (>3 days)' },
];

const emptyProgram: Program = {
  title: '',
  dates: '',
  agency: '',
  attendedOrganized: '',
  duration: '',
  api: ''
};

export function ProgramsTab({
  formData,
  isEditing,
  toggleEdit,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
}: ProgramsTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Orientation/Refresher Courses & Programs"
        description="Summer/Winter Schools, FDPs, Seminars/Conferences/Workshops (Item 11)"
        infoMessage="API Points: Attended programs - 1/3/5 points based on duration. Organized - 5/10/20 points. Add 5 points if Chief Organizer."
      >
        <ArrayFieldGroup<Program>
          items={formData.programs}
          onAdd={() => addArrayItem('programs', emptyProgram)}
          onRemove={(index) => removeArrayItem('programs', index)}
          addLabel="Add Program"
          itemLabel="Program"
          renderItem={(program, index) => (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Program Title"
                value={program.title}
                placeholder="e.g., FDP on AI/ML/DL"
                isEditing={isEditing(`prog-title-${index}`)}
                onEdit={() => toggleEdit(`prog-title-${index}`)}
                onChange={(val) => handleArrayChange('programs', index, 'title', val)}
                className="md:col-span-2"
              />
              <FormField
                label="Dates/Duration"
                value={program.dates}
                placeholder="e.g., 20-02-23 to 24-02-23"
                isEditing={isEditing(`prog-dates-${index}`)}
                onEdit={() => toggleEdit(`prog-dates-${index}`)}
                onChange={(val) => handleArrayChange('programs', index, 'dates', val)}
              />
              <FormField
                label="Sponsoring Agency & Place"
                value={program.agency}
                placeholder="e.g., NIT Jalandhar"
                isEditing={isEditing(`prog-agency-${index}`)}
                onEdit={() => toggleEdit(`prog-agency-${index}`)}
                onChange={(val) => handleArrayChange('programs', index, 'agency', val)}
              />
              <FormField
                label="Type of Participation"
                value={program.attendedOrganized}
                placeholder="Select participation type"
                isEditing={isEditing(`prog-attended-${index}`)}
                onEdit={() => toggleEdit(`prog-attended-${index}`)}
                onChange={(val) => handleArrayChange('programs', index, 'attendedOrganized', val)}
                type="select"
                options={participationTypes}
                tooltip="Select how you participated in this program"
              />
              <FormField
                label="Program Duration"
                value={program.duration}
                placeholder="Select duration"
                isEditing={isEditing(`prog-duration-${index}`)}
                onEdit={() => toggleEdit(`prog-duration-${index}`)}
                onChange={(val) => handleArrayChange('programs', index, 'duration', val)}
                type="select"
                options={durationOptions}
                tooltip="Duration affects API score calculation"
              />
              <FormField
                label="Self-Assessed API Score"
                value={program.api}
                placeholder="Enter API score"
                isEditing={isEditing(`prog-api-${index}`)}
                onEdit={() => toggleEdit(`prog-api-${index}`)}
                onChange={(val) => handleArrayChange('programs', index, 'api', val)}
                type="number"
                tooltip="Calculate based on participation type and duration"
              />
            </div>
          )}
        />
      </SectionCard>
    </div>
  );
}
