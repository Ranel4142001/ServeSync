// A reusable Button component with loading state
// Used across all forms and action buttons

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;  // shows spinner when true
  variant?:   'primary' | 'secondary' | 'danger';
}

export function Button({
  isLoading = false,
  variant   = 'primary',
  children,
  ...props
}: ButtonProps) {

  // Different styles for different button types
  const variantStyles = {
    primary:   'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    danger:    'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      className={`
        w-full py-2 px-4 rounded-lg font-medium text-sm
        transition-colors disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${variantStyles[variant]}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {/* Show spinner when loading */}
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}