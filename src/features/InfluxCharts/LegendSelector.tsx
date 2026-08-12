import React from 'react';
import styled from 'styled-components';

export interface LegendItem {
  key: string;
  label: string;
  color: string;
  visible: boolean;
}

export interface LegendSelectorProps {
  legendItems: LegendItem[];
  setVisibility: (id: string, visible: boolean) => void;
  legendLabel?: string;
}

const LegendContainer = styled.div<{ $scrollable: boolean }>`
  padding: 8px;
  overflow-y: ${({ $scrollable }) => ($scrollable ? 'auto' : 'visible')};
  max-height: ${({ $scrollable }) => ($scrollable ? '200px' : 'none')};
`;

const LegendRow = styled.div<{ $disabled: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 14px;
  cursor: pointer;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`;

const ColorBox = styled.span<{ $color: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  background-color: ${({ $color }) => $color};
  margin-right: 8px;
  border-radius: 2px;
`;

export const LegendSelector: React.FC<LegendSelectorProps> = ({
                                                                legendItems,
                                                                setVisibility,
                                                                legendLabel,
                                                              }) => {
  if (!Array.isArray(legendItems)) return null;

  const scrollable = legendItems.length > 8;

  return (
    <LegendContainer $scrollable={scrollable}>
      {legendLabel && (
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          {legendLabel}
        </div>
      )}
      {legendItems.map((item) => (
        <LegendRow
          key={item.key}
          $disabled={!item.visible}
          onClick={() => setVisibility(item.key, !item.visible)}
        >
          <ColorBox $color={item.color} />
          <span>{item.label}</span>
        </LegendRow>
      ))}
    </LegendContainer>
  );
};
