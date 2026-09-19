import type { ChangeEvent } from 'react';

interface IconSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  'aria-label'?: string;
}

export default function IconSwitch({
  checked,
  onChange,
  disabled,
  ...props
}: IconSwitchProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <label className="check-switch">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={handleChange}
        {...props}
      />
      <span className="check-switch-slider">
        <span className="check-switch-glow" aria-hidden="true" />
        <span className="check-switch-icon-on" aria-hidden="true">
          &#10003;
        </span>
        <span className="check-switch-icon-off" aria-hidden="true">
          &#10005;
        </span>
      </span>
    </label>
  );
}