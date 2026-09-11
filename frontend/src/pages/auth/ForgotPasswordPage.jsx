import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/shared/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172033', letterSpacing: '-0.01em' }}>
          Reset Password
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
          Enter your account email to receive a password reset link
        </p>
      </div>

      {submitted ? (
        <div style={{ padding: '16px', backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '6px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: '#065F46', fontWeight: 600 }}>Reset link dispatched to {email}</p>
          <Link to="/login" style={{ display: 'inline-block', marginTop: '12px', fontSize: '12px', color: '#2563EB' }}>
            ← Return to Sign In
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '6px' }}>
              Account Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. merchant@localcommerce.com"
              style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '13px' }}
            />
          </div>

          <Button type="submit" variant="primary" fullWidth size="lg">
            Send Reset Instructions
          </Button>
        </form>
      )}

      <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
        Remember your password?{' '}
        <Link to="/login" style={{ color: '#2563EB', fontWeight: 600 }}>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
