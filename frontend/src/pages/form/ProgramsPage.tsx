
import { FormField } from '@/components/assesment/FormField';
import { useFormContext } from '@/context/FormContext';
import { participationOptions, durationOptions } from '@/types/formTypes';

export default function ProgramsPage() {
  const { formData, isEditing, handleEdit, handleArrayChange, addArrayItem, removeArrayItem } = useFormContext();

  return (
    <div>
      <h2 className="page-title">Orientation/Refresher Courses & Programs</h2>
      <p className="subtitle">Summer/Winter Schools, Faculty Development Programmes, Seminars/Conferences/Workshops Attended/Organized</p>
      
      <div className="info-message">
        <strong>API Points Guide:</strong><br/>
        • Attended: 1/3/5 points for &lt;1 week / 1 week / 2+ weeks<br/>
        • Organized: 5/10/20 points + 5 extra if Chief Organizer<br/>
        • Seminars attended without presentation: 2 points (max 5)
      </div>

      {formData.programs.map((program, index) => (
        <div key={index} className="course-entry">
          <h4>Program {index + 1}</h4>
          
          <FormField
            label="Title"
            value={program.title}
            placeholder="Enter program title"
            isEditing={isEditing[`prog-title-${index}`]}
            onEdit={() => handleEdit(`prog-title-${index}`)}
            onChange={(val) => handleArrayChange('programs', index, 'title', val)}
          />
          
          <FormField
            label="Dates/Duration"
            value={program.dates}
            placeholder="e.g., 11-06-23 to 30-06-23"
            isEditing={isEditing[`prog-dates-${index}`]}
            onEdit={() => handleEdit(`prog-dates-${index}`)}
            onChange={(val) => handleArrayChange('programs', index, 'dates', val)}
          />
          
          <FormField
            label="Sponsoring Agency and Organisation & Place"
            value={program.agency}
            placeholder="e.g., ACM, JUIT Solan"
            isEditing={isEditing[`prog-agency-${index}`]}
            onEdit={() => handleEdit(`prog-agency-${index}`)}
            onChange={(val) => handleArrayChange('programs', index, 'agency', val)}
          />
          
          <FormField
            label="Type of Participation"
            value={program.attendedOrganized}
            placeholder="Select participation type"
            isEditing={isEditing[`prog-attended-${index}`]}
            onEdit={() => handleEdit(`prog-attended-${index}`)}
            onChange={(val) => handleArrayChange('programs', index, 'attendedOrganized', val)}
            type="radio"
            options={participationOptions}
          />
          
          <FormField
            label="Program Duration"
            value={program.duration}
            placeholder="Select duration"
            isEditing={isEditing[`prog-duration-${index}`]}
            onEdit={() => handleEdit(`prog-duration-${index}`)}
            onChange={(val) => handleArrayChange('programs', index, 'duration', val)}
            type="select"
            options={durationOptions}
          />
          
          <FormField
            label="Self-Assessed API Score"
            value={program.api}
            placeholder="Enter API score"
            isEditing={isEditing[`prog-api-${index}`]}
            onEdit={() => handleEdit(`prog-api-${index}`)}
            onChange={(val) => handleArrayChange('programs', index, 'api', val)}
          />

          {index > 0 && (
            <button
              type="button"
              onClick={() => removeArrayItem('programs', index)}
              className="remove-button"
            >
              Remove Program
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => addArrayItem('programs', { title: '', dates: '', agency: '', attendedOrganized: '', duration: '', api: '' })}
        className="add-button"
      >
        + Add Program
      </button>
    </div>
  );
}
