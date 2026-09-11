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
  const { isAuthenticated, currentUser, getRoleDestination } = useAuth();
  const location = useLocation();

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
