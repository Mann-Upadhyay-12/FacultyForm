import { FormField } from '../FormField';
import { SectionCard } from '../SectionCard';
import type { FormData } from '@/types/assessment';

interface PersonalInfoTabProps {
  formData: FormData;
  isEditing: (field: string) => boolean;
  toggleEdit: (field: string) => void;
  handleChange: (field: keyof FormData, value: string) => void;
}

const departmentOptions = [
  { label: 'CSE & IT', value: 'CSE&IT' },
  { label: 'Electronics & Communication', value: 'ECE' },
  { label: 'Civil Engineering', value: 'CE' },
  { label: 'Biotechnology & Bioinformatics', value: 'BT' },
  { label: 'Mathematics', value: 'MATH' },
  { label: 'Physics', value: 'PHY' },
  { label: 'Humanities & Social Sciences', value: 'HSS' },
];

const designationOptions = [
  { label: 'Professor', value: 'Professor' },
  { label: 'Associate Professor', value: 'Associate Professor' },
  { label: 'Assistant Professor (Senior Grade)', value: 'AP (SG)' },
  { label: 'Assistant Professor', value: 'Assistant Professor' },
  { label: 'Lecturer', value: 'Lecturer' },
];

const qualificationOptions = [
  { label: 'Ph.D.', value: 'PhD' },
  { label: 'M.Tech', value: 'MTech' },
  { label: 'M.E.', value: 'ME' },
  { label: 'M.Sc.', value: 'MSc' },
  { label: 'M.Phil', value: 'MPhil' },
  { label: 'M.B.A.', value: 'MBA' },
];

export function PersonalInfoTab({
  formData,
  isEditing,
  toggleEdit,
  handleChange,
}: PersonalInfoTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Basic Information"
        description="Your personal and professional details (Items 1-8)"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Full Name"
            value={formData.name}
            placeholder="Enter your full name"
            isEditing={isEditing('name')}
            onEdit={() => toggleEdit('name')}
            onChange={(val) => handleChange('name', val)}
            required
            tooltip="Enter your name as it appears in official records"
          />
          <FormField
            label="Department"
            value={formData.department}
            placeholder="Select your department"
            isEditing={isEditing('department')}
            onEdit={() => toggleEdit('department')}
            onChange={(val) => handleChange('department', val)}
            type="select"
            options={departmentOptions}
            required
          />
          <FormField
            label="Qualifications"
            value={formData.qualifications}
            placeholder="Select highest qualification"
            isEditing={isEditing('qualifications')}
            onEdit={() => toggleEdit('qualifications')}
            onChange={(val) => handleChange('qualifications', val)}
            type="select"
            options={qualificationOptions}
            required
          />
          <FormField
            label="Present Designation"
            value={formData.designation}
            placeholder="Select designation"
            isEditing={isEditing('designation')}
            onEdit={() => toggleEdit('designation')}
            onChange={(val) => handleChange('designation', val)}
            type="select"
            options={designationOptions}
            required
          />
          <FormField
            label="University Joining Date"
            value={formData.joiningDate}
            isEditing={isEditing('joiningDate')}
            onEdit={() => toggleEdit('joiningDate')}
            onChange={(val) => handleChange('joiningDate', val)}
            type="date"
            required
            tooltip="Date when you first joined JUIT"
          />
          <FormField
            label="First Designation"
            value={formData.firstDesignation}
            placeholder="Select first designation"
            isEditing={isEditing('firstDesignation')}
            onEdit={() => toggleEdit('firstDesignation')}
            onChange={(val) => handleChange('firstDesignation', val)}
            type="select"
            options={designationOptions}
            tooltip="Your designation when you first joined"
          />
          <FormField
            label="Present Pay Scale & Pay"
            value={formData.payScale}
            placeholder="e.g., 32500 (Basic), 119758 (Gross)"
            isEditing={isEditing('payScale')}
            onEdit={() => toggleEdit('payScale')}
            onChange={(val) => handleChange('payScale', val)}
            tooltip="Enter Basic and Gross pay"
            className="md:col-span-2"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Academic Profile"
        description="Your areas of expertise and ongoing studies (Items 8-10)"
      >
        <div className="space-y-6">
          <FormField
            label="Areas of Specialization and Current Interest"
            value={formData.specialization}
            placeholder="e.g., Complex Systems and Machine Learning"
            isEditing={isEditing('specialization')}
            onEdit={() => toggleEdit('specialization')}
            onChange={(val) => handleChange('specialization', val)}
            multiline
            tooltip="List your main research areas and current interests"
          />
          <FormField
            label="Additional Qualification Acquired During the Year"
            value={formData.additionalQualification}
            placeholder="Give full details or enter 'NA' if none"
            isEditing={isEditing('additionalQualification')}
            onEdit={() => toggleEdit('additionalQualification')}
            onChange={(val) => handleChange('additionalQualification', val)}
            multiline
            tooltip="Any new degrees, certifications, or qualifications obtained this year"
          />
          <FormField
            label="Pursuing Higher Studies"
            value={formData.higherStudies}
            placeholder="Give full details or enter 'NA' if not applicable"
            isEditing={isEditing('higherStudies')}
            onEdit={() => toggleEdit('higherStudies')}
            onChange={(val) => handleChange('higherStudies', val)}
            multiline
            tooltip="Details of any ongoing higher studies (Ph.D., Post-doc, etc.)"
          />
        </div>
      </SectionCard>
    </div>
  );
}
