import { FormField } from '../FormField';
import { SectionCard } from '../SectionCard';
import { ArrayFieldGroup } from '../ArrayFieldGroup';
import type { FormData, Activity } from '@/types/assessment';

interface ActivitiesTabProps {
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

const emptyActivity: Activity = {
  activity: '',
  api: ''
};

export function ActivitiesTab({
  formData,
  isEditing,
  toggleEdit,
  handleChange,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
}: ActivitiesTabProps) {
  const renderActivityFields = (
    activity: Activity,
    index: number,
    prefix: string,
    arrayName: 'studentActivities' | 'departmentActivities' | 'instituteActivities'
  ) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <FormField
        label="Activity Description"
        value={activity.activity}
        placeholder="Describe the activity"
        isEditing={isEditing(`${prefix}-act-${index}`)}
        onEdit={() => toggleEdit(`${prefix}-act-${index}`)}
        onChange={(val) => handleArrayChange(arrayName, index, 'activity', val)}
        multiline
        className="md:col-span-3"
      />
      <FormField
        label="API Score"
        value={activity.api}
        placeholder="0"
        isEditing={isEditing(`${prefix}-api-${index}`)}
        onEdit={() => toggleEdit(`${prefix}-api-${index}`)}
        onChange={(val) => handleArrayChange(arrayName, index, 'api', val)}
        type="number"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <SectionCard
        title="Student Extra & Co-Curricular Activities"
        description="Contribution/Participation in student activities (Item 13A)"
        infoMessage="5 API points per activity, 10 if played a lead role. Maximum: 20 points."
      >
        <ArrayFieldGroup<Activity>
          items={formData.studentActivities}
          onAdd={() => addArrayItem('studentActivities', emptyActivity)}
          onRemove={(index) => removeArrayItem('studentActivities', index)}
          addLabel="Add Student Activity"
          itemLabel="Activity"
          renderItem={(activity, index) => 
            renderActivityFields(activity, index, 'student', 'studentActivities')
          }
        />
      </SectionCard>

      <SectionCard
        title="Departmental Activities & Development"
        description="Contribution to department development (Item 13B)"
        infoMessage="5 API points as In-charge/Chairman, 3 as member. Maximum: 20 points."
      >
        <ArrayFieldGroup<Activity>
          items={formData.departmentActivities}
          onAdd={() => addArrayItem('departmentActivities', emptyActivity)}
          onRemove={(index) => removeArrayItem('departmentActivities', index)}
          addLabel="Add Department Activity"
          itemLabel="Activity"
          renderItem={(activity, index) => 
            renderActivityFields(activity, index, 'dept', 'departmentActivities')
          }
        />
      </SectionCard>

      <SectionCard
        title="Institute Activities & Development"
        description="Contribution to institutional development (Item 13C)"
        infoMessage="10 API points for Director/Dean/HoD level positions, 5 for committee membership. Maximum: 20 points."
      >
        <ArrayFieldGroup<Activity>
          items={formData.instituteActivities}
          onAdd={() => addArrayItem('instituteActivities', emptyActivity)}
          onRemove={(index) => removeArrayItem('instituteActivities', index)}
          addLabel="Add Institute Activity"
          itemLabel="Activity"
          renderItem={(activity, index) => 
            renderActivityFields(activity, index, 'inst', 'instituteActivities')
          }
        />
      </SectionCard>

      <SectionCard
        title="Lectures & Publications"
        description="Special lectures delivered and articles written (Items 13D & 13E)"
      >
        <div className="space-y-4">
          <FormField
            label="Special/Extension/Expert/Invited Lectures Delivered (13D)"
            value={formData.lectures}
            placeholder="Provide details of lectures delivered outside/within institute"
            isEditing={isEditing('lectures')}
            onEdit={() => toggleEdit('lectures')}
            onChange={(val) => handleChange('lectures', val)}
            multiline
            tooltip="10 API points each for outside Institute, 5 each for within. Maximum: 20 points."
          />
          <FormField
            label="Articles, Monographs, Technical Reports, Reviews Written (13E)"
            value={formData.articles}
            placeholder="List any articles, reports, or reviews written"
            isEditing={isEditing('articles')}
            onEdit={() => toggleEdit('articles')}
            onChange={(val) => handleChange('articles', val)}
            multiline
            tooltip="1/2/3 API points based on level and effort. Maximum: 10 points."
          />
        </div>
      </SectionCard>
    </div>
  );
}
