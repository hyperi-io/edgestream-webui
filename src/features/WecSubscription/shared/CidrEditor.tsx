import React, { useCallback, useState } from 'react';

import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';

function isValidCidr(s: string) {
  return /^(\d{1,3}\.){3}\d{1,3}\/(\d{1,2}|(\d{1,3}\.){3}\d{1,3})$/.test(
    s.trim(),
  );
}

export default function CidrEditor({
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  label: string;
  value: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  error?: string;
}) {
  const [input, setInput] = useState('');

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInput(e.currentTarget.value);
    },
    [],
  );

  const add = useCallback(() => {
    const t = input.trim();
    if (!t) return;

    if (!isValidCidr(t)) {
      window.alert('Invalid CIDR. Use a.b.c.d/prefix or a.b.c.d/netmask');
      return;
    }

    // prevent duplicates so we can safely use cidr as a React key
    if (value.includes(t)) {
      return;
    }

    onChange([...value, t]);
    setInput('');
  }, [input, onChange, value]);

  const handleRemoveClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const idxAttr = (e.currentTarget as HTMLButtonElement).dataset.index;
      if (idxAttr == null) return;
      const idx = Number(idxAttr);
      if (Number.isNaN(idx) || idx < 0 || idx >= value.length) return;

      const next = value.slice(0, idx).concat(value.slice(idx + 1));
      onChange(next);
    },
    [onChange, value],
  );

  return (
    <Stack gap={6}>
      <Text fw={600}>{label}</Text>

      <Group wrap="wrap" gap="xs">
        {value.map((cidr, idx) => (
          <Badge
            key={cidr} // stable key; we prevent duplicates in `add`
            rightSection={
              <ActionIcon
                size="xs"
                variant="subtle"
                color="red"
                onClick={handleRemoveClick}
                data-index={idx}
                aria-label="Remove"
                style={{ marginLeft: 4 }}
              >
                <IconX size={12} />
              </ActionIcon>
            }
          >
            {cidr}
          </Badge>
        ))}
      </Group>

      <Group align="end" wrap="nowrap">
        <TextInput
          flex={1}
          placeholder={placeholder || 'a.b.c.d/prefix or a.b.c.d/netmask'}
          value={input}
          onChange={handleInputChange}
        />
        <Button variant="light" onClick={add}>
          Add
        </Button>
      </Group>

      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
    </Stack>
  );
}
