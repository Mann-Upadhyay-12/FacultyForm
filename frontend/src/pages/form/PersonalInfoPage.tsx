import { FormField } from '@/components/assesment/FormField';
import { useFormContext } from '@/context/FormContext';
import {
  academicYearOptions,
  departmentOptions,
  designationOptions,
  qualificationOptions,
} from '@/types/formTypes';

export default function PersonalInfoPage() {
  const { formData, handleChange, issues } = useFormContext();
  const err = (needle: string) => issues.find((i) => i.tab === 'personal' && i.level === 'error' && i.message.startsWith(needle))?.message;

  return (
    <div>
      <h2 className="page-title">Personal Information</h2>
      <p className="subtitle">Items 1–10. Fields marked * are required to submit.</p>

      <div className="field-grid">
        <FormField
          label="Academic year under assessment"
          type="select"
          value={formData.academicYear}
          onChange={(v) => handleChange('academicYear', v)}
          options={academicYearOptions()}
          required
          tooltip="The July–June academic year this self-assessment covers."
        />
        <FormField
          label="Name"
          value={formData.name}
          placeholder="e.g., Dr. Anita Sharma"
          onChange={(v) => handleChange('name', v)}
          required
          error={formData.name ? undefined : err('Name')}
        />
        <FormField
          label="Employee ID"
          value={formData.employeeId}
          placeholder="e.g., JUIT/FAC/1234"
          onChange={(v) => handleChange('employeeId', v)}
        />
        <FormField
          label="Official email"
          type="email"
          value={formData.email}
          placeholder="name@juit.ac.in"
          onChange={(v) => handleChange('email', v)}
          error={err('Email')}
        />
        <FormField
          label="Department"
          type="select"
          value={formData.department}
          placeholder="Select your department"
          onChange={(v) => handleChange('department', v)}
          options={departmentOptions}
          required
          hint={
            formData.department === 'HSS' || formData.department === 'MGMT'
              ? 'HSS / Management grant thresholds will be used for project API points.'
              : undefined
          }
        />
        <FormField
          label="Highest qualification"
          type="select"
          value={formData.qualifications}
          placeholder="Select highest qualification"
          onChange={(v) => handleChange('qualifications', v)}
          options={qualificationOptions}
        />
        <FormField
          label="Present designation"
          type="select"
          value={formData.designation}
          placeholder="Select designation"
          onChange={(v) => handleChange('designation', v)}
          options={designationOptions}
          required
        />
        <FormField
          label="Designation at first joining"
          type="select"
          value={formData.firstDesignation}
          placeholder="Select first designation"
          onChange={(v) => handleChange('firstDesignation', v)}
          options={designationOptions}
        />
        <FormField
          label="University joining date"
          type="date"
          value={formData.joiningDate}
          onChange={(v) => handleChange('joiningDate', v)}
          error={err('University joining date')}
        />
        <FormField
          label="Present pay scale & pay"
          value={formData.payScale}
          placeholder="e.g., Level 12, ₹ 1,01,500"
          onChange={(v) => handleChange('payScale', v)}
        />
        <FormField
          label="Areas of specialization and current interest"
          type="textarea"
          value={formData.specialization}
          placeholder="e.g., Machine learning; or Indian English literature, gender studies"
          onChange={(v) => handleChange('specialization', v)}
        />
        <FormField
          label="Additional qualification acquired during the year"
          type="textarea"
          value={formData.additionalQualification}
          placeholder="Give full details, or write NA"
          onChange={(v) => handleChange('additionalQualification', v)}
        />
        <FormField
          label="Pursuing higher studies"
          type="textarea"
          value={formData.higherStudies}
          placeholder="Give full details, or write NA"
          onChange={(v) => handleChange('higherStudies', v)}
        />
      </div>
    </div>
  );
}
