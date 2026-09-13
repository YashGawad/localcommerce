import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useOperations } from '../../context/OperationsContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminModal from '../../components/admin/AdminModal';

export default function AdminOrdersPage() {
  const { stores } = useAdmin();
  const { ordersMap } = useOperations();

  // Filters
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [selectedStoreFilter, setSelectedStoreFilter] = useState('ALL');
  const [selectedFulfillment, setSelectedFulfillment] = useState('ALL');
  const [inspectOrder, setInspectOrder] = useState(null);

  // Aggregate all orders across all stores from OperationsContext
  const allOrders = useMemo(() => {
    return Object.values(ordersMap || {})
      .flat()
      .sort((a, b) => (b.id > a.id ? 1 : -1));
  }, [ordersMap]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: allOrders.length,
      IN_FLIGHT: allOrders.filter(
        (o) =>
          o.status !== 'DELIVERED' &&
          o.status !== 'PICKED_UP' &&
          o.status !== 'CANCELLED'
      ).length,
      COMPLETED: allOrders.filter(
        (o) => o.status === 'DELIVERED' || o.status === 'PICKED_UP'
      ).length,
      CANCELLED: allOrders.filter((o) => o.status === 'CANCELLED').length,
    };
  }, [allOrders]);

  // Filtered dataset
  const filteredOrders = useMemo(() => {
    return allOrders.filter((order) => {
      // Status tab
      if (selectedStatusTab === 'IN_FLIGHT') {
        if (
          order.status === 'DELIVERED' ||
          order.status === 'PICKED_UP' ||
          order.status === 'CANCELLED'
        ) {
          return false;
        }
      } else if (selectedStatusTab === 'COMPLETED') {
        if (order.status !== 'DELIVERED' && order.status !== 'PICKED_UP') {
          return false;
        }
      } else if (selectedStatusTab === 'CANCELLED') {
        if (order.status !== 'CANCELLED') return false;
      }

      // Store filter
      if (selectedStoreFilter !== 'ALL' && order.storeId !== selectedStoreFilter) {
        return false;
      }

      // Fulfillment filter
      if (selectedFulfillment !== 'ALL' && order.fulfillmentType !== selectedFulfillment) {
        return false;
      }

      return true;
    });
  }, [allOrders, selectedStatusTab, selectedStoreFilter, selectedFulfillment]);

  const columns = [
    {
      header: 'Order Reference',
      key: 'id',
      render: (o) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
            {o.id || o.orderNumber}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            {o.placedAt || o.date || 'Today'}
          </div>
        </div>
      ),
    },
    {
      header: 'Store Merchant',
      key: 'storeName',
      render: (o) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#172033' }}>
            {o.storeName}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            ID: {o.storeId}
          </div>
        </div>
      ),
    },
    {
      header: 'Customer',
      key: 'customer',
      render: (o) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#172033' }}>
            {o.customer?.name || 'Customer'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            {o.customer?.phone || '+91 98201 44829'}
          </div>
        </div>
      ),
    },
    {
      header: 'Fulfillment Mode',
      key: 'fulfillmentType',
      render: (o) => (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'capitalize',
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: o.fulfillmentType === 'delivery' ? '#EFF6FF' : '#F5F3FF',
            color: o.fulfillmentType === 'delivery' ? '#1D4ED8' : '#6D28D9',
          }}
        >
          {o.fulfillmentType}
        </span>
      ),
    },
    {
      header: 'Amount & Payment',
      key: 'total',
      render: (o) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
            ₹{o.total}
          </div>
          <div style={{ fontSize: '10px', color: '#10B981', fontWeight: 600 }}>
            {o.paymentStatus || 'PAID'} • {o.paymentMethod || 'UPI'}
          </div>
        </div>
      ),
    },
    {
      header: 'Platform Status',
      key: 'status',
      render: (o) => <AdminStatusBadge status={o.status} size="sm" />,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (o) => (
        <button
          type="button"
          onClick={() => setInspectOrder(o)}
          style={{
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid #CBD5E1',
            backgroundColor: '#FFFFFF',
            color: '#2563EB',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Inspect Order
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <AdminPageHeader
        title="Cross-Store Order Monitor"
        subtitle="Platform-wide order registry aggregated across all merchant nodes via OperationsContext"
        badge={`${allOrders.length} Total Orders Recorded`}
        badgeVariant="info"
      />

      {/* Segmented Status Tabs & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
          {[
            { key: 'ALL', label: 'All Orders' },
            { key: 'IN_FLIGHT', label: 'In-Flight' },
            { key: 'COMPLETED', label: 'Completed' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedStatusTab(tab.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedStatusTab === tab.key ? '#FFFFFF' : 'transparent',
                color: selectedStatusTab === tab.key ? '#172033' : '#64748B',
                boxShadow: selectedStatusTab === tab.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              {tab.label} ({tabCounts[tab.key] || 0})
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Store:</span>
            <select
              value={selectedStoreFilter}
              onChange={(e) => setSelectedStoreFilter(e.target.value)}
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
              <option value="ALL">All Stores</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Mode:</span>
            <select
              value={selectedFulfillment}
              onChange={(e) => setSelectedFulfillment(e.target.value)}
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
              <option value="ALL">Delivery & Pickup</option>
              <option value="delivery">Store Delivery</option>
              <option value="pickup">Customer Pickup</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <AdminTable
        columns={columns}
        data={filteredOrders}
        searchPlaceholder="Search order ID, store, customer..."
        searchFilter={(o, q) => {
          return (
            o.id?.toLowerCase().includes(q) ||
            o.storeName?.toLowerCase().includes(q) ||
            o.customer?.name?.toLowerCase().includes(q) ||
            o.customer?.phone?.includes(q)
          );
        }}
      />

      {/* Order Details Inspection Modal */}
      <AdminModal
        isOpen={Boolean(inspectOrder)}
        onClose={() => setInspectOrder(null)}
        title={`Order Details: ${inspectOrder?.id || inspectOrder?.orderNumber}`}
        subtitle={`Dispatched by ${inspectOrder?.storeName}`}
        maxWidth="640px"
        footer={
          <button
            type="button"
            onClick={() => setInspectOrder(null)}
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
            Close
          </button>
        }
      >
        {inspectOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
            {/* Status & General Info Strip */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Current Status</span>
                <div style={{ marginTop: '2px' }}>
                  <AdminStatusBadge status={inspectOrder.status} size="md" />
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Order Total</span>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#172033' }}>
                  ₹{inspectOrder.total}
                </span>
              </div>
            </div>

            {/* Customer & Address */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Customer Details
                </div>
                <div style={{ fontWeight: 700, color: '#172033', marginTop: '4px' }}>
                  {inspectOrder.customer?.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  {inspectOrder.customer?.phone}
                </div>
                {inspectOrder.customer?.email && (
                  <div style={{ fontSize: '12px', color: '#64748B' }}>
                    {inspectOrder.customer?.email}
                  </div>
                )}
              </div>

              <div style={{ padding: '12px', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                  Fulfillment & Destination
                </div>
                <div style={{ fontWeight: 700, color: '#172033', marginTop: '4px', textTransform: 'capitalize' }}>
                  {inspectOrder.fulfillmentType} ({inspectOrder.fulfillmentLabel || 'Standard'})
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                  {inspectOrder.deliveryAddress?.addressLine || inspectOrder.customer?.address || 'Pickup at store counter'}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#172033', marginBottom: '8px' }}>
                Order Items ({inspectOrder.items?.length || 0})
              </div>
              <div style={{ border: '1px solid #E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
                {(inspectOrder.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 14px',
                      borderBottom: idx < inspectOrder.items.length - 1 ? '1px solid #F1F5F9' : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, color: '#172033' }}>
                        {item.title || item.name}
                      </span>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        Qty: {item.quantity} × ₹{item.price} {item.unit && `(${item.unit})`}
                      </div>
                    </div>
                    <span style={{ fontWeight: 700, color: '#172033' }}>
                      ₹{(item.quantity || 1) * (item.price || 0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Rider info if assigned */}
            {inspectOrder.deliveryPartner && (
              <div style={{ padding: '12px', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '6px', fontSize: '12px', color: '#166534' }}>
                <strong>Assigned Delivery Partner:</strong> {inspectOrder.deliveryPartner.name} ({inspectOrder.deliveryPartner.phone}) • Vehicle: {inspectOrder.deliveryPartner.vehicle || 'Standard Run'}
              </div>
            )}
          </div>
        )}
      </AdminModal>
    </div>
  );
}
