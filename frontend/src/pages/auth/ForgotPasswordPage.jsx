import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/shared/Logo';

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(45);

  const { resetPassword, loading } = useAuth();
  const canResend = countdown === 0;

  useEffect(() => {
    let timer;
    if (isSuccess && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSuccess, countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!identifier.trim() || identifier.trim().length < 4) {
      setErrorMessage('Please enter a valid account email or phone number.');
      return;
    }

    await resetPassword(identifier);
    setIsSuccess(true);
    setCountdown(45);
  };

  const handleResend = async () => {
    if (!canResend || loading) return;
    await resetPassword(identifier);
    setCountdown(45);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Top Security Status Bar */}
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
              backgroundColor: '#2563EB',
              display: 'inline-block',
            }}
          />
          <span>Access Recovery Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748B' }}>
            verified_user
          </span>
          <span>Encrypted Session</span>
        </div>
      </div>

      {/* Main Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          padding: '32px 28px',
        }}
      >
        {/* Header */}
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
            Reset your password
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Enter your email or phone number and we&apos;ll help you reset your password.
          </p>
        </div>

        {/* Inline Success Panel (Stitch Specification) */}
        {isSuccess ? (
          <div
            style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '10px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                  mark_email_read
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#14532D', margin: 0 }}>
                    Check your inbox or SMS
                  </h2>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#DCFCE7',
                      color: '#15803D',
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}
                  >
                    Dispatched
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#166534', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                  We have dispatched recovery instructions to <strong>{identifier}</strong> if an active account exists.
                </p>
              </div>
            </div>

            <div
              style={{
                borderTop: '1px solid #DCFCE7',
                paddingTop: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                fontSize: '12px',
              }}
            >
              <span style={{ color: '#64748B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#2563EB' }}>
                  schedule
                </span>
                Expires in 15 minutes
              </span>

              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  style={{
                    border: 'none',
                    background: 'none',
                    color: '#2563EB',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Resend instructions
                </button>
              ) : (
                <span style={{ color: '#94A3B8' }}>
                  Didn&apos;t receive it? Resend in {countdown}s
                </span>
              )}
            </div>

            <Link
              to="/login"
              style={{
                marginTop: '6px',
                height: '40px',
                backgroundColor: '#172554',
                color: '#FFFFFF',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_back
              </span>
              <span>Back to Sign In</span>
            </Link>
          </div>
        ) : (
          /* Form State */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  color: '#991B1B',
                  fontSize: '13px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#DC2626' }}>
                  error
                </span>
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label htmlFor="recovery-identifier" style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                  Email or Phone Number
                </label>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Registered Contact</span>
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
                  id="recovery-identifier"
                  type="text"
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
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Privacy notice banner from Stitch */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '17px', color: '#2563EB', marginTop: '1px' }}>
                shield
              </span>
              <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.4 }}>
                For privacy and account security, we never disclose publicly whether an email or phone number is registered.
              </p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                height: '44px',
                backgroundColor: loading ? '#93C5FD' : '#172554',
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
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>
                    progress_activity
                  </span>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Sign In Link */}
        <div
          style={{
            marginTop: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
          }}
        >
          <Link
            to="/login"
            style={{
              fontSize: '13px',
              color: '#2563EB',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              arrow_back
            </span>
            <span>Back to Sign In</span>
          </Link>
          <div style={{ fontSize: '12px', color: '#64748B' }}>
            Need merchant assistance?{' '}
            <span style={{ color: '#172033', textDecoration: 'underline', cursor: 'pointer' }}>Contact Support</span>
          </div>
        </div>
      </div>
    </div>
  );
}
