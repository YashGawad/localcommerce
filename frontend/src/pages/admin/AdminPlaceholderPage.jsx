import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

export default function AdminPlaceholderPage() {
  const { section, id } = useParams();

  const formatTitle = (text) => {
    if (!text) return 'Admin Console';
    return text
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#172033' }}>
            {formatTitle(section)} {id && <span style={{ color: '#64748B' }}>#{id}</span>}
          </h1>
          <Badge variant="info" size="sm">Admin Section</Badge>
        </div>
        <Link to="/admin">
          <Button variant="outline" size="sm" icon="dashboard">Admin Home</Button>
        </Link>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '32px' }}>
        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6 }}>
          Batch 1 Route Shell verified for <code>/admin/{section}{id ? `/${id}` : ''}</code>. Full data tables and moderation workflows will be implemented in subsequent admin batches.
        </p>
      </div>
    </div>
  );
}
