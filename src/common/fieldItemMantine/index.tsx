import React, { useMemo } from 'react';
import { MultiSelect, Select, Textarea, TextInput } from '@mantine/core';
import { CERT_KEY_RE } from 'common/tlsCertificates';

export type Operator = 'eq' | 'ne' | 'in' | 'nin' | 'truthy' | 'falsy';

export type Rule = {
  key: string;
  operator?: Operator;
  value?: any | any[];
};

export type FieldDef = {
  fieldKey: string;
  title?: string;
  description?: string;
  placeholder?: string;
  enum?: (string | number)[];
  type?: 'string' | 'number' | 'boolean' | 'select' | 'text' | 'multiselect';
  required?: boolean;
  default?: any;
  dependsOn?: Rule[];
  requires?: Rule[];
  cast?: string;
};

type Props = {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
  error?: string | null;
  requiredNow: boolean;
};

const FieldItemMantine: React.FC<Props> = ({
                                             field,
                                             value,
                                             onChange,
                                             error,
                                             requiredNow,
                                           }) => {
  const label = field.title ?? field.fieldKey;

  const commonProps = {
    label,
    description: field.description,
    error,
    withAsterisk: requiredNow,
    mb: 'md', // Added a default margin for form spacing
  };

  const isCertField = useMemo(() => CERT_KEY_RE.test(field.fieldKey), [field.fieldKey]);

  // Boolean Detection logic
  const isBooleanField = useMemo(() => {
    const castLower = (field.cast || '').toLowerCase();
    return (
      field.type === 'boolean' ||
      castLower === 'bool' ||
      castLower === 'boolean' ||
      typeof value === 'boolean' ||
      typeof field.default === 'boolean'
    );
  }, [field.type, field.cast, field.default, value]);

  /** Render Boolean Select */
  if (isBooleanField) {
    return (
      <Select
        {...commonProps}
        data={[
          { value: 'true', label: 'True' },
          { value: 'false', label: 'False' },
        ]}
        value={value === null || value === undefined ? null : String(!!value)}
        onChange={(v) => onChange(v === null ? undefined : v === 'true')}
        placeholder={field.placeholder ?? 'Select True/False'}
        searchable={false}
        clearable={!requiredNow}
        allowDeselect={!requiredNow}
      />
    );
  }

  /** Render MultiSelect */
  if (field.type === 'multiselect') {
    const options = (field.enum ?? []).map((v) => ({
      value: String(v),
      label: String(v),
    }));
    const disabled = isCertField && options.length === 0;

    return (
      <MultiSelect
        {...commonProps}
        data={options}
        value={Array.isArray(value) ? value.map(String) : []}
        onChange={onChange}
        placeholder={disabled ? 'No options available' : field.placeholder ?? 'Select...'}
        searchable={!isCertField}
        disabled={disabled}
        clearable={!requiredNow}
      />
    );
  }

  /** Render Enum Select */
  if (field.enum && field.enum.length > 0) {
    const options = field.enum.map((v) => ({
      value: String(v),
      label: String(v),
    }));
    const disabled = isCertField && options.length === 0;

    return (
      <Select
        {...commonProps}
        data={options}
        value={value === undefined || value === '' ? null : String(value)}
        onChange={(v) => onChange(v ?? '')}
        placeholder={disabled ? 'No certificates available' : field.placeholder ?? 'Select...'}
        searchable={!isCertField}
        disabled={disabled}
        clearable={!requiredNow}
        allowDeselect={!requiredNow}
      />
    );
  }

  /** Render Textarea */
  if (field.type === 'text') {
    return (
      <Textarea
        {...commonProps}
        value={value ?? ''}
        onChange={(e) => onChange(e.currentTarget.value)}
        autosize
        minRows={2}
        placeholder={field.placeholder}
      />
    );
  }

  /** Render Number Input */
  if (field.type === 'number') {
    return (
      <TextInput
        {...commonProps}
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.currentTarget.value === '' ? '' : Number(e.currentTarget.value))}
        placeholder={field.placeholder}
      />
    );
  }

  /** Default: Text Input */
  return (
    <TextInput
      {...commonProps}
      value={value ?? ''}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder={field.placeholder}
    />
  );
};

export default React.memo(FieldItemMantine);
