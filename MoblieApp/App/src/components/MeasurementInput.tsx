import React from 'react';
import { WheelPicker } from './WheelPicker';

interface MeasurementInputProps {
  label: string;
  value: number | null;
  unit: string;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
  accessibilityLabel?: string;
}

export const MeasurementInput: React.FC<MeasurementInputProps> = ({
  label,
  value,
  unit,
  onChangeValue,
  min = 30,
  max = 250,
}) => {
  return (
    <WheelPicker
      label={label}
      min={min}
      max={max}
      selectedValue={value}
      onValueChange={onChangeValue}
      unit={unit}
    />
  );
};
