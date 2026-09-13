import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminModal from '../../components/admin/AdminModal';

export default function AdminSubscriptionsPage() {
  const { subscriptions, plans, changeStorePlan } = useAdmin();

  // Billing view toggle for plan cards: 'monthly' | 'annual'
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [editingStorePlan, setEditingStorePlan] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('plan_starter');
  const [selectedCycle, setSelectedCycle] = useState('Monthly');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmPlanChange = () => {
    if (!editingStorePlan) return;
    changeStorePlan(editingStorePlan.storeId, selectedPlanId, selectedCycle);
    showToast(`Updated subscription for ${editingStorePlan.storeName}`);
    setEditingStorePlan(null);
  };

  const columns = [
    {
      header: 'Store Merchant',
      key: 'storeName',
      render: (s) => (
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
            {s.storeName}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            Owner: {s.ownerName}
          </div>
        </div>
      ),
    },
    {
      header: 'Subscribed Tier',
      key: 'planName',
      render: (s) => (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: s.planId === 'plan_business' ? '#F5F3FF' : (s.planId === 'plan_starter' ? '#EFF6FF' : '#F1F5F9'),
            color: s.planId === 'plan_business' ? '#7C3AED' : (s.planId === 'plan_starter' ? '#1D4ED8' : '#475569'),
            border: '1px solid #E2E8F0',
          }}
        >
          {s.planName}
        </span>
      ),
    },
    {
      header: 'Billing & Fee',
      key: 'amount',
      render: (s) => (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#172033' }}>
            {s.amount === 0 ? 'Free' : `₹${s.amount.toLocaleString('en-IN')}`} / {s.billingCycle}
          </div>
          <div style={{ fontSize: '10px', color: '#64748B' }}>
            {s.paymentMethod}
          </div>
        </div>
      ),
    },
    {
      header: 'Renewal Date',
      key: 'renewalDate',
      render: (s) => (
        <div>
          <div style={{ fontSize: '12px', color: '#172033' }}>{s.renewalDate}</div>
          <div style={{ fontSize: '10px', color: '#94A3B8' }}>Since {s.startedDate}</div>
        </div>
      ),
    },
    {
      header: 'Usage Metrics',
      key: 'usage',
      render: (s) => (
        <div style={{ minWidth: '120px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748B', marginBottom: '3px' }}>
            <span>{s.listingsUsed} listings</span>
            <span>{s.listingsLimit > 5000 ? 'Unlimited' : `Limit ${s.listingsLimit}`}</span>
          </div>
          <div style={{ width: '100%', height: '4px', backgroundColor: '#E2E8F0', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, Math.round((s.listingsUsed / (s.listingsLimit || 1)) * 100))}%`,
                height: '100%',
                backgroundColor: '#2563EB',
              }}
            />
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (s) => <AdminStatusBadge status={s.status} size="sm" />,
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (s) => (
        <button
          type="button"
          onClick={() => {
            setEditingStorePlan(s);
            setSelectedPlanId(s.planId);
            setSelectedCycle(s.billingCycle || 'Monthly');
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
          Change Tier
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
        title="Platform SaaS Subscriptions & Plans"
        subtitle="Manage merchant software licensing tiers, listing capacity allotments, and billing cycles"
        badge="SaaS Pricing Model (Mock)"
        badgeVariant="info"
        actions={
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#FFFFFF', padding: '3px', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
            <button
              type="button"
              onClick={() => setBillingPeriod('monthly')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: billingPeriod === 'monthly' ? '#2563EB' : 'transparent',
                color: billingPeriod === 'monthly' ? '#FFFFFF' : '#475569',
              }}
            >
              Monthly View
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod('annual')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: billingPeriod === 'annual' ? '#2563EB' : 'transparent',
                color: billingPeriod === 'annual' ? '#FFFFFF' : '#475569',
              }}
            >
              Annual View (Save ~16%)
            </button>
          </div>
        }
      />

      {/* Plan Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {plans.map((plan) => {
          const price = billingPeriod === 'annual' ? plan.annualPrice : plan.monthlyPrice;
          return (
            <div
              key={plan.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#172033' }}>
                    {plan.name}
                  </span>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: '#EFF6FF',
                      color: plan.color,
                    }}
                  >
                    {plan.badge}
                  </span>
                </div>

                <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '26px', fontWeight: 800, color: '#172033' }}>
                    {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
                  </span>
                  {price > 0 && (
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      /{billingPeriod === 'annual' ? 'year' : 'month'}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4, margin: '0 0 14px' }}>
                  {plan.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', color: '#334155' }}>
                  {plan.features.map((f, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#10B981' }}>
                        check
                      </span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #F1F5F9', fontSize: '11px', color: '#64748B' }}>
                Commission: <strong style={{ color: '#172033' }}>{plan.commissionRate}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscribed Stores Table */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172033', marginBottom: '12px' }}>
          Merchant Store Subscriptions
        </h3>

        <AdminTable
          columns={columns}
          data={subscriptions}
          searchPlaceholder="Search store name, owner..."
          searchFilter={(sub, q) => {
            return (
              sub.storeName.toLowerCase().includes(q) ||
              sub.ownerName.toLowerCase().includes(q) ||
              sub.planName.toLowerCase().includes(q)
            );
          }}
        />
      </div>

      {/* Change Tier Modal */}
      <AdminModal
        isOpen={Boolean(editingStorePlan)}
        onClose={() => setEditingStorePlan(null)}
        title={`Change Plan: ${editingStorePlan?.storeName}`}
        subtitle="Upgrade or adjust merchant SaaS software tier"
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditingStorePlan(null)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPlanChange}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Confirm Plan Update
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Select SaaS Plan Tier
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px', borderRadius: '6px' }}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — ₹{p.monthlyPrice}/mo ({p.commissionRate} commission)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Billing Cycle
            </label>
            <select
              value={selectedCycle}
              onChange={(e) => setSelectedCycle(e.target.value)}
              style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px', borderRadius: '6px' }}
            >
              <option value="Monthly">Monthly Recurring</option>
              <option value="Annual">Annual Billing (Save ~16%)</option>
            </select>
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '11px', color: '#64748B' }}>
            <strong>Note:</strong> In this frontend prototype, billing changes adjust store limits, commission benchmarks, and renewal dates locally in mock state without contacting real payment gateways.
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
