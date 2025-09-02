import React from 'react';
import AdvancedModeSelector from './AdvancedModeSelector';

interface ModeSelectorProps {
  mode: 'default' | 'advanced';
  onModeChange: (mode: 'default' | 'advanced') => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  mode,
  onModeChange,
  disabled = false
}) => {
  return (
    <AdvancedModeSelector
      currentMode={mode}
      onModeChange={onModeChange}
      disabled={disabled}
    />
  );
};
