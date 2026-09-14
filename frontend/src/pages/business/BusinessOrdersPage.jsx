import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useOperations } from '../../context/OperationsContext';

export default function BusinessOrdersPage() {
  const navigate = useNavigate();
  const { currentStore } = useCatalog();
  const { storeOrders, updateOrderStatus, cancelOrder } = useOperations();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  // Cancel Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Out of stock');
  const [customReason, setCustomReason] = useState('');

  // Toast / Export feedback
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = storeOrders.length;
    const pending = storeOrders.filter((o) => o.status === 'PLACED').length;
    const preparing = storeOrders.filter(
      (o) => o.status === 'CONFIRMED' || o.status === 'PREPARING'
    ).length;
    const outForDelivery = storeOrders.filter(
      (o) => o.status === 'OUT_FOR_DELIVERY'
    ).length;
    const completed = storeOrders.filter(
      (o) => o.status === 'DELIVERED' || o.status === 'PICKED_UP'
    ).length;
    const totalRevenue = storeOrders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return { total, pending, preparing, outForDelivery, completed, totalRevenue };
  }, [storeOrders]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      ALL: storeOrders.length,
      PLACED: storeOrders.filter((o) => o.status === 'PLACED').length,
      CONFIRMED: storeOrders.filter((o) => o.status === 'CONFIRMED').length,
      PREPARING: storeOrders.filter((o) => o.status === 'PREPARING').length,
      READY: storeOrders.filter((o) => o.status === 'READY').length,
      READY_FOR_PICKUP: storeOrders.filter((o) => o.status === 'READY_FOR_PICKUP').length,
      OUT_FOR_DELIVERY: storeOrders.filter((o) => o.status === 'OUT_FOR_DELIVERY').length,
      DELIVERED: storeOrders.filter((o) => o.status === 'DELIVERED').length,
      PICKED_UP: storeOrders.filter((o) => o.status === 'PICKED_UP').length,
      CANCELLED: storeOrders.filter((o) => o.status === 'CANCELLED').length,
    };
  }, [storeOrders]);

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    return storeOrders
      .filter((order) => {
        // Status tab filter
        if (selectedStatusTab !== 'ALL') {
          if (selectedStatusTab === 'COMPLETED') {
            if (order.status !== 'DELIVERED' && order.status !== 'PICKED_UP') return false;
          } else if (order.status !== selectedStatusTab) {
            return false;
          }
        }
        // Fulfillment type filter
        if (fulfillmentFilter !== 'ALL' && order.fulfillmentType !== fulfillmentFilter) {
          return false;
        }
        // Payment filter
        if (paymentFilter !== 'ALL' && order.paymentStatus !== paymentFilter) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId =
            order.id?.toLowerCase().includes(q) ||
            order.orderNumber?.toLowerCase().includes(q);
          const matchCust =
            order.customer?.name?.toLowerCase().includes(q) ||
            order.customer?.phone?.toLowerCase().includes(q);
          const matchItems = order.items?.some((i) =>
            i.title?.toLowerCase().includes(q)
          );
          if (!matchId && !matchCust && !matchItems) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'OLDEST') return a.id.localeCompare(b.id);
        if (sortBy === 'AMOUNT_HIGH') return b.total - a.total;
        if (sortBy === 'AMOUNT_LOW') return b.total - a.total;
        return b.id.localeCompare(a.id); // Default NEWEST
      });
  }, [storeOrders, selectedStatusTab, fulfillmentFilter, paymentFilter, searchQuery, sortBy]);

  // Quick Action Handler
  const handleQuickAdvance = async (order, e) => {
    e.stopPropagation();
    try {
      switch (order.status) {
        case 'PLACED':
          await updateOrderStatus(order.id, 'CONFIRMED');
          showToast(`Order ${order.orderNumber} confirmed`);
          break;
        case 'CONFIRMED':
          await updateOrderStatus(order.id, 'PREPARING');
          showToast(`Order ${order.orderNumber} in preparation`);
          break;
        case 'PREPARING':
          if (order.fulfillmentType === 'pickup') {
            await updateOrderStatus(order.id, 'READY_FOR_PICKUP');
            showToast(`Order ${order.orderNumber} marked Ready for Pickup`);
          } else {
            await updateOrderStatus(order.id, 'READY');
            showToast(`Order ${order.orderNumber} marked Ready for Dispatch`);
          }
          break;
        case 'READY':
          // Delivery order: open details to dispatch or advance
          navigate(`/business/orders/${order.id}`);
          break;
        case 'READY_FOR_PICKUP':
          // Pickup order: customer collects at store counter
          await updateOrderStatus(order.id, 'PICKED_UP');
          showToast(`Order ${order.orderNumber} marked Picked Up by customer`);
          break;
        case 'OUT_FOR_DELIVERY':
          await updateOrderStatus(order.id, 'DELIVERED');
          showToast(`Order ${order.orderNumber} marked Delivered`);
          break;
        default:
          break;
      }
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to update order status');
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;
    const reason = cancelReason === 'Other' ? customReason || 'Merchant cancelled' : cancelReason;
    try {
      await cancelOrder(cancelModalOrder.id, reason);
      showToast(`Order ${cancelModalOrder.orderNumber} cancelled`);
      setCancelModalOrder(null);
      setCustomReason('');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Failed to cancel order');
    }
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Order Number', 'Date', 'Customer', 'Phone', 'Type', 'Status', 'Payment', 'Total (INR)'],
      ...filteredOrders.map((o) => [
        o.orderNumber,
        o.placedAt,
        o.customer?.name || 'Walk-in',
        o.customer?.phone || '-',
        o.fulfillmentType,
        o.status,
        o.paymentStatus,
        o.total,
      ]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `orders_${currentStore.id}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders export generated successfully');
  };

  // Status Badge Helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PLACED':
        return {
          bg: '#FFFBEB',
          color: '#B45309',
          border: '#FDE68A',
          label: 'Pending Confirmation',
        };
      case 'CONFIRMED':
        return {
          bg: '#EFF6FF',
          color: '#1D4ED8',
          border: '#BFDBFE',
          label: 'Confirmed',
        };
      case 'PREPARING':
        return {
          bg: '#F5F3FF',
          color: '#6D28D9',
          border: '#DDD6FE',
          label: 'In Kitchen / Prep',
        };
      case 'READY':
        return {
          bg: '#EFF6FF',
          color: '#1D4ED8',
          border: '#BFDBFE',
          label: 'Ready for Dispatch',
        };
      case 'READY_FOR_PICKUP':
        return {
          bg: '#ECFDF5',
          color: '#047857',
          border: '#A7F3D0',
          label: 'Ready for Pickup',
        };
      case 'OUT_FOR_DELIVERY':
        return {
          bg: '#F0F9FF',
          color: '#0369A1',
          border: '#BAE6FD',
          label: 'Out for Delivery',
        };
      case 'DELIVERED':
        return {
          bg: '#F0FDF4',
          color: '#15803D',
          border: '#BBF7D0',
          label: 'Delivered',
        };
      case 'PICKED_UP':
        return {
          bg: '#F0FDF4',
          color: '#15803D',
          border: '#BBF7D0',
          label: 'Picked Up',
        };
      case 'CANCELLED':
        return {
          bg: '#FEF2F2',
          color: '#B91C1C',
          border: '#FECACA',
          label: 'Cancelled',
        };
      default:
        return {
          bg: '#F1F5F9',
          color: '#475569',
          border: '#CBD5E1',
          label: status,
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Toast Notification */}
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
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-in-out',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Orders
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                border: '1px solid #A7F3D0',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 0 2px #A7F3D0',
                }}
              />
              {currentStore.name} Live
            </span>
          </div>
          <p
            style={{
              fontSize: '14px',
              color: '#64748B',
              margin: '4px 0 0 0',
            }}
          >
            Manage live incoming orders, kitchen prep, and dispatch pipeline.
          </p>
        </div>

        {/* Top Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
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
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>

          <Link
            to="/business/fulfillment"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: '#172554',
              border: '1px solid #172554',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#FFFFFF',
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13" />
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
              <circle cx="5.5" cy="18.5" r="2.5" />
              <circle cx="18.5" cy="18.5" r="2.5" />
            </svg>
            Fulfillment Queue
          </Link>
        </div>
      </div>

      {/* 5 KPI Scanning Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Total Orders */}
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
            Total Store Orders
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '26px', fontWeight: '700', color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
              {metrics.total}
            </span>
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#10B981' }}>
              ₹{metrics.totalRevenue.toLocaleString('en-IN')} vol
            </span>
          </div>
        </div>

        {/* Pending Confirmation */}
        <div
          onClick={() => setSelectedStatusTab(selectedStatusTab === 'PLACED' ? 'ALL' : 'PLACED')}
          style={{
            backgroundColor: selectedStatusTab === 'PLACED' ? '#FFFBEB' : '#FFFFFF',
            border: selectedStatusTab === 'PLACED' ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            cursor: 'pointer',
            transition: 'border-color 0.15s, background-color 0.15s',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pending Action
            </span>
            {metrics.pending > 0 && (
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            )}
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#B45309', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.pending}
          </div>
        </div>

        {/* In Preparation */}
        <div
          onClick={() => setSelectedStatusTab(selectedStatusTab === 'PREPARING' ? 'ALL' : 'PREPARING')}
          style={{
            backgroundColor: selectedStatusTab === 'PREPARING' ? '#F5F3FF' : '#FFFFFF',
            border: selectedStatusTab === 'PREPARING' ? '1.5px solid #8B5CF6' : '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            In Preparation
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#6D28D9', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.preparing}
          </div>
        </div>

        {/* Out for Delivery */}
        <div
          onClick={() => setSelectedStatusTab(selectedStatusTab === 'OUT_FOR_DELIVERY' ? 'ALL' : 'OUT_FOR_DELIVERY')}
          style={{
            backgroundColor: selectedStatusTab === 'OUT_FOR_DELIVERY' ? '#EFF6FF' : '#FFFFFF',
            border: selectedStatusTab === 'OUT_FOR_DELIVERY' ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Out for Delivery
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#1D4ED8', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.outForDelivery}
          </div>
        </div>

        {/* Completed Today */}
        <div
          onClick={() => setSelectedStatusTab(selectedStatusTab === 'COMPLETED' ? 'ALL' : 'COMPLETED')}
          style={{
            backgroundColor: selectedStatusTab === 'COMPLETED' ? '#F0FDF4' : '#FFFFFF',
            border: selectedStatusTab === 'COMPLETED' ? '1.5px solid #10B981' : '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Completed (Delivered & Picked Up)
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#047857', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.completed}
          </div>
        </div>
      </div>

      {/* Search & Filters Controls Container */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        }}
      >
        {/* Status Tabs Ribbon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
          }}
        >
          {[
            { key: 'ALL', label: 'All Orders', count: tabCounts.ALL },
            { key: 'PLACED', label: 'Pending', count: tabCounts.PLACED },
            { key: 'CONFIRMED', label: 'Confirmed', count: tabCounts.CONFIRMED },
            { key: 'PREPARING', label: 'Preparing', count: tabCounts.PREPARING },
            { key: 'READY', label: 'Ready for Dispatch', count: tabCounts.READY },
            { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', count: tabCounts.READY_FOR_PICKUP },
            { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', count: tabCounts.OUT_FOR_DELIVERY },
            { key: 'DELIVERED', label: 'Delivered', count: tabCounts.DELIVERED },
            { key: 'PICKED_UP', label: 'Picked Up', count: tabCounts.PICKED_UP },
            { key: 'CANCELLED', label: 'Cancelled', count: tabCounts.CANCELLED },
          ].map((tab) => {
            const active = selectedStatusTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedStatusTab(tab.key)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: active ? '#172554' : '#F1F5F9',
                  color: active ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 5px',
                    fontSize: '11px',
                    borderRadius: '9999px',
                    backgroundColor: active ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                    color: active ? '#FFFFFF' : '#1E293B',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Inputs Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '12px',
            borderTop: '1px solid #F1F5F9',
            paddingTop: '12px',
          }}
        >
          {/* Search Input */}
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94A3B8"
              strokeWidth="2"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by Order ID, customer name, phone, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                fontSize: '13px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                boxSizing: 'border-box',
                color: '#0F172A',
              }}
            />
          </div>

          {/* Fulfillment Filter */}
          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Fulfillment</option>
            <option value="delivery">Home Delivery</option>
            <option value="pickup">Store Pickup</option>
          </select>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Payment Types</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="COD">Cash on Delivery</option>
          </select>

          {/* Sort Filter */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              cursor: 'pointer',
            }}
          >
            <option value="NEWEST">Sort: Newest First</option>
            <option value="OLDEST">Sort: Oldest First</option>
            <option value="AMOUNT_HIGH">Sort: Highest Total</option>
            <option value="AMOUNT_LOW">Sort: Lowest Total</option>
          </select>

          {/* Clear Filters button */}
          {(searchQuery || selectedStatusTab !== 'ALL' || fulfillmentFilter !== 'ALL' || paymentFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatusTab('ALL');
                setFulfillmentFilter('ALL');
                setPaymentFilter('ALL');
              }}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#EF4444',
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table Container */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '980px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Time</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fulfillment</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items Summary</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Amount</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '48px 16px', textAlign: 'center' }}>
                    <div style={{ maxWidth: '360px', margin: '0 auto', color: '#64748B' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" style={{ margin: '0 auto 12px' }}>
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', marginBottom: '4px' }}>
                        No orders found
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748B' }}>
                        Try changing your search terms, status tab, or fulfillment filter.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const isDelivery = order.fulfillmentType === 'delivery';

                  return (
                    <tr
                      key={order.id}
                      onClick={() => navigate(`/business/orders/${order.id}`)}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Order Number */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#2563EB', fontVariantNumeric: 'tabular-nums' }}>
                          {order.orderNumber}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>
                          {order.items?.length || 0} items
                        </div>
                      </td>

                      {/* Time */}
                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#475569' }}>
                        {order.placedAt}
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                          {order.customer?.name || 'Walk-in Customer'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          {order.customer?.phone || '-'}
                        </div>
                      </td>

                      {/* Fulfillment */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: isDelivery ? '#EFF6FF' : '#F3F4F6',
                            color: isDelivery ? '#1E40AF' : '#374151',
                            border: `1px solid ${isDelivery ? '#BFDBFE' : '#E5E7EB'}`,
                          }}
                        >
                          {isDelivery ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <rect x="1" y="3" width="15" height="13" />
                              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                              <circle cx="5.5" cy="18.5" r="2.5" />
                              <circle cx="18.5" cy="18.5" r="2.5" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                              <line x1="3" y1="6" x2="21" y2="6" />
                              <path d="M16 10a4 4 0 0 1-8 0" />
                            </svg>
                          )}
                          {isDelivery ? 'Delivery' : 'Store Pickup'}
                        </span>
                      </td>

                      {/* Items Summary */}
                      <td style={{ padding: '14px 16px', maxWidth: '240px' }}>
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#334155',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                          title={order.items?.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                        >
                          {order.items?.map((i) => `${i.quantity}x ${i.title}`).join(', ')}
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#0F172A',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          ₹{Number(order.total || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Payment */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor:
                              order.paymentStatus === 'PAID'
                                ? '#DCFCE7'
                                : order.paymentStatus === 'COD'
                                ? '#E0E7FF'
                                : '#FEF3C7',
                            color:
                              order.paymentStatus === 'PAID'
                                ? '#166534'
                                : order.paymentStatus === 'COD'
                                ? '#3730A3'
                                : '#92400E',
                          }}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '3px 9px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '600',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Lifecycle Advance Button */}
                          {order.status === 'PLACED' && (
                            <button
                              onClick={(e) => handleQuickAdvance(order, e)}
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
                              Accept Order
                            </button>
                          )}
                          {order.status === 'CONFIRMED' && (
                            <button
                              onClick={(e) => handleQuickAdvance(order, e)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#2563EB',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Start Prep
                            </button>
                          )}
                          {order.status === 'PREPARING' && (
                            <button
                              onClick={(e) => handleQuickAdvance(order, e)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#059669',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              {order.fulfillmentType === 'pickup' ? 'Ready for Pickup' : 'Ready for Dispatch'}
                            </button>
                          )}
                          {order.status === 'READY_FOR_PICKUP' && (
                            <button
                              onClick={(e) => handleQuickAdvance(order, e)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#15803D',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Handover (Picked Up)
                            </button>
                          )}
                          {order.status === 'READY' && (
                            <button
                              onClick={(e) => handleQuickAdvance(order, e)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#0284C7',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Dispatch Rider
                            </button>
                          )}
                          {order.status === 'OUT_FOR_DELIVERY' && (
                            <button
                              onClick={(e) => handleQuickAdvance(order, e)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#15803D',
                                color: '#FFFFFF',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '600',
                                cursor: 'pointer',
                              }}
                            >
                              Mark Delivered
                            </button>
                          )}

                          {/* Details Icon Link */}
                          <Link
                            to={`/business/orders/${order.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '4px',
                              backgroundColor: '#F1F5F9',
                              color: '#334155',
                              textDecoration: 'none',
                            }}
                            title="View Full Order Details"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </Link>

                          {/* Cancel button if active */}
                          {order.status !== 'DELIVERED' && order.status !== 'PICKED_UP' && order.status !== 'CANCELLED' && (
                            <button
                              onClick={() => setCancelModalOrder(order)}
                              title="Cancel Order"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '28px',
                                height: '28px',
                                borderRadius: '4px',
                                backgroundColor: '#FEF2F2',
                                color: '#EF4444',
                                border: '1px solid #FECACA',
                                cursor: 'pointer',
                              }}
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setCancelModalOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
                Cancel Order {cancelModalOrder.orderNumber}
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: '0 0 16px 0' }}>
              Please select a cancellation reason. The order status will be updated to Cancelled and the customer notified.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {[
                'Out of stock',
                'Customer requested cancellation',
                'Store closed / prep delay',
                'Delivery partner unavailable',
                'Other',
              ].map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: '#334155',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={() => setCancelReason(reason)}
                  />
                  {reason}
                </label>
              ))}

              {cancelReason === 'Other' && (
                <input
                  type="text"
                  placeholder="Specify custom reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  style={{
                    marginTop: '4px',
                    padding: '8px 10px',
                    fontSize: '13px',
                    borderRadius: '4px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                  }}
                />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setCancelModalOrder(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
              <button
                onClick={handleConfirmCancel}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
