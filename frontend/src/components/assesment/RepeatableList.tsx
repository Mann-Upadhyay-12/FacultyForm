import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFormContext, ArrayKey } from '@/context/FormContext';
import type { FormData } from '@/types/formTypes';

type Row<K extends ArrayKey> = FormData[K][number];

interface RepeatableListProps<K extends ArrayKey> {
  name: K;
  template: Row<K>;
  itemLabel: string;
  addLabel?: string;
  /** Short summary shown next to the entry heading, e.g. the API points. */
  badge?: (row: Row<K>, index: number) => React.ReactNode;
  children: (row: Row<K>, index: number, set: (field: keyof Row<K> & string, value: string) => void) => React.ReactNode;
}

export function RepeatableList<K extends ArrayKey>({ name, template, itemLabel, addLabel, badge, children }: RepeatableListProps<K>) {
  const { formData, handleArrayChange, addArrayItem, removeArrayItem } = useFormContext();
  const rows = formData[name] as Row<K>[];

  const isBlank = (row: Row<K>) => Object.values(row as unknown as Record<string, string>).every((v) => !v);

  const onRemove = (index: number) => {
    const row = rows[index];
    if (!isBlank(row) && !window.confirm(`Remove ${itemLabel} ${index + 1}? Its details will be lost.`)) return;
    removeArrayItem(name, index, template);
  };

  return (
    <div className="repeatable">
      {rows.map((row, index) => (
        <div key={index} className="entry-card">
          <div className="entry-head">
            <h4>
              {itemLabel} {index + 1}
            </h4>
            <div className="entry-head-right">
              {badge?.(row, index)}
              {(rows.length > 1 || !isBlank(row)) && (
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="remove-button"
                  aria-label={rows.length > 1 ? `Remove ${itemLabel} ${index + 1}` : `Clear ${itemLabel} ${index + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  {rows.length > 1 ? 'Remove' : 'Clear'}
                </button>
              )}
            </div>
          </div>
          <div className="field-grid">
            {children(row, index, (field, value) => handleArrayChange(name, index, field, value))}
          </div>
        </div>
      ))}
      <button type="button" onClick={() => addArrayItem(name, template)} className="add-button">
        <Plus className="h-4 w-4" aria-hidden="true" />
        {addLabel || `Add ${itemLabel.toLowerCase()}`}
      </button>
    </div>
  );
}

export function PointsBadge({ value }: { value: string }) {
  if (!value) return null;
  return <span className="points-badge">{value} pts</span>;
}

export function SectionTotal({ label, claimed, counted, cap }: { label: string; claimed: number; counted?: number; cap?: number }) {
  const over = counted !== undefined && claimed > counted;
  return (
    <div className={`section-total ${over ? 'is-over' : ''}`}>
      <span>{label}</span>
      <strong>
        {claimed}
        {cap !== undefined && <span className="section-total-cap"> / {cap} max</span>}
      </strong>
      {over && <span className="section-total-note">Only {counted} will be counted.</span>}
    </div>
  );
}
