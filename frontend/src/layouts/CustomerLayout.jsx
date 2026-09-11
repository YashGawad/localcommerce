import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerHeader from '../components/customer/CustomerHeader';
import CustomerFooter from '../components/customer/CustomerFooter';

export default function CustomerLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F6F5F2' }}>
      <CustomerHeader />
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <CustomerFooter />
    </div>
  );
}
