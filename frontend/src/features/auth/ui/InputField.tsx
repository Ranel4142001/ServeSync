import { useState } from 'react';
import { C } from './design-tokens';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;            // Text shown above the input box
  error?: string;           // Error message shown below the input box when validation fails
  icon?: React.ReactNode;   // Optional icon component/string placed inside the input box on the left
}

// InputField wraps a standard input field with additional label, error indicator and icon support
export function InputField({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  ...props
}: InputFieldProps) {
  // Track focus state to trigger dynamic styling highlights
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {/* Field Label */}
      <label style={{ fontSize: 12, fontWeight: 600, color: C.gray700, letterSpacing: 0.2 }}>
        {label}
      </label>

      {/* Input wrapper containing optional icon overlay */}
      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: focused ? C.brandLight : C.gray400,
            fontSize: 15, transition: 'color .15s', pointerEvents: 'none',
          }}>
            {icon}
          </div>
        )}
        
        {/* Native Input Control */}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            padding: `10px 12px 10px ${icon ? 36 : 12}px`,
            border: `1.5px solid ${error ? C.red : focused ? C.brandLight : C.gray200}`,
            borderRadius: 8,
            fontSize: 13,
            color: C.gray900,
            background: error ? C.redPale : focused ? C.white : C.brandPale,
            outline: 'none',
            transition: 'border-color .15s, box-shadow .15s, background-color .15s',
            boxShadow: focused && !error ? `0 0 0 3px ${C.brandLight}18` : 'none',
            boxSizing: 'border-box',
          }}
          {...props}
        />
      </div>

      {/* Input Field Error State Notification */}
      {error && (
        <div style={{ fontSize: 11, color: C.red, display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⚠</span> {error}
        </div>
      )}
    </div>
  );
}
