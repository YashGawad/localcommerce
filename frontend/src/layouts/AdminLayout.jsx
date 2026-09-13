import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';
import { CatalogProvider } from '../context/CatalogContext';
import { OperationsProvider } from '../context/OperationsContext';
import { AdminProvider } from '../context/AdminContext';
import styles from './AdminLayout.module.css';

export default function AdminLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <CatalogProvider>
      <OperationsProvider>
        <AdminProvider>
          <div className={styles.container}>
            {/* Permanent Compact Admin Sidebar on Desktop; Toggleable Drawer on Mobile */}
            <div className={styles.sidebarContainer}>
              <AdminSidebar
                isOpen={mobileNavOpen}
                onClose={() => setMobileNavOpen(false)}
              />
            </div>

            {/* Main Content Area */}
            <div className={styles.mainArea}>
              <AdminHeader onToggleSidebar={() => setMobileNavOpen((prev) => !prev)} />
              <main className={styles.mainContent}>
                <Outlet />
              </main>
            </div>
          </div>
        </AdminProvider>
      </OperationsProvider>
    </CatalogProvider>
  );
}
