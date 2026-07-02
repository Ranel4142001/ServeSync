import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../application/auth.store';
import { C } from './design-tokens';
import { AuthLayout } from './AuthLayout';
import { Logo } from './Logo';
import { InputField } from './InputField';
import { PrimaryButton } from './PrimaryButton';
import { Divider } from './Divider';
import { ErrorBanner } from './Banners';

// LoginPage renders the Login screen incorporating credentials entry and routing checks
export function LoginPage() {
  const navigate = useNavigate();

  // Retrieve state and operations from Zustand store
  const { loginAction, isLoading, error } = useAuthStore();

  // Local control state for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Form field level validation feedback
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Performs basic structural checks on email & password entries before API submission
  function validate(): boolean {
    const errors: typeof formErrors = {};

    if (!email) {
      errors.email = 'Email is required';
    } else if (!email.includes('@')) {
      errors.email = 'Enter a valid email';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'At least 6 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // Sends credentials to Zustand login action and handles success redirects based on user role
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Prevent page reload

    if (!validate()) return; // Stop if local checks fail

    await loginAction({ email, password });

    // Retrieve updated user role to trigger navigation
    const { user } = useAuthStore.getState();
    if (user) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      if (user.role === 'AGENT') navigate('/agent/dashboard');
      if (user.role === 'CLIENT') navigate('/client/dashboard');
    }
  }

  return (
    <AuthLayout mode="login">
      {/* Right panel inner content */}
      <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: "44px 44px 36px" }}>
        
        {/* Company Branding logo header */}
        <Logo />

        {/* Title and subtitle */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: C.gray900, letterSpacing: -0.5 }}>
            Sign in
          </div>
          <div style={{ fontSize: 13, color: C.gray500, marginTop: 4 }}>
            Enter your credentials to access your dashboard
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, marginTop: 24 }}>
          
          {/* API Server error banner */}
          <ErrorBanner message={error} />

          {/* Email input field */}
          <InputField
            label="Email address"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            error={formErrors.email}
            icon="✉"
          />

          {/* Password input field with hide/show toggles */}
          <div>
            <InputField
              label="Password"
              type={showPass ? "text" : "password"}
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={formErrors.password}
              icon="🔒"
            />
            <div style={{ textAlign: "right", marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{ background: "none", border: "none", fontSize: 11, color: C.brandLight, cursor: "pointer", padding: 0 }}
              >
                {showPass ? "Hide password" : "Show password"}
              </button>
            </div>
          </div>

          {/* Login submit button */}
          <div style={{ marginTop: 4 }}>
            <PrimaryButton type="submit" loading={isLoading}>
              {isLoading ? "Signing in..." : "Sign in →"}
            </PrimaryButton>
          </div>

          {/* Quick-fill accounts panel */}
          <Divider text="Test accounts" />

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { role: "ADMIN", email: "admin@servesync.com", color: C.brand },
              { role: "AGENT", email: "agent@servesync.com", color: "#059669" },
              { role: "CLIENT", email: "client@servesync.com", color: C.violet },
            ].map(a => (
              <button
                key={a.role}
                type="button"
                onClick={() => {
                  setEmail(a.email);
                  setPassword("Admin@123456");
                  // Clear form error boundaries when quick-filling
                  setFormErrors({});
                }}
                style={{
                  padding: "8px 12px", borderRadius: 7,
                  border: `1px solid ${C.brandBorder}`,
                  background: C.brandPale, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  fontSize: 12, color: C.gray700,
                  transition: "border-color .12s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.brandLight}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.brandBorder}
              >
                <span style={{
                  padding: "2px 7px", borderRadius: 4,
                  background: a.color + "15", color: a.color,
                  fontSize: 10, fontWeight: 600,
                }}>
                  {a.role}
                </span>
                <span style={{ flex: 1, textAlign: "left" }}>{a.email}</span>
                <span style={{ color: C.gray400, fontSize: 11 }}>click to fill</span>
              </button>
            ))}
          </div>
        </form>

        {/* Navigation redirect to registration page */}
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: C.gray500 }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ background: "none", border: "none", color: C.brandLight, fontWeight: 600, cursor: "pointer", fontSize: 12, textDecoration: "none" }}
          >
            Create one
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}