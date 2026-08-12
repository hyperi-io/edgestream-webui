import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TextInput, ActionIcon, Group } from '@mantine/core';
import { MantineValueSelector } from '@react-querybuilder/mantine';
import { IconEdit, IconList } from '@tabler/icons-react';

import type { FieldSelectorProps } from 'react-querybuilder';

type SelectOpt = { value: string; label: string };

function rqbOptionsToSelectData(options: any[] = []): SelectOpt[] {
  return options.reduce<SelectOpt[]>((acc, item) => {
    if (item.options && Array.isArray(item.options)) {
      const inner = item.options.map((o: any) => ({
        value: o.name,
        label: o.label ?? o.name,
      }));
      return acc.concat(inner);
    }
    if (item.name) {
      return acc.concat({ value: item.name, label: item.label ?? item.name });
    }
    return acc;
  }, []);
}

const CustomFieldSelector: React.FC<FieldSelectorProps> = (props) => {
  const [useCustomField, setUseCustomField] = useState<boolean>(true);
  const [local, setLocal] = useState<string>(props.value ?? '');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (props.value !== local && document.activeElement !== inputRef.current) {
      setLocal((props.value as string) ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  const commit = useCallback(() => {
    if ((props.value ?? '') !== local) {
      props.handleOnChange(local);
    }
  }, [local, props]);

  const selectData = useMemo(() => rqbOptionsToSelectData(props.options), [props.options]);

  return (
    <Group gap="xs" wrap="nowrap" align="center">
      <ActionIcon
        variant="subtle"
        title={useCustomField ? "Use default fields" : "Use custom field"}
        onClick={() => setUseCustomField((prev) => !prev)}
      >
        {useCustomField ? <IconList size={16} /> : <IconEdit size={16} />}
      </ActionIcon>

      {useCustomField ? (
        <TextInput
          ref={inputRef}
          style={{ width: 220 }}
          value={local}
          onChange={(e) => setLocal(e.currentTarget.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          className={props.className}
          placeholder="Field name"
        />
      ) : (
        <MantineValueSelector
          {...props}
          value={(props.value as string) ?? ''}
          options={selectData as any}
        />
      )}
    </Group>
  );
};

export default CustomFieldSelector;
