import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route guard for public auth pages (/login, /signup, /forgot-password).
 * If the user is already authenticated, redirects them directly to their role destination.
 */
export default function PublicAuthRoute() {
  const { isAuthenticated, currentUser, getRoleDestination, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#64748B' }}>
        <span className="material-symbols-outlined animate-spin" style={{ fontSize: '28px', marginRight: '8px' }}>
          progress_activity
        </span>
        <span>Loading session...</span>
      </div>
    );
  }

  if (isAuthenticated && currentUser) {
    const destination = getRoleDestination(currentUser.role);
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
