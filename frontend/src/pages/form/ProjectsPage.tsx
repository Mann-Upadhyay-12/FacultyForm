
import { FormField } from '@/components/assesment/FormField';
import { useFormContext } from '@/context/FormContext';
import { roleOptions } from '@/types/formTypes';

export default function ProjectsPage() {
  const { formData, isEditing, handleEdit, handleArrayChange, addArrayItem, removeArrayItem } = useFormContext();

  return (
    <div>
      <h2 className="page-title">Research Projects and Consultancy Works</h2>
      
      <div className="info-message">
        <strong>Sponsored Research Projects API:</strong><br/>
        • ≥10 lakhs (≥3L for HSS/Mgmt): 20 points<br/>
        • 4-10 lakhs (1-3L for HSS/Mgmt): 15 points<br/>
        • 0.5-4 lakhs (0.25-1L for HSS/Mgmt): 10 points<br/>
        <strong>Consultancy:</strong> 50% of above amounts and points<br/>
        <strong>Joint projects:</strong> Share as per book authorship rules
      </div>

      {formData.researchProjects.map((project, index) => (
        <div key={index} className="project-entry">
          <h4>Project {index + 1}</h4>
          <FormField
            label="Title of Research Project/Consultancy Work"
            value={project.title}
            placeholder="Enter project title"
            isEditing={isEditing[`proj-title-${index}`]}
            onEdit={() => handleEdit(`proj-title-${index}`)}
            onChange={(val) => handleArrayChange('researchProjects', index, 'title', val)}
          />
          <FormField
            label="Details of Sponsoring Agency"
            value={project.agency}
            placeholder="e.g., DST, AICTE, Industry name"
            isEditing={isEditing[`proj-agency-${index}`]}
            onEdit={() => handleEdit(`proj-agency-${index}`)}
            onChange={(val) => handleArrayChange('researchProjects', index, 'agency', val)}
          />
          <FormField
            label="Duration, Sanction Date & Status"
            value={project.duration}
            placeholder="e.g., 3 years, 01-04-2022, Ongoing"
            isEditing={isEditing[`proj-duration-${index}`]}
            onEdit={() => handleEdit(`proj-duration-${index}`)}
            onChange={(val) => handleArrayChange('researchProjects', index, 'duration', val)}
          />
          <FormField
            label="Amount Sanctioned (₹)"
            value={project.amount}
            placeholder="Enter amount in rupees"
            isEditing={isEditing[`proj-amount-${index}`]}
            onEdit={() => handleEdit(`proj-amount-${index}`)}
            onChange={(val) => handleArrayChange('researchProjects', index, 'amount', val)}
          />
          <FormField
            label="Role"
            value={project.role}
            placeholder="Select your role"
            isEditing={isEditing[`proj-role-${index}`]}
            onEdit={() => handleEdit(`proj-role-${index}`)}
            onChange={(val) => handleArrayChange('researchProjects', index, 'role', val)}
            type="radio"
            options={roleOptions}
          />
          <FormField
            label="Self-Assessed API Score"
            value={project.api}
            placeholder="Enter API"
            isEditing={isEditing[`proj-api-${index}`]}
            onEdit={() => handleEdit(`proj-api-${index}`)}
            onChange={(val) => handleArrayChange('researchProjects', index, 'api', val)}
          />
          {index > 0 && (
            <button type="button" onClick={() => removeArrayItem('researchProjects', index)} className="remove-button">
              Remove Project
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addArrayItem('researchProjects', { title: '', agency: '', duration: '', amount: '', role: '', api: '' })}
        className="add-button"
      >
        + Add Project
      </button>
    </div>
  );
}
