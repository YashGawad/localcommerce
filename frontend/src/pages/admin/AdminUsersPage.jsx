import React, { useState, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminTable from '../../components/admin/AdminTable';
import AdminStatusBadge from '../../components/admin/AdminStatusBadge';
import AdminModal from '../../components/admin/AdminModal';

export default function AdminUsersPage() {
  const { users, updateUserStatus, updateUserRole, addUser } = useAdmin();

  // Filter States
  const [selectedRoleTab, setSelectedRoleTab] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [newRoleValue, setNewRoleValue] = useState('customer');
  const [toastMessage, setToastMessage] = useState(null);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState('customer');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Role Counts
  const counts = useMemo(() => {
    return {
      ALL: users.length,
      customer: users.filter((u) => u.role === 'customer').length,
      business_owner: users.filter((u) => u.role === 'business_owner').length,
      staff: users.filter((u) => u.role === 'staff').length,
      delivery_staff: users.filter((u) => u.role === 'delivery_staff').length,
      admin: users.filter((u) => u.role === 'admin').length,
    };
  }, [users]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (selectedRoleTab !== 'ALL' && u.role !== selectedRoleTab) return false;
      if (selectedStatusFilter !== 'ALL' && u.status !== selectedStatusFilter) return false;
      return true;
    });
  }, [users, selectedRoleTab, selectedStatusFilter]);

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      phone: newUserPhone.trim() || '+91 98000 12345',
      role: newUserRole,
    });

    setShowAddModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    showToast(`User ${newUserName} successfully created.`);
  };

  const handleChangeRole = () => {
    if (!selectedUserForRole) return;
    updateUserRole(selectedUserForRole.id, newRoleValue);
    setSelectedUserForRole(null);
    showToast(`Updated role for ${selectedUserForRole.name} to ${newRoleValue}.`);
  };

  const columns = [
    {
      header: 'User Identity',
      key: 'name',
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: u.role === 'admin' ? '#1E293B' : (u.role === 'business_owner' ? '#2563EB' : '#64748B'),
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '12px',
              flexShrink: 0,
            }}
          >
            {u.avatar || u.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
              {u.name}
            </div>
            <div style={{ fontSize: '11px', color: '#64748B' }}>
              ID: {u.id} {u.storeName && `• ${u.storeName}`}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Credentials',
      key: 'email',
      render: (u) => (
        <div>
          <div style={{ fontSize: '12px', color: '#172033', fontWeight: 500 }}>
            {u.email}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            {u.phone}
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      key: 'role',
      render: (u) => <AdminStatusBadge status={u.role} size="sm" />,
    },
    {
      header: 'Account Status',
      key: 'status',
      render: (u) => <AdminStatusBadge status={u.status} size="sm" />,
    },
    {
      header: 'Joined & Activity',
      key: 'joinedDate',
      render: (u) => (
        <div>
          <div style={{ fontSize: '11px', color: '#172033' }}>
            Joined: {u.joinedDate}
          </div>
          <div style={{ fontSize: '11px', color: '#64748B' }}>
            {u.lastActive}
          </div>
        </div>
      ),
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (u) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
          <button
            type="button"
            onClick={() => {
              setSelectedUserForRole(u);
              setNewRoleValue(u.role);
            }}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            Role
          </button>

          {u.status === 'Active' ? (
            <button
              type="button"
              onClick={() => {
                updateUserStatus(u.id, 'Suspended');
                showToast(`Suspended user account for ${u.name}`);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #FECACA',
                backgroundColor: '#FEF2F2',
                fontSize: '11px',
                fontWeight: 600,
                color: '#DC2626',
                cursor: 'pointer',
              }}
            >
              Suspend
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                updateUserStatus(u.id, 'Active');
                showToast(`Activated user account for ${u.name}`);
              }}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #BBF7D0',
                backgroundColor: '#F0FDF4',
                fontSize: '11px',
                fontWeight: 600,
                color: '#16A34A',
                cursor: 'pointer',
              }}
            >
              Activate
            </button>
          )}
        </div>
      ),
    },
  ];

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
        title="Platform Users & Access Governance"
        subtitle="Manage identities across customers, store owners, merchant staff, delivery partners, and platform admins"
        badge={`${users.length} Platform Accounts`}
        badgeVariant="info"
        actions={
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              backgroundColor: '#2563EB',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#FFFFFF',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              person_add
            </span>
            Add User Account
          </button>
        }
      />

      {/* Role Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px', overflowX: 'auto' }}>
          {[
            { key: 'ALL', label: 'All Roles' },
            { key: 'customer', label: 'Customers' },
            { key: 'business_owner', label: 'Owners' },
            { key: 'staff', label: 'Staff' },
            { key: 'delivery_staff', label: 'Riders' },
            { key: 'admin', label: 'Admins' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setSelectedRoleTab(tab.key)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                backgroundColor: selectedRoleTab === tab.key ? '#FFFFFF' : 'transparent',
                color: selectedRoleTab === tab.key ? '#172033' : '#64748B',
                boxShadow: selectedRoleTab === tab.key ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label} ({counts[tab.key] || 0})
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Status:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
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
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Flagged">Flagged</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <AdminTable
        columns={columns}
        data={filteredUsers}
        searchPlaceholder="Search by user name, email, phone, role..."
        searchFilter={(u, q) => {
          return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.phone.includes(q) ||
            u.role.toLowerCase().includes(q)
          );
        }}
      />

      {/* Add User Modal */}
      <AdminModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Platform User Account"
        subtitle="Provision an authorized identity for customer, merchant, or operator"
      >
        <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g. Priya Iyer"
              style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Email Address *
            </label>
            <input
              type="email"
              required
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="user@example.com"
              style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Mobile Phone Number
            </label>
            <input
              type="text"
              value={newUserPhone}
              onChange={(e) => setNewUserPhone(e.target.value)}
              placeholder="+91 98200 00000"
              style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
              Role Authorization *
            </label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              style={{ width: '100%', height: '36px', padding: '0 10px', fontSize: '13px' }}
            >
              <option value="customer">Customer (Storefront browsing & checkout)</option>
              <option value="business_owner">Business Owner (Merchant store manager)</option>
              <option value="staff">Store Staff (Order fulfillment & inventory)</option>
              <option value="delivery_staff">Delivery Staff (Order dispatch & transit)</option>
              <option value="admin">Platform Admin (Full operations console)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
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
              type="submit"
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
              Create Account
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Change Role Modal */}
      <AdminModal
        isOpen={Boolean(selectedUserForRole)}
        onClose={() => setSelectedUserForRole(null)}
        title={`Change Role for ${selectedUserForRole?.name}`}
        subtitle="Platform Access Level Control"
        footer={
          <>
            <button
              type="button"
              onClick={() => setSelectedUserForRole(null)}
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
              onClick={handleChangeRole}
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
              Update Role
            </button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: '13px', color: '#475569', margin: 0 }}>
            Select a new authorization role for this user. Changing their role adjusts their protected route permissions immediately.
          </p>

          <select
            value={newRoleValue}
            onChange={(e) => setNewRoleValue(e.target.value)}
            style={{ width: '100%', height: '38px', padding: '0 10px', fontSize: '13px', borderRadius: '6px' }}
          >
            <option value="customer">customer (Customer Storefront)</option>
            <option value="business_owner">business_owner (Merchant Owner Dashboard)</option>
            <option value="staff">staff (Store Staff Fulfillment)</option>
            <option value="delivery_staff">delivery_staff (Delivery Fleet Partner)</option>
            <option value="admin">admin (Platform Operations Console)</option>
          </select>
        </div>
      </AdminModal>
    </div>
  );
}
