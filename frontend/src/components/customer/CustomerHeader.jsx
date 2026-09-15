import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from '../shared/Logo';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import styles from './CustomerHeader.module.css';

export default function CustomerHeader() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const accountMenuRef = useRef(null);

  const { itemCount, total } = useCart();
  const { currentUser, isAuthenticated, logout } = useAuth();

  // Close menus on route navigation
  const [prevPath, setPrevPath] = useState(location.pathname);
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsAccountMenuOpen(false);
    setIsDrawerOpen(false);
  }

  // Click-outside listener for account dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    }
    if (isAccountMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAccountMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsAccountMenuOpen(false);
    setIsDrawerOpen(false);
    navigate('/');
  };

  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'CU';

  return (
    <>
      {/* Top Announcement Bar (Hidden on Mobile) */}
      <div className={styles.announcement}>
        <div className={styles.announcementInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={styles.announcementBadge}>Local Express</span>
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
          {/* Left Group: Mobile Hamburger + Logo + Location */}
          <div className={styles.brandLocationGroup}>
            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className={styles.mobileHamburgerBtn}
              aria-label="Open navigation menu"
              title="Open Navigation"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>

            <Logo variant="customer" to="/" />

            {/* Location Selector (Compact on mobile) */}
            <div className={styles.locationSelector} title="Click to switch delivery area">
              <span className={`material-symbols-outlined ${styles.locationPin}`}>
                location_on
              </span>
              <div className={styles.locationCol}>
                <span className={styles.locationLabel}>Delivering to</span>
                <span className={styles.locationAddress}>
                  <span className={styles.locationCity}>Panch Pakhadi, Thane</span>
                  <span className={`material-symbols-outlined ${styles.locationChevron}`}>
                    expand_more
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className={`${styles.searchForm} ${styles.searchFormDesktop}`}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for products, brands or stores..."
              className={styles.searchInput}
            />
            <span className={styles.searchKbd}>⌘K</span>
          </form>

          {/* User Nav Actions */}
          <div className={styles.actionsGroup}>
            {/* Desktop-only Orders Link */}
            <Link to="/orders" className={styles.navLinkText}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>
                receipt_long
              </span>
              <span>My Orders</span>
            </Link>

            {/* Desktop-only Sign In / Account Text Link */}
            {!isAuthenticated && (
              <Link to="/login" className={styles.navLinkText}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#64748B' }}>
                  person
                </span>
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Button (Always visible) */}
            <Link
              to="/cart"
              className={styles.cartBtn}
              aria-label={`View cart with ${itemCount} items totaling ₹${total}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                shopping_bag
              </span>
              <span className={styles.cartBtnText}>Cart ({itemCount})</span>
              <span className={styles.cartBadge}>{itemCount}</span>
              <span className={styles.cartTotalText}> • ₹{total}</span>
            </Link>

            {/* Account / Profile Icon Button with Dropdown Menu */}
            <div className={styles.accountMenuContainer} ref={accountMenuRef}>
              <button
                type="button"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className={styles.avatarBadge}
                title={isAuthenticated ? 'Account & Profile' : 'Sign In'}
                aria-label="Account menu"
                aria-expanded={isAccountMenuOpen}
              >
                {isAuthenticated ? (
                  currentUser?.avatar ? currentUser.avatar : userInitials
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                    person
                  </span>
                )}
              </button>

              {/* Account Dropdown Menu (Accessible on desktop and mobile) */}
              {isAccountMenuOpen && (
                <div className={styles.accountDropdown}>
                  {isAuthenticated ? (
                    <>
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownUserAvatar}>
                          {currentUser?.avatar || userInitials}
                        </div>
                        <div className={styles.dropdownUserInfo}>
                          <span className={styles.dropdownUserName}>
                            {currentUser?.name || 'Customer'}
                          </span>
                          <span className={styles.dropdownUserSub}>
                            {currentUser?.email || currentUser?.phone || 'Customer Account'}
                          </span>
                        </div>
                      </div>

                      <div className={styles.dropdownSection}>
                        <Link
                          to="/profile"
                          className={styles.dropdownItem}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined">person</span>
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/orders"
                          className={styles.dropdownItem}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined">receipt_long</span>
                          <span>My Orders</span>
                        </Link>
                        <Link
                          to="/profile"
                          className={styles.dropdownItem}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined">home_pin</span>
                          <span>Saved Addresses</span>
                        </Link>
                      </div>

                      <div className={styles.dropdownDivider} />

                      <div className={styles.dropdownSectionTitle}>Portals</div>
                      <div className={styles.dropdownSection}>
                        <Link
                          to="/business"
                          className={styles.dropdownItem}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined">storefront</span>
                          <span>Merchant Portal</span>
                        </Link>
                        <Link
                          to="/delivery"
                          className={styles.dropdownItem}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined">two_wheeler</span>
                          <span>Delivery Portal</span>
                        </Link>
                        <Link
                          to="/admin"
                          className={styles.dropdownItem}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined">admin_panel_settings</span>
                          <span>Admin Console</span>
                        </Link>
                      </div>

                      <div className={styles.dropdownDivider} />

                      {/* Primary Mobile Logout Button */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className={`${styles.dropdownItem} ${styles.dropdownLogoutItem}`}
                      >
                        <span className="material-symbols-outlined">logout</span>
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownUserInfo}>
                          <span className={styles.dropdownUserName}>Welcome to LocalCommerce</span>
                          <span className={styles.dropdownUserSub}>Sign in to track orders and save addresses</span>
                        </div>
                      </div>

                      <div className={styles.dropdownSection}>
                        <Link
                          to="/login"
                          className={styles.dropdownSignInBtn}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          Sign In / Register
                        </Link>
                      </div>

                      <div className={styles.dropdownDivider} />

                      <div className={styles.dropdownSectionTitle}>Portals</div>
                      <div className={styles.dropdownSection}>
                        <Link
                          to="/business"
                          className={styles.dropdownItem}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined">storefront</span>
                          <span>Merchant Portal</span>
                        </Link>
                        <Link
                          to="/delivery"
                          className={styles.dropdownItem}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined">two_wheeler</span>
                          <span>Delivery Portal</span>
                        </Link>
                        <Link
                          to="/admin"
                          className={styles.dropdownItem}
                          onClick={() => setIsAccountMenuOpen(false)}
                        >
                          <span className="material-symbols-outlined">admin_panel_settings</span>
                          <span>Admin Console</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Row */}
        <div className={styles.mobileSearchContainer}>
          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, stores, essentials..."
              className={styles.searchInput}
            />
          </form>
        </div>
      </header>

      {/* Customer Mobile Navigation Drawer */}
      {isDrawerOpen && (
        <div className={styles.drawerOverlay} onClick={() => setIsDrawerOpen(false)}>
          <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <Logo variant="customer" to="/" />
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className={styles.drawerCloseBtn}
                aria-label="Close navigation"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* User State in Drawer */}
            <div className={styles.drawerUserSection}>
              {isAuthenticated ? (
                <div className={styles.drawerUserProfile}>
                  <div className={styles.dropdownUserAvatar}>
                    {currentUser?.avatar || userInitials}
                  </div>
                  <div>
                    <div className={styles.drawerUserName}>{currentUser?.name || 'Customer'}</div>
                    <div className={styles.drawerUserEmail}>{currentUser?.email || currentUser?.phone}</div>
                  </div>
                </div>
              ) : (
                <Link to="/login" className={styles.drawerLoginBtn}>
                  <span className="material-symbols-outlined">login</span>
                  <span>Sign In or Register</span>
                </Link>
              )}
            </div>

            {/* Navigation Links */}
            <div className={styles.drawerNavList}>
              <div className={styles.drawerSectionLabel}>Explore</div>
              <Link to="/" className={styles.drawerNavItem}>
                <span className="material-symbols-outlined">home</span>
                <span>Home</span>
              </Link>
              <Link to="/search" className={styles.drawerNavItem}>
                <span className="material-symbols-outlined">search</span>
                <span>Search Products &amp; Stores</span>
              </Link>
              <Link to="/cart" className={styles.drawerNavItem}>
                <span className="material-symbols-outlined">shopping_bag</span>
                <span>Shopping Cart ({itemCount})</span>
              </Link>

              <div className={styles.drawerSectionLabel}>My Account</div>
              <Link to="/orders" className={styles.drawerNavItem}>
                <span className="material-symbols-outlined">receipt_long</span>
                <span>My Orders</span>
              </Link>
              <Link to="/profile" className={styles.drawerNavItem}>
                <span className="material-symbols-outlined">person</span>
                <span>Profile &amp; Addresses</span>
              </Link>

              <div className={styles.drawerSectionLabel}>Portals</div>
              <Link to="/business" className={styles.drawerNavItem}>
                <span className="material-symbols-outlined">storefront</span>
                <span>Merchant Portal</span>
              </Link>
              <Link to="/delivery" className={styles.drawerNavItem}>
                <span className="material-symbols-outlined">two_wheeler</span>
                <span>Delivery Partner App</span>
              </Link>
              <Link to="/admin" className={styles.drawerNavItem}>
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span>Admin Console</span>
              </Link>
            </div>

            {/* Drawer Logout button */}
            {isAuthenticated && (
              <div className={styles.drawerFooter}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={styles.drawerLogoutBtn}
                >
                  <span className="material-symbols-outlined">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
