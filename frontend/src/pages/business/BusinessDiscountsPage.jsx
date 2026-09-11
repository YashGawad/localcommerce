import React, { useState, useMemo } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useDiscounts } from '../../context/DiscountsContext';

const DEFAULT_FORM_DATA = {
  name: '',
  code: '',
  type: 'percentage',
  value: 10,
  appliesTo: 'All Products',
  minOrderValue: 500,
  startDate: '2026-09-06',
  endDate: '2026-09-13',
  limitPerCustomer: true,
};

export default function BusinessDiscountsPage() {
  const { currentStore } = useCatalog();
  const {
    storeDiscounts,
    createDiscount,
    updateDiscount,
    toggleDiscountStatus,
    deleteDiscount,
    duplicateDiscount,
  } = useDiscounts();

  // Search & Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState('NEWEST');

  // Drawer state (Create / Edit)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDiscountId, setEditingDiscountId] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [formErrors, setFormErrors] = useState({});

  // Rules & Limits modal
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Delete confirm modal
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  // Active open 3-dots action menu id
  const [openMenuId, setOpenMenuId] = useState(null);

  // Toast notice for copied promo codes
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // KPI calculations
  const totalPromotions = storeDiscounts.length;
  const activeDiscounts = storeDiscounts.filter((d) => d.status === 'Active');
  const scheduledDiscounts = storeDiscounts.filter((d) => d.status === 'Scheduled');
  const expiredOrInactiveDiscounts = storeDiscounts.filter(
    (d) => d.status === 'Expired' || d.status === 'Inactive'
  );
  const totalRedemptions = storeDiscounts.reduce((sum, d) => sum + (d.usageCount || 0), 0);

  // Filtered & Sorted list
  const filteredDiscounts = useMemo(() => {
    return storeDiscounts
      .filter((d) => {
        // Search term
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchesName = d.name.toLowerCase().includes(q);
          const matchesCode = d.code.toLowerCase().includes(q);
          const matchesApplies = d.appliesTo.toLowerCase().includes(q);
          if (!matchesName && !matchesCode && !matchesApplies) return false;
        }

        // Status
        if (statusFilter !== 'ALL') {
          if (statusFilter === 'ACTIVE' && d.status !== 'Active') return false;
          if (statusFilter === 'SCHEDULED' && d.status !== 'Scheduled') return false;
          if (statusFilter === 'INACTIVE' && d.status !== 'Inactive') return false;
          if (statusFilter === 'EXPIRED' && d.status !== 'Expired') return false;
        }

        // Type
        if (typeFilter !== 'ALL') {
          if (typeFilter === 'PERCENT' && d.type !== 'percentage') return false;
          if (typeFilter === 'FIXED' && d.type !== 'fixed') return false;
        }

        // Applies To Scope
        if (scopeFilter !== 'ALL') {
          if (scopeFilter === 'STOREWIDE' && !d.appliesTo.includes('All')) return false;
          if (scopeFilter === 'CATEGORIES' && !d.appliesTo.toLowerCase().includes('category') && !d.appliesTo.toLowerCase().includes('munchies') && !d.appliesTo.toLowerCase().includes('milk')) return false;
          if (scopeFilter === 'SKUS' && !d.appliesTo.toLowerCase().includes('sku')) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'NEWEST') return b.id.localeCompare(a.id);
        if (sortOption === 'ENDING_SOON') return new Date(a.endDate) - new Date(b.endDate);
        if (sortOption === 'USAGE') return (b.usageCount || 0) - (a.usageCount || 0);
        if (sortOption === 'NAME') return a.code.localeCompare(b.code);
        return 0;
      });
  }, [storeDiscounts, searchTerm, statusFilter, typeFilter, scopeFilter, sortOption]);

  // Handle drawer open for Create
  const handleOpenCreate = () => {
    setEditingDiscountId(null);
    setFormData(DEFAULT_FORM_DATA);
    setFormErrors({});
    setIsDrawerOpen(true);
  };

  // Handle drawer open for Edit
  const handleOpenEdit = (discount) => {
    setEditingDiscountId(discount.id);
    setFormData({
      name: discount.name,
      code: discount.code,
      type: discount.type,
      value: discount.value,
      appliesTo: discount.appliesTo,
      minOrderValue: discount.minOrderValue,
      startDate: discount.startDate,
      endDate: discount.endDate,
      limitPerCustomer: discount.limitPerCustomer ?? true,
    });
    setFormErrors({});
    setOpenMenuId(null);
    setIsDrawerOpen(true);
  };

  // Random code generator
  const handleGenerateCode = () => {
    const prefixes = ['SUPER', 'DEAL', 'SAVE', 'MAHA', 'FESTIVE', 'SPECIAL'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setFormData((prev) => ({ ...prev, code: `${prefix}${num}` }));
    if (formErrors.code) {
      setFormErrors((prev) => ({ ...prev, code: null }));
    }
  };

  // Form submit validation & action
  const handleSubmitForm = (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Discount title is required.';
    }
    if (!formData.code.trim()) {
      errors.code = 'Coupon code is required.';
    }
    const numVal = Number(formData.value);
    if (isNaN(numVal) || numVal <= 0) {
      errors.value = 'Discount value must be greater than 0.';
    } else if (formData.type === 'percentage' && numVal > 100) {
      errors.value = 'Percentage discount cannot exceed 100%.';
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      errors.endDate = 'End date cannot be earlier than start date.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingDiscountId) {
      updateDiscount(editingDiscountId, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        appliesTo: formData.appliesTo,
        minOrderValue: Number(formData.minOrderValue) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        limitPerCustomer: formData.limitPerCustomer,
      });
      showToast(`Promotion "${formData.code.trim().toUpperCase()}" updated successfully.`);
    } else {
      createDiscount({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        appliesTo: formData.appliesTo,
        minOrderValue: Number(formData.minOrderValue) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        limitPerCustomer: formData.limitPerCustomer,
      });
      showToast(`Promotion "${formData.code.trim().toUpperCase()}" created and synced to POS.`);
    }

    setIsDrawerOpen(false);
  };

  // Copy code to clipboard
  const handleCopyCode = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    showToast(`Promo code "${code}" copied to clipboard.`);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setScopeFilter('ALL');
    setSortOption('NEWEST');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#172554',
            color: '#FFFFFF',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>
            check_circle
          </span>
          {toastMessage}
        </div>
      )}

      {/* Store Scope Notice Banner */}
      <div
        style={{
          backgroundColor: '#EFF4FF',
          border: '1px solid #DCE9FF',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB' }}>
            store
          </span>
          <div style={{ fontSize: '13px', color: '#172033' }}>
            <span style={{ fontWeight: 700, color: '#172554' }}>Store Promotion Scope: </span>
            Discounts configured here apply exclusively to online and POS billing at{' '}
            <strong style={{ color: '#2563EB' }}>{currentStore.name}</strong> ({currentStore.city || currentStore.address}).
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', display: 'inline-block' }}></span>
          POS Sync Active
        </div>
      </div>

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
          <span>{currentStore.name}</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span>Growth &amp; Analytics</span>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>chevron_right</span>
          <span style={{ color: '#2563EB', fontWeight: 600 }}>Discounts</span>
        </nav>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#172554', margin: 0, letterSpacing: '-0.015em' }}>
              Discounts &amp; Campaigns
            </h1>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
              Create and manage promotions, category vouchers, and automated cart markdowns for your store.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setIsRulesModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                height: '38px',
                borderRadius: '6px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                color: '#172033',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>
                tune
              </span>
              Rules &amp; Limits
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                height: '38px',
                borderRadius: '6px',
                backgroundColor: '#2563EB',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                add
              </span>
              + Create Discount
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Strip: 4 KPI Summary Widgets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Total Promotions */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Total Promotions
            </span>
            <span style={{ padding: '4px', borderRadius: '4px', backgroundColor: '#EFF4FF', color: '#2563EB', display: 'flex' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                loyalty
              </span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#172033' }}>
              {totalPromotions}
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Active catalog</span>
          </div>
        </div>

        {/* Active Today */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Active Today
            </span>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#172554' }}>
              {activeDiscounts.length}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#ECFDF5',
                color: '#065F46',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
                bolt
              </span>
              {totalRedemptions} Redemptions
            </span>
          </div>
        </div>

        {/* Scheduled Ahead */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Scheduled Ahead
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
              event
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#172033' }}>
              {scheduledDiscounts.length}
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#EFF4FF',
                color: '#2563EB',
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {scheduledDiscounts.length > 0 ? `Next: ${scheduledDiscounts[0].startDate}` : 'None pending'}
            </span>
          </div>
        </div>

        {/* Expired / Inactive */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
              Expired / Inactive
            </span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#94A3B8' }}>
              history
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#64748B' }}>
              {expiredOrInactiveDiscounts.length}
            </span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Archived / Paused</span>
          </div>
        </div>
      </div>

      {/* Workspace Panel: Controls & Filter Toolbar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Filter Inputs Row */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 280px', minWidth: '240px' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B',
                fontSize: '20px',
                pointerEvents: 'none',
              }}
            >
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search discounts by name or code (e.g. WEEKEND10)..."
              style={{
                width: '100%',
                height: '38px',
                paddingLeft: '38px',
                paddingRight: '12px',
                borderRadius: '8px',
                backgroundColor: '#EFF4FF',
                border: '1px solid transparent',
                fontSize: '13px',
                color: '#172033',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Dropdown Filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                height: '38px',
                padding: '0 12px',
                borderRadius: '8px',
                backgroundColor: '#EFF4FF',
                border: '1px solid transparent',
                fontSize: '13px',
                fontWeight: 600,
                color: '#172033',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Status: Active</option>
              <option value="SCHEDULED">Status: Scheduled</option>
              <option value="INACTIVE">Status: Inactive</option>
              <option value="EXPIRED">Status: Expired</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                height: '38px',
                padding: '0 12px',
                borderRadius: '8px',
                backgroundColor: '#EFF4FF',
                border: '1px solid transparent',
                fontSize: '13px',
                fontWeight: 600,
                color: '#172033',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">Discount Type: All</option>
              <option value="PERCENT">Percentage (%)</option>
              <option value="FIXED">Fixed Amount (₹)</option>
            </select>

            {/* Applies To Filter */}
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value)}
              style={{
                height: '38px',
                padding: '0 12px',
                borderRadius: '8px',
                backgroundColor: '#EFF4FF',
                border: '1px solid transparent',
                fontSize: '13px',
                fontWeight: 600,
                color: '#172033',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">Applies To: All</option>
              <option value="STOREWIDE">All Products</option>
              <option value="CATEGORIES">Category Scope</option>
              <option value="SKUS">Selected SKUs</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                height: '38px',
                padding: '0 12px',
                borderRadius: '8px',
                backgroundColor: '#E5EEFF',
                border: '1px solid transparent',
                fontSize: '13px',
                fontWeight: 600,
                color: '#172554',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="NEWEST">Sort: Newest First</option>
              <option value="ENDING_SOON">Sort: Ending Soon</option>
              <option value="USAGE">Sort: Top Redeemed</option>
              <option value="NAME">Sort: Code Name A-Z</option>
            </select>
          </div>
        </div>

        {/* Active Filter Pill Chips */}
        {(statusFilter !== 'ALL' || typeFilter !== 'ALL' || scopeFilter !== 'ALL' || searchTerm) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', paddingTop: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B' }}>
              Active Filters:
            </span>

            {searchTerm && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: '#EFF4FF',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#172033',
                }}
              >
                Search: <strong>{searchTerm}</strong>
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748B' }}>
                    close
                  </span>
                </button>
              </span>
            )}

            {statusFilter !== 'ALL' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: '#EFF4FF',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#172033',
                }}
              >
                Status: <strong>{statusFilter}</strong>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748B' }}>
                    close
                  </span>
                </button>
              </span>
            )}

            {typeFilter !== 'ALL' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: '#EFF4FF',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#172033',
                }}
              >
                Type: <strong>{typeFilter}</strong>
                <button
                  type="button"
                  onClick={() => setTypeFilter('ALL')}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748B' }}>
                    close
                  </span>
                </button>
              </span>
            )}

            {scopeFilter !== 'ALL' && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  backgroundColor: '#EFF4FF',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#172033',
                }}
              >
                Scope: <strong>{scopeFilter}</strong>
                <button
                  type="button"
                  onClick={() => setScopeFilter('ALL')}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748B' }}>
                    close
                  </span>
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563EB',
                fontSize: '12px',
                fontWeight: 600,
                textDecoration: 'underline',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              Clear All
            </button>
          </div>
        )}

        {/* Main Promotions Table (Responsive Container) */}
        <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '850px' }}>
            <thead>
              <tr style={{ backgroundColor: '#EFF4FF', height: '36px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                <th style={{ padding: '8px 16px', fontWeight: 600 }}>Promotion Name &amp; Code</th>
                <th style={{ padding: '8px 16px', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '8px 16px', fontWeight: 600 }}>Value</th>
                <th style={{ padding: '8px 16px', fontWeight: 600 }}>Applies To</th>
                <th style={{ padding: '8px 16px', fontWeight: 600 }}>Min. Order</th>
                <th style={{ padding: '8px 16px', fontWeight: 600 }}>Validity Window</th>
                <th style={{ padding: '8px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '8px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '13px', color: '#172033' }}>
              {filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#94A3B8' }}>
                        loyalty
                      </span>
                      <div style={{ fontWeight: 600, fontSize: '14px', color: '#172033' }}>No promotions found</div>
                      <div style={{ fontSize: '12px' }}>Try adjusting your search terms or active filters.</div>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          backgroundColor: '#EFF4FF',
                          border: 'none',
                          color: '#2563EB',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Reset Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((discount) => {
                  const isActive = discount.status === 'Active';
                  const isScheduled = discount.status === 'Scheduled';
                  const isExpired = discount.status === 'Expired';
                  const isInactive = discount.status === 'Inactive';

                  return (
                    <tr
                      key={discount.id}
                      style={{
                        borderTop: '1px solid #E2E8F0',
                        opacity: isExpired ? 0.65 : isInactive ? 0.8 : 1,
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      {/* Name & Code */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: 600,
                              color: isExpired ? '#64748B' : '#172554',
                              textDecoration: isExpired ? 'line-through' : 'none',
                            }}
                          >
                            {discount.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 700,
                                letterSpacing: '0.04em',
                                padding: '2px 6px',
                                backgroundColor: isExpired ? '#E2E8F0' : '#EFF4FF',
                                borderRadius: '4px',
                                color: isExpired ? '#64748B' : '#2563EB',
                                textTransform: 'uppercase',
                              }}
                            >
                              {discount.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(discount.code)}
                              title="Copy Promo Code"
                              style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                                cursor: 'pointer',
                                color: '#64748B',
                                display: 'flex',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                content_copy
                              </span>
                            </button>
                            <span style={{ fontSize: '11px', color: '#64748B' }}>
                              • {discount.usageCount || 0} redeemed
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>
                        {discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </td>

                      {/* Value */}
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: isExpired ? '#64748B' : '#172554' }}>
                          {discount.type === 'percentage' ? `${discount.value}% OFF` : `₹${discount.value} OFF`}
                        </span>
                      </td>

                      {/* Applies To */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: '#EFF4FF',
                            color: '#172033',
                            fontSize: '12px',
                            fontWeight: 500,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#2563EB' }}>
                            {discount.appliesTo.includes('All')
                              ? 'shopping_bag'
                              : discount.appliesTo.includes('Dairy')
                              ? 'category'
                              : discount.appliesTo.includes('Staples')
                              ? 'grain'
                              : 'inventory_2'}
                          </span>
                          {discount.appliesTo}
                        </span>
                      </td>

                      {/* Min Order */}
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                        ₹{discount.minOrderValue}
                      </td>

                      {/* Validity Window */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', lineHeight: 1.3 }}>
                          <span style={{ fontWeight: 500 }}>
                            {discount.startDate} – {discount.endDate}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              color: isActive
                                ? '#059669'
                                : isScheduled
                                ? '#2563EB'
                                : isInactive
                                ? '#D97706'
                                : '#64748B',
                            }}
                          >
                            {isActive
                              ? 'Live now'
                              : isScheduled
                              ? `Scheduled (${discount.startDate})`
                              : isInactive
                              ? 'Manually paused'
                              : 'Ended'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: isActive
                              ? '#ECFDF5'
                              : isScheduled
                              ? '#EFF4FF'
                              : isInactive
                              ? '#FFFBEB'
                              : '#F1F5F9',
                            color: isActive
                              ? '#065F46'
                              : isScheduled
                              ? '#1D4ED8'
                              : isInactive
                              ? '#B45309'
                              : '#475569',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: isActive
                                ? '#10B981'
                                : isScheduled
                                ? '#2563EB'
                                : isInactive
                                ? '#F59E0B'
                                : '#94A3B8',
                            }}
                          ></span>
                          {discount.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', position: 'relative' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(discount)}
                            title="Edit Discount"
                            style={{
                              padding: '6px',
                              borderRadius: '4px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#64748B',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#EFF4FF';
                              e.currentTarget.style.color = '#172033';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#64748B';
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                              edit
                            </span>
                          </button>

                          {/* 3-dots Menu Button */}
                          <button
                            type="button"
                            onClick={() => setOpenMenuId(openMenuId === discount.id ? null : discount.id)}
                            style={{
                              padding: '6px',
                              borderRadius: '4px',
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#64748B',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#EFF4FF';
                              e.currentTarget.style.color = '#172033';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.color = '#64748B';
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                              more_vert
                            </span>
                          </button>

                          {/* 3-dots Dropdown Menu */}
                          {openMenuId === discount.id && (
                            <div
                              style={{
                                position: 'absolute',
                                right: 0,
                                top: '100%',
                                marginTop: '4px',
                                width: '180px',
                                backgroundColor: '#FFFFFF',
                                borderRadius: '8px',
                                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                                border: '1px solid #E2E8F0',
                                padding: '4px',
                                zIndex: 30,
                                textAlign: 'left',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  duplicateDiscount(discount.id);
                                  setOpenMenuId(null);
                                  showToast(`Duplicated promotion "${discount.code}".`);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: '#172033',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF4FF')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                  content_copy
                                </span>
                                Duplicate
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  toggleDiscountStatus(discount.id);
                                  setOpenMenuId(null);
                                  showToast(`Status updated to ${discount.status === 'Active' ? 'Inactive' : 'Active'}.`);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: discount.status === 'Active' ? '#D97706' : '#059669',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EFF4FF')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                  {discount.status === 'Active' ? 'pause_circle' : 'play_circle'}
                                </span>
                                {discount.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteConfirmTarget(discount);
                                  setOpenMenuId(null);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  fontSize: '12px',
                                  fontWeight: 500,
                                  color: '#DC2626',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                              >
                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                  delete
                                </span>
                                Delete
                              </button>
                            </div>
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

        {/* Pagination Strip */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12px',
            color: '#64748B',
            paddingTop: '8px',
          }}
        >
          <div>
            Showing <strong style={{ color: '#172033' }}>1–{filteredDiscounts.length}</strong> of{' '}
            <strong style={{ color: '#172033' }}>{filteredDiscounts.length}</strong> promotions
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              disabled
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#94A3B8',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_left</span>
              Previous
            </button>
            <span
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#172554',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '12px',
              }}
            >
              1
            </span>
            <button
              type="button"
              disabled
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                color: '#94A3B8',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
              }}
            >
              Next
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Insights & Operational Rules (3 cards at bottom) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#172554', fontWeight: 700, fontSize: '13px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
              verified_user
            </span>
            Stacking Rules
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
            LocalCommerce enforces a single coupon per checkout by default. Order-level percentage discounts override category promos.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#172554', fontWeight: 700, fontSize: '13px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
              point_of_sale
            </span>
            POS Terminal Sync
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
            Counter staff can scan physical discount QR barcodes or enter codes directly on billing tablets in real-time.
          </p>
        </div>

        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#172554', fontWeight: 700, fontSize: '13px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
              analytics
            </span>
            Customer Targeting
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
            Promotional codes can be restricted to first-time mobile app buyers or loyalty members using verified customer phone tags.
          </p>
        </div>
      </div>

      {/* Create / Edit Promotion Side Drawer */}
      {isDrawerOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              zIndex: 70,
              transition: 'opacity 0.2s ease',
            }}
          />

          {/* Sliding Drawer Container */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '100%',
              maxWidth: '540px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
              zIndex: 80,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                height: '64px',
                padding: '0 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#EFF4FF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ padding: '6px', borderRadius: '6px', backgroundColor: '#FFFFFF', color: '#2563EB', display: 'flex' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    {editingDiscountId ? 'edit' : 'add_circle'}
                  </span>
                </span>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
                    {editingDiscountId ? 'Edit Promotion' : 'Create New Promotion'}
                  </h2>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    {currentStore.name} • {currentStore.city || 'Local Store'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                style={{ background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: '#64748B' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            {/* Drawer Form Body */}
            <form
              onSubmit={handleSubmitForm}
              style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              {/* Discount Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                  Discount Title / Public Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                  }}
                  placeholder="e.g. Weekend Grocery Sale"
                  style={{
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    backgroundColor: '#EFF4FF',
                    border: formErrors.name ? '1px solid #DC2626' : '1px solid transparent',
                    fontSize: '13px',
                    color: '#172033',
                    outline: 'none',
                  }}
                />
                {formErrors.name && (
                  <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>{formErrors.name}</span>
                )}
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Displayed to customers on online store and order receipts.
                </span>
              </div>

              {/* Coupon Code */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                    Coupon Code <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateCode}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#2563EB',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      autorenew
                    </span>
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => {
                    setFormData({ ...formData, code: e.target.value.toUpperCase() });
                    if (formErrors.code) setFormErrors({ ...formErrors, code: null });
                  }}
                  placeholder="e.g. FESTIVE10"
                  style={{
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    backgroundColor: '#EFF4FF',
                    border: formErrors.code ? '1px solid #DC2626' : '1px solid transparent',
                    fontSize: '13px',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: '#172554',
                    outline: 'none',
                  }}
                />
                {formErrors.code && (
                  <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>{formErrors.code}</span>
                )}
              </div>

              {/* Discount Type & Value */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Discount Type</label>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '6px',
                    padding: '4px',
                    backgroundColor: '#EFF4FF',
                    borderRadius: '8px',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'percentage' })}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: formData.type === 'percentage' ? '#FFFFFF' : 'transparent',
                      color: formData.type === 'percentage' ? '#172554' : '#64748B',
                      fontWeight: formData.type === 'percentage' ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: formData.type === 'percentage' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      percent
                    </span>
                    Percentage (%)
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'fixed' })}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: formData.type === 'fixed' ? '#FFFFFF' : 'transparent',
                      color: formData.type === 'fixed' ? '#172554' : '#64748B',
                      fontWeight: formData.type === 'fixed' ? 700 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: formData.type === 'fixed' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      currency_rupee
                    </span>
                    Fixed Amount (₹)
                  </button>
                </div>

                <div style={{ position: 'relative', marginTop: '4px' }}>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => {
                      setFormData({ ...formData, value: e.target.value });
                      if (formErrors.value) setFormErrors({ ...formErrors, value: null });
                    }}
                    style={{
                      width: '100%',
                      height: '38px',
                      paddingLeft: '12px',
                      paddingRight: '36px',
                      borderRadius: '6px',
                      backgroundColor: '#EFF4FF',
                      border: formErrors.value ? '1px solid #DC2626' : '1px solid transparent',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#172033',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#64748B',
                    }}
                  >
                    {formData.type === 'percentage' ? '%' : '₹'}
                  </span>
                </div>
                {formErrors.value && (
                  <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>{formErrors.value}</span>
                )}
              </div>

              {/* Applies To */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>Applies To</label>
                <select
                  value={formData.appliesTo}
                  onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
                  style={{
                    height: '38px',
                    padding: '0 12px',
                    borderRadius: '6px',
                    backgroundColor: '#EFF4FF',
                    border: '1px solid transparent',
                    fontSize: '13px',
                    color: '#172033',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="All Products">Entire Store Catalog (All Products)</option>
                  <option value="Dairy & Fresh Milk">Dairy &amp; Fresh Milk</option>
                  <option value="Staples, Flours & Pulses">Staples, Flours &amp; Pulses</option>
                  <option value="Snacks, Biscuits & Munchies">Snacks, Biscuits &amp; Munchies</option>
                  <option value="Selected Specific SKUs">Selected Specific SKUs (Pick items)</option>
                </select>
              </div>

              {/* Minimum Purchase Requirement */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                  Minimum Purchase Requirement (₹)
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#64748B',
                    }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    placeholder="500"
                    style={{
                      width: '100%',
                      height: '38px',
                      paddingLeft: '28px',
                      paddingRight: '12px',
                      borderRadius: '6px',
                      backgroundColor: '#EFF4FF',
                      border: '1px solid transparent',
                      fontSize: '13px',
                      color: '#172033',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#64748B' }}>
                  Cart total must equal or exceed this amount before tax.
                </span>
              </div>

              {/* Start & End Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#172033' }}>Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    style={{
                      height: '38px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      backgroundColor: '#EFF4FF',
                      border: '1px solid transparent',
                      fontSize: '13px',
                      color: '#172033',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#172033' }}>End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => {
                      setFormData({ ...formData, endDate: e.target.value });
                      if (formErrors.endDate) setFormErrors({ ...formErrors, endDate: null });
                    }}
                    style={{
                      height: '38px',
                      padding: '0 10px',
                      borderRadius: '6px',
                      backgroundColor: '#EFF4FF',
                      border: formErrors.endDate ? '1px solid #DC2626' : '1px solid transparent',
                      fontSize: '13px',
                      color: '#172033',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
              {formErrors.endDate && (
                <span style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>{formErrors.endDate}</span>
              )}

              {/* Limit per customer */}
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.limitPerCustomer}
                  onChange={(e) => setFormData({ ...formData, limitPerCustomer: e.target.checked })}
                  style={{ marginTop: '2px', accentColor: '#2563EB', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#172033' }}>
                    Limit to one redemption per registered customer
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Prevents repeated misuse using the same verified phone number.
                  </span>
                </div>
              </label>

              {/* Live Promotion Preview Box (Checkout Badge Preview) */}
              <div
                style={{
                  backgroundColor: '#EFF4FF',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  border: '1px solid #DCE9FF',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B' }}>
                  <span>Checkout Badge Preview</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#2563EB' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                      preview
                    </span>
                    Live Customer View
                  </span>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '6px',
                        backgroundColor: '#DBE1FF',
                        color: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        confirmation_number
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#172554' }}>
                        {formData.type === 'percentage' ? `${formData.value || 0}% OFF` : `₹${formData.value || 0} OFF`}{' '}
                        on orders above ₹{formData.minOrderValue || 0}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        Valid {formData.startDate} – {formData.endDate} • Code:{' '}
                        <strong style={{ color: '#2563EB' }}>{formData.code || 'PROMO'}</strong>
                      </div>
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      backgroundColor: '#ECFDF5',
                      color: '#065F46',
                      fontSize: '11px',
                      fontWeight: 700,
                    }}
                  >
                    APPLY
                  </span>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #E2E8F0',
                  marginTop: 'auto',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    backgroundColor: '#F1F5F9',
                    border: 'none',
                    color: '#172033',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    backgroundColor: '#2563EB',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 3px rgba(37, 99, 235, 0.2)',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    check
                  </span>
                  {editingDiscountId ? 'Save Changes' : 'Create Discount'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Rules & Limits Modal */}
      {isRulesModalOpen && (
        <>
          <div
            onClick={() => setIsRulesModalOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              zIndex: 70,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '520px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              zIndex: 80,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#2563EB', fontSize: '22px' }}>
                  tune
                </span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#172554' }}>
                  Discount Rules &amp; Limits
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#64748B' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#172033', lineHeight: 1.5 }}>
              <div style={{ padding: '12px', backgroundColor: '#EFF4FF', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, color: '#172554', marginBottom: '4px' }}>Coupon Stacking Rule</div>
                <div>Only 1 coupon voucher can be redeemed per customer order checkout. Multi-voucher stacking is disallowed to protect merchant profit margins.</div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#EFF4FF', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, color: '#172554', marginBottom: '4px' }}>POS Terminal Offline Sync</div>
                <div>Promotional vouchers cached on in-store Android billing tablets remain redeemable during transient internet interruptions, syncing verification totals upon reconnection.</div>
              </div>

              <div style={{ padding: '12px', backgroundColor: '#EFF4FF', borderRadius: '8px' }}>
                <div style={{ fontWeight: 700, color: '#172554', marginBottom: '4px' }}>Minimum Order Validation</div>
                <div>Voucher discounts apply only when the cart subtotal meets or exceeds the specified threshold before delivery and service fees.</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#2563EB',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <>
          <div
            onClick={() => setDeleteConfirmTarget(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.4)',
              zIndex: 70,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '440px',
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
              zIndex: 80,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-symbols-outlined" style={{ color: '#DC2626', fontSize: '24px' }}>
                warning
              </span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#172554' }}>
                Delete Promotion?
              </h3>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete promotion{' '}
              <strong style={{ color: '#172033' }}>{deleteConfirmTarget.name}</strong> (
              <span style={{ fontWeight: 700, color: '#2563EB' }}>{deleteConfirmTarget.code}</span>)? Customers will no
              longer be able to apply this voucher.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#F1F5F9',
                  border: 'none',
                  color: '#172033',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDiscount(deleteConfirmTarget.id);
                  showToast(`Promotion "${deleteConfirmTarget.code}" deleted.`);
                  setDeleteConfirmTarget(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: '#DC2626',
                  border: 'none',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
