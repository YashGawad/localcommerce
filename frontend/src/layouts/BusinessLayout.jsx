import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import BusinessHeader from '../components/business/BusinessHeader';
import BusinessNavDrawer from '../components/business/BusinessNavDrawer';

export default function BusinessLayout() {
  const [isNavOpen, setIsNavOpen] = useState(false);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FF' }}>
      {/* Top Header with Hamburger, Logo, Store Switcher, Status, Profile */}
      <BusinessHeader onOpenNav={() => setIsNavOpen(true)} />

      {/* Slide-out Navigation Drawer containing full application menu */}
      <BusinessNavDrawer isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '24px 16px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
