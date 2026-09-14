import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MOCK_CUSTOMER, MOCK_ADDRESSES } from '../../data/customers';
import AddressCard from '../../components/customer/AddressCard';
import addressService from '../../services/addressService';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

/**
 * Screen 6 — Customer Profile & Addresses (/profile)
 * Platform-wide account management and interactive delivery address book.
 * Supports adding, editing, deleting, and setting default address.
 */
export default function ProfilePage() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [customer] = useState(MOCK_CUSTOMER);
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  const displayName = currentUser?.name || customer.name;
  const displayEmail = currentUser?.email || customer.email;
  const displayPhone = currentUser?.phone || customer.phone;
  const displayAvatar = currentUser?.avatar || (displayName ? displayName.split(' ').map((n) => n[0]).join('').slice(0, 2) : 'AT');

  // Address form fields
  const [formType, setFormType] = useState('Home');
  const [formName, setFormName] = useState(displayName);
  const [formPhone, setFormPhone] = useState(displayPhone);
  const [formAddressLine, setFormAddressLine] = useState('');
  const [formArea, setFormArea] = useState('Panch Pakhadi');
  const [formCity, setFormCity] = useState('Thane West');
  const [formPincode, setFormPincode] = useState('400602');
  const [formLandmark, setFormLandmark] = useState('');

  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await addressService.getAddresses();
      if (Array.isArray(data) && data.length > 0) {
        setAddresses(data);
      }
    } catch (err) {
      console.warn('Could not load addresses from server:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      if (!isAuthenticated) return;
      try {
        const data = await addressService.getAddresses();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setAddresses(data);
        }
      } catch (err) {
        console.warn('Could not load addresses from server:', err);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const handleOpenAddForm = () => {
    setEditingAddressId(null);
    setFormType('Home');
    setFormName(displayName);
    setFormPhone(displayPhone);
    setFormAddressLine('');
    setFormArea('Panch Pakhadi');
    setFormCity('Thane West');
    setFormPincode('400602');
    setFormLandmark('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (address) => {
    setEditingAddressId(address.id);
    setFormType(address.type || 'Home');
    setFormName(address.recipientName || address.recipient_name || displayName);
    setFormPhone(address.phone || displayPhone);
    setFormAddressLine(address.addressLine || address.address_line1 || '');
    setFormArea(address.area || address.address_line2 || '');
    setFormCity(address.city || '');
    setFormPincode(address.pincode || address.postal_code || '');
    setFormLandmark(address.landmark || '');
    setIsFormOpen(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (!formAddressLine.trim() || !formName.trim()) return;

    if (isAuthenticated) {
      try {
        if (editingAddressId && isUUID(editingAddressId)) {
          await addressService.updateAddress(editingAddressId, {
            recipient_name: formName,
            phone: formPhone,
            address_line1: formAddressLine,
            address_line2: formArea,
            city: formCity,
            state: 'Maharashtra',
            postal_code: formPincode,
            landmark: formLandmark,
          });
        } else {
          await addressService.createAddress({
            recipient_name: formName,
            phone: formPhone,
            address_line1: formAddressLine,
            address_line2: formArea,
            city: formCity,
            state: 'Maharashtra',
            postal_code: formPincode,
            landmark: formLandmark,
            is_default: addresses.length === 0,
          });
        }
        await fetchAddresses();
        setIsFormOpen(false);
        setEditingAddressId(null);
        return;
      } catch (err) {
        console.error('Failed to save address to server:', err);
      }
    }

    // Local fallback
    if (editingAddressId) {
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingAddressId
            ? {
                ...addr,
                type: formType,
                recipientName: formName,
                phone: formPhone,
                addressLine: formAddressLine,
                area: formArea,
                city: formCity,
                pincode: formPincode,
                landmark: formLandmark,
              }
            : addr
        )
      );
    } else {
      const newAddress = {
        id: `addr_${Date.now()}`,
        type: formType,
        recipientName: formName,
        phone: formPhone,
        addressLine: formAddressLine,
        area: formArea,
        city: formCity,
        pincode: formPincode,
        landmark: formLandmark,
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddress]);
    }

    setIsFormOpen(false);
    setEditingAddressId(null);
  };

  const handleDeleteAddress = async (id) => {
    if (isAuthenticated && isUUID(id)) {
      try {
        await addressService.deleteAddress(id);
        await fetchAddresses();
        return;
      } catch (err) {
        console.error('Failed to delete address on server:', err);
      }
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = async (id) => {
    if (isAuthenticated && isUUID(id)) {
      try {
        await addressService.updateAddress(id, { is_default: true });
        await fetchAddresses();
        return;
      } catch (err) {
        console.error('Failed to set default address on server:', err);
      }
    }
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 64px 16px' }}>
      {/* Top Breadcrumb */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#64748B',
          marginBottom: '20px',
        }}
      >
        <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>
          Home
        </Link>
        <span>/</span>
        <span style={{ color: '#172033', fontWeight: 600 }}>Customer Profile &amp; Addresses</span>
      </nav>

      {/* Two-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left Sidebar: Profile Overview & Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minWidth: 0 }}>
          {/* Profile Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#172554',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {displayAvatar}
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172554', margin: 0 }}>
                  {displayName}
                </h2>
                <span style={{ fontSize: '13px', color: '#64748B', display: 'block' }}>
                  {displayEmail}
                </span>
                <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>
                  {displayPhone}
                </span>
              </div>
            </div>

            <div
              style={{
                paddingTop: '16px',
                borderTop: '1px solid #F1F5F9',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                textAlign: 'center',
              }}
            >
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#172554', display: 'block' }}>
                  {customer.ordersCount}
                </span>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Total Orders
                </span>
              </div>
              <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#2563EB', display: 'block' }}>
                  {customer.loyaltyPoints}
                </span>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                  Local Coins
                </span>
              </div>
            </div>
          </div>

          {/* Account Menu Navigation */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                fontWeight: 600,
                fontSize: '13px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB' }}>
                home_pin
              </span>
              <span>Saved Addresses</span>
            </div>

            <Link
              to="/orders"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                color: '#475569',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '13px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>
                receipt_long
              </span>
              <span>My Orders</span>
            </Link>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                color: '#475569',
                fontSize: '13px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>
                payments
              </span>
              <span>Payment Methods &amp; VPAs</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                color: '#475569',
                fontSize: '13px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>
                support_agent
              </span>
              <span>Help &amp; Customer Support</span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  logout();
                  navigate('/login');
                } else {
                  navigate('/login');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: '8px',
                color: isAuthenticated ? '#DC2626' : '#2563EB',
                backgroundColor: 'transparent',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                borderTop: '1px solid #F1F5F9',
                marginTop: '4px',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: '20px', color: isAuthenticated ? '#DC2626' : '#2563EB' }}
              >
                {isAuthenticated ? 'logout' : 'login'}
              </span>
              <span>{isAuthenticated ? 'Sign Out' : 'Sign In'}</span>
            </button>
          </div>

          {/* Nearby Kiranas Mini-Widget */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Nearby Kiranas (3)
              </span>
              <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600 }}>12–25 mins</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB' }}>
                  storefront
                </span>
                <div>
                  <strong style={{ fontSize: '13px', color: '#172554', display: 'block' }}>
                    Shree Kirana &amp; General Store
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>0.8 km • Panch Pakhadi</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB' }}>
                  storefront
                </span>
                <div>
                  <strong style={{ fontSize: '13px', color: '#172554', display: 'block' }}>
                    Sharma Supermarket
                  </strong>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>1.2 km • Naupada</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content: Addresses & Add/Edit Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 2, minWidth: 0 }}>
          {/* Hyperlocal Serviceability Notice Banner */}
          <div
            style={{
              backgroundColor: '#EFF6FF',
              borderRadius: '12px',
              border: '1px solid #BFDBFE',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#DBEAFE',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                radar
              </span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1E40AF', margin: 0 }}>
                  Hyperlocal Delivery Availability Notice
                </h3>
                <span style={{ fontSize: '10px', padding: '1px 6px', backgroundColor: '#2563EB', color: '#FFFFFF', borderRadius: '4px', fontWeight: 600 }}>
                  Store-Direct
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0, lineHeight: 1.5 }}>
                Your saved addresses discover independent neighborhood stores within delivery radius (0–4 km)
                and determine store-direct pricing and fulfillment SLAs.
              </p>
            </div>
          </div>

          {/* Section Header & Add Address Toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172554', margin: 0 }}>
                Delivery Addresses
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                Manage your saved delivery locations across LocalCommerce.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddForm}
              style={{
                padding: '10px 18px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                add
              </span>
              <span>Add New Delivery Address</span>
            </button>
          </div>

          {/* Inline Add / Edit Address Form Modal/Accordion */}
          {isFormOpen && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '2px solid #2563EB',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#2563EB' }}>
                    add_location_alt
                  </span>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
                    {editingAddressId ? 'Edit Address Details' : 'Enter New Address Details'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    close
                  </span>
                </button>
              </div>

              <form onSubmit={handleSaveAddress} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Type pills */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '8px' }}>
                    Address Type
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['Home', 'Work / Office', 'Parents / Relatives', 'Other'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormType(type)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '999px',
                          border: 'none',
                          backgroundColor: formType === type ? '#2563EB' : '#F1F5F9',
                          color: formType === type ? '#FFFFFF' : '#475569',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name & Phone */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '4px' }}>
                      Contact Person Name *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '4px' }}>
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Address Line */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '4px' }}>
                    Flat / House No. &amp; Building / Street Name *
                  </label>
                  <input
                    type="text"
                    value={formAddressLine}
                    onChange={(e) => setFormAddressLine(e.target.value)}
                    required
                    placeholder="e.g., Flat 402, Shree Ganesh Heights, Ram Maruti Road"
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Area, City, Pincode */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '4px' }}>
                      Area / Locality *
                    </label>
                    <input
                      type="text"
                      value={formArea}
                      onChange={(e) => setFormArea(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '4px' }}>
                      City *
                    </label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '4px' }}>
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={formPincode}
                      onChange={(e) => setFormPincode(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        height: '38px',
                        padding: '0 12px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                {/* Landmark */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '4px' }}>
                    Nearby Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={formLandmark}
                    onChange={(e) => setFormLandmark(e.target.value)}
                    placeholder="e.g., Opposite Saraswati High School Ground"
                    style={{
                      width: '100%',
                      height: '38px',
                      padding: '0 12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                {/* Form Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      color: '#475569',
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
                      backgroundColor: '#2563EB',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {editingAddressId ? 'Save Changes' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Saved Addresses List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                isSelected={address.isDefault}
                onEdit={handleOpenEditForm}
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefault}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
