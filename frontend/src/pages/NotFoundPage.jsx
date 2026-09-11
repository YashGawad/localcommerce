import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/shared/Button';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '48px', fontWeight: 800, color: '#172554', lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#172033', marginTop: '12px' }}>Page Not Found</h1>
      <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px', maxWidth: '380px' }}>
        The page or resource you are looking for does not exist or has been moved.
      </p>
      <div style={{ marginTop: '20px' }}>
        <Link to="/">
          <Button variant="primary">Return to Marketplace Home</Button>
        </Link>
      </div>
    </div>
  );
}
