/**
 * Role Authorization Middleware
 * Verifies that the authenticated user has one of the allowed roles.
 * Returns HTTP 403 Forbidden if permissions are insufficient.
 */
const requireRole = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userRole = (req.user.role || '').toLowerCase();

    // Check user's primary role
    if (normalizedAllowed.includes(userRole)) {
      return next();
    }

    // Check store-specific roles if present
    const hasStoreRole = (req.user.store_roles || []).some((sr) =>
      normalizedAllowed.includes((sr.role || '').toLowerCase())
    );

    if (hasStoreRole) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Forbidden. Insufficient permissions to access this resource.',
    });
  };
};

module.exports = {
  requireRole,
};
