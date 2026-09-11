import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../../context/CatalogContext';

function SettingsForm({ currentStore, storeSettings, updateStoreSettings, isOnline, setIsOnline }) {
  // Active navigation tab
  const [activeTab, setActiveTab] = useState('store-identity');

  // Form state initialized from storeSettings
  const [formData, setFormData] = useState({
    ...storeSettings,
    acceptingOrders: isOnline,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const storeCode = formData.storeCode || (currentStore.id === 'store_01' ? '#0102' : '#0201');
  const branchTag = formData.branchTag || (currentStore.id === 'store_01' ? 'Scoped to Koramangala Branch' : 'Scoped to Thane West Branch');

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleDiscard = () => {
    setFormData({
      ...storeSettings,
      acceptingOrders: isOnline,
    });
    setHasUnsavedChanges(false);
  };

  const handleSave = () => {
    updateStoreSettings(formData);
    if (formData.acceptingOrders !== undefined) {
      setIsOnline(formData.acceptingOrders);
    }
    setHasUnsavedChanges(false);
    setToastMessage(`Settings for ${formData.storeName || currentStore.name} ${storeCode} updated`);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', position: 'relative' }}>
      {/* Toast Notification Alert */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            top: '80px',
            right: '24px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#172554',
            color: '#FFFFFF',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px rgba(23,37,84,0.25)',
            transition: 'all 0.3s ease-out',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#60A5FA' }}>
            check_circle
          </span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Saved Successfully</span>
            <span style={{ fontSize: '12px', color: '#CBD5E1' }}>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Breadcrumb & Location Scoping Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: '#64748B',
          }}
        >
          <span style={{ color: '#172554', fontWeight: 600 }}>{formData.storeName || currentStore.name}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            chevron_right
          </span>
          <span>System</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            chevron_right
          </span>
          <span style={{ fontWeight: 700, color: '#2563EB' }}>Settings</span>
        </nav>

        {/* Store Scope Tag Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            padding: '4px 12px',
            borderRadius: '20px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            border: '1px solid #E2E8F0',
            fontSize: '12px',
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
          <span style={{ color: '#172033' }}>
            Store ID: <strong style={{ color: '#172554' }}>{storeCode}</strong>
          </span>
          <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#CBD5E1' }} />
          <span style={{ color: '#64748B' }}>{branchTag}</span>
        </div>
      </div>

      {/* Header Block */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '650px', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              width: 'fit-content',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
              storefront
            </span>
            Retail Operating Configuration
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 700,
              color: '#172554',
              letterSpacing: '-0.02em',
            }}
          >
            Settings
          </h1>
          <p style={{ margin: 0, fontSize: '13.5px', color: '#64748B', lineHeight: 1.5 }}>
            Configure store operations, fulfillment parameters, catalog rules, and business details for{' '}
            <strong style={{ color: '#172033' }}>{formData.storeName || currentStore.name}</strong>.
          </p>
        </div>

        {/* Quick Action Pill Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', zIndex: 2, flexWrap: 'wrap' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#F8FAFC',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '12px',
              fontWeight: 600,
              color: '#172033',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
              verified
            </span>
            <span>GST Registered</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#F8FAFC',
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '12px',
              fontWeight: 600,
              color: '#172033',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
              point_of_sale
            </span>
            <span>POS Live #3</span>
          </div>
        </div>
      </div>

      {/* Two-Column Desktop Architecture */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(12, 1fr)',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Settings Navigation Rail */}
        <aside
          style={{
            gridColumn: 'span 12',
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
          className="settings-sidebar"
        >
          {/* Category: STORE */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '0 8px 6px 8px', letterSpacing: '0.04em' }}>
              Store
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { id: 'store-identity', label: 'Store Information', icon: 'badge' },
                { id: 'store-hours', label: 'Store Hours', icon: 'schedule' },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#172554' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#475569',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isActive ? '#FFFFFF' : '#64748B' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', opacity: isActive ? 1 : 0.4 }}>
                      chevron_right
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category: COMMERCE */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '0 8px 6px 8px', letterSpacing: '0.04em' }}>
              Commerce
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { id: 'fulfillment', label: 'Fulfillment Rules', icon: 'local_shipping' },
                { id: 'payments', label: 'Payment Methods', icon: 'account_balance_wallet' },
                { id: 'tax-gst', label: 'Tax & GST', icon: 'receipt_long' },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#172554' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#475569',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isActive ? '#FFFFFF' : '#64748B' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', opacity: isActive ? 1 : 0.4 }}>
                      chevron_right
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category: CATALOG & INVENTORY */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '0 8px 6px 8px', letterSpacing: '0.04em' }}>
              Catalog & Stock
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { id: 'inventory-rules', label: 'Inventory Alerts', icon: 'inventory_2' },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#172554' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#475569',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isActive ? '#FFFFFF' : '#64748B' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', opacity: isActive ? 1 : 0.4 }}>
                      chevron_right
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category: PREFERENCES */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', padding: '0 8px 6px 8px', letterSpacing: '0.04em' }}>
              Preferences
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {[
                { id: 'notifications', label: 'Notification Alerts', icon: 'notifications_active' },
              ].map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#172554' : 'transparent',
                      color: isActive ? '#FFFFFF' : '#475569',
                      fontSize: '13px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px', color: isActive ? '#FFFFFF' : '#64748B' }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', opacity: isActive ? 1 : 0.4 }}>
                      chevron_right
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Helper Box */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              padding: '14px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#172554', fontSize: '13px', fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
                help_center
              </span>
              <span>POS Hardware Help</span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
              Need to pair your thermal receipt printer or barcode scanner?
            </p>
            <button
              type="button"
              onClick={() => alert('Launching POS Hardware Detection Wizard...')}
              style={{
                alignSelf: 'flex-start',
                marginTop: '4px',
                padding: 0,
                background: 'none',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2563EB',
                cursor: 'pointer',
              }}
            >
              Launch Hardware Wizard →
            </button>
          </div>
        </aside>

        {/* Right Column: Settings Content Panels */}
        <div style={{ gridColumn: 'span 12' }} className="settings-content">
          {/* TAB 1: STORE IDENTITY */}
          {activeTab === 'store-identity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Identity Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#172554' }}>
                      Store Identity
                    </h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                      Legal name, public web handle, and customer storefront details.
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '4px 10px',
                      backgroundColor: '#ECFDF5',
                      color: '#065F46',
                      borderRadius: '4px',
                      border: '1px solid #A7F3D0',
                    }}
                  >
                    Storefront Active
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* Store Name */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Store Name</label>
                    <input
                      type="text"
                      value={formData.storeName || ''}
                      onChange={(e) => handleChange('storeName', e.target.value)}
                      style={{
                        height: '38px',
                        padding: '0 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#172033',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748B' }}>Appears on receipt prints and SMS alerts</span>
                  </div>

                  {/* Trade License */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                      Business Registration / Trade License
                    </label>
                    <input
                      type="text"
                      value={formData.license || ''}
                      onChange={(e) => handleChange('license', e.target.value)}
                      style={{
                        height: '38px',
                        padding: '0 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#172033',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748B' }}>BBMP Trade License or Shops & Establishment</span>
                  </div>

                  {/* Store Slug */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Store URL Handle (Slug)</label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: '#F8FAFC',
                          padding: '0 12px',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          fontSize: '13px',
                          color: '#64748B',
                          borderRight: '1px solid #E2E8F0',
                          userSelect: 'none',
                        }}
                      >
                        localcommerce.in/store/
                      </span>
                      <input
                        type="text"
                        value={formData.slug || ''}
                        onChange={(e) => handleChange('slug', e.target.value)}
                        style={{
                          flex: 1,
                          height: '38px',
                          padding: '0 12px',
                          border: 'none',
                          fontSize: '13px',
                          color: '#172033',
                          outline: 'none',
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
                        link
                      </span>
                      <Link
                        to={`/store/${currentStore.slug}`}
                        style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}
                      >
                        Preview live store page ↗
                      </Link>
                    </div>
                  </div>

                  {/* Storefront Description */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Storefront Description</label>
                    <textarea
                      rows={3}
                      value={formData.description || ''}
                      onChange={(e) => handleChange('description', e.target.value)}
                      style={{
                        padding: '10px 12px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#172033',
                        outline: 'none',
                        lineHeight: 1.4,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Physical Dispatch Location Card */}
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#172554' }}>
                      Contact & Dispatch Details
                    </h2>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                      Physical pickup location for riders and primary operational contact.
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#2563EB',
                      backgroundColor: '#EFF6FF',
                      padding: '4px 10px',
                      borderRadius: '4px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      pin_drop
                    </span>
                    Verified Geocoded Coordinates
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* Phone */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                      Primary Phone (Floor / Manager)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      style={{
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#172033',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Email */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Support / Orders Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleChange('email', e.target.value)}
                      style={{
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#172033',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Street Address */}
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                      Street Address & Shop Unit
                    </label>
                    <input
                      type="text"
                      value={formData.address || ''}
                      onChange={(e) => handleChange('address', e.target.value)}
                      style={{
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#172033',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Landmark */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Landmark</label>
                    <input
                      type="text"
                      value={formData.landmark || ''}
                      onChange={(e) => handleChange('landmark', e.target.value)}
                      style={{
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#172033',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* PIN Code */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Postal / PIN Code</label>
                    <input
                      type="text"
                      value={formData.pinCode || ''}
                      onChange={(e) => handleChange('pinCode', e.target.value)}
                      style={{
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#172033',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* City */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>City</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => handleChange('city', e.target.value)}
                      style={{
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#172033',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* State */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>State</label>
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => handleChange('state', e.target.value)}
                      style={{
                        height: '38px',
                        padding: '0 12px',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#172033',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Static Map Context Card */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    padding: '16px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                        explore
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#172554' }}>
                        {formData.hubName || 'Store Central Dispatch Hub'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        {formData.hubCoords || 'Latitude: 12.9352° N, Longitude: 77.6245° E'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert('GPS Pin verification completed: Location within 3m tolerance.')}
                    style={{
                      padding: '6px 14px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color: '#172554',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    Recalibrate Pin
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STORE HOURS & LIVE AVAILABILITY */}
          {activeTab === 'store-hours' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#172554' }}>
                    Store Hours & Live Availability
                  </h2>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                    Control operational hours for counter visits and real-time app ordering availability.
                  </p>
                </div>

                {/* Main Online Orders Live Toggle (Synchronized with BusinessHeader) */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: '#F8FAFC',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                      Accepting Online Orders
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: formData.acceptingOrders ? '#10B981' : '#EF4444',
                      }}
                    >
                      {formData.acceptingOrders ? 'Currently Live' : 'Paused / Store Offline'}
                    </span>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
                    <input
                      type="checkbox"
                      checked={!!formData.acceptingOrders}
                      onChange={(e) => handleChange('acceptingOrders', e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '44px',
                        height: '24px',
                        backgroundColor: formData.acceptingOrders ? '#10B981' : '#CBD5E1',
                        borderRadius: '24px',
                        position: 'relative',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          backgroundColor: '#FFFFFF',
                          borderRadius: '50%',
                          position: 'absolute',
                          top: '3px',
                          left: formData.acceptingOrders ? '23px' : '3px',
                          transition: 'left 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                        }}
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* Weekly Schedule Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  {
                    key: 'hoursWeekday',
                    label: 'Monday – Friday',
                    subtitle: 'Regular Weekday Shift',
                    defaultVal: formData.hoursWeekday || { open: '08:00 AM', close: '10:00 PM', status: 'Open (14h)' },
                  },
                  {
                    key: 'hoursSaturday',
                    label: 'Saturday',
                    subtitle: 'Peak Weekend Market',
                    defaultVal: formData.hoursSaturday || { open: '08:00 AM', close: '10:00 PM', status: 'Open (14h)' },
                  },
                  {
                    key: 'hoursSunday',
                    label: 'Sunday',
                    subtitle: 'Extended Morning Fresh Produce',
                    defaultVal: formData.hoursSunday || { open: '08:30 AM', close: '10:30 PM', status: 'Open (14h)' },
                  },
                ].map((sched) => (
                  <div
                    key={sched.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>{sched.label}</div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>{sched.subtitle}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748B' }}>
                          sunny
                        </span>
                        <input
                          type="text"
                          value={formData[sched.key]?.open || sched.defaultVal.open}
                          onChange={(e) => handleNestedChange(sched.key, 'open', e.target.value)}
                          style={{
                            width: '74px',
                            border: 'none',
                            outline: 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#172033',
                            textAlign: 'center',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>to</span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          backgroundColor: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748B' }}>
                          bedtime
                        </span>
                        <input
                          type="text"
                          value={formData[sched.key]?.close || sched.defaultVal.close}
                          onChange={(e) => handleNestedChange(sched.key, 'close', e.target.value)}
                          style={{
                            width: '74px',
                            border: 'none',
                            outline: 'none',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#172033',
                            textAlign: 'center',
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '4px 8px',
                          backgroundColor: '#EFF6FF',
                          color: '#2563EB',
                          borderRadius: '4px',
                        }}
                      >
                        {sched.defaultVal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FULFILLMENT RULES */}
          {activeTab === 'fulfillment' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#172554' }}>
                  Fulfillment & Delivery Parameters
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Manage hyper-local delivery radii, minimum spend limits, and pickup windows.
                </p>
              </div>

              {/* 1. Store Express Delivery Module */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  padding: '18px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                        moped
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>Store Express Delivery</div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>Dedicated delivery fleet within local sectors</div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      borderRadius: '4px',
                    }}
                  >
                    Enabled
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Free Delivery Above</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#172554' }}>₹</span>
                      <input
                        type="number"
                        value={formData.freeDeliveryAbove || 499}
                        onChange={(e) => handleChange('freeDeliveryAbove', Number(e.target.value))}
                        style={{ width: '60px', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 700, color: '#172554' }}
                      />
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Base Delivery Fee</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#172554' }}>₹</span>
                      <input
                        type="number"
                        value={formData.deliveryFee || 20}
                        onChange={(e) => handleChange('deliveryFee', Number(e.target.value))}
                        style={{ width: '60px', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 700, color: '#172554' }}
                      />
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Max Radius</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.maxRadius || 8.0}
                        onChange={(e) => handleChange('maxRadius', Number(e.target.value))}
                        style={{ width: '50px', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 700, color: '#172554' }}
                      />
                      <span style={{ fontSize: '13px', color: '#64748B' }}>km</span>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>Min Order Value</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#172554' }}>₹</span>
                      <input
                        type="number"
                        value={formData.minOrder || 150}
                        onChange={(e) => handleChange('minOrder', Number(e.target.value))}
                        style={{ width: '60px', border: 'none', outline: 'none', fontSize: '16px', fontWeight: 700, color: '#172554' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Counter Pickup Module */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                      shopping_basket
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                      Counter Pickup (Click & Collect)
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Customers collect bags directly at billing station #2
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>
                    Prep SLA: <strong style={{ color: '#172554' }}>{formData.pickupPrepTime || 'Immediate (0 min)'}</strong>
                  </span>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.pickupEnabled !== false}
                      onChange={(e) => handleChange('pickupEnabled', e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '40px',
                        height: '22px',
                        backgroundColor: formData.pickupEnabled !== false ? '#2563EB' : '#CBD5E1',
                        borderRadius: '22px',
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
                          top: '3px',
                          left: formData.pickupEnabled !== false ? '21px' : '3px',
                          transition: 'left 0.2s',
                        }}
                      />
                    </div>
                  </label>
                </div>
              </div>

              {/* 3. Third Party Regional Logistics */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                      rv_hookup
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                      Regional Logistics Integration
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Delhivery Express & BlueDart Air Courier API Sync
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '3px 8px',
                      backgroundColor: '#E0E7FF',
                      color: '#3730A3',
                      borderRadius: '4px',
                    }}
                  >
                    API Linked
                  </span>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!formData.courierShippingEnabled}
                      onChange={(e) => handleChange('courierShippingEnabled', e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '40px',
                        height: '22px',
                        backgroundColor: formData.courierShippingEnabled ? '#2563EB' : '#CBD5E1',
                        borderRadius: '22px',
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
                          top: '3px',
                          left: formData.courierShippingEnabled ? '21px' : '3px',
                          transition: 'left 0.2s',
                        }}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT METHODS */}
          {activeTab === 'payments' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#172554' }}>
                  Payment Gateways & POS Tenders
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Manage active payment rails for in-store QR stands and consumer web checkout.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Razorpay UPI */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#EFF6FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                        qr_code_scanner
                      </span>
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                          Razorpay UPI & Dynamic QR
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            backgroundColor: '#EFF6FF',
                            color: '#2563EB',
                            borderRadius: '4px',
                          }}
                        >
                          Instant Settlement
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        Zero MDR on RuPay UPI. Direct credit to HDFC Current A/C ***4891
                      </div>
                    </div>
                  </div>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.upiEnabled !== false}
                      onChange={(e) => handleChange('upiEnabled', e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '40px',
                        height: '22px',
                        backgroundColor: formData.upiEnabled !== false ? '#2563EB' : '#CBD5E1',
                        borderRadius: '22px',
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
                          top: '3px',
                          left: formData.upiEnabled !== false ? '21px' : '3px',
                          transition: 'left 0.2s',
                        }}
                      />
                    </div>
                  </label>
                </div>

                {/* Credit/Debit Cards */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#EFF6FF',
                        color: '#172554',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                        credit_card
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                        Card Swipe & Online Gateway
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        Supports Visa, Mastercard, RuPay & American Express
                      </div>
                    </div>
                  </div>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.cardsEnabled !== false}
                      onChange={(e) => handleChange('cardsEnabled', e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '40px',
                        height: '22px',
                        backgroundColor: formData.cardsEnabled !== false ? '#2563EB' : '#CBD5E1',
                        borderRadius: '22px',
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
                          top: '3px',
                          left: formData.cardsEnabled !== false ? '21px' : '3px',
                          transition: 'left 0.2s',
                        }}
                      />
                    </div>
                  </label>
                </div>

                {/* Cash on Delivery */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#EFF6FF',
                        color: '#10B981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                        payments
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                        Cash on Delivery (COD)
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        Rider collects cash. Max threshold: <strong>₹{formData.codMaxLimit || 3000} per order</strong>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="text"
                      value={`Max ₹${formData.codMaxLimit || 3000}`}
                      onChange={(e) => {
                        const val = Number(e.target.value.replace(/[^0-9]/g, '')) || 0;
                        handleChange('codMaxLimit', val);
                      }}
                      style={{
                        width: '110px',
                        height: '32px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textAlign: 'center',
                        color: '#172033',
                        outline: 'none',
                      }}
                    />
                    <label style={{ cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.codEnabled !== false}
                        onChange={(e) => handleChange('codEnabled', e.target.checked)}
                        style={{ display: 'none' }}
                      />
                      <div
                        style={{
                          width: '40px',
                          height: '22px',
                          backgroundColor: formData.codEnabled !== false ? '#2563EB' : '#CBD5E1',
                          borderRadius: '22px',
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
                            top: '3px',
                            left: formData.codEnabled !== false ? '21px' : '3px',
                            transition: 'left 0.2s',
                          }}
                        />
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TAX & GST */}
          {activeTab === 'tax-gst' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#172554' }}>
                  Taxation & GST Compliance
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Statutory tax identification and category tax slab defaults.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                    Store GSTIN ({formData.state || 'Karnataka'})
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      backgroundColor: '#FFFFFF',
                      overflow: 'hidden',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB', padding: '0 8px 0 10px' }}>
                      verified_user
                    </span>
                    <input
                      type="text"
                      value={formData.gstin || '29AAAAA0000A1Z5'}
                      onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                      style={{
                        flex: 1,
                        height: '38px',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#172033',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        outline: 'none',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Validated with GST Portal Database</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Retail Pricing Logic</label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#F8FAFC',
                      height: '38px',
                      padding: '0 12px',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
                      check
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                      All listed item prices are inclusive of GST (MRP)
                    </span>
                  </div>
                </div>
              </div>

              {/* GST Slabs Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                  Active HSN Category Slabs for Store {storeCode}
                </span>
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    padding: '14px',
                    border: '1px solid #E2E8F0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                    gap: '12px',
                  }}
                >
                  {[
                    { label: 'Staples & Fresh Grains', slab: '0% GST' },
                    { label: 'Dairy & Edible Oils', slab: '5% GST' },
                    { label: 'Packaged Snacks', slab: '12% GST' },
                    { label: 'Household Hygiene', slab: '18% GST' },
                  ].map((s) => (
                    <div
                      key={s.label}
                      style={{
                        backgroundColor: '#FFFFFF',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <span style={{ fontSize: '11px', color: '#64748B', display: 'block' }}>{s.label}</span>
                      <div style={{ fontSize: '16px', fontWeight: 700, color: '#172554', marginTop: '2px' }}>
                        {s.slab}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: INVENTORY ALERTS */}
          {activeTab === 'inventory-rules' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#172554' }}>
                  Inventory Thresholds & Auto-Sync
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Guardrails to prevent overselling on busy supermarket peak hours.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Storewide Low-Stock Alert Threshold */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                      Storewide Low-Stock Alert Threshold
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Triggers notification to replenishment team when SKU drops below threshold
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="number"
                      value={formData.lowStockThreshold || 10}
                      onChange={(e) => handleChange('lowStockThreshold', Number(e.target.value))}
                      style={{
                        width: '64px',
                        height: '36px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '6px',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#172554',
                        textAlign: 'center',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '13px', color: '#64748B' }}>units</span>
                  </div>
                </div>

                {/* Allow Online Backorders */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                      Allow Online Backorders
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Permits checkout when inventory reaches zero (Not recommended for perishable grocery)
                    </div>
                  </div>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!formData.allowBackorders}
                      onChange={(e) => handleChange('allowBackorders', e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '40px',
                        height: '22px',
                        backgroundColor: formData.allowBackorders ? '#2563EB' : '#CBD5E1',
                        borderRadius: '22px',
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
                          top: '3px',
                          left: formData.allowBackorders ? '21px' : '3px',
                          transition: 'left 0.2s',
                        }}
                      />
                    </div>
                  </label>
                </div>

                {/* POS Register Ledger Auto-Deduction */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                      POS Register Ledger Auto-Deduction
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Real-time decrement on physical barcode swipe to immediately freeze online stock
                    </div>
                  </div>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.posAutoDeduction !== false}
                      onChange={(e) => handleChange('posAutoDeduction', e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '40px',
                        height: '22px',
                        backgroundColor: formData.posAutoDeduction !== false ? '#2563EB' : '#CBD5E1',
                        borderRadius: '22px',
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
                          top: '3px',
                          left: formData.posAutoDeduction !== false ? '21px' : '3px',
                          transition: 'left 0.2s',
                        }}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: NOTIFICATION ALERTS */}
          {activeTab === 'notifications' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#172554' }}>
                  Floor Notifications & Alerts
                </h2>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748B' }}>
                  Configure alert destinations for urgent dispatch tickets and stock alerts.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Loud Sound Alarm */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                      Loud Sound Alarm on POS for Incoming Orders
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Rings till kitchen or packing station accepts dispatch ticket
                    </div>
                  </div>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.soundAlarmOnNewOrder !== false}
                      onChange={(e) => handleChange('soundAlarmOnNewOrder', e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '40px',
                        height: '22px',
                        backgroundColor: formData.soundAlarmOnNewOrder !== false ? '#2563EB' : '#CBD5E1',
                        borderRadius: '22px',
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
                          top: '3px',
                          left: formData.soundAlarmOnNewOrder !== false ? '21px' : '3px',
                          transition: 'left 0.2s',
                        }}
                      />
                    </div>
                  </label>
                </div>

                {/* Daily Digest */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                      Daily Morning Low-Stock WhatsApp & SMS Digest
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Dispatched at 07:30 AM to store floor manager ({formData.phone || '+91 98450-00001'})
                    </div>
                  </div>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.dailyMorningDigest !== false}
                      onChange={(e) => handleChange('dailyMorningDigest', e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '40px',
                        height: '22px',
                        backgroundColor: formData.dailyMorningDigest !== false ? '#2563EB' : '#CBD5E1',
                        borderRadius: '22px',
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
                          top: '3px',
                          left: formData.dailyMorningDigest !== false ? '21px' : '3px',
                          transition: 'left 0.2s',
                        }}
                      />
                    </div>
                  </label>
                </div>

                {/* Unauthorized Register Login Alert */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
                      Unauthorized Register Login Alert
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      Triggers immediate SMS when billing terminal unlocks outside opening hours
                    </div>
                  </div>
                  <label style={{ cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!formData.unauthorizedLoginAlert}
                      onChange={(e) => handleChange('unauthorizedLoginAlert', e.target.checked)}
                      style={{ display: 'none' }}
                    />
                    <div
                      style={{
                        width: '40px',
                        height: '22px',
                        backgroundColor: formData.unauthorizedLoginAlert ? '#2563EB' : '#CBD5E1',
                        borderRadius: '22px',
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
                          top: '3px',
                          left: formData.unauthorizedLoginAlert ? '21px' : '3px',
                          transition: 'left 0.2s',
                        }}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Tenant Guarantee Footnote Notice */}
          <div
            style={{
              backgroundColor: '#EFF6FF',
              borderRadius: '10px',
              border: '1px solid #BFDBFE',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              marginTop: '20px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#2563EB', flexShrink: 0, marginTop: '2px' }}>
              verified_user
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#172554' }}>
                Multi-Tenant Store Isolation Guarantee
              </span>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.5 }}>
                All configuration keys, API tokens, tax registrations, and dispatch rules belong strictly to{' '}
                <strong style={{ color: '#172554' }}>{formData.storeName || currentStore.name} (Store {storeCode})</strong>. Adjustments made in this panel are isolated and will not overwrite other locations in your parent group.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unsaved Changes Floating Dock / Action Bar */}
      {hasUnsavedChanges && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '720px',
            width: 'calc(100% - 32px)',
            zIndex: 90,
            backgroundColor: '#172554',
            color: '#FFFFFF',
            borderRadius: '12px',
            padding: '14px 20px',
            boxShadow: '0 12px 32px rgba(23,37,84,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            animation: 'fadeInUp 0.25s ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#F59E0B',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF' }}>Unsaved Changes</span>
              <span style={{ fontSize: '12px', color: '#CBD5E1' }}>
                Store Information or Operational Rules modified
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={handleDiscard}
              style={{
                padding: '6px 14px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#CBD5E1',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Discard Changes
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 18px',
                backgroundColor: '#2563EB',
                border: 'none',
                borderRadius: '6px',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                check
              </span>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Inline styles for responsive layout */}
      <style>{`
        @media (min-width: 1024px) {
          .settings-sidebar {
            grid-column: span 3 !important;
            position: sticky !important;
            top: 84px !important;
          }
          .settings-content {
            grid-column: span 9 !important;
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
}

export default function BusinessSettingsPage() {
  const { currentStore, storeSettings, updateStoreSettings, isOnline, setIsOnline } = useCatalog();

  return (
    <SettingsForm
      key={currentStore.id}
      currentStore={currentStore}
      storeSettings={storeSettings}
      updateStoreSettings={updateStoreSettings}
      isOnline={isOnline}
      setIsOnline={setIsOnline}
    />
  );
}
