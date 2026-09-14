import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/shared/Logo';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showDevRoles, setShowDevRoles] = useState(false);

  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect destination if passed from protected route state
  const fromLocation = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    const result = await login(identifier.trim(), password);
    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
      return;
    }

    // Navigate to original destination if role matches, otherwise to role home
    if (fromLocation && fromLocation !== '/login' && fromLocation !== '/signup') {
      navigate(fromLocation, { replace: true });
    } else {
      navigate(result.destination, { replace: true });
    }
  };

  const handleFillDevCredentials = (testEmail) => {
    setIdentifier(testEmail);
    setPassword('Password@123');
    setErrorMessage('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Security Status Bar (Stitch specification) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#64748B',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'inline-block',
            }}
          />
          <span>Official Auth Gateway</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748B' }}>
            encrypted
          </span>
          <span>256-Bit TLS</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          padding: '32px 28px',
        }}
      >
        {/* Brand & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <Logo variant="customer" to="/" />
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 700,
              color: '#172033',
              letterSpacing: '-0.02em',
              margin: '0 0 6px 0',
            }}
          >
            Sign in to your account
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Welcome back! Please enter your details to continue.
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              marginBottom: '20px',
              color: '#991B1B',
              fontSize: '13px',
              lineHeight: 1.4,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', flexShrink: 0, color: '#DC2626' }}>
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Email or Phone Field */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label
                htmlFor="login-identifier"
                style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}
              >
                Email or Phone Number
              </label>
              <span style={{ fontSize: '11px', color: '#64748B' }}>Registered ID</span>
            </div>
            <div style={{ position: 'relative' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#64748B',
                  pointerEvents: 'none',
                }}
              >
                badge
              </span>
              <input
                id="login-identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="name@example.com or +91 98765 43210"
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 12px 0 38px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#172033',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                  e.target.style.backgroundColor = '#FFFFFF';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.backgroundColor = '#F8FAFC';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Field with show/hide toggle */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label
                htmlFor="login-password"
                style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '18px',
                  color: '#64748B',
                  pointerEvents: 'none',
                }}
              >
                lock
              </span>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  height: '42px',
                  padding: '0 40px 0 38px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#172033',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                  e.target.style.backgroundColor = '#FFFFFF';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E2E8F0';
                  e.target.style.backgroundColor = '#F8FAFC';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '4px',
                accentColor: '#2563EB',
                cursor: 'pointer',
              }}
            />
            <label
              htmlFor="remember-me"
              style={{ fontSize: '13px', color: '#64748B', cursor: 'pointer', userSelect: 'none' }}
            >
              Remember for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              height: '44px',
              backgroundColor: loading ? '#93C5FD' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#2563EB';
            }}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>
                  progress_activity
                </span>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        {/* Development Helper Pill (Clearly labeled DEV-ONLY, unobtrusive) */}
        <div
          style={{
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px dashed #CBD5E1',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#64748B',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Dev Test Credentials
            </span>
            <button
              type="button"
              onClick={() => setShowDevRoles(!showDevRoles)}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563EB',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px',
              }}
            >
              {showDevRoles ? 'Hide ▲' : 'Auto-fill test roles ▼'}
            </button>
          </div>

          {showDevRoles && (
            <div
              style={{
                marginTop: '10px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '6px',
              }}
            >
              {[
                { label: 'Customer', email: 'customer@example.com', role: 'customer' },
                { label: 'Merchant', email: 'owner@example.com', role: 'business_owner' },
                { label: 'Staff', email: 'staff@example.com', role: 'staff' },
                { label: 'Delivery', email: 'delivery@example.com', role: 'delivery_staff' },
                { label: 'Admin', email: 'admin@example.com', role: 'admin' },
              ].map((roleItem) => (
                <button
                  key={roleItem.role}
                  type="button"
                  onClick={() => handleFillDevCredentials(roleItem.email, roleItem.role)}
                  style={{
                    padding: '6px 8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    textAlign: 'center',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    color: '#1E293B',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title={`Fill ${roleItem.email} (${roleItem.role})`}
                >
                  {roleItem.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#64748B',
          }}
        >
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
            Sign Up
          </Link>
        </div>

        <div
          style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid #F1F5F9',
            textAlign: 'center',
            fontSize: '13px',
            color: '#64748B',
          }}
        >
          Are you a business owner?{' '}
          <Link
            to="/business/onboarding"
            style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}
          >
            Create a Store
          </Link>
        </div>
      </div>
    </div>
  );
}
