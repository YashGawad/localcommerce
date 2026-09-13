import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';

export default function AdminSettingsPage() {
  const { platformSettings, updatePlatformSettings } = useAdmin();

  // Local form state
  const [formData, setFormData] = useState({ ...platformSettings });
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'financial' | 'sla' | 'security' | 'system'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updatePlatformSettings(formData);
    showToast('Platform operational settings successfully updated.');
  };

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
        title="Platform Operations & System Settings"
        subtitle="Configure network-wide take rates, operational fulfillment SLAs, security policies, and platform defaults"
        badge="Platform v2.4 Admin"
        badgeVariant="info"
        actions={
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 18px',
              backgroundColor: '#2563EB',
              borderRadius: '6px',
              border: 'none',
              fontSize: '12px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              save
            </span>
            Save Configuration
          </button>
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', gap: '20px' }}>
        {[
          { key: 'general', label: 'General Info' },
          { key: 'financial', label: 'Commission & Fees' },
          { key: 'sla', label: 'Operational SLAs' },
          { key: 'security', label: 'Governance & Security' },
          { key: 'system', label: 'System Health & Maintenance' },
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

      <form onSubmit={handleSave}>
        {/* TAB 1: GENERAL */}
        {activeTab === 'general' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                Platform Identity
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                Public platform labels shown in system emails, notifications, and merchant documents
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Platform Name
                </label>
                <input
                  type="text"
                  value={formData.platformName}
                  onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Tagline
                </label>
                <input
                  type="text"
                  value={formData.platformTagline}
                  onChange={(e) => setFormData({ ...formData, platformTagline: e.target.value })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Support Desk Email
                </label>
                <input
                  type="email"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Helpline Toll-Free Phone
                </label>
                <input
                  type="text"
                  value={formData.helplinePhone}
                  onChange={(e) => setFormData({ ...formData, helplinePhone: e.target.value })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Default Base Currency
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.defaultCurrency}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px', backgroundColor: '#F8FAFC' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Platform Operational Timezone
                </label>
                <input
                  type="text"
                  disabled
                  value={formData.timezone}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px', backgroundColor: '#F8FAFC' }}
                />
              </div>
            </div>

            <div style={{ paddingTop: '12px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#172033' }}>
                  Emergency Platform Maintenance Mode
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Temporarily display a maintenance banner and pause new customer checkout runs
                </div>
              </div>
              <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.maintenanceMode}
                  onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: FINANCIAL & COMMISSION */}
        {activeTab === 'financial' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                Commission & Network Pricing Parameters
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                Default economics applied to newly onboarded merchant nodes unless contractually overridden
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Default Platform Commission Take Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.defaultTakeRatePercent}
                  onChange={(e) => setFormData({ ...formData, defaultTakeRatePercent: Number(e.target.value) })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Applied per settled order from store merchant payouts
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Customer Platform Convenience Fee (₹)
                </label>
                <input
                  type="number"
                  value={formData.customerConvenienceFee}
                  onChange={(e) => setFormData({ ...formData, customerConvenienceFee: Number(e.target.value) })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Fixed fee levied on customer checkout basket
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Minimum Network Order Value (₹)
                </label>
                <input
                  type="number"
                  value={formData.minPlatformOrderValue}
                  onChange={(e) => setFormData({ ...formData, minPlatformOrderValue: Number(e.target.value) })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Default Free Delivery Basket Threshold (₹)
                </label>
                <input
                  type="number"
                  value={formData.freeDeliveryThresholdDefault}
                  onChange={(e) => setFormData({ ...formData, freeDeliveryThresholdDefault: Number(e.target.value) })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OPERATIONAL SLAS */}
        {activeTab === 'sla' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                Hyperlocal Delivery & Dispatch SLAs
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                Operational timeouts controlling order routing, rider assignment, and merchant response windows
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Maximum Delivery Radius (km)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={formData.maxDeliveryRadiusKm}
                  onChange={(e) => setFormData({ ...formData, maxDeliveryRadiusKm: Number(e.target.value) })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Stores outside this radius are not matched for customer delivery
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Merchant Acceptance Window SLA (minutes)
                </label>
                <input
                  type="number"
                  value={formData.merchantAcceptanceSlaMins}
                  onChange={(e) => setFormData({ ...formData, merchantAcceptanceSlaMins: Number(e.target.value) })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'block' }}>
                  Time allowed before triggering automated voice call reminder
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Auto-Cancel Timeout for Unaccepted Orders (minutes)
                </label>
                <input
                  type="number"
                  value={formData.autoCancelTimeoutMins}
                  onChange={(e) => setFormData({ ...formData, autoCancelTimeoutMins: Number(e.target.value) })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Rider Dispatch Buffer (minutes)
                </label>
                <input
                  type="number"
                  value={formData.riderDispatchBufferMins}
                  onChange={(e) => setFormData({ ...formData, riderDispatchBufferMins: Number(e.target.value) })}
                  style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GOVERNANCE & SECURITY */}
        {activeTab === 'security' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                Platform Governance & Security Enforcement
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                Identity verification, doorstep handover protocols, and automated review trust filters
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#172033' }}>
                    Mandatory Doorstep Handover OTP
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Requires rider to verify 4-digit customer SMS OTP before marking delivery complete
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.mandatoryDoorstepOtp}
                  onChange={(e) => setFormData({ ...formData, mandatoryDoorstepOtp: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#172033' }}>
                    Two-Factor Authentication for Store Owners
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Mandates SMS/WhatsApp OTP for merchant portal logins from unverified devices
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.merchantTwoFactorAuth}
                  onChange={(e) => setFormData({ ...formData, merchantTwoFactorAuth: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: '#172033' }}>
                    Automated Moderation Filter for Flagged Keywords
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Automatically places reviews containing profanity or dispute language into 'Pending Review'
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.profanityFilterEnabled}
                  onChange={(e) => setFormData({ ...formData, profanityFilterEnabled: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SYSTEM HEALTH & MAINTENANCE */}
        {activeTab === 'system' && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                System Architecture & Mock Integrations Status
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748B' }}>
                Infrastructure diagnostics and mock simulation state for frontend evaluation
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>SMS Gateway Service</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>
                  {formData.smsGatewayStatus}
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>WhatsApp Business Gateway</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#10B981', marginTop: '2px' }}>
                  {formData.whatsappApiStatus}
                </div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: '11px', color: '#64748B' }}>Geo-Routing Engine</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB', marginTop: '2px' }}>
                  {formData.mapsApiStatus}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
              <button
                type="button"
                onClick={() => showToast('Platform audit logs exported to JSON download')}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                Export Platform Audit Log
              </button>

              <button
                type="button"
                onClick={() => showToast('Local simulation cache cleared and state synced')}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                Purge Frontend Cache
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
