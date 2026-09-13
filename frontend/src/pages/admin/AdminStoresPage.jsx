import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminModal from '../../components/admin/AdminModal';

export default function AdminStoresPage() {
  const { stores, updateStoreStatus, toggleStoreVerification } = useAdmin();

  // Filter States
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStoreAction, setSelectedStoreAction] = useState(null);
  const [actionType, setActionType] = useState(null); // 'suspend' | 'activate' | 'verify'

  // Filter categories
  const categories = useMemo(() => {
    const set = new Set(stores.map((s) => s.category));
    return Array.from(set);
  }, [stores]);

  // Tab counts
  const counts = useMemo(() => {
    return {
      ALL: stores.length,
      Active: stores.filter((s) => s.status === 'Active').length,
      Suspended: stores.filter((s) => s.status === 'Suspended').length,
      Inactive: stores.filter((s) => s.status === 'Inactive').length,
    };
  }, [stores]);

  // Filtered store records
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (selectedStatusTab !== 'ALL' && store.status !== selectedStatusTab) {
        return false;
      }
      if (selectedCategory !== 'ALL' && store.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [stores, selectedStatusTab, selectedCategory]);

  const handleConfirmAction = () => {
    if (!selectedStoreAction || !actionType) return;
    if (actionType === 'suspend') {
      updateStoreStatus(selectedStoreAction.id, 'Suspended');
    } else if (actionType === 'activate') {
      updateStoreStatus(selectedStoreAction.id, 'Active');
    } else if (actionType === 'verify') {
      toggleStoreVerification(selectedStoreAction.id);
    }
    setSelectedStoreAction(null);
    setActionType(null);
  };

  const columns = [
    {
      header: 'Store Entity',
      key: 'name',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={s.image}
            alt={s.name}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '6px',
              objectFit: 'cover',
              border: '1px solid #E2E8F0',
            }}
          />
          <div>
            <Link
              to={`/admin/stores/${s.id}`}
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#172033',
                textDecoration: 'none',
              }}
            >
              {s.name}
            </Link>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              /{s.slug} • {s.category}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Owner & Contact',
      key: 'ownerName',
      render: (s) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#172033' }}>
            {s.ownerName}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            {s.phone}
          </div>
        </div>
      ),
    },
    {
      header: 'Location & Area',
      key: 'location',
      render: (s) => (
        <div>
          <div style={{ fontSize: '12px', color: '#172033' }}>
            {s.location}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            PIN: {s.pinCode || '560034'}
          </div>
        </div>
      ),
    },
    {
      header: 'Rating & Orders',
      key: 'rating',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#172033' }}>
            ⭐ {s.rating}
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            ({s.reviewCount} reviews)
          </span>
        </div>
      ),
    },
    {
      header: 'Platform Status',
      key: 'status',
      render: (s) => <AdminStatusBadge status={s.status} size="sm" />,
    },
    {
      header: 'Verification',
      key: 'verified',
      render: (s) => (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: s.verified ? '#EFF6FF' : '#FFFBEB',
            color: s.verified ? '#1D4ED8' : '#B45309',
            border: `1px solid ${s.verified ? '#BFDBFE' : '#FDE68A'}`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
            {s.verified ? 'verified' : 'pending'}
          </span>
          {s.verified ? 'Verified Merchant' : 'KYC Pending'}
        </span>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (s) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <Link
            to={`/admin/stores/${s.id}`}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '11px',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            Details
          </Link>

          {s.status === 'Active' ? (
            <button
              type="button"
              onClick={() => {
                setSelectedStoreAction(s);
                setActionType('suspend');
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Suspend
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setSelectedStoreAction(s);
                setActionType('activate');
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #BBF7D0',
                backgroundColor: '#F0FDF4',
                color: '#16A34A',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AdminPageHeader
        title="Store Governance & Directory"
        subtitle="Manage verified merchant nodes, operational authorization, and local service zones"
        badge={`${stores.length} Registered Merchants`}
        badgeVariant="info"
        actions={
          <button
            type="button"
            onClick={() => alert('Exporting platform store registry to CSV...')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#1E293B',
              cursor: 'pointer',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              download
            </span>
            Export CSV
          </button>
        }
      />

      {/* Segmented Status Tabs & Category Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
          {['ALL', 'Active', 'Suspended', 'Inactive'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedStatusTab(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedStatusTab === tab ? '#FFFFFF' : 'transparent',
                color: selectedStatusTab === tab ? '#172033' : '#64748B',
                boxShadow: selectedStatusTab === tab ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {tab === 'ALL' ? 'All Stores' : tab} ({counts[tab] || 0})
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
            <option value="ALL">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Admin Table */}
      <AdminTable
        columns={columns}
        data={filteredStores}
        searchPlaceholder="Search store name, owner, area, PIN..."
        searchFilter={(store, query) => {
          return (
            store.name.toLowerCase().includes(query) ||
            store.ownerName.toLowerCase().includes(query) ||
            store.location.toLowerCase().includes(query) ||
            (store.pinCode && store.pinCode.includes(query))
          );
        }}
      />

      {/* Action Confirmation Modal */}
      <AdminModal
        isOpen={Boolean(selectedStoreAction)}
        onClose={() => setSelectedStoreAction(null)}
        title={
          actionType === 'suspend'
            ? `Suspend ${selectedStoreAction?.name}?`
            : (actionType === 'activate' ? `Reactivate ${selectedStoreAction?.name}?` : 'Toggle Verification')
        }
        subtitle="Platform Operational Action"
        footer={
          <>
            <button
              type="button"
              onClick={() => setSelectedStoreAction(null)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmAction}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: actionType === 'suspend' ? '#EF4444' : '#2563EB',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {actionType === 'suspend' ? 'Confirm Suspension' : 'Confirm Action'}
            </button>
          </>
        }
      >
        <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
          {actionType === 'suspend' ? (
            <>
              Suspending <strong>{selectedStoreAction?.name}</strong> will delist all products from the customer storefront and prevent new incoming orders. Existing fulfilled and in-transit orders will remain accessible.
            </>
          ) : (
            <>
              Reactivating <strong>{selectedStoreAction?.name}</strong> will restore its listings to neighborhood customer discovery and allow incoming order placement.
            </>
          )}
        </p>
      </AdminModal>
    </div>
  );
}
