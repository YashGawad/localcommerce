const pool = require('../config/db');

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (id) => typeof id === 'string' && UUID_REGEX.test(id);

/**
 * Middleware: requireStoreRole(...allowedRoles, [options])
 * Verifies that the store exists and the authenticated user possesses an authorized
 * role (e.g. 'owner', 'manager') in store_users for the target store.
 *
 * If options.allowAdmin is true, platform admin (req.user.role === 'admin')
 * is also permitted.
 */
const requireStoreRole = (...args) => {
  let allowedRoles = [];
  let allowAdmin = false;

  if (args.length > 0 && typeof args[args.length - 1] === 'object' && !Array.isArray(args[args.length - 1])) {
    const opts = args.pop();
    if (opts.allowAdmin) {
      allowAdmin = true;
    }
  }

  allowedRoles = args.flat().map((r) => r.toLowerCase());

  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Platform admin check if explicitly enabled
    if (allowAdmin && req.user.role && req.user.role.toLowerCase() === 'admin') {
      const targetStoreId = req.params.storeId || req.params.id || req.body?.store_id;
      if (targetStoreId && isValidUUID(targetStoreId)) {
        // Also verify store exists even for admin
        const storeCheck = await pool.query('SELECT id FROM stores WHERE id = $1', [targetStoreId]);
        if (storeCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'Store not found.',
          });
        }
      }

      req.storeMembership = {
        store_id: targetStoreId || null,
        role: 'admin',
      };
      return next();
    }

    // Determine target storeId from params or body
    const targetStoreId = req.params.storeId || req.params.id || req.body?.store_id;

    if (!targetStoreId || !isValidUUID(targetStoreId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid store ID is required.',
      });
    }

    try {
      // 1. Verify store exists
      const storeRes = await pool.query('SELECT id FROM stores WHERE id = $1', [targetStoreId]);
      if (storeRes.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Store not found.',
        });
      }

      // 2. Query store membership from store_users
      const membershipRes = await pool.query(
        `
        SELECT role
        FROM store_users
        WHERE store_id = $1 AND user_id = $2;
        `,
        [targetStoreId, req.user.id]
      );

      if (membershipRes.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. You do not have access to this store.',
        });
      }

      const userStoreRole = (membershipRes.rows[0].role || '').toLowerCase();

      if (!allowedRoles.includes(userStoreRole)) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. Insufficient store permissions for this action.',
        });
      }

      // Attach verified membership context to request
      req.storeMembership = {
        store_id: targetStoreId,
        role: userStoreRole,
      };

      return next();
    } catch (error) {
      console.error('Store authorization error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server authorization error.',
      });
    }
  };
};

module.exports = {
  requireStoreRole,
};
