import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

export default function BusinessPlaceholderPage() {
  const { section, id } = useParams();

  const formatTitle = (text) => {
    if (!text) return 'Business Workspace';
    return text
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#172554' }}>
              {formatTitle(section)} {id && <span style={{ color: '#64748B' }}>#{id}</span>}
            </h1>
            <Badge variant="neutral" size="sm">Workspace Shell</Badge>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Store operations module for Sharma Supermarket
          </p>
        </div>

        <Link to="/business">
          <Button variant="outline" size="sm" icon="dashboard">Back to Dashboard</Button>
        </Link>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '32px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#172033', marginBottom: '8px' }}>
          Batch 1 Route Shell Verified: <code>/business/{section}{id ? `/${id}` : ''}</code>
        </h3>
        <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, maxWidth: '640px' }}>
          This section is registered in the routing table and accessible via the top hamburger navigation drawer.
          Detailed interactive data tables, filters, and forms will be implemented in subsequent Batches (Batches 8–11).
        </p>
      </div>
    </div>
  );
}
