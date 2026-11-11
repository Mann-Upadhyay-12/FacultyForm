
import { FormField } from '../FormField';
import { SectionCard } from '../SectionCard';
import { ArrayFieldGroup } from '../ArrayFieldGroup';
import type { FormData, Course, Resource } from '@/types/assessment';

interface TeachingTabProps {
  formData: FormData;
  isEditing: (field: string) => boolean;
  toggleEdit: (field: string) => void;
  handleChange: (field: keyof FormData, value: string) => void;
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

const emptyCourse: Course = {
  courseCode: '',
  courseTitle: '',
  contactHours: '',
  scheduled: '',
  engaged: ''
};

const emptyResource: Resource = {
  courseCode: '',
  consulted: '',
  prescribed: '',
  additional: ''
};

export function TeachingTab({
  formData,
  isEditing,
  toggleEdit,
  handleChange,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
}: TeachingTabProps) {
  const renderCourseFields = (course: Course, index: number, semesterPrefix: string, arrayName: 'oddSemester' | 'evenSemester') => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <FormField
        label="Course Code"
        value={course.courseCode}
        placeholder="e.g., 19B17CI111"
        isEditing={isEditing(`${semesterPrefix}-code-${index}`)}
        onEdit={() => toggleEdit(`${semesterPrefix}-code-${index}`)}
        onChange={(val) => handleArrayChange(arrayName, index, 'courseCode', val)}
      />
      <FormField
        label="Course Title"
        value={course.courseTitle}
        placeholder="e.g., Programming for Problem Solving"
        isEditing={isEditing(`${semesterPrefix}-title-${index}`)}
        onEdit={() => toggleEdit(`${semesterPrefix}-title-${index}`)}
        onChange={(val) => handleArrayChange(arrayName, index, 'courseTitle', val)}
        className="lg:col-span-2"
      />
      <FormField
        label="Hours/Week"
        value={course.contactHours}
        placeholder="e.g., 4"
        isEditing={isEditing(`${semesterPrefix}-hours-${index}`)}
        onEdit={() => toggleEdit(`${semesterPrefix}-hours-${index}`)}
        onChange={(val) => handleArrayChange(arrayName, index, 'contactHours', val)}
        type="number"
      />
      <div className="grid grid-cols-2 gap-2">
        <FormField
          label="Scheduled"
          value={course.scheduled}
          placeholder="28"
          isEditing={isEditing(`${semesterPrefix}-scheduled-${index}`)}
          onEdit={() => toggleEdit(`${semesterPrefix}-scheduled-${index}`)}
          onChange={(val) => handleArrayChange(arrayName, index, 'scheduled', val)}
          type="number"
        />
        <FormField
          label="Engaged"
          value={course.engaged}
          placeholder="28"
          isEditing={isEditing(`${semesterPrefix}-engaged-${index}`)}
          onEdit={() => toggleEdit(`${semesterPrefix}-engaged-${index}`)}
          onChange={(val) => handleArrayChange(arrayName, index, 'engaged', val)}
          type="number"
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionCard
        title="Odd Semester Courses"
        description="July to December (Item 12.1A)"
        infoMessage="API Score: 25 points for 95%+ classes, 15 for 80%+, 0 for below 80%. Additional 5 points for excess classes."
      >
        <ArrayFieldGroup<Course>
          items={formData.oddSemester}
          onAdd={() => addArrayItem('oddSemester', emptyCourse)}
          onRemove={(index) => removeArrayItem('oddSemester', index)}
          addLabel="Add Course"
          itemLabel="Course"
          renderItem={(course, index) => renderCourseFields(course, index, 'odd', 'oddSemester')}
        />
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <FormField
            label="Classes Engaged in Excess of Norms (API)"
            value={formData.oddExcessApi}
            placeholder="Enter API for excess classes"
            isEditing={isEditing('oddExcessApi')}
            onEdit={() => toggleEdit('oddExcessApi')}
            onChange={(val) => handleChange('oddExcessApi', val)}
            type="number"
            tooltip="5 API points if classes engaged exceed the scheduled norm"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Even Semester Courses"
        description="January to June (Item 12.1B)"
      >
        <ArrayFieldGroup<Course>
          items={formData.evenSemester}
          onAdd={() => addArrayItem('evenSemester', emptyCourse)}
          onRemove={(index) => removeArrayItem('evenSemester', index)}
          addLabel="Add Course"
          itemLabel="Course"
          renderItem={(course, index) => renderCourseFields(course, index, 'even', 'evenSemester')}
        />
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <FormField
            label="Classes Engaged in Excess of Norms (API)"
            value={formData.evenExcessApi}
            placeholder="Enter API for excess classes"
            isEditing={isEditing('evenExcessApi')}
            onEdit={() => toggleEdit('evenExcessApi')}
            onChange={(val) => handleChange('evenExcessApi', val)}
            type="number"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Reading/Instructional Material"
        description="Knowledge resources consulted and provided (Item 12.2)"
        infoMessage="Maximum total API score: 35. Score 10 for each sub-component (consulted, prescribed, additional resources, participative teaching, syllabus modifications)."
      >
        <ArrayFieldGroup<Resource>
          items={formData.resources}
          onAdd={() => addArrayItem('resources', emptyResource)}
          onRemove={(index) => removeArrayItem('resources', index)}
          addLabel="Add Resource Entry"
          itemLabel="Resource"
          renderItem={(resource, index) => (
            <div className="space-y-4">
              <FormField
                label="Course Code"
                value={resource.courseCode}
                placeholder="e.g., 19B17CI111"
                isEditing={isEditing(`res-code-${index}`)}
                onEdit={() => toggleEdit(`res-code-${index}`)}
                onChange={(val) => handleArrayChange('resources', index, 'courseCode', val)}
              />
              <FormField
                label="Knowledge Resources Consulted"
                value={resource.consulted}
                placeholder="List textbooks, papers, online resources consulted"
                isEditing={isEditing(`res-consulted-${index}`)}
                onEdit={() => toggleEdit(`res-consulted-${index}`)}
                onChange={(val) => handleArrayChange('resources', index, 'consulted', val)}
                multiline
              />
              <FormField
                label="Prescribed Resources"
                value={resource.prescribed}
                placeholder="Resources prescribed to students"
                isEditing={isEditing(`res-prescribed-${index}`)}
                onEdit={() => toggleEdit(`res-prescribed-${index}`)}
                onChange={(val) => handleArrayChange('resources', index, 'prescribed', val)}
                multiline
              />
              <FormField
                label="Additional Resources Provided"
                value={resource.additional}
                placeholder="e.g., PPTs, notes, supplementary materials"
                isEditing={isEditing(`res-additional-${index}`)}
                onEdit={() => toggleEdit(`res-additional-${index}`)}
                onChange={(val) => handleArrayChange('resources', index, 'additional', val)}
                multiline
              />
            </div>
          )}
        />

        <div className="mt-6 space-y-4">
          <FormField
            label="Participatory/Innovative Teaching Methodologies"
            value={formData.participatory}
            placeholder="Describe innovative methods used"
            isEditing={isEditing('participatory')}
            onEdit={() => toggleEdit('participatory')}
            onChange={(val) => handleChange('participatory', val)}
            multiline
          />
          <FormField
            label="Modifications/Additions to Syllabus"
            value={formData.modification}
            placeholder="Any syllabus modifications made"
            isEditing={isEditing('modification')}
            onEdit={() => toggleEdit('modification')}
            onChange={(val) => handleChange('modification', val)}
            multiline
          />
          <FormField
            label="Coverage Beyond Syllabus"
            value={formData.coverageBeyond}
            placeholder="Topics covered beyond the syllabus"
            isEditing={isEditing('coverageBeyond')}
            onEdit={() => toggleEdit('coverageBeyond')}
            onChange={(val) => handleChange('coverageBeyond', val)}
            multiline
          />
          <FormField
            label="Total API Score for Item 12.2"
            value={formData.teachingApi}
            placeholder="Maximum: 35"
            isEditing={isEditing('teachingApi')}
            onEdit={() => toggleEdit('teachingApi')}
            onChange={(val) => handleChange('teachingApi', val)}
            type="number"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Project Guidance at UG Level"
        description="Undergraduate project supervision (Item 12.3)"
        infoMessage="API Score: Maximum 10 for this component."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Number of Projects Guided"
            value={formData.projectsGuided}
            placeholder="e.g., 8"
            isEditing={isEditing('projectsGuided')}
            onEdit={() => toggleEdit('projectsGuided')}
            onChange={(val) => handleChange('projectsGuided', val)}
            type="number"
          />
          <FormField
            label="Number of Students Guided"
            value={formData.studentsGuided}
            placeholder="e.g., 16"
            isEditing={isEditing('studentsGuided')}
            onEdit={() => toggleEdit('studentsGuided')}
            onChange={(val) => handleChange('studentsGuided', val)}
            type="number"
          />
          <FormField
            label="API Score for 12.3"
            value={formData.projectGuidanceApi}
            placeholder="Maximum: 10"
            isEditing={isEditing('projectGuidanceApi')}
            onEdit={() => toggleEdit('projectGuidanceApi')}
            onChange={(val) => handleChange('projectGuidanceApi', val)}
            type="number"
          />
        </div>
      </SectionCard>
    </div>
  );
}
