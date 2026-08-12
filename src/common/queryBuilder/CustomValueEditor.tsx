// src/common/queryBuilder/CustomValueEditor.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TextInput, Select } from '@mantine/core';

import type { ValueEditorProps } from 'react-querybuilder';

const CustomValueEditor: React.FC<ValueEditorProps> = (props) => {
  const { value, handleOnChange, values, disabled, className } = props;

  const [local, setLocal] = useState<string>((value as string) ?? '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setLocal((value as string) ?? '');
    }
  }, [value]);

  const commit = useCallback(() => {
    const next = local ?? '';
    if ((value ?? '') !== next) {
      handleOnChange(next);
    }
  }, [local, value, handleOnChange]);

  // Enum provided -> Use Select
  if (values && values.length > 0) {
    const data = values.map((v) =>
      typeof v === 'string' ? { value: v, label: v } : { value: String(v.name ?? v.value), label: String(v.label ?? v.name) }
    );

    return (
      <Select
        data={data}
        value={(value as string) ?? null}
        onChange={(val) => handleOnChange(val ?? '')}
        disabled={disabled}
        searchable
        clearable
        placeholder="Select value"
        w={220}
        className={className}
        allowDeselect
      />
    );
  }

  // Text editor -> Use buffered input
  return (
    <TextInput
      ref={inputRef}
      value={local}
      onChange={(e) => setLocal(e.currentTarget.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
      disabled={disabled}
      placeholder="Enter value"
      w={220}
      className={className}
    />
  );
};

export default CustomValueEditor;
