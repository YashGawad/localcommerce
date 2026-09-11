import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../shared/Logo';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function CustomerHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const { itemCount, total } = useCart();
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <>
      {/* Top Announcement Bar */}
      <div
        style={{
          backgroundColor: '#172554',
          color: '#FFFFFF',
          fontSize: '12px',
          padding: '6px 16px',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                padding: '1px 6px',
                borderRadius: '3px',
              }}
            >
              Local Express
            </span>
            <span style={{ color: '#E2E8F0' }}>
              Shop from independent neighbourhood stores across Thane &amp; Mumbai MMR
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#CBD5E1' }}>
            <Link
              to="/business"
              style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 500 }}
              title="Merchant Portal"
            >
              Merchant Portal
            </Link>
            <span style={{ color: '#475569' }}>|</span>
            <Link
              to="/admin"
              style={{ color: '#CBD5E1', textDecoration: 'none' }}
              title="Admin Console"
            >
              Admin
            </Link>
            <span style={{ color: '#475569' }}>|</span>
            <Link
              to="/delivery"
              style={{ color: '#CBD5E1', textDecoration: 'none' }}
              title="Delivery Portal"
            >
              Delivery
            </Link>
          </div>
        </div>
      </div>

      {/* Main Consumer Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
          {/* Logo & Location Pin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexShrink: 0 }}>
            <Logo variant="customer" to="/" />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 10px',
                backgroundColor: '#F6F5F2',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
              title="Click to switch delivery area"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
                location_on
              </span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 500, lineHeight: 1 }}>
                  Delivering to
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#172033',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    marginTop: '2px',
                  }}
                >
                  Panch Pakhadi, Thane (400602)
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748B' }}>
                    expand_more
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              flex: 1,
              maxWidth: '560px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '12px',
                color: '#64748B',
                fontSize: '18px',
                pointerEvents: 'none',
              }}
            >
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands or stores..."
              style={{
                width: '100%',
                height: '38px',
                padding: '0 44px 0 38px',
                backgroundColor: '#F6F5F2',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#172033',
              }}
            />
            <span
              style={{
                position: 'absolute',
                right: '10px',
                fontSize: '10px',
                fontWeight: 600,
                color: '#64748B',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '4px',
                padding: '2px 5px',
                boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
                userSelect: 'none',
              }}
            >
              ⌘K
            </span>
          </form>

          {/* User Nav Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <Link
              to="/orders"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#172033',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>
                receipt_long
              </span>
              <span>My Orders</span>
            </Link>

            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#172033',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>
                person
              </span>
              <span>{isAuthenticated ? (currentUser?.name?.split(' ')[0] || 'Account') : 'Sign In'}</span>
            </Link>

            <Link
              to="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#2563EB',
                borderRadius: '6px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                textDecoration: 'none',
                transition: 'background-color 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                shopping_bag
              </span>
              <span>Cart ({itemCount}) • ₹{total}</span>
            </Link>

            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#172554',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                fontSize: '11px',
                fontWeight: 700,
              }}
              title={isAuthenticated ? 'View Profile' : 'Sign In'}
            >
              {isAuthenticated && currentUser?.avatar ? (
                currentUser.avatar
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  person
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
