import React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Sparkles } from 'lucide-react';
import type { Option } from '@/types/formTypes';

export type SelectOption = Option;

export interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'date' | 'number' | 'select' | 'radio' | 'textarea';
  /** @deprecated use type="textarea" */
  multiline?: boolean;
  options?: Option[];
  /** Free-text with typeahead suggestions (renders a <datalist>). */
  suggestions?: string[];
  tooltip?: string;
  hint?: React.ReactNode;
  error?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number | 'any';
  className?: string;
  /** Wide fields span both columns of a .field-grid. */
  wide?: boolean;
}

export function FormField({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  multiline = false,
  options = [],
  suggestions,
  tooltip,
  hint,
  error,
  required = false,
  min,
  max,
  step,
  className = '',
  wide = false,
}: FormFieldProps) {
  const id = React.useId();
  const listId = suggestions ? `${id}-list` : undefined;
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  const kind = multiline ? 'textarea' : type;

  const common = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': required || undefined,
  };

  const renderInput = () => {
    if (kind === 'select') {
      return (
        <select
          {...common}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`ff-input ff-select ${value ? '' : 'is-empty'}`}
        >
          <option value="">{placeholder || 'Select…'}</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
          {/* Keep legacy / imported values visible instead of silently blanking them */}
          {value && !options.some((o) => o.value === value) && <option value={value}>{value}</option>}
        </select>
      );
    }

    if (kind === 'radio') {
      return (
        <div className="ff-radio-group" role="radiogroup" aria-labelledby={`${id}-label`} aria-describedby={describedBy}>
          {options.map((o) => {
            const checked = value === o.value;
            return (
              <label key={o.value} className={`ff-radio ${checked ? 'is-checked' : ''}`}>
                <input
                  type="radio"
                  name={id}
                  value={o.value}
                  checked={checked}
                  onChange={(e) => onChange(e.target.value)}
                  onClick={() => checked && onChange('')}
                  className="sr-only"
                />
                <span className="ff-radio-dot" aria-hidden="true" />
                <span>{o.label}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (kind === 'textarea') {
      return (
        <textarea
          {...common}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="ff-input ff-textarea"
        />
      );
    }

    return (
      <>
        <input
          {...common}
          type={kind}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onWheel={kind === 'number' ? (e) => (e.target as HTMLInputElement).blur() : undefined}
          placeholder={placeholder}
          min={min}
          max={kind === 'date' && max === undefined ? new Date().toISOString().slice(0, 10) : max}
          step={step}
          inputMode={kind === 'number' ? 'decimal' : undefined}
          list={listId}
          className="ff-input"
        />
        {suggestions && (
          <datalist id={listId}>
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
      </>
    );
  };

  return (
    <div className={`ff-field ${wide || kind === 'textarea' || kind === 'radio' ? 'is-wide' : ''} ${className}`}>
      <div className="ff-label-row">
        <label id={`${id}-label`} htmlFor={kind === 'radio' ? undefined : id} className="ff-label">
          {label}
          {required && (
            <span className="ff-required" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {tooltip && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="ff-help" aria-label={`About ${label}`}>
                <HelpCircle className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-slate-900 text-white text-xs p-2 rounded shadow-lg z-50">
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      {renderInput()}
      {error ? (
        <p id={`${id}-err`} className="ff-error" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="ff-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface ApiFieldProps {
  value: string;
  onChange: (value: string) => void;
  /** Points the rules give for this entry, or null if they don't fix a number. */
  suggested?: number | null;
  label?: string;
  max?: number;
  hint?: React.ReactNode;
  className?: string;
}

/** Numeric self-assessed API score with an optional "use suggested" chip. */
export function ApiField({ value, onChange, suggested, label = 'Self-assessed API score', max, hint, className }: ApiFieldProps) {
  const n = value === '' ? null : Number(value);
  const error =
    n !== null && (!Number.isFinite(n) || n < 0)
      ? 'Enter a positive number.'
      : max !== undefined && n !== null && n > max
        ? `Maximum allowed is ${max}.`
        : undefined;

  const showSuggestion = suggested !== undefined && suggested !== null && String(suggested) !== value;

  return (
    <div className={`ff-api ${className ?? ''}`}>
      <FormField
        label={label}
        type="number"
        value={value}
        onChange={onChange}
        min={0}
        max={max}
        step="any"
        placeholder={max !== undefined ? `0 – ${max}` : 'Points'}
        error={error}
        hint={hint}
      />
      {showSuggestion && (
        <button type="button" className="ff-suggest" onClick={() => onChange(String(suggested))}>
          <Sparkles className="h-3 w-3" aria-hidden="true" />
          As per rules: <strong>{suggested}</strong> — use this
        </button>
      )}
    </div>
  );
}
