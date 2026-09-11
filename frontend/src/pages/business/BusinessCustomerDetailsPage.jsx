import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useOperations } from '../../context/OperationsContext';

export default function BusinessCustomerDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentStore } = useCatalog();
  const { storeCustomers, storeOrders, addCustomerNote, addCustomerTag } = useOperations();

  // Find target customer
  const customer = useMemo(() => {
    return storeCustomers.find((c) => c.id === id);
  }, [storeCustomers, id]);

  // Orders placed by this customer AT THIS STORE
  const customerOrders = useMemo(() => {
    return storeOrders.filter(
      (o) =>
        o.customer?.id === id ||
        o.customer?.phone === customer?.phone ||
        o.customer?.name === customer?.name
    );
  }, [storeOrders, id, customer]);

  // Notes & Tags State
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  if (!customer) {
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          padding: '48px 24px',
          textAlign: 'center',
          maxWidth: '540px',
          margin: '40px auto',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0F172A', margin: '0 0 8px 0' }}>
          Customer Not Found
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 20px 0' }}>
          Customer record &quot;{id}&quot; does not have purchase history at {currentStore.name}.
        </p>
        <Link
          to="/business/customers"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 16px',
            backgroundColor: '#172554',
            color: '#FFFFFF',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          Back to Customers
        </Link>
      </div>
    );
  }

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addCustomerNote(customer.id, newNote.trim());
    setNewNote('');
    showToast('Internal store note added');
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    addCustomerTag(customer.id, newTag.trim());
    setNewTag('');
    showToast('Customer tag updated');
  };

  // Metrics
  const totalSpend = customerOrders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrdersCount = customerOrders.length;
  const aov = totalOrdersCount > 0 ? Math.round(totalSpend / totalOrdersCount) : 0;
  const completedOrders = customerOrders.filter(
    (o) => o.status === 'DELIVERED' || o.status === 'PICKED_UP'
  ).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: '#0F172A',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Top Breadcrumbs & Store Data Notice */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <Link
          to="/business/customers"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#64748B',
            textDecoration: 'none',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Customer Directory
        </Link>

        {/* Store Data Boundary Badge */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            backgroundColor: '#F1F5F9',
            border: '1px solid #CBD5E1',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#334155',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {currentStore.name} · Store Data Boundary
        </span>
      </div>

      {/* Customer Header Profile Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          padding: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#172554',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '700',
            }}
          >
            {customer.avatar || 'CU'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
                {customer.name}
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: customer.customerType === 'VIP' ? '#FEF3C7' : '#EFF6FF',
                  color: customer.customerType === 'VIP' ? '#B45309' : '#1D4ED8',
                }}
              >
                {customer.customerType || 'Regular'}
              </span>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginTop: '6px', fontSize: '13px', color: '#64748B' }}>
              <span>Phone: <strong style={{ color: '#0F172A' }}>{customer.phone}</strong></span>
              <span>·</span>
              <span>Email: <strong style={{ color: '#0F172A' }}>{customer.email}</strong></span>
              <span>·</span>
              <span>Primary: {customer.address || 'Koramangala, Bangalore'}</span>
            </div>
          </div>
        </div>

        {/* Quick Contact Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href={`tel:${customer.phone}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#0F172A',
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call Customer
          </a>

          <button
            onClick={() => showToast(`Opened messaging for ${customer.name}`)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#172554',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            Send Notification
          </button>
        </div>
      </div>

      {/* 4 Relationship Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Store Lifetime Spend
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#10B981', fontVariantNumeric: 'tabular-nums' }}>
            ₹{totalSpend.toLocaleString('en-IN')}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Orders at this Store
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
            {totalOrdersCount}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Average Order Value (AOV)
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#1D4ED8', fontVariantNumeric: 'tabular-nums' }}>
            ₹{aov.toLocaleString('en-IN')}
          </div>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Completed Orders
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#047857', fontVariantNumeric: 'tabular-nums' }}>
            {completedOrders} <span style={{ fontSize: '14px', fontWeight: '500', color: '#64748B' }}>/ {totalOrdersCount}</span>
          </div>
        </div>
      </div>

      {/* 2-Column Main Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 340px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Main: Order History Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Order History at {currentStore.name} ({customerOrders.length})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              Sorted newest first
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Order Number</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Placed At</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Fulfillment</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Items Summary</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Total Amount</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {customerOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
                      No orders found at {currentStore.name} for this customer.
                    </td>
                  </tr>
                ) : (
                  customerOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/business/orders/${order.id}`)}
                      style={{ borderBottom: '1px solid #F1F5F9', cursor: 'pointer' }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB' }}>
                          {order.orderNumber}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569' }}>
                        {order.placedAt}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#334155' }}>
                        {order.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup'}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569', maxWidth: '200px' }}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {order.items?.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '700', color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                        ₹{order.total}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            backgroundColor:
                              order.status === 'DELIVERED' || order.status === 'PICKED_UP'
                                ? '#DCFCE7'
                                : order.status === 'CANCELLED'
                                ? '#FEE2E2'
                                : '#EFF6FF',
                            color:
                              order.status === 'DELIVERED' || order.status === 'PICKED_UP'
                                ? '#166534'
                                : order.status === 'CANCELLED'
                                ? '#DC2626'
                                : '#1E40AF',
                          }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/business/orders/${order.id}`);
                          }}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: '#172554',
                            cursor: 'pointer',
                          }}
                        >
                          Details →
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Private Notes & Customer Tags */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Customer Tags */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0' }}>
              Customer Tags
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              {customer.tags && customer.tags.length > 0 ? (
                customer.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: '#F1F5F9',
                      color: '#334155',
                      border: '1px solid #E2E8F0',
                      fontWeight: '500',
                    }}
                  >
                    #{tag}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>No tags assigned</span>
              )}
            </div>

            <form onSubmit={handleAddTag} style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Add tag (e.g. VIP)..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid #CBD5E1',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#172554',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Add
              </button>
            </form>
          </div>

          {/* Private Merchant Notes */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
            }}
          >
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 12px 0' }}>
              Store Staff Notes
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', maxHeight: '240px', overflowY: 'auto' }}>
              {customer.notes && customer.notes.length > 0 ? (
                customer.notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                    }}
                  >
                    <div style={{ fontSize: '12px', color: '#0F172A', lineHeight: '1.4' }}>
                      {note.text}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                      {note.author} · {note.date}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>
                  No internal notes recorded yet for this customer.
                </div>
              )}
            </div>

            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea
                placeholder="Add private note (e.g. prefers morning delivery)..."
                rows={2}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  fontSize: '12px',
                  borderRadius: '4px',
                  border: '1px solid #CBD5E1',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                style={{
                  alignSelf: 'flex-end',
                  padding: '6px 14px',
                  backgroundColor: '#172554',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Save Note
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
