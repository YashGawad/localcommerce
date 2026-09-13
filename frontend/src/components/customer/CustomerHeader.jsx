import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../shared/Logo';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import styles from './CustomerHeader.module.css';

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
      <div className={styles.announcement}>
        <div className={styles.announcementInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.announcementBadge}>
              Local Express
            </span>
            <span className={styles.announcementText}>
              Shop from independent neighbourhood stores across Thane &amp; Mumbai MMR
            </span>
          </div>

          <div className={styles.portalLinks}>
            <Link to="/business" className={styles.portalLink} title="Merchant Portal">
              Merchant Portal
            </Link>
            <span className={styles.portalDivider}>|</span>
            <Link to="/admin" className={styles.portalLink} title="Admin Console">
              Admin
            </Link>
            <span className={styles.portalDivider}>|</span>
            <Link to="/delivery" className={styles.portalLink} title="Delivery Portal">
              Delivery
            </Link>
          </div>
        </div>
      </div>

      {/* Main Consumer Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Logo & Location Pin */}
          <div className={styles.brandLocationGroup}>
            <Logo variant="customer" to="/" />

            <div
              className={styles.locationSelector}
              title="Click to switch delivery area"
            >
              <span className={`material-symbols-outlined ${styles.locationPin}`}>
                location_on
              </span>
              <div className={styles.locationCol}>
                <span className={styles.locationLabel}>
                  Delivering to
                </span>
                <span className={styles.locationAddress}>
                  Panch Pakhadi, Thane
                  <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#64748B' }}>
                    expand_more
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className={`${styles.searchForm} ${styles.searchFormDesktop}`}
          >
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands or stores..."
              className={styles.searchInput}
            />
            <span className={styles.searchKbd}>
              ⌘K
            </span>
          </form>

          {/* User Nav Actions */}
          <div className={styles.actionsGroup}>
            <Link to="/orders" className={styles.navLinkText}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>
                receipt_long
              </span>
              <span>My Orders</span>
            </Link>

            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              className={styles.navLinkText}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>
                person
              </span>
              <span>{isAuthenticated ? (currentUser?.name?.split(' ')[0] || 'Account') : 'Sign In'}</span>
            </Link>

            <Link
              to="/cart"
              className={styles.cartBtn}
              aria-label={`View cart with ${itemCount} items totaling ₹${total}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                shopping_bag
              </span>
              <span>Cart ({itemCount})<span className={styles.cartTotalText}> • ₹{total}</span></span>
            </Link>

            <Link
              to={isAuthenticated ? '/profile' : '/login'}
              className={styles.avatarBadge}
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

        {/* Mobile Search Row (Spans full width for comfortable touch interaction) */}
        <div className={styles.mobileSearchContainer}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, brands or stores..."
              className={styles.searchInput}
            />
          </form>
        </div>
      </header>
    </>
  );
}
