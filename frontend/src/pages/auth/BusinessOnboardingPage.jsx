import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/shared/Logo';

/**
 * Utility to generate a URL-friendly slug from store name
 */
function generateSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function BusinessOnboardingPage() {
  // Account Information State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Store Information State
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [postalCode, setPostalCode] = useState('');

  // UI / Status State
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { registerBusiness } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Account Validations
    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage('Please provide a valid business email address.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    // 2. Store Validations
    if (!storeName.trim()) {
      setErrorMessage('Please enter your store name.');
      return;
    }

    const finalSlug = slug.trim() || generateSlug(storeName);
    if (!finalSlug || !/^[a-z0-9-]+$/.test(finalSlug)) {
      setErrorMessage('Store slug can only contain lowercase letters, numbers, and hyphens.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await registerBusiness({
        name,
        email,
        phone,
        password,
        store: {
          name: storeName,
          slug: finalSlug,
          description,
          phone: phone || null,
          email: email || null,
          address,
          city,
          state,
          postal_code: postalCode,
        },
      });

      if (!result.success) {
        setErrorMessage(result.error || 'Registration failed. Please verify your details.');
        setIsSubmitting(false);
        return;
      }

      // Store selected store ID in localStorage so when /business mounts, it is automatically selected
      if (result.store?.id && typeof localStorage !== 'undefined') {
        localStorage.setItem('localcommerce_selected_store_id', result.store.id);
      }

      // Navigate to business dashboard
      navigate('/business', { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during onboarding.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Security / Badge Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 4px',
          fontSize: '11px',
          fontWeight: 600,
          color: '#64748B',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#2563EB',
              display: 'inline-block',
            }}
          />
          <span>Business Merchant Onboarding</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748B' }}>
            store
          </span>
          <span>Instant Activation</span>
        </div>
      </div>

      {/* Main Form Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          padding: '28px 24px',
        }}
      >
        {/* Brand & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            <Logo variant="business" to="/business/onboarding" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
            Create Your Business Store
          </h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>
            Set up your merchant account and launch your storefront in minutes.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            style={{
              marginBottom: '20px',
              padding: '12px 14px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '13px',
              color: '#991B1B',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '18px', color: '#DC2626', flexShrink: 0, marginTop: '1px' }}
            >
              error
            </span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* SECTION 1: MERCHANT ACCOUNT DETAILS */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
                paddingBottom: '6px',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
                badge
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                1. Owner Account Details
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="onboarding-name"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
                >
                  Full Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="onboarding-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* Email Address */}
              <div>
                <label
                  htmlFor="onboarding-email"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
                >
                  Business Email <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="onboarding-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh@apexstore.com"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label
                  htmlFor="onboarding-phone"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
                >
                  Phone Number
                </label>
                <input
                  id="onboarding-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* Password & Confirm Password */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label
                      htmlFor="onboarding-password"
                      style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}
                    >
                      Password <span style={{ color: '#EF4444' }}>*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '11px',
                        color: '#2563EB',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <input
                    id="onboarding-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                <div>
                  <label
                    htmlFor="onboarding-confirm-password"
                    style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
                  >
                    Confirm <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    id="onboarding-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: STORE PROFILE */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '12px',
                paddingBottom: '6px',
                borderBottom: '1px solid #F1F5F9',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
                storefront
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                2. Store Information
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Store Name */}
              <div>
                <label
                  htmlFor="onboarding-store-name"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
                >
                  Store Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  id="onboarding-store-name"
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setStoreName(val);
                    if (!slugManuallyEdited) {
                      setSlug(generateSlug(val));
                    }
                  }}
                  placeholder="e.g. Apex Supermarket"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* Store Slug / URL Handle */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label
                    htmlFor="onboarding-store-slug"
                    style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}
                  >
                    Store URL Handle <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    auto-generated
                  </span>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '10px',
                      fontSize: '12px',
                      color: '#94A3B8',
                      pointerEvents: 'none',
                      userSelect: 'none',
                    }}
                  >
                    store/
                  </span>
                  <input
                    id="onboarding-store-slug"
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value.toLowerCase());
                      setSlugManuallyEdited(true);
                    }}
                    placeholder="apex-supermarket"
                    style={{
                      ...inputStyle,
                      paddingLeft: '50px',
                      fontFamily: 'monospace',
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                  Customers will visit: <span style={{ color: '#2563EB', fontWeight: 500 }}>localcommerce.com/store/{slug || 'your-store'}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="onboarding-store-desc"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
                >
                  Description (Optional)
                </label>
                <textarea
                  id="onboarding-store-desc"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fresh organic produce, groceries, and daily essentials..."
                  style={{
                    ...inputStyle,
                    height: 'auto',
                    padding: '8px 12px',
                    resize: 'vertical',
                  }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* Address */}
              <div>
                <label
                  htmlFor="onboarding-store-address"
                  style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
                >
                  Store Address
                </label>
                <input
                  id="onboarding-store-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop No. 4, MG Road"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />
              </div>

              {/* City, State, Postal Code */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <div>
                  <label
                    htmlFor="onboarding-store-city"
                    style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
                  >
                    City
                  </label>
                  <input
                    id="onboarding-store-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Mumbai"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                <div>
                  <label
                    htmlFor="onboarding-store-state"
                    style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
                  >
                    State
                  </label>
                  <input
                    id="onboarding-store-state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Maharashtra"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                <div>
                  <label
                    htmlFor="onboarding-store-postal"
                    style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}
                  >
                    PIN Code
                  </label>
                  <input
                    id="onboarding-store-postal"
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="400001"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              height: '46px',
              backgroundColor: isSubmitting ? '#93C5FD' : '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
              marginTop: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting) e.currentTarget.style.backgroundColor = '#1D4ED8';
            }}
            onMouseLeave={(e) => {
              if (!isSubmitting) e.currentTarget.style.backgroundColor = '#2563EB';
            }}
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: '18px' }}>
                  progress_activity
                </span>
                <span>Creating Your Store...</span>
              </>
            ) : (
              <>
                <span>Launch Business Store</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div
          style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '13px',
            color: '#64748B',
          }}
        >
          Already have a business account?{' '}
          <Link to="/login" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

// Consistent Form Input Styling Tokens
const inputStyle = {
  width: '100%',
  height: '38px',
  padding: '0 12px',
  backgroundColor: '#F8FAFC',
  border: '1px solid #E2E8F0',
  borderRadius: '6px',
  fontSize: '13px',
  color: '#172033',
  outline: 'none',
  transition: 'all 0.15s ease',
  boxSizing: 'border-box',
};

const handleFocus = (e) => {
  e.target.style.borderColor = '#2563EB';
  e.target.style.backgroundColor = '#FFFFFF';
  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
};

const handleBlur = (e) => {
  e.target.style.borderColor = '#E2E8F0';
  e.target.style.backgroundColor = '#F8FAFC';
  e.target.style.boxShadow = 'none';
};
