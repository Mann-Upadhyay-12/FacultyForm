import { FormField } from '@/components/assesment/FormField';
import { useFormContext } from '@/context/FormContext';
import { departmentOptions, designationOptions, qualificationOptions } from '@/types/formTypes';

export default function PersonalInfoPage() {
  const { formData, isEditing, handleEdit, handleChange } = useFormContext();

  return (
    <div>
      <h2 className="page-title">Personal Information</h2>
      
      <FormField
        label="Name"
        value={formData.name}
        placeholder="Enter your full name"
        isEditing={isEditing.name}
        onEdit={() => handleEdit('name')}
        onChange={(val) => handleChange('name', val)}
      />
      
      <FormField
        label="Department"
        value={formData.department}
        placeholder="Select your department"
        isEditing={isEditing.department}
        onEdit={() => handleEdit('department')}
        onChange={(val) => handleChange('department', val)}
        type="select"
        options={departmentOptions}
      />
      
      <FormField
        label="Qualifications"
        value={formData.qualifications}
        placeholder="Select highest qualification"
        isEditing={isEditing.qualifications}
        onEdit={() => handleEdit('qualifications')}
        onChange={(val) => handleChange('qualifications', val)}
        type="select"
        options={qualificationOptions}
      />
      
      <FormField
        label="Present Designation"
        value={formData.designation}
        placeholder="Select designation"
        isEditing={isEditing.designation}
        onEdit={() => handleEdit('designation')}
        onChange={(val) => handleChange('designation', val)}
        type="select"
        options={designationOptions}
      />
      
      <FormField
        label="University Joining Date"
        value={formData.joiningDate}
        placeholder="Select date"
        type="date"
        isEditing={isEditing.joiningDate}
        onEdit={() => handleEdit('joiningDate')}
        onChange={(val) => handleChange('joiningDate', val)}
      />
      
      <FormField
        label="First Designation"
        value={formData.firstDesignation}
        placeholder="Select first designation"
        isEditing={isEditing.firstDesignation}
        onEdit={() => handleEdit('firstDesignation')}
        onChange={(val) => handleChange('firstDesignation', val)}
        type="select"
        options={designationOptions}
      />
      
      <FormField
        label="Present Pay Scale & Pay"
        value={formData.payScale}
        placeholder="Enter pay scale and pay"
        isEditing={isEditing.payScale}
        onEdit={() => handleEdit('payScale')}
        onChange={(val) => handleChange('payScale', val)}
      />
      
      <FormField
        label="Areas of Specialization and Current Interest"
        value={formData.specialization}
        placeholder="Enter areas of specialization"
        multiline
        isEditing={isEditing.specialization}
        onEdit={() => handleEdit('specialization')}
        onChange={(val) => handleChange('specialization', val)}
      />
      
      <FormField
        label="Additional Qualification Acquired During the Year"
        value={formData.additionalQualification}
        placeholder="Give full details or NA"
        multiline
        isEditing={isEditing.additionalQualification}
        onEdit={() => handleEdit('additionalQualification')}
        onChange={(val) => handleChange('additionalQualification', val)}
      />
      
      <FormField
        label="Pursuing Higher Studies"
        value={formData.higherStudies}
        placeholder="Give full details or NA"
        multiline
        isEditing={isEditing.higherStudies}
        onEdit={() => handleEdit('higherStudies')}
        onChange={(val) => handleChange('higherStudies', val)}
      />
    </div>
  );
}

