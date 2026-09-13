import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminModal from '../../components/admin/AdminModal';

export default function AdminReviewsPage() {
  const { reviews, updateReviewStatus, addModeratorNote } = useAdmin();

  // Filters
  const [selectedTypeTab, setSelectedTypeTab] = useState('ALL'); // 'ALL' | 'product' | 'store'
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [moderatingReview, setModeratingReview] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered dataset
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (selectedTypeTab !== 'ALL' && r.targetType !== selectedTypeTab) {
        return false;
      }
      if (selectedStatusFilter !== 'ALL' && r.status !== selectedStatusFilter) {
        return false;
      }
      return true;
    });
  }, [reviews, selectedTypeTab, selectedStatusFilter]);

  const handleSaveModeration = (newStatus) => {
    if (!moderatingReview) return;
    updateReviewStatus(moderatingReview.id, newStatus);
    if (noteText.trim()) {
      addModeratorNote(moderatingReview.id, noteText.trim());
    }
    showToast(`Review #${moderatingReview.id} status set to ${newStatus}.`);
    setModeratingReview(null);
    setNoteText('');
  };

  const columns = [
    {
      header: 'Review Target',
      key: 'targetName',
      render: (r) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: r.targetType === 'product' ? '#EFF6FF' : '#F5F3FF',
                color: r.targetType === 'product' ? '#1D4ED8' : '#6D28D9',
              }}
            >
              {r.targetType}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
              {r.targetName}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
            Reference: {r.storeReference}
          </div>
        </div>
      ),
    },
    {
      header: 'Author & Rating',
      key: 'rating',
      render: (r) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#172033' }}>
              {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#F59E0B' }}>
              ({r.rating}/5)
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            {r.authorName}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer Feedback',
      key: 'comment',
      render: (r) => (
        <div style={{ maxWidth: '380px' }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#172033' }}>
            "{r.title}"
          </div>
          <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', lineHeight: 1.4 }}>
            {r.comment}
          </div>
          {r.moderatorNote && (
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#B45309', backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>
              Mod Note: {r.moderatorNote}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Date',
      key: 'date',
      render: (r) => (
        <span style={{ fontSize: '11px', color: '#64748B', whiteSpace: 'nowrap' }}>
          {r.date}
        </span>
      ),
    },
    {
      header: 'Moderation Status',
      key: 'status',
      render: (r) => <AdminStatusBadge status={r.status} size="sm" />,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (r) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            type="button"
            onClick={() => {
              setModeratingReview(r);
              setNoteText(r.moderatorNote || '');
            }}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#1E293B',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Moderate
          </button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1E293B',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 999,
          }}
        >
          {toastMessage}
        </div>
      )}

      <AdminPageHeader
        title="Reviews & Trust Moderation"
        subtitle="Platform governance across two distinct feedback channels: Canonical Product Ratings vs Individual Store Merchant Ratings"
        badge={`${reviews.length} Total Reviews`}
        badgeVariant="info"
      />

      {/* Dual Rating Model Explanation Card */}
      <div
        style={{
          padding: '14px 18px',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB', marginTop: '2px' }}>
            inventory_2
          </span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#172033' }}>
              1. Product Ratings (Canonical Catalog)
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
              Associated with <code>global_product</code> identity (e.g. Amul Taaza freshness, taste, packaging). Aggregated across all stores carrying the SKU.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#7C3AED', marginTop: '2px' }}>
            storefront
          </span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#172033' }}>
              2. Store Ratings (Merchant Node)
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
              Associated with <code>store</code> entity (e.g. Shree Kirana speed, rider courtesy, packing care). Determines merchant search ranking.
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
          {[
            { key: 'ALL', label: 'All Reviews' },
            { key: 'product', label: 'Product Reviews' },
            { key: 'store', label: 'Store Reviews' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedTypeTab(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedTypeTab === tab.key ? '#FFFFFF' : 'transparent',
                color: selectedTypeTab === tab.key ? '#172033' : '#64748B',
                boxShadow: selectedTypeTab === tab.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Moderation State:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            style={{
              height: '34px',
              padding: '0 10px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: '12px',
              color: '#172033',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Flagged">Flagged</option>
            <option value="Removed">Removed</option>
          </select>
        </div>
      </div>

      {/* Reviews Table */}
      <AdminTable
        columns={columns}
        data={filteredReviews}
        searchPlaceholder="Search review text, author, target..."
        searchFilter={(r, q) => {
          return (
            r.targetName.toLowerCase().includes(q) ||
            r.authorName.toLowerCase().includes(q) ||
            r.comment.toLowerCase().includes(q) ||
            r.title.toLowerCase().includes(q)
          );
        }}
      />

      {/* Moderation Action Modal */}
      <AdminModal
        isOpen={Boolean(moderatingReview)}
        onClose={() => setModeratingReview(null)}
        title="Review Moderation Decision"
        subtitle={`Review #${moderatingReview?.id} by ${moderatingReview?.authorName}`}
      >
        {moderatingReview && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Target: {moderatingReview.targetName}</div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#172033', marginTop: '2px' }}>
                ⭐ {moderatingReview.rating}/5 — "{moderatingReview.title}"
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>
                {moderatingReview.comment}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Internal Moderator Note
              </label>
              <textarea
                rows={2}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Reason for approval, flagging, or removal..."
                style={{ width: '100%', padding: '8px 10px', fontSize: '12px', borderRadius: '6px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleSaveModeration('Removed')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #FECACA',
                  backgroundColor: '#FEF2F2',
                  color: '#DC2626',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Remove from Platform
              </button>

              <button
                type="button"
                onClick={() => handleSaveModeration('Flagged')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #FDE68A',
                  backgroundColor: '#FFFBEB',
                  color: '#D97706',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Flag for Investigation
              </button>

              <button
                type="button"
                onClick={() => handleSaveModeration('Published')}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Approve & Publish
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
