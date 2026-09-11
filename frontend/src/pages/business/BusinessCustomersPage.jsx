import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useOperations } from '../../context/OperationsContext';

export default function BusinessCustomersPage() {
  const navigate = useNavigate();
  const { currentStore } = useCatalog();
  const { storeCustomers } = useOperations();

  const [searchQuery, setSearchQuery] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('HIGHEST_SPEND');

  // Metrics
  const metrics = useMemo(() => {
    const totalCustomers = storeCustomers.length;
    const vipCustomers = storeCustomers.filter((c) => c.customerType === 'VIP').length;
    const totalRevenue = storeCustomers.reduce((sum, c) => sum + (Number(c.totalSpent) || 0), 0);
    const avgSpend = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

    return { totalCustomers, vipCustomers, totalRevenue, avgSpend };
  }, [storeCustomers]);

  // Filtered and sorted customers
  const filteredCustomers = useMemo(() => {
    return storeCustomers
      .filter((customer) => {
        if (segmentFilter !== 'ALL' && customer.customerType !== segmentFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = customer.name?.toLowerCase().includes(q);
          const matchPhone = customer.phone?.toLowerCase().includes(q);
          const matchEmail = customer.email?.toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchEmail) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'MOST_ORDERS') return b.ordersCount - a.ordersCount;
        if (sortBy === 'ALPHABETICAL') return a.name.localeCompare(b.name);
        return (b.totalSpent || 0) - (a.totalSpent || 0); // Default HIGHEST_SPEND
      });
  }, [storeCustomers, segmentFilter, searchQuery, sortBy]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0F172A', margin: 0 }}>
              Customers
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid #BFDBFE',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {currentStore.name} Directory
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
            Customer purchase volume, relationship notes, and store order frequency.
          </p>
        </div>
      </div>

      {/* 4 Customer Metric Cards */}
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
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Store Customers
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.totalCustomers}
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
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Frequent / VIP Shoppers
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#B45309', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.vipCustomers}
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
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Total Customer Value
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#10B981', fontVariantNumeric: 'tabular-nums' }}>
            ₹{metrics.totalRevenue.toLocaleString('en-IN')}
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
            Average Spend / Customer
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#1D4ED8', fontVariantNumeric: 'tabular-nums' }}>
            ₹{metrics.avgSpend.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '8px',
          padding: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
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
            placeholder="Search customers by name, phone, or email..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
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
            <option value="ALL">All Segments</option>
            <option value="VIP">VIP Customers</option>
            <option value="Regular">Regular Shoppers</option>
            <option value="New">New Customers</option>
          </select>

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
            <option value="HIGHEST_SPEND">Sort: Highest Spend</option>
            <option value="MOST_ORDERS">Sort: Most Orders</option>
            <option value="ALPHABETICAL">Sort: Name (A-Z)</option>
          </select>

          {(searchQuery || segmentFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSegmentFilter('ALL');
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
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Customers Table Container */}
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
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '920px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Phone Number</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Segment</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Store Orders</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Total Spent</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Last Active Order</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
                    No customer records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => navigate(`/business/customers/${cust.id}`)}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: '#172554',
                            color: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '700',
                          }}
                        >
                          {cust.avatar || 'CU'}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                            {cust.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748B' }}>
                            {cust.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                      {cust.phone}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '600',
                          backgroundColor:
                            cust.customerType === 'VIP'
                              ? '#FEF3C7'
                              : cust.customerType === 'New'
                              ? '#DCFCE7'
                              : '#EFF6FF',
                          color:
                            cust.customerType === 'VIP'
                              ? '#B45309'
                              : cust.customerType === 'New'
                              ? '#166534'
                              : '#1D4ED8',
                        }}
                      >
                        {cust.customerType || 'Regular'}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '13px', fontWeight: '600', color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                      {cust.ordersCount} orders
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '14px', fontWeight: '700', color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
                      ₹{Number(cust.totalSpent || 0).toLocaleString('en-IN')}
                    </td>

                    <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748B' }}>
                      {cust.lastOrderDate || 'Recent'}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/business/customers/${cust.id}`);
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#172554',
                          cursor: 'pointer',
                        }}
                      >
                        View Profile →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
