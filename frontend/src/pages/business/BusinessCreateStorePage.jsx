import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCatalog } from '../../context/CatalogContext';
import { storeService } from '../../services/storeService';
import Button from '../../components/shared/Button';

function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function BusinessCreateStorePage() {
  const { currentUser, refreshCurrentUser } = useAuth();
  const { reloadStores } = useCatalog();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [postalCode, setPostalCode] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Store name is required.');
      return;
    }

    const finalSlug = slug.trim() || generateSlug(name);
    if (!finalSlug || !/^[a-z0-9-]+$/.test(finalSlug)) {
      setErrorMessage('Store URL slug can only contain lowercase letters, numbers, and hyphens.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newStore = await storeService.createStore({
        name: name.trim(),
        slug: finalSlug,
        description: description.trim() || null,
        phone: phone.trim() || null,
        email: email.trim().toLowerCase() || null,
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || 'Maharashtra',
        postal_code: postalCode.trim() || null,
        status: 'active',
      });

      // 1. Refresh current user in AuthContext to include new store in store_roles
      if (refreshCurrentUser) {
        await refreshCurrentUser();
      }

      // 2. Reload stores in CatalogContext and automatically switch to newly created store
      if (reloadStores) {
        await reloadStores(newStore.id);
      }

      // 3. Navigate back to business dashboard
      navigate('/business');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create store. Please try again.';
      setErrorMessage(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header & Breadcrumb */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/business"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 500,
            color: '#64748B',
            textDecoration: 'none',
            marginBottom: '12px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_back
          </span>
          Back to Dashboard
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              add_business
            </span>
          </div>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Create New Store Branch
            </h1>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>
              Register a new storefront under your merchant account.
            </p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div
          role="alert"
          style={{
            marginBottom: '20px',
            padding: '12px 16px',
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            color: '#991B1B',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#DC2626' }}>
            error
          </span>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Creation Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '28px',
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Store Name */}
          <div>
            <label
              htmlFor="create-store-name"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}
            >
              Store Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              id="create-store-name"
              type="text"
              required
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                if (!slugManuallyEdited) {
                  setSlug(generateSlug(val));
                }
              }}
              placeholder="e.g. Apex Electronics - Bandra Branch"
              style={inputStyle}
            />
          </div>

          {/* Store Slug / URL Handle */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label
                htmlFor="create-store-slug"
                style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}
              >
                Store URL Handle <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <span style={{ fontSize: '11px', color: '#64748B' }}>auto-generated</span>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  fontSize: '13px',
                  color: '#94A3B8',
                  pointerEvents: 'none',
                }}
              >
                store/
              </span>
              <input
                id="create-store-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value.toLowerCase());
                  setSlugManuallyEdited(true);
                }}
                placeholder="apex-bandra"
                style={{
                  ...inputStyle,
                  paddingLeft: '56px',
                  fontFamily: 'monospace',
                }}
              />
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0' }}>
              Customer link: <span style={{ color: '#2563EB', fontWeight: 500 }}>localcommerce.com/store/{slug || 'store-handle'}</span>
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="create-store-desc"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}
            >
              Description (Optional)
            </label>
            <textarea
              id="create-store-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief summary of products and services offered at this location..."
              style={{
                ...inputStyle,
                height: 'auto',
                padding: '10px 12px',
                resize: 'vertical',
              }}
            />
          </div>

          {/* Contact Details (Phone & Email) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label
                htmlFor="create-store-phone"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}
              >
                Store Contact Phone
              </label>
              <input
                id="create-store-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="create-store-email"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}
              >
                Store Contact Email
              </label>
              <input
                id="create-store-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="store@domain.com"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Location Details */}
          <div>
            <label
              htmlFor="create-store-address"
              style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}
            >
              Street Address
            </label>
            <input
              id="create-store-address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Shop No. 12, High Street"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div>
              <label
                htmlFor="create-store-city"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}
              >
                City
              </label>
              <input
                id="create-store-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Mumbai"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="create-store-state"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}
              >
                State
              </label>
              <input
                id="create-store-state"
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Maharashtra"
                style={inputStyle}
              />
            </div>

            <div>
              <label
                htmlFor="create-store-pin"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1E293B', marginBottom: '6px' }}
              >
                PIN Code
              </label>
              <input
                id="create-store-pin"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="400050"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #F1F5F9',
              marginTop: '8px',
            }}
          >
            <Link
              to="/business"
              style={{
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#64748B',
                textDecoration: 'none',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
              }}
            >
              Cancel
            </Link>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Store...' : 'Create & Open Store'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  height: '40px',
  padding: '0 14px',
  backgroundColor: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '8px',
  fontSize: '13px',
  color: '#172033',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  boxSizing: 'border-box',
};
