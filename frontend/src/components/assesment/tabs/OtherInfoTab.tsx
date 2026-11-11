
import { FormField } from '../FormField';
import { SectionCard } from '../SectionCard';
import { ArrayFieldGroup } from '../ArrayFieldGroup';
import type { FormData, Membership } from '@/types/assessment';
import { AlertCircle } from 'lucide-react';

interface OtherInfoTabProps {
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

const emptyMembership: Membership = {
  body: '',
  idNumber: '',
  api: ''
};

export function OtherInfoTab({
  formData,
  isEditing,
  toggleEdit,
  handleChange,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
}: OtherInfoTabProps) {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Professional Memberships"
        description="Membership of professional bodies and committees (Item 18)"
        infoMessage="7 API points per membership, 10 for Chairmanship. Maximum: 20 points."
      >
        <ArrayFieldGroup<Membership>
          items={formData.membership}
          onAdd={() => addArrayItem('membership', emptyMembership)}
          onRemove={(index) => removeArrayItem('membership', index)}
          addLabel="Add Membership"
          itemLabel="Membership"
          renderItem={(mem, index) => (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Professional Body"
                value={mem.body}
                placeholder="e.g., ACM, IEEE, SIAM"
                isEditing={isEditing(`mem-body-${index}`)}
                onEdit={() => toggleEdit(`mem-body-${index}`)}
                onChange={(val) => handleArrayChange('membership', index, 'body', val)}
              />
              <FormField
                label="Membership ID/Number"
                value={mem.idNumber}
                placeholder="e.g., 7452111"
                isEditing={isEditing(`mem-id-${index}`)}
                onEdit={() => toggleEdit(`mem-id-${index}`)}
                onChange={(val) => handleArrayChange('membership', index, 'idNumber', val)}
              />
              <FormField
                label="API Score"
                value={mem.api}
                placeholder="7 or 10"
                isEditing={isEditing(`mem-api-${index}`)}
                onEdit={() => toggleEdit(`mem-api-${index}`)}
                onChange={(val) => handleArrayChange('membership', index, 'api', val)}
                type="number"
                tooltip="7 points for membership, 10 for chairmanship"
              />
            </div>
          )}
        />
      </SectionCard>

      <SectionCard
        title="Other Information"
        description="Additional achievements, patents, innovations (Item 19)"
        infoMessage="API points based on importance and effort (max 30). Patents/Technology Transfer: 30 points (National) or 50 points (International)."
      >
        <div className="space-y-4">
          <FormField
            label="Any Other Information"
            value={formData.otherInfo}
            placeholder="Patents, technology transfers, products developed, or any other noteworthy achievements..."
            isEditing={isEditing('otherInfo')}
            onEdit={() => toggleEdit('otherInfo')}
            onChange={(val) => handleChange('otherInfo', val)}
            multiline
            tooltip="Include patents, technology transfers, products/processes developed, and other achievements"
          />
          <FormField
            label="List of Enclosures"
            value={formData.enclosures}
            placeholder="List all documents attached as proof..."
            isEditing={isEditing('enclosures')}
            onEdit={() => toggleEdit('enclosures')}
            onChange={(val) => handleChange('enclosures', val)}
            multiline
            tooltip="List all supporting documents you're attaching with this form"
          />
        </div>
      </SectionCard>

      <div className="p-6 bg-accent/10 border border-accent/30 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-heading font-semibold text-foreground mb-2">
              Certification
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              I certify that the above data is correct and I shall be responsible for any 
              inaccurate/incorrect data and shall be liable for suitable action for the same, 
              as decided by the authorities.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
