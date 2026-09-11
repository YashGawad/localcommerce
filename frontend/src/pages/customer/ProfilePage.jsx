import React from 'react';
import Button from '../../components/shared/Button';

export default function ProfilePage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#172033' }}>Account &amp; Saved Addresses</h1>
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '24px' }}>
        <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
          Customer addresses and profile management shell ready. Complete address manager and phone auth will be populated in <strong>Batch 5</strong>.
        </p>
        <Button variant="outline">Edit Addresses</Button>
      </div>
    </div>
  );
}
