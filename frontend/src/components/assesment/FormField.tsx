import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Pencil, Check, HelpCircle } from 'lucide-react';
import React from 'react';

export interface SelectOption {
  label: string;
  value: string;
}

export interface FormFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  isEditing: boolean;
  onEdit: () => void;
  onChange: (value: string) => void;
  multiline?: boolean;
  type?: 'text' | 'date' | 'number' | 'select' | 'radio';
  options?: SelectOption[];
  tooltip?: string;
  required?: boolean;
  className?: string;
}

export function FormField({
  label,
  value,
  placeholder = '',
  isEditing,
  onEdit,
  onChange,
  multiline = false,
  type = 'text',
  options = [],
  tooltip,
  required = false,
  className = ''
}: FormFieldProps) {
  const inputId = React.useId();

  // Find human-readable label for select/radio when in view mode
  const displayValue = React.useMemo(() => {
    if (!value) return '';
    if ((type === 'select' || type === 'radio') && options.length > 0) {
      const matched = options.find((opt) => opt.value === value);
      if (matched) return matched.label;
    }
    return value;
  }, [value, type, options]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline && isEditing) {
      e.preventDefault();
      onEdit();
    } else if (e.key === 'Escape' && isEditing) {
      e.preventDefault();
      onEdit();
    }
  };

  const renderInput = () => {
    if (type === 'select' && options.length > 0) {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={inputId} className="w-full bg-background border-slate-300 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]">
            <SelectValue placeholder={placeholder || 'Select an option'} />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border z-50 shadow-md">
            {options.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="cursor-pointer hover:bg-slate-100"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (type === 'radio' && options.length > 0) {
      return (
        <div className="flex flex-wrap gap-2 pt-1" role="radiogroup" aria-labelledby={inputId}>
          {options.map((option) => {
            const isChecked = value === option.value;
            return (
              <label
                key={option.value}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium cursor-pointer transition-all ${
                  isChecked
                    ? 'border-[#1e3a5f] bg-[#1e3a5f]/10 text-[#1e3a5f] shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name={inputId}
                  value={option.value}
                  checked={isChecked}
                  onChange={(e) => onChange(e.target.value)}
                  className="sr-only"
                />
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isChecked ? 'border-[#1e3a5f]' : 'border-slate-400'
                  }`}
                >
                  {isChecked && <span className="w-2 h-2 rounded-full bg-[#1e3a5f]" />}
                </span>
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      );
    }

    if (multiline) {
      return (
        <Textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[85px] bg-background border-slate-300 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f] resize-y"
          rows={3}
        />
      );
    }

    return (
      <Input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-background border-slate-300 focus:border-[#1e3a5f] focus:ring-1 focus:ring-[#1e3a5f]"
      />
    );
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor={inputId} className="text-sm font-semibold text-slate-700 cursor-pointer">
            {label}
            {required && <span className="text-rose-600 ml-1 font-bold">*</span>}
          </Label>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="text-slate-400 hover:text-slate-600 inline-flex items-center focus:outline-hidden"
                  aria-label={`Info about ${label}`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-slate-900 text-white text-xs p-2 rounded shadow-lg z-50">
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className={`h-7 px-2 text-xs font-medium rounded-md transition-colors ${
            isEditing
              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800'
              : 'text-slate-600 hover:text-[#1e3a5f] hover:bg-slate-100'
          }`}
          aria-label={isEditing ? `Save ${label}` : `Edit ${label}`}
        >
          {isEditing ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              <span>Save</span>
            </>
          ) : (
            <>
              <Pencil className="h-3 w-3 mr-1" />
              <span>Edit</span>
            </>
          )}
        </Button>
      </div>

      {isEditing ? (
        renderInput()
      ) : (
        <div
          onClick={onEdit}
          title="Click to edit"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onEdit();
            }
          }}
          className="group py-2 px-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 rounded-md min-h-[38px] flex items-center justify-between cursor-pointer transition-all focus:outline-hidden focus:ring-2 focus:ring-[#1e3a5f]/40"
        >
          <p className={`text-sm leading-relaxed ${displayValue ? 'text-slate-800 font-medium' : 'text-slate-400 italic'}`}>
            {displayValue || placeholder || 'Not provided — click to enter'}
          </p>
          <Pencil className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
        </div>
      )}
    </div>
  );
}
