
import { FormField } from '@/components/assesment/FormField';
import { useFormContext } from '@/context/FormContext';

export default function TeachingPage() {
  const { formData, isEditing, handleEdit, handleChange, handleArrayChange, addArrayItem, removeArrayItem } = useFormContext();

  return (
    <div>
      <h2 className="page-title">Teaching, Learning and Evaluation Activities</h2>
      
      <div className="info-message">
        <strong>API Scoring (12.1):</strong> 25 points for 95%+ classes, 15 for 80%+, 0 for below 80%. +5 for excess classes.
      </div>

      {/* ODD SEMESTER */}
      <div className="semester-section">
        <h3 className="section-title">ODD SEMESTER (July to December)</h3>
        
        {formData.oddSemester.map((course, index) => (
          <div key={index} className="course-entry">
            <h4>Course {index + 1}</h4>
            <div className="course-fields">
              <FormField
                label="Course Code"
                value={course.courseCode}
                placeholder="e.g., 19BI7CI111"
                isEditing={isEditing[`odd-code-${index}`]}
                onEdit={() => handleEdit(`odd-code-${index}`)}
                onChange={(val) => handleArrayChange('oddSemester', index, 'courseCode', val)}
              />
              <FormField
                label="Course Title"
                value={course.courseTitle}
                placeholder="Enter course title"
                isEditing={isEditing[`odd-title-${index}`]}
                onEdit={() => handleEdit(`odd-title-${index}`)}
                onChange={(val) => handleArrayChange('oddSemester', index, 'courseTitle', val)}
              />
              <FormField
                label="Contact Hours/Week"
                value={course.contactHours}
                placeholder="Hours"
                isEditing={isEditing[`odd-hours-${index}`]}
                onEdit={() => handleEdit(`odd-hours-${index}`)}
                onChange={(val) => handleArrayChange('oddSemester', index, 'contactHours', val)}
              />
              <FormField
                label="Scheduled Classes"
                value={course.scheduled}
                placeholder="Total scheduled"
                isEditing={isEditing[`odd-scheduled-${index}`]}
                onEdit={() => handleEdit(`odd-scheduled-${index}`)}
                onChange={(val) => handleArrayChange('oddSemester', index, 'scheduled', val)}
              />
              <FormField
                label="Engaged Classes"
                value={course.engaged}
                placeholder="Total engaged"
                isEditing={isEditing[`odd-engaged-${index}`]}
                onEdit={() => handleEdit(`odd-engaged-${index}`)}
                onChange={(val) => handleArrayChange('oddSemester', index, 'engaged', val)}
              />
            </div>
            {index > 0 && (
              <button type="button" onClick={() => removeArrayItem('oddSemester', index)} className="remove-button">
                Remove Course
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => addArrayItem('oddSemester', { courseCode: '', courseTitle: '', contactHours: '', scheduled: '', engaged: '' })}
          className="add-button"
        >
          + Add Course
        </button>
        
        <FormField
          label="Classes Engaged in Excess of Norms (API)"
          value={formData.oddExcessApi}
          placeholder="Enter API for excess"
          isEditing={isEditing.oddExcessApi}
          onEdit={() => handleEdit('oddExcessApi')}
          onChange={(val) => handleChange('oddExcessApi', val)}
        />
      </div>

      {/* EVEN SEMESTER */}
      <div className="semester-section">
        <h3 className="section-title">EVEN SEMESTER (January to June)</h3>
        
        {formData.evenSemester.map((course, index) => (
          <div key={index} className="course-entry">
            <h4>Course {index + 1}</h4>
            <div className="course-fields">
              <FormField
                label="Course Code"
                value={course.courseCode}
                placeholder="e.g., L18B1WCI732"
                isEditing={isEditing[`even-code-${index}`]}
                onEdit={() => handleEdit(`even-code-${index}`)}
                onChange={(val) => handleArrayChange('evenSemester', index, 'courseCode', val)}
              />
              <FormField
                label="Course Title"
                value={course.courseTitle}
                placeholder="Enter course title"
                isEditing={isEditing[`even-title-${index}`]}
                onEdit={() => handleEdit(`even-title-${index}`)}
                onChange={(val) => handleArrayChange('evenSemester', index, 'courseTitle', val)}
              />
              <FormField
                label="Contact Hours/Week"
                value={course.contactHours}
                placeholder="Hours"
                isEditing={isEditing[`even-hours-${index}`]}
                onEdit={() => handleEdit(`even-hours-${index}`)}
                onChange={(val) => handleArrayChange('evenSemester', index, 'contactHours', val)}
              />
              <FormField
                label="Scheduled Classes"
                value={course.scheduled}
                placeholder="Total scheduled"
                isEditing={isEditing[`even-scheduled-${index}`]}
                onEdit={() => handleEdit(`even-scheduled-${index}`)}
                onChange={(val) => handleArrayChange('evenSemester', index, 'scheduled', val)}
              />
              <FormField
                label="Engaged Classes"
                value={course.engaged}
                placeholder="Total engaged"
                isEditing={isEditing[`even-engaged-${index}`]}
                onEdit={() => handleEdit(`even-engaged-${index}`)}
                onChange={(val) => handleArrayChange('evenSemester', index, 'engaged', val)}
              />
            </div>
            {index > 0 && (
              <button type="button" onClick={() => removeArrayItem('evenSemester', index)} className="remove-button">
                Remove Course
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={() => addArrayItem('evenSemester', { courseCode: '', courseTitle: '', contactHours: '', scheduled: '', engaged: '' })}
          className="add-button"
        >
          + Add Course
        </button>
        
        <FormField
          label="Classes Engaged in Excess of Norms (API)"
          value={formData.evenExcessApi}
          placeholder="Enter API for excess"
          isEditing={isEditing.evenExcessApi}
          onEdit={() => handleEdit('evenExcessApi')}
          onChange={(val) => handleChange('evenExcessApi', val)}
        />
      </div>

      {/* Resources Section */}
      <h3 className="section-title">Reading/Instructional Material (12.2)</h3>
      <div className="info-message">
        Maximum API: 35 points. Score 10 for each sub-component.
      </div>
      
      {formData.resources.map((res, index) => (
        <div key={index} className="course-entry">
          <h4>Resource {index + 1}</h4>
          <FormField
            label="Course Code"
            value={res.courseCode}
            placeholder="Enter course code"
            isEditing={isEditing[`res-code-${index}`]}
            onEdit={() => handleEdit(`res-code-${index}`)}
            onChange={(val) => handleArrayChange('resources', index, 'courseCode', val)}
          />
          <FormField
            label="Knowledge Resources Consulted"
            value={res.consulted}
            placeholder="Enter consulted resources"
            multiline
            isEditing={isEditing[`res-consulted-${index}`]}
            onEdit={() => handleEdit(`res-consulted-${index}`)}
            onChange={(val) => handleArrayChange('resources', index, 'consulted', val)}
          />
          <FormField
            label="Prescribed Resources"
            value={res.prescribed}
            placeholder="Enter prescribed resources"
            multiline
            isEditing={isEditing[`res-prescribed-${index}`]}
            onEdit={() => handleEdit(`res-prescribed-${index}`)}
            onChange={(val) => handleArrayChange('resources', index, 'prescribed', val)}
          />
          <FormField
            label="Additional Resources Provided"
            value={res.additional}
            placeholder="Enter additional resources (PPTs, notes, etc.)"
            multiline
            isEditing={isEditing[`res-additional-${index}`]}
            onEdit={() => handleEdit(`res-additional-${index}`)}
            onChange={(val) => handleArrayChange('resources', index, 'additional', val)}
          />
          {index > 0 && (
            <button type="button" onClick={() => removeArrayItem('resources', index)} className="remove-button">
              Remove Resource
            </button>
          )}
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => addArrayItem('resources', { courseCode: '', consulted: '', prescribed: '', additional: '' })}
        className="add-button"
      >
        + Add Resource
      </button>

      <FormField
        label="Participatory/Innovative Teaching Learning Methodologies"
        value={formData.participatory}
        placeholder="Give brief details"
        multiline
        isEditing={isEditing.participatory}
        onEdit={() => handleEdit('participatory')}
        onChange={(val) => handleChange('participatory', val)}
      />
      
      <FormField
        label="Any Modification/Addition to Syllabus"
        value={formData.modification}
        placeholder="Give brief details"
        multiline
        isEditing={isEditing.modification}
        onEdit={() => handleEdit('modification')}
        onChange={(val) => handleChange('modification', val)}
      />
      
      <FormField
        label="Any Coverage/Introduction Beyond Syllabus"
        value={formData.coverageBeyond}
        placeholder="Give brief details"
        multiline
        isEditing={isEditing.coverageBeyond}
        onEdit={() => handleEdit('coverageBeyond')}
        onChange={(val) => handleChange('coverageBeyond', val)}
      />
      
      <FormField
        label="Self-Assessed API Score for 12.2"
        value={formData.teachingApi}
        placeholder="Enter API score (max 35)"
        isEditing={isEditing.teachingApi}
        onEdit={() => handleEdit('teachingApi')}
        onChange={(val) => handleChange('teachingApi', val)}
      />

      {/* Project Guidance */}
      <h3 className="section-title">Project Guidance at UG Level (12.3)</h3>
      
      <FormField
        label="Number of Projects Guided"
        value={formData.projectsGuided}
        placeholder="Enter number"
        isEditing={isEditing.projectsGuided}
        onEdit={() => handleEdit('projectsGuided')}
        onChange={(val) => handleChange('projectsGuided', val)}
      />
      
      <FormField
        label="Number of Students Guided"
        value={formData.studentsGuided}
        placeholder="Enter number"
        isEditing={isEditing.studentsGuided}
        onEdit={() => handleEdit('studentsGuided')}
        onChange={(val) => handleChange('studentsGuided', val)}
      />
      
      <FormField
        label="Self-Assessed API Score for 12.3"
        value={formData.projectGuidanceApi}
        placeholder="Enter API score (max 10)"
        isEditing={isEditing.projectGuidanceApi}
        onEdit={() => handleEdit('projectGuidanceApi')}
        onChange={(val) => handleChange('projectGuidanceApi', val)}
      />
    </div>
  );
}
