import { FormField } from '@/components/assesment/FormField';
import { useFormContext } from '@/context/FormContext';
import { levelOptions, statusOptions } from '@/types/formTypes';

export default function GuidancePage() {
  const { formData, isEditing, handleEdit, handleArrayChange, addArrayItem, removeArrayItem } = useFormContext();

  return (
    <div>
      <h2 className="page-title">Research Guidance</h2>
      
      <div className="info-message">
        <strong>API Points:</strong><br/>
        • M.Tech/M.Phil/D.D./M.S. degree awarded: 5 points<br/>
        • Ph.D. degree awarded: 10 points<br/>
        • Ph.D. Thesis submitted: 7 points<br/>
        • Ongoing Ph.D. (&gt;6 months): 3 points<br/>
        <strong>Joint guidance:</strong> Share as per book authorship rules
      </div>

      {formData.guidance.map((guide, index) => (
        <div key={index} className="project-entry">
          <h4>Guidance {index + 1}</h4>
          <FormField
            label="Enrol. No. & Name of the Student"
            value={guide.enrolName}
            placeholder="e.g., 2020PhD1234 - Mr. John Doe"
            isEditing={isEditing[`guide-enrol-${index}`]}
            onEdit={() => handleEdit(`guide-enrol-${index}`)}
            onChange={(val) => handleArrayChange('guidance', index, 'enrolName', val)}
          />
          <FormField
            label="Title of Thesis/Dissertation/Project"
            value={guide.title}
            placeholder="Enter title"
            multiline
            isEditing={isEditing[`guide-title-${index}`]}
            onEdit={() => handleEdit(`guide-title-${index}`)}
            onChange={(val) => handleArrayChange('guidance', index, 'title', val)}
          />
          <FormField
            label="Names of Joint Supervisors"
            value={guide.jointSupervisors}
            placeholder="Enter names or NA"
            isEditing={isEditing[`guide-joint-${index}`]}
            onEdit={() => handleEdit(`guide-joint-${index}`)}
            onChange={(val) => handleArrayChange('guidance', index, 'jointSupervisors', val)}
          />
          <FormField
            label="Level"
            value={guide.level}
            placeholder="Select level"
            isEditing={isEditing[`guide-level-${index}`]}
            onEdit={() => handleEdit(`guide-level-${index}`)}
            onChange={(val) => handleArrayChange('guidance', index, 'level', val)}
            type="select"
            options={levelOptions}
          />
          <FormField
            label="Status"
            value={guide.status}
            placeholder="Select status"
            isEditing={isEditing[`guide-status-${index}`]}
            onEdit={() => handleEdit(`guide-status-${index}`)}
            onChange={(val) => handleArrayChange('guidance', index, 'status', val)}
            type="radio"
            options={statusOptions}
          />
          <FormField
            label="Self-Assessed API Score"
            value={guide.api}
            placeholder="Enter API"
            isEditing={isEditing[`guide-api-${index}`]}
            onEdit={() => handleEdit(`guide-api-${index}`)}
            onChange={(val) => handleArrayChange('guidance', index, 'api', val)}
          />
          {index > 0 && (
            <button type="button" onClick={() => removeArrayItem('guidance', index)} className="remove-button">
              Remove
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addArrayItem('guidance', { enrolName: '', title: '', jointSupervisors: '', level: '', status: '', api: '' })}
        className="add-button"
      >
        + Add Research Guidance
      </button>
    </div>
  );
}
