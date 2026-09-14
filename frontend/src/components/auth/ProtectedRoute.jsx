import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route protection guard for authenticated application zones.
 * Validates authentication status and checks role authorization.
 *
 * Examples:
 * - Unauthenticated -> /login (with return state)
 * - Customer entering /admin -> /
 * - Delivery staff entering /business -> /delivery
 * - Business owner entering /admin -> /business
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, currentUser, getRoleDestination, loading } = useAuth();
  const location = useLocation();

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

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && currentUser && !allowedRoles.includes(currentUser.role)) {
    // User is authenticated but does not possess required role.
    // Redirect them to their designated role home.
    const destination = getRoleDestination(currentUser.role);
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
