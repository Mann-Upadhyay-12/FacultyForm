
import { FormField } from '@/components/assesment/FormField';
import { useFormContext } from '@/context/FormContext';

export default function ActivitiesPage() {
  const { formData, isEditing, handleEdit, handleChange, handleArrayChange, addArrayItem, removeArrayItem } = useFormContext();

  return (
    <div>
      <h2 className="page-title">Co-Curricular Activities & Contributions</h2>
      
      <div className="info-message">
        <strong>Total API for Item 13 is capped at 60 points.</strong><br/>
        13A/B/C: Max 20 points each. 13D: Max 20 points. 13E: Max 10 points.
      </div>

      {/* 13A - Student Activities */}
      <h3 className="section-title">Contribution/Participation in Students Extra & Co-Curricular Activities (13A)</h3>
      <p className="subtitle">5 API points per activity, 10 if lead role. Maximum: 20</p>
      
      {formData.studentActivities.map((act, index) => (
        <div key={index} className="project-entry">
          <h4>Activity {index + 1}</h4>
          <FormField
            label="Activity Description"
            value={act.activity}
            placeholder="Describe the activity"
            multiline
            isEditing={isEditing[`stud-act-${index}`]}
            onEdit={() => handleEdit(`stud-act-${index}`)}
            onChange={(val) => handleArrayChange('studentActivities', index, 'activity', val)}
          />
          <FormField
            label="Self-Assessed API Score"
            value={act.api}
            placeholder="Enter API (5 or 10)"
            isEditing={isEditing[`stud-api-${index}`]}
            onEdit={() => handleEdit(`stud-api-${index}`)}
            onChange={(val) => handleArrayChange('studentActivities', index, 'api', val)}
          />
          {index > 0 && (
            <button type="button" onClick={() => removeArrayItem('studentActivities', index)} className="remove-button">
              Remove Activity
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => addArrayItem('studentActivities', { activity: '', api: '' })} className="add-button">
        + Add Student Activity
      </button>

      {/* 13B - Department Activities */}
      <h3 className="section-title">Contribution/Participation in Departmental Activities & Development (13B)</h3>
      <p className="subtitle">5 API as In-charge/Chairman, 3 as member. Maximum: 20</p>
      
      {formData.departmentActivities.map((act, index) => (
        <div key={index} className="project-entry">
          <h4>Activity {index + 1}</h4>
          <FormField
            label="Activity Description"
            value={act.activity}
            placeholder="Describe activity"
            multiline
            isEditing={isEditing[`dept-act-${index}`]}
            onEdit={() => handleEdit(`dept-act-${index}`)}
            onChange={(val) => handleArrayChange('departmentActivities', index, 'activity', val)}
          />
          <FormField
            label="Self-Assessed API Score"
            value={act.api}
            placeholder="Enter API (3 or 5)"
            isEditing={isEditing[`dept-api-${index}`]}
            onEdit={() => handleEdit(`dept-api-${index}`)}
            onChange={(val) => handleArrayChange('departmentActivities', index, 'api', val)}
          />
          {index > 0 && (
            <button type="button" onClick={() => removeArrayItem('departmentActivities', index)} className="remove-button">
              Remove Activity
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => addArrayItem('departmentActivities', { activity: '', api: '' })} className="add-button">
        + Add Department Activity
      </button>

      {/* 13C - Institute Activities */}
      <h3 className="section-title">Contribution/Participation in Institute Activities & Development (13C)</h3>
      <p className="subtitle">10 API for Director/Dean/HoD level, 5 for committee membership. Maximum: 20</p>
      
      {formData.instituteActivities.map((act, index) => (
        <div key={index} className="project-entry">
          <h4>Activity {index + 1}</h4>
          <FormField
            label="Activity Description"
            value={act.activity}
            placeholder="Describe activity"
            multiline
            isEditing={isEditing[`inst-act-${index}`]}
            onEdit={() => handleEdit(`inst-act-${index}`)}
            onChange={(val) => handleArrayChange('instituteActivities', index, 'activity', val)}
          />
          <FormField
            label="Self-Assessed API Score"
            value={act.api}
            placeholder="Enter API (5 or 10)"
            isEditing={isEditing[`inst-api-${index}`]}
            onEdit={() => handleEdit(`inst-api-${index}`)}
            onChange={(val) => handleArrayChange('instituteActivities', index, 'api', val)}
          />
          {index > 0 && (
            <button type="button" onClick={() => removeArrayItem('instituteActivities', index)} className="remove-button">
              Remove Activity
            </button>
          )}
        </div>
      ))}
      <button type="button" onClick={() => addArrayItem('instituteActivities', { activity: '', api: '' })} className="add-button">
        + Add Institute Activity
      </button>

      {/* 13D & 13E */}
      <FormField
        label="Special/Extension/Expert/Invited Lectures Delivered (13D)"
        value={formData.lectures}
        placeholder="10 points outside institute, 5 within. Max 20."
        multiline
        isEditing={isEditing.lectures}
        onEdit={() => handleEdit('lectures')}
        onChange={(val) => handleChange('lectures', val)}
      />

      <FormField
        label="Articles, Monographs, Technical Reports, Reviews Written (13E)"
        value={formData.articles}
        placeholder="1/2/3 points based on level. Max 10."
        multiline
        isEditing={isEditing.articles}
        onEdit={() => handleEdit('articles')}
        onChange={(val) => handleChange('articles', val)}
      />
    </div>
  );
}
