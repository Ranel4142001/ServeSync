import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { C } from './design-tokens';
import { AuthLayout } from './AuthLayout';
import { Logo } from './Logo';
import { InputField } from './InputField';
import { PrimaryButton } from './PrimaryButton';
import { ErrorBanner } from './Banners';

// RegisterPage handles user registration with a multi-step form and password strength metrics
export function RegisterPage() {
  const navigate = useNavigate();

  // Retrieve state and operations from Zustand store
  const { registerAction, isLoading, error } = useAuthStore();

  // Step-by-step navigation state (Step 1: Your info, Step 2: Security settings)
  const [step, setStep] = useState(1);

  // Unified state representation of all form inputs
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    organizationId: "",
  });

  // Validation errors grouped by input key
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Triggers confirmation screen on success
  const [success, setSuccess] = useState(false);

  // Helper function to update state based on form input key
  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  // Validates Step 1 credentials (personal info)
  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.email) e.email = "Required";
    else if (!form.email.includes("@")) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Validates Step 2 credentials (passwords and organization details)
  function validateStep2(): boolean {
    const e: Record<string, string> = {};
    if (!form.password) e.password = "Required";
    else if (form.password.length < 8) e.password = "At least 8 characters";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords don't match";
    if (!form.organizationId.trim()) e.organizationId = "Required — ask your admin";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Transitions to the security details step after verifying personal details
  function nextStep() {
    if (validateStep1()) {
      setStep(2);
      setErrors({});
    }
  }

  // Submits the registration request to the server and schedules login navigation
  async function handleRegister() {
    if (!validateStep2()) return; // Stop if security checks fail

    await registerAction({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      role: 'CLIENT', // Default new signups to Client tier
      organizationId: form.organizationId,
    });

    const storeError = useAuthStore.getState().error;
    if (!storeError) {
      setSuccess(true);
      // Auto redirect to sign-in page after a small delay
      setTimeout(() => navigate('/login'), 2500);
    }
  }

  // Success view display
  if (success) {
    return (
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 44, textAlign: "center",
      }}>
        {/* Checkmark icon */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "#F0FDF4", border: "2px solid #BBF7D0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, marginBottom: 20,
        }}>
          ✓
        </div>
        
        <div style={{ fontSize: 20, fontWeight: 700, color: C.gray900, marginBottom: 8 }}>
          Account created!
        </div>
        
        <div style={{ fontSize: 13, color: C.gray500, marginBottom: 28, lineHeight: 1.6 }}>
          Welcome to ServeSync, {form.firstName}. You can now sign in with your credentials.
        </div>
        
        <PrimaryButton onClick={() => navigate('/login')}>
          Go to sign in →
        </PrimaryButton>
      </div>
    );
  }

  return (
    <AuthLayout mode="register">
      {/* Right panel inner content */}
      <div style={{ display: "flex", flex: 1, flexDirection: "column", padding: "44px 44px 36px" }}>
        
        {/* Company Branding logo header */}
        <Logo />

        {/* Form Step indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 28 }}>
          {[1, 2].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: 26, height: 26, borderRadius: "50%",
                background: step >= s ? C.brandMid : C.gray100,
                color: step >= s ? "#fff" : C.gray400,
                display: "flex", alignItems: "center",
                justifyContent: "center",
                fontSize: 11, fontWeight: 700,
                transition: "background .2s",
              }}>
                {step > s ? "✓" : s}
              </div>
              <div style={{ marginLeft: 6 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: step >= s ? C.gray900 : C.gray400 }}>
                  {s === 1 ? "Your info" : "Security"}
                </div>
              </div>
              {i === 0 && (
                <div style={{
                  flex: 1, height: 1.5, background: step >= 2 ? C.brandMid : C.gray200,
                  margin: "0 12px", minWidth: 32,
                  transition: "background .2s",
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Heading title of current step */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.gray900, letterSpacing: -0.5 }}>
            {step === 1 ? "Create your account" : "Secure your account"}
          </div>
          <div style={{ fontSize: 13, color: C.gray500, marginTop: 4 }}>
            {step === 1 ? "Step 1 of 2 — Tell us about yourself" : "Step 2 of 2 — Set your password"}
          </div>
        </div>

        {/* Registration form context */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (step === 1) nextStep();
            else handleRegister();
          }}
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Server side authentication errors */}
          <ErrorBanner message={error} />

          {step === 1 ? (
            <>
              {/* Personal details fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <InputField
                  label="First name"
                  type="text"
                  placeholder="Ranel"
                  value={form.firstName}
                  onChange={set("firstName")}
                  error={errors.firstName}
                />
                <InputField
                  label="Last name"
                  type="text"
                  placeholder="Dahil"
                  value={form.lastName}
                  onChange={set("lastName")}
                  error={errors.lastName}
                />
              </div>

              {/* Email address field */}
              <InputField
                label="Work email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={set("email")}
                error={errors.email}
                icon="✉"
              />

              {/* Trigger transition to step 2 */}
              <div style={{ marginTop: 4 }}>
                <PrimaryButton type="submit">
                  Continue →
                </PrimaryButton>
              </div>
            </>
          ) : (
            <>
              {/* Password credentials creation */}
              <InputField
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={set("password")}
                error={errors.password}
                icon="🔒"
              />

              {/* Password strength progress meter */}
              {form.password && (
                <div style={{ display: "flex", gap: 4, marginTop: -8 }}>
                  {[1, 2, 3, 4].map(i => {
                    const strength = form.password.length < 6 ? 1
                      : form.password.length < 8 ? 2
                      : /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? 4 : 3;
                    const colors = ["", "#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
                    return (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i <= strength ? colors[strength] : C.gray200,
                        transition: "background .2s",
                      }} />
                    );
                  })}
                  
                  {/* Strength textual summary */}
                  <span style={{ fontSize: 10, color: C.gray400, whiteSpace: "nowrap" }}>
                    {form.password.length < 6 ? "Weak"
                      : form.password.length < 8 ? "Fair"
                      : /[A-Z]/.test(form.password) && /[0-9]/.test(form.password) ? "Strong" : "Good"}
                  </span>
                </div>
              )}

              {/* Password confirmation check field */}
              <InputField
                label="Confirm password"
                type="password"
                placeholder="Repeat your password"
                value={form.confirmPassword}
                onChange={set("confirmPassword")}
                error={errors.confirmPassword}
                icon="🔒"
              />

              {/* Organization Identification details */}
              <div>
                <InputField
                  label="Organization ID"
                  type="text"
                  placeholder="Paste the ID from your admin"
                  value={form.organizationId}
                  onChange={set("organizationId")}
                  error={errors.organizationId}
                  icon="#"
                />
                <div style={{ fontSize: 11, color: C.gray400, marginTop: 5 }}>
                  Your admin can find this in their dashboard settings
                </div>
              </div>

              {/* Back navigation and registration execution */}
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrors({}); }}
                  style={{
                    padding: "11px 20px", borderRadius: 8,
                    border: `1.5px solid ${C.gray200}`,
                    background: C.white, color: C.gray700,
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
                <div style={{ flex: 1 }}>
                  <PrimaryButton type="submit" loading={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                  </PrimaryButton>
                </div>
              </div>
            </>
          )}
        </form>

        {/* Redirect toggle to login page */}
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: C.gray500 }}>
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ background: "none", border: "none", color: C.brandLight, fontWeight: 600, cursor: "pointer", fontSize: 12, textDecoration: "none" }}
          >
            Sign in
          </Link>
        </div>

      </div>
    </AuthLayout>
  );
}