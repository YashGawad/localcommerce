import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route guard for public auth pages (/login, /signup, /forgot-password).
 * If the user is already authenticated, redirects them directly to their role destination.
 */
export default function PublicAuthRoute() {
  const { isAuthenticated, currentUser, getRoleDestination } = useAuth();

  if (isAuthenticated && currentUser) {
    const destination = getRoleDestination(currentUser.role);
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}
