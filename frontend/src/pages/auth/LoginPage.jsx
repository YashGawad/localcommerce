import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/shared/Button';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Batch 1 interaction: simple navigation based on entered credentials or defaults to home
    navigate('/business');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172033', letterSpacing: '-0.01em' }}>
          Welcome back
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
          Sign in to manage your store, track orders, or access your account
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '6px' }}>
            Email or Mobile Number
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. merchant@localcommerce.com"
            style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '13px' }}
          />
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#172033' }}>
              Password
            </label>
            <Link to="/forgot-password" style={{ fontSize: '12px', color: '#2563EB', fontWeight: 500 }}>
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '13px' }}
          />
        </div>

        <Button type="submit" variant="primary" fullWidth size="lg">
          Sign In
        </Button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: '#2563EB', fontWeight: 600 }}>
          Create account
        </Link>
      </div>
    </div>
  );
}
