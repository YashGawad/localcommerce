import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { useOperations } from '../../context/OperationsContext';
import { STORE_LISTINGS, GLOBAL_PRODUCTS } from '../../data/products';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminModal from '../../components/admin/AdminModal';

export default function AdminStoreDetailsPage() {
  const { id } = useParams();
  const { stores, updateStoreStatus, toggleStoreVerification, updateStorePlatformNotes } = useAdmin();
  const { ordersMap } = useOperations();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'listings' | 'orders' | 'compliance'
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [platformNotesInput, setPlatformNotesInput] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const showToast = (msg) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Find store
  const store = useMemo(() => {
    return stores.find((s) => s.id === id) || stores[0];
  }, [stores, id]);

  // Store's specific orders
  const storeOrders = useMemo(() => {
    return ordersMap[store.id] || [];
  }, [ordersMap, store.id]);

  // Store's specific product listings
  const storeListings = useMemo(() => {
    const raw = STORE_LISTINGS[store.id] || [];
    return raw.map((item) => {
      const globalMeta = GLOBAL_PRODUCTS.find((g) => g.id === item.productId);
      return {
        ...item,
        globalMeta,
      };
    });
  }, [store.id]);

  // Total GMV for this store
  const storeGmv = useMemo(() => {
    return storeOrders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [storeOrders]);

  const handleSaveNotes = () => {
    updateStorePlatformNotes(store.id, platformNotesInput);
    setIsEditingNotes(false);
    showToast('Platform audit notes updated successfully');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast */}
      {feedbackToast && (
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
          {feedbackToast}
        </div>
      )}

      {/* Header with Navigation Breadcrumb */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '8px' }}>
          <Link to="/admin/stores" style={{ color: '#2563EB', textDecoration: 'none' }}>
            Stores
          </Link>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span>{store.name}</span>
        </div>

        <AdminPageHeader
          title={store.name}
          subtitle={`Merchant ID: ${store.id} • Registered Node in ${store.location}`}
          badge={store.status}
          badgeVariant={store.status === 'Active' ? 'success' : 'warning'}
          actions={
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  toggleStoreVerification(store.id);
                  showToast(`Verification status toggled for ${store.name}`);
                }}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#1E293B',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: store.verified ? '#10B981' : '#F59E0B' }}>
                  {store.verified ? 'verified' : 'pending'}
                </span>
                {store.verified ? 'Verified Merchant' : 'Verify Merchant'}
              </button>

              {store.status === 'Active' ? (
                <button
                  type="button"
                  onClick={() => setShowSuspendModal(true)}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#DC2626',
                    cursor: 'pointer',
                  }}
                >
                  Suspend Store
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    updateStoreStatus(store.id, 'Active');
                    showToast(`${store.name} activated on platform.`);
                  }}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#F0FDF4',
                    border: '1px solid #BBF7D0',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#16A34A',
                    cursor: 'pointer',
                  }}
                >
                  Reactivate Store
                </button>
              )}
            </div>
          }
        />
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', gap: '20px' }}>
        {[
          { key: 'overview', label: 'Store Overview' },
          { key: 'listings', label: `Catalog Listings (${storeListings.length})` },
          { key: 'orders', label: `Store Orders (${storeOrders.length})` },
          { key: 'compliance', label: 'Platform Audit & Notes' },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 4px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === tab.key ? '#2563EB' : '#64748B',
              borderBottom: activeTab === tab.key ? '2px solid #2563EB' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Top Quick Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                Lifetime Orders
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#172033', marginTop: '6px' }}>
                {storeOrders.length + 124}
              </div>
              <div style={{ fontSize: '11px', color: '#10B981', marginTop: '4px' }}>
                98.8% Fulfillment Rate
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                Store GMV
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#172033', marginTop: '6px' }}>
                ₹{(storeGmv + 384000).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Platform Take Rate: {store.commissionRate}%
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                Average Rating
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#172033', marginTop: '6px' }}>
                ⭐ {store.rating}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Based on {store.reviewCount} customer reviews
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                Delivery SLA
              </div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#172033', marginTop: '6px' }}>
                {store.deliveryTime || '25–35 mins'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                Pickup: {store.pickupTime || '15 mins'}
              </div>
            </div>
          </div>

          {/* Detailed Store Info Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
            }}
          >
            <div>
              <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#172033' }}>
                Merchant Identity & Contact
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Legal Owner</span>
                  <strong style={{ color: '#172033' }}>{store.ownerName}</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Direct Phone</span>
                  <span style={{ color: '#172033' }}>{store.phone}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Category & Department</span>
                  <span style={{ color: '#172033' }}>{store.category}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Customer Slug URL</span>
                  <code style={{ color: '#2563EB', backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                    /store/{store.slug}
                  </code>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#172033' }}>
                Physical Location & Operations
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Full Physical Address</span>
                  <span style={{ color: '#172033' }}>{store.address}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Operational Area / Pin</span>
                  <span style={{ color: '#172033' }}>{store.location} — {store.pinCode || '560034'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Store Operating Hours</span>
                  <span style={{ color: '#172033' }}>{store.hours || '8:00 AM – 10:30 PM'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Fulfillment Modes Enabled</span>
                  <span style={{ color: '#172033', textTransform: 'capitalize' }}>
                    {(store.fulfillmentTypes || ['delivery', 'pickup']).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#172033' }}>
                Platform Governance & KYC
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>KYC Documentation Status</span>
                  <AdminStatusBadge status={store.kycStatus || 'Verified'} size="sm" />
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Commission Contract Rate</span>
                  <strong style={{ color: '#172033' }}>{store.commissionRate}% per settled order</strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Registered Since</span>
                  <span style={{ color: '#172033' }}>{store.joinedDate || 'January 2024'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block', fontSize: '11px' }}>Platform Actions</span>
                  <button
                    type="button"
                    onClick={() => showToast('Merchant API integration key reset (mock)')}
                    style={{
                      marginTop: '4px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      backgroundColor: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    Regenerate POS Sync Secret
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STORE LISTINGS */}
      {activeTab === 'listings' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#172033' }}>
              Products Listed by {store.name}
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
              Store-specific inventory and price points mapped from canonical Global Products
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>
                  Canonical Product
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>
                  Store Price vs MRP
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>
                  Availability Status
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>
                  Est. Delivery Time
                </th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>
                  Global ID
                </th>
              </tr>
            </thead>
            <tbody>
              {storeListings.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                    No products currently listed for this store.
                  </td>
                </tr>
              ) : (
                storeListings.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {item.globalMeta?.image && (
                          <img
                            src={item.globalMeta.image}
                            alt=""
                            style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'contain' }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#172033' }}>
                            {item.globalMeta?.title || item.productId}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>
                            {item.globalMeta?.brand} • {item.globalMeta?.unit}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontWeight: 700, color: '#172033' }}>₹{item.storePrice}</span>
                      {item.mrp && (
                        <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through', marginLeft: '6px' }}>
                          ₹{item.mrp}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <AdminStatusBadge status={item.availability || (item.inStock ? 'In Stock' : 'Out of Stock')} size="sm" />
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748B' }}>
                      {item.deliveryTime || '25–35 mins'}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <code style={{ fontSize: '11px', color: '#64748B' }}>{item.productId}</code>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: STORE ORDERS */}
      {activeTab === 'orders' && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#172033' }}>
              Orders Dispatched by {store.name}
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
              Platform order history isolated to this store tenant
            </p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Order ID</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Customer</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Total</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Mode</th>
                <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#475569' }}>Status</th>
                <th style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {storeOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748B' }}>
                    No recorded orders for this store yet.
                  </td>
                </tr>
              ) : (
                storeOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#172033' }}>
                      {order.id}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#172033' }}>{order.customer?.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>{order.customer?.phone}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#172033' }}>
                      ₹{order.total}
                    </td>
                    <td style={{ padding: '12px 16px', textTransform: 'capitalize', color: '#64748B' }}>
                      {order.fulfillmentType}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <AdminStatusBadge status={order.status} size="sm" />
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Link
                        to="/admin/orders"
                        style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600 }}
                      >
                        Inspect →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: COMPLIANCE & NOTES */}
      {activeTab === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                  Platform Operations Audit Log & Notes
                </h4>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Internal notes recorded by platform moderators and administrators
                </p>
              </div>

              {!isEditingNotes && (
                <button
                  type="button"
                  onClick={() => {
                    setPlatformNotesInput(store.platformNotes || '');
                    setIsEditingNotes(true);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Edit Audit Notes
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <textarea
                  value={platformNotesInput}
                  onChange={(e) => setPlatformNotesInput(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                  }}
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(false)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '6px',
                  border: '1px solid #E2E8F0',
                  fontSize: '13px',
                  color: '#334155',
                  lineHeight: 1.6,
                }}
              >
                {store.platformNotes || 'No special platform notes filed for this merchant node.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suspend Confirmation Modal */}
      <AdminModal
        isOpen={showSuspendModal}
        onClose={() => setShowSuspendModal(false)}
        title={`Suspend ${store.name}?`}
        subtitle="Platform Governance Action"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowSuspendModal(false)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                updateStoreStatus(store.id, 'Suspended');
                setShowSuspendModal(false);
                showToast(`${store.name} has been suspended.`);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#EF4444',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Confirm Store Suspension
            </button>
          </>
        }
      >
        <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
          This will temporarily pause merchant operations for <strong>{store.name}</strong>. Its catalog will be hidden from customer storefront discovery until reactivated by an admin.
        </p>
      </AdminModal>
    </div>
  );
}
