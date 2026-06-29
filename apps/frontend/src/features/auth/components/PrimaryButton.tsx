import { C } from './design-tokens';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean; // Shows a loading spinner when true and disables clicks
}

// PrimaryButton renders a styled submit or primary action button with built-in loading spinner
export function PrimaryButton({
  children,
  onClick,
  loading = false,
  disabled,
  ...props
}: PrimaryButtonProps) {
  const isButtonDisabled = loading || disabled;

  return (
    <button
      onClick={onClick}
      disabled={isButtonDisabled}
      style={{
        width: "100%",
        padding: "11px 0",
        background: isButtonDisabled
          ? C.gray200
          : `linear-gradient(135deg, ${C.brandMid} 0%, ${C.brandLight} 100%)`,
        color: isButtonDisabled ? C.gray400 : C.white,
        border: "none",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        cursor: isButtonDisabled ? "not-allowed" : "pointer",
        transition: "opacity .15s, transform .1s",
        boxShadow: isButtonDisabled ? "none" : `0 2px 8px ${C.brandMid}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        letterSpacing: 0.2,
      }}
      // Interactive visual hover states
      onMouseEnter={e => {
        if (!isButtonDisabled) {
          e.currentTarget.style.opacity = "0.88";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.opacity = "1";
      }}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 1s linear infinite" }}>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity=".25" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}
