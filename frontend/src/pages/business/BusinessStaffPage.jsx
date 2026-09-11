import React, { useState, useMemo } from 'react';
import { useCatalog } from '../../context/CatalogContext';
import { useOperations } from '../../context/OperationsContext';

export default function BusinessStaffPage() {
  const { currentStore } = useCatalog();
  const { storeStaff, addStaff, toggleStaffStatus, removeStaff } = useOperations();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Staff',
    scope: 'Order Packing & Counter Bay',
  });

  // Toast
  const [toastMessage, setToastMessage] = useState(null);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = storeStaff.length;
    const managers = storeStaff.filter((s) => s.role === 'Manager').length;
    const staff = storeStaff.filter((s) => s.role === 'Staff').length;
    const delivery = storeStaff.filter((s) => s.role === 'Delivery Staff').length;

    return { total, managers, staff, delivery };
  }, [storeStaff]);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return storeStaff.filter((member) => {
      if (roleFilter !== 'ALL' && member.role !== roleFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = member.name?.toLowerCase().includes(q);
        const matchEmail = member.email?.toLowerCase().includes(q);
        const matchPhone = member.phone?.toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }
      return true;
    });
  }, [storeStaff, roleFilter, searchQuery]);

  const handleRoleChange = (role) => {
    let defaultScope = 'Order Packing & Counter Bay';
    if (role === 'Manager') defaultScope = 'Catalog, Orders, Inventory, Staff';
    if (role === 'Delivery Staff') defaultScope = 'Local Delivery Fleet & Order Dispatch';
    setFormData((prev) => ({ ...prev, role, scope: defaultScope }));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      showToast('Please fill in all required fields');
      return;
    }

    addStaff(formData);
    showToast(`Added ${formData.name} to ${currentStore.name} team`);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'Staff',
      scope: 'Order Packing & Counter Bay',
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmStaff) return;
    if (deleteConfirmStaff.role === 'Owner') {
      showToast('Cannot remove the Store Owner account');
      setDeleteConfirmStaff(null);
      return;
    }
    removeStaff(deleteConfirmStaff.id);
    showToast(`Removed ${deleteConfirmStaff.name} from store directory`);
    setDeleteConfirmStaff(null);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Owner':
        return { bg: '#172554', color: '#FFFFFF', border: '#172554' };
      case 'Manager':
        return { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
      case 'Delivery Staff':
        return { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' };
      default:
        return { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' };
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
              Staff & Team
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
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              {currentStore.name} Team
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '4px 0 0 0' }}>
            Manage store team members, assign operational roles, and set shifts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 18px',
            backgroundColor: '#172554',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#FFFFFF',
            cursor: 'pointer',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Invite Team Member
        </button>
      </div>

      {/* 4 Headcount Metrics */}
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
            Total Store Staff
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.total}
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
            Store Managers
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#1D4ED8', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.managers}
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
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Floor Associates
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#475569', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.staff}
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
            Delivery Fleet
          </div>
          <div style={{ marginTop: '6px', fontSize: '26px', fontWeight: '700', color: '#B45309', fontVariantNumeric: 'tabular-nums' }}>
            {metrics.delivery}
          </div>
        </div>
      </div>

      {/* Role Permissions Guide Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
          padding: '16px 20px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
            Role Authority & Access Levels for {currentStore.name}
          </span>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            fontSize: '12px',
            color: '#475569',
            lineHeight: '1.4',
          }}
        >
          <div>
            <strong style={{ color: '#172554' }}>Store Owner:</strong> Full platform access, store payout configuration, staff hiring, and deletion.
          </div>
          <div>
            <strong style={{ color: '#1D4ED8' }}>Manager:</strong> Order processing, price & inventory adjustments, stock alerts, and shift assignment.
          </div>
          <div>
            <strong style={{ color: '#475569' }}>Floor Staff:</strong> Live orders list, item picking & packing, marking items ready for counter pickup.
          </div>
          <div>
            <strong style={{ color: '#B45309' }}>Delivery Staff:</strong> Dispatch queue, assigned delivery runs, in-transit status and completion proof.
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Search staff by name, email, or phone..."
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
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
            <option value="ALL">All Roles</option>
            <option value="Owner">Owner</option>
            <option value="Manager">Manager</option>
            <option value="Staff">Floor Staff</option>
            <option value="Delivery Staff">Delivery Staff</option>
          </select>

          {(searchQuery || roleFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setRoleFilter('ALL');
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

      {/* Staff Directory Table */}
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
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Team Member</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Contact</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Operational Scope</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Shift Status</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase' }}>Joined</th>
                <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: '600', color: '#64748B', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px 16px', textAlign: 'center', color: '#64748B' }}>
                    No team members found matching your search.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((member) => {
                  const roleBadge = getRoleBadge(member.role);
                  const isOnShift = member.status === 'Active';

                  return (
                    <tr
                      key={member.id}
                      style={{ borderBottom: '1px solid #F1F5F9', transition: 'background-color 0.15s' }}
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
                            {member.avatar}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: '#0F172A' }}>
                              {member.name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: roleBadge.bg,
                            color: roleBadge.color,
                            border: `1px solid ${roleBadge.border}`,
                          }}
                        >
                          {member.roleLabel || member.role}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '13px', color: '#334155' }}>
                        {member.phone}
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#475569', maxWidth: '240px' }}>
                        {member.scope}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: '600',
                            backgroundColor: isOnShift ? '#DCFCE7' : '#F1F5F9',
                            color: isOnShift ? '#166534' : '#64748B',
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isOnShift ? '#16A34A' : '#94A3B8' }} />
                          {isOnShift ? 'On Shift' : 'Off Shift'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', fontSize: '12px', color: '#64748B' }}>
                        {member.joinedDate}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            onClick={() => {
                              toggleStaffStatus(member.id);
                              showToast(`Updated ${member.name} shift status`);
                            }}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#172554',
                              cursor: 'pointer',
                            }}
                          >
                            {isOnShift ? 'Off Shift' : 'On Shift'}
                          </button>

                          {member.role !== 'Owner' && (
                            <button
                              onClick={() => setDeleteConfirmStaff(member)}
                              title="Remove from Store Team"
                              style={{
                                padding: '5px 8px',
                                backgroundColor: '#FEF2F2',
                                border: '1px solid #FECACA',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#DC2626',
                                cursor: 'pointer',
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
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

      {/* Add Staff Modal */}
      {isAddModalOpen && (
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
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '700', color: '#0F172A' }}>
              Add Team Member to {currentStore.name}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 18px 0' }}>
              Assign role and operational access for this store location.
            </p>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Deshmukh"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sunil.d@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '13px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98200 12345"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      fontSize: '13px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Operational Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleRoleChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="Manager">Store Operations Manager</option>
                  <option value="Staff">Floor & Packaging Associate</option>
                  <option value="Delivery Staff">Delivery Partner</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Operational Responsibilities / Department
                </label>
                <input
                  type="text"
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: '13px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
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
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#172554',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Save Team Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation Modal */}
      {deleteConfirmStaff && (
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
          onClick={() => setDeleteConfirmStaff(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '8px',
              maxWidth: '420px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700', color: '#DC2626' }}>
              Remove {deleteConfirmStaff.name}?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.5', margin: '0 0 18px 0' }}>
              Are you sure you want to remove {deleteConfirmStaff.name} ({deleteConfirmStaff.role}) from {currentStore.name}? They will lose access to order and inventory tools.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setDeleteConfirmStaff(null)}
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
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
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
                Remove Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
