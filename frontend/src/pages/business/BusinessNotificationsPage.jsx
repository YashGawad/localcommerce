import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';
import { useNotifications } from '../../context/NotificationsContext';

export default function BusinessNotificationsPage() {
  const { currentStore } = useCatalog();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOlderLoaded, setIsOlderLoaded] = useState(false);

  const storeCode = currentStore.id === 'store_01' ? '0102' : '0201';

  // Category counts for filter pills
  const categoryCounts = useMemo(() => {
    const counts = {
      all: notifications.length,
      orders: 0,
      inventory: 0,
      fulfillment: 0,
      customers: 0,
      system: 0,
    };
    notifications.forEach((n) => {
      if (counts[n.category] !== undefined) {
        counts[n.category] += 1;
      }
    });
    return counts;
  }, [notifications]);

  // Filtered notifications list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchCategory = selectedCategory === 'all' || n.category === selectedCategory;
      const matchUnread = !unreadOnly || !n.read;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        n.title.toLowerCase().includes(query) ||
        n.message.toLowerCase().includes(query) ||
        (n.amount && n.amount.toLowerCase().includes(query)) ||
        (n.channel && n.channel.toLowerCase().includes(query));

      return matchCategory && matchUnread && matchSearch;
    });
  }, [notifications, selectedCategory, unreadOnly, searchQuery]);

  // Critical metrics calculation
  const criticalInventoryCount = useMemo(() => {
    return notifications.filter((n) => n.category === 'inventory' && !n.read).length;
  }, [notifications]);

  const criticalOrdersCount = useMemo(() => {
    return notifications.filter((n) => n.category === 'orders' && !n.read).length;
  }, [notifications]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setUnreadOnly(false);
    setSearchQuery('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* 1. Header & Scope Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          paddingBottom: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#64748B',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#172554', fontWeight: 700 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  storefront
                </span>
                {currentStore.name}
              </span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span>System</span>
              <span style={{ color: '#CBD5E1' }}>/</span>
              <span style={{ color: '#172033', fontWeight: 600 }}>Notifications</span>
              <span
                style={{
                  marginLeft: '4px',
                  padding: '2px 6px',
                  backgroundColor: '#E2E8F0',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Store #{storeCode}
              </span>
            </nav>

            {/* Page Title & Operational Scope */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#172033',
                  letterSpacing: '-0.02em',
                  margin: 0,
                }}
              >
                Notifications
              </h1>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3px 10px',
                  borderRadius: '20px',
                  backgroundColor: unreadCount > 0 ? '#DBEAFE' : '#F1F5F9',
                  color: unreadCount > 0 ? '#1D4ED8' : '#64748B',
                }}
              >
                {unreadCount} Unread
              </span>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#64748B', maxWidth: '640px' }}>
              Stay up to date with real-time transactional activity, aisle stock alerts, and fulfillment milestones from your {currentStore.location} retail floor.
            </p>
          </div>

          {/* Header Global Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', alignSelf: 'flex-start' }}>
            <button
              type="button"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#FFFFFF',
                color: unreadCount > 0 ? '#172033' : '#94A3B8',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: unreadCount > 0 ? 'pointer' : 'default',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                done_all
              </span>
              Mark all as read
            </button>

            <Link
              to="/business/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                backgroundColor: '#172554',
                color: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                tune
              </span>
              Preferences
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Quick Status Diagnostic Strip (3 Cards) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Event Stream */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              electric_bolt
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Event Stream
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  boxShadow: '0 0 0 2px #A7F3D0',
                }}
              />
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#172554' }}>
                Connected Real-time
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Critical Actions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#FEF2F2',
              color: '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              warning
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Critical Actions
            </span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#172033', marginTop: '2px' }}>
              {criticalInventoryCount} Low Inventory · {criticalOrdersCount} Stalled Order
            </span>
          </div>
        </div>

        {/* Card 3: Channel Isolation */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#EFF6FF',
              color: '#172554',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              sync_saved_locally
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Channel Isolation
            </span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#172033', marginTop: '2px' }}>
              Branch #{storeCode} Locked
            </span>
          </div>
        </div>
      </div>

      {/* 3. Controls, Filter Tabs & Search Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        {/* Category Segmented Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#F8FAFC',
            padding: '4px',
            borderRadius: '8px',
            overflowX: 'auto',
            maxWidth: '100%',
          }}
        >
          {[
            { id: 'all', label: 'All', count: categoryCounts.all },
            { id: 'orders', label: 'Orders', count: categoryCounts.orders },
            { id: 'inventory', label: 'Inventory', count: categoryCounts.inventory },
            { id: 'fulfillment', label: 'Fulfillment', count: categoryCounts.fulfillment },
            { id: 'customers', label: 'Customers', count: categoryCounts.customers },
            { id: 'system', label: 'System', count: categoryCounts.system },
          ].map((tab) => {
            const isActive = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? '#172554' : '#64748B',
                  boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? '#EFF6FF' : '#E2E8F0',
                    color: isActive ? '#2563EB' : '#475569',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Unread Switch + Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Unread Switch Toggle */}
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              style={{ display: 'none' }}
            />
            <div
              style={{
                width: '36px',
                height: '20px',
                backgroundColor: unreadOnly ? '#2563EB' : '#CBD5E1',
                borderRadius: '20px',
                position: 'relative',
                transition: 'background-color 0.2s',
              }}
            >
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: unreadOnly ? '18px' : '2px',
                  transition: 'left 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              />
            </div>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#172033', whiteSpace: 'nowrap' }}>
              Unread only
            </span>
          </label>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
                color: '#64748B',
                pointerEvents: 'none',
              }}
            >
              search
            </span>
            <input
              type="text"
              placeholder="Filter alerts by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '34px',
                padding: '0 12px 0 34px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '13px',
                color: '#172033',
                outline: 'none',
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notifications.length === 0 ? (
          /* Empty State - No notifications yet */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '48px 24px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>
                notifications_none
              </span>
            </div>
            <div style={{ maxWidth: '380px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#172554' }}>
                You're all caught up
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                No notifications yet for {currentStore?.name}. New order alerts, inventory notices, and dispatch updates will appear here.
              </p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State - Filter mismatch */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              padding: '48px 24px',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>
                notifications_paused
              </span>
            </div>
            <div style={{ maxWidth: '380px' }}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#172554' }}>
                No notifications match your filter
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
                Try resetting the search keyword or toggle to "All" category to view the complete store activity stream.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                marginTop: '6px',
                padding: '7px 16px',
                backgroundColor: '#172554',
                color: '#FFFFFF',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: item.read ? '#F8FAFC' : '#FFFFFF',
                padding: '16px 20px',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                boxShadow: item.read ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Left Details */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '260px' }}>
                {/* Type Icon with Color Accent */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: item.iconBg || '#F1F5F9',
                      color: item.iconColor || '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                      {item.icon || 'notifications'}
                    </span>
                  </div>
                  {!item.read && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-1px',
                        right: '-1px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#2563EB',
                        border: '2px solid #FFFFFF',
                      }}
                    />
                  )}
                </div>

                {/* Description & Core Text */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: item.read ? 600 : 700,
                        color: item.read ? '#334155' : '#172554',
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {item.category}
                    </span>
                    {item.amount && (
                      <>
                        <span style={{ color: '#94A3B8', fontSize: '11px' }}>•</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB' }}>
                          {item.amount}
                        </span>
                      </>
                    )}
                    {item.priority && (
                      <>
                        <span style={{ color: '#94A3B8', fontSize: '11px' }}>•</span>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#DC2626' }}>
                          {item.priority}
                        </span>
                      </>
                    )}
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: '13.5px',
                      color: item.read ? '#64748B' : '#1E293B',
                      lineHeight: 1.45,
                    }}
                  >
                    {item.message}
                  </p>

                  {/* Metadata Chips */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      fontSize: '12px',
                      color: '#64748B',
                      marginTop: '4px',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                        schedule
                      </span>
                      {item.timestamp}
                    </span>
                    {item.channel && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            storefront
                          </span>
                          {item.channel}
                        </span>
                      </>
                    )}
                    {item.payment && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            payments
                          </span>
                          {item.payment}
                        </span>
                      </>
                    )}
                    {item.aisle && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            pin_drop
                          </span>
                          {item.aisle}
                        </span>
                      </>
                    )}
                    {item.rider && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            person
                          </span>
                          {item.rider}
                        </span>
                      </>
                    )}
                    {item.phone && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            phone
                          </span>
                          {item.phone}
                        </span>
                      </>
                    )}
                    {item.tag && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            loyalty
                          </span>
                          {item.tag}
                        </span>
                      </>
                    )}
                    {item.status && (
                      <>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                            cloud_done
                          </span>
                          {item.status}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0,
                  alignSelf: 'center',
                }}
              >
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(item.id)}
                    title="Mark as read"
                    style={{
                      padding: '6px',
                      borderRadius: '6px',
                      backgroundColor: 'transparent',
                      border: '1px solid #E2E8F0',
                      color: '#64748B',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      check
                    </span>
                  </button>
                )}

                {item.secondaryActionUrl && (
                  <Link
                    to={item.secondaryActionUrl}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#F1F5F9',
                      color: '#1E293B',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {item.secondaryActionLabel || 'Action'}
                  </Link>
                )}

                {item.actionUrl && (
                  <Link
                    to={item.actionUrl}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: item.read ? '#F1F5F9' : '#2563EB',
                      color: item.read ? '#1E293B' : '#FFFFFF',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: item.read ? 'none' : '0 1px 2px rgba(37,99,235,0.2)',
                    }}
                  >
                    <span>{item.actionLabel || 'View'}</span>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      arrow_forward
                    </span>
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. Pagination / Activity Footer & Infinite Scroll Trigger */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: '10px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
            history
          </span>
          <span>
            Showing <strong style={{ color: '#172033', fontWeight: 600 }}>{filteredNotifications.length}</strong> of{' '}
            <strong style={{ color: '#172033', fontWeight: 600 }}>{isOlderLoaded ? notifications.length : '24'}</strong> recorded events
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOlderLoaded(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '6px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#172554',
            cursor: 'pointer',
          }}
        >
          <span>{isOlderLoaded ? 'All events loaded' : 'Load older notifications'}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
            {isOlderLoaded ? 'done' : 'expand_more'}
          </span>
        </button>
      </div>

      {/* 6. Retail Multi-Tenant Isolation Banner */}
      <div
        style={{
          backgroundColor: '#EFF6FF',
          padding: '16px 20px',
          borderRadius: '10px',
          border: '1px solid #BFDBFE',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: '24px', color: '#2563EB', flexShrink: 0, marginTop: '2px' }}
        >
          verified_user
        </span>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#172554' }}>
            Multi-tenant Isolation & Security Compliance
          </div>
          <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
            All notification feeds, transactional webhooks, and alert dispatches are cryptographically isolated to{' '}
            <strong style={{ color: '#172554' }}>{currentStore.name} (Location #{storeCode})</strong>. Customer phone records and delivery coordinates are masked to protect personal data according to local merchant operating standards.
          </p>
        </div>
        <Link
          to="/business/settings"
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#2563EB',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0,
          }}
        >
          <span>Audit Log</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            open_in_new
          </span>
        </Link>
      </div>
    </div>
  );
}
