// A reusable Input component used across all forms
// Accepts all standard HTML input props plus a label and error

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label:   string;         // text shown above the input
  error?:  string;         // red error message shown below
}

export function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">

      {/* Label above the input */}
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* The actual input field */}
      <input
        className={`
          w-full px-3 py-2 border rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-colors
          ${error
            ? 'border-red-400 bg-red-50'   // red border if error
            : 'border-gray-300 bg-white'   // normal border
          }
        `}
        {...props}
      />

      {/* Error message below input — only shown if error exists */}
      {error && (
        <span className="text-xs text-red-500">{error}</span>
      )}

    </div>
  );
}