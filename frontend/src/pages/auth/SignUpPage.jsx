import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/shared/Button';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/business');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#172033', letterSpacing: '-0.01em' }}>
          Create an Account
        </h1>
        <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
          Join LocalCommerce as a customer, merchant, or partner
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '6px' }}>
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Suresh Sharma"
            style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '6px' }}>
            Email or Phone
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '13px' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '6px' }}>
            Create Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            style={{ width: '100%', height: '38px', padding: '0 12px', fontSize: '13px' }}
          />
        </div>

        <Button type="submit" variant="primary" fullWidth size="lg">
          Create Account
        </Button>
      </form>

      <div style={{ textAlign: 'center', fontSize: '13px', color: '#64748B', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#2563EB', fontWeight: 600 }}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
