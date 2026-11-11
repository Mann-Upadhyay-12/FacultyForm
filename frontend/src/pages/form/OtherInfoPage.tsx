
import { FormField } from '@/components/assesment/FormField';
import { useFormContext } from '@/context/FormContext';

export default function OtherInfoPage() {
  const { formData, isEditing, handleEdit, handleChange, handleArrayChange, addArrayItem, removeArrayItem } = useFormContext();

  return (
    <div>
      <h2 className="page-title">Other Information</h2>
      
      <h3 className="section-title">Membership of Professional Bodies/Committees (Item 18)</h3>
      <div className="info-message">
        7 API points per membership, 10 for Chairmanship. Maximum: 20 points.
      </div>

      {formData.membership.map((mem, index) => (
        <div key={index} className="project-entry">
          <h4>Membership {index + 1}</h4>
          <FormField
            label="Body"
            value={mem.body}
            placeholder="e.g., ACM, IEEE, SIAM"
            isEditing={isEditing[`mem-body-${index}`]}
            onEdit={() => handleEdit(`mem-body-${index}`)}
            onChange={(val) => handleArrayChange('membership', index, 'body', val)}
          />
          <FormField
            label="Membership ID/Number"
            value={mem.idNumber}
            placeholder="Enter ID/number"
            isEditing={isEditing[`mem-id-${index}`]}
            onEdit={() => handleEdit(`mem-id-${index}`)}
            onChange={(val) => handleArrayChange('membership', index, 'idNumber', val)}
          />
          <FormField
            label="Self-Assessed API Score"
            value={mem.api}
            placeholder="7 or 10"
            isEditing={isEditing[`mem-api-${index}`]}
            onEdit={() => handleEdit(`mem-api-${index}`)}
            onChange={(val) => handleArrayChange('membership', index, 'api', val)}
          />
          {index > 0 && (
            <button type="button" onClick={() => removeArrayItem('membership', index)} className="remove-button">
              Remove Membership
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => addArrayItem('membership', { body: '', idNumber: '', api: '' })}
        className="add-button"
      >
        + Add Membership
      </button>

      <h3 className="section-title">Additional Information (Item 19)</h3>
      <div className="info-message">
        Patents, Technology Transfer, Products/Processes developed: 30 points (National) or 50 points (International) each.
        Other achievements: Up to 30 points based on importance, novelty, and effort.
      </div>

      <FormField
        label="Any Other Information"
        value={formData.otherInfo}
        placeholder="Patents, technology transfers, products developed, other achievements..."
        multiline
        isEditing={isEditing.otherInfo}
        onEdit={() => handleEdit('otherInfo')}
        onChange={(val) => handleChange('otherInfo', val)}
      />

      <FormField
        label="List of Enclosures"
        value={formData.enclosures}
        placeholder="List all documents attached as proof..."
        multiline
        isEditing={isEditing.enclosures}
        onEdit={() => handleEdit('enclosures')}
        onChange={(val) => handleChange('enclosures', val)}
      />

      <div className="certification-box">
        <p>
          <strong>Certification:</strong> I certify that the above data is correct and I shall be responsible for any inaccurate/incorrect data and shall be liable for suitable action for the same, as decided by the authorities.
        </p>
      </div>
    </div>
  );
}
