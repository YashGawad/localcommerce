import { Outlet, Link } from 'react-router-dom';
import Logo from '../components/shared/Logo';

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8F9FF',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Top Header */}
      <header
        style={{
          height: '64px',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            height: '100%',
            margin: '0 auto',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Logo variant="customer" to="/" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link
              to="/"
              style={{
                fontSize: '13px',
                color: '#64748B',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                storefront
              </span>
              <span>Browse Marketplace</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 16px',
          position: 'relative',
        }}
      >
        {/* Subtle background glow effect from Stitch */}
        <div
          style={{
            position: 'absolute',
            width: '560px',
            height: '560px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(219, 234, 254, 0.5) 0%, rgba(248, 249, 255, 0) 70%)',
            pointerEvents: 'none',
            zIndex: 0,
            transform: 'translateY(-20px)',
          }}
        />

        <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>
          <Outlet />
        </div>
      </main>

      {/* Trust & Compliance Footer */}
      <footer
        style={{
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          padding: '16px',
          fontSize: '12px',
          color: '#64748B',
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#10B981' }}>
              lock
            </span>
            <span>256-Bit TLS Encrypted Auth</span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span>&copy; {new Date().getFullYear()} LocalCommerce Inc.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#2563EB' }}>
                verified_user
              </span>
              <span>PCI-DSS Level 1</span>
            </span>
            <span style={{ color: '#CBD5E1' }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#2563EB' }}>
                gpp_good
              </span>
              <span>SOC 2 Type II</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
