const pool = require('../config/db');

/**
 * GET /api/admin/users
 * Returns list of platform users (password_hash excluded), with their store affiliations.
 * Authorized: Platform Admin only.
 */
async function getUsers(req, res) {
  try {
    const usersResult = await pool.query(
      `SELECT id, name, email, phone, role, status, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    const storeUsersResult = await pool.query(
      `SELECT su.user_id, su.store_id, su.role AS store_role, s.name AS store_name
       FROM store_users su
       JOIN stores s ON su.store_id = s.id`
    );

    const storeUserMap = new Map();
    storeUsersResult.rows.forEach((su) => {
      if (!storeUserMap.has(su.user_id)) {
        storeUserMap.set(su.user_id, []);
      }
      storeUserMap.get(su.user_id).push({
        storeId: su.store_id,
        storeName: su.store_name,
        role: su.store_role,
      });
    });

    const formattedUsers = usersResult.rows.map((u) => {
      const affiliations = storeUserMap.get(u.id) || [];
      const primaryAffiliation = affiliations[0] || null;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || '',
        role: u.role,
        status: u.status ? u.status.charAt(0).toUpperCase() + u.status.slice(1) : 'Active',
        joinedDate: u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recent',
        lastActive: 'Active recently',
        storeName: primaryAffiliation ? primaryAffiliation.storeName : null,
        storeId: primaryAffiliation ? primaryAffiliation.storeId : null,
        storeAffiliations: affiliations,
        avatar: (u.name || 'U')
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase(),
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    console.error('Admin getUsers error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users' });
  }
}

/**
 * GET /api/admin/subscriptions
 * Returns store subscriptions joined with subscription plans and store details.
 * Authorized: Platform Admin only.
 */
async function getSubscriptions(req, res) {
  try {
    const result = await pool.query(
      `SELECT ss.id, ss.store_id, ss.plan_id, ss.status, ss.billing_cycle, ss.starts_at, ss.ends_at,
              ss.created_at, ss.updated_at,
              sp.name AS plan_name, sp.monthly_price, sp.annual_price, sp.max_products, sp.max_staff,
              sp.analytics_enabled, sp.custom_domain_enabled,
              s.name AS store_name
       FROM store_subscriptions ss
       JOIN subscription_plans sp ON ss.plan_id = sp.id
       JOIN stores s ON ss.store_id = s.id
       ORDER BY ss.created_at DESC`
    );

    const formatted = result.rows.map((sub) => ({
      id: sub.id,
      storeId: sub.store_id,
      storeName: sub.store_name,
      planId: sub.plan_id,
      planName: sub.plan_name,
      status: sub.status ? sub.status.charAt(0).toUpperCase() + sub.status.slice(1) : 'Active',
      billingCycle: sub.billing_cycle ? sub.billing_cycle.charAt(0).toUpperCase() + sub.billing_cycle.slice(1) : 'Monthly',
      amount: sub.billing_cycle === 'annual' ? Number(sub.annual_price) : Number(sub.monthly_price),
      listingsLimit: sub.max_products,
      renewalDate: sub.ends_at ? new Date(sub.ends_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Ongoing',
      startsAt: sub.starts_at,
      endsAt: sub.ends_at,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Admin getSubscriptions error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve subscriptions' });
  }
}

/**
 * GET /api/admin/platform-settings
 * Returns platform settings key-value entries.
 * Authorized: Platform Admin only.
 */
async function getPlatformSettings(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, setting_key, setting_value, description, updated_at
       FROM platform_settings
       ORDER BY setting_key ASC`
    );

    const settingsObj = {};
    result.rows.forEach((r) => {
      settingsObj[r.setting_key] = r.setting_value;
    });

    return res.status(200).json({
      success: true,
      data: {
        raw: result.rows,
        settings: settingsObj,
      },
    });
  } catch (error) {
    console.error('Admin getPlatformSettings error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve platform settings' });
  }
}

/**
 * PATCH /api/admin/platform-settings/:key
 * Updates a platform setting by setting_key.
 * Authorized: Platform Admin only.
 */
async function updatePlatformSetting(req, res) {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ success: false, message: 'Value is required' });
    }

    const result = await pool.query(
      `UPDATE platform_settings
       SET setting_value = $1, updated_at = NOW()
       WHERE setting_key = $2
       RETURNING *`,
      [JSON.stringify(value), key]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: `Setting "${key}" not found` });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Admin updatePlatformSetting error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update setting' });
  }
}

/**
 * GET /api/admin/notifications
 * Returns platform notifications.
 * Authorized: Platform Admin only.
 */
async function getNotifications(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, store_id, user_id, type, title, message, read_at, created_at
       FROM notifications
       ORDER BY created_at DESC`
    );

    const formatted = result.rows.map((n) => ({
      id: n.id,
      storeId: n.store_id,
      userId: n.user_id,
      type: n.type || 'system',
      title: n.title,
      message: n.message,
      isRead: Boolean(n.read_at),
      timestamp: n.created_at ? new Date(n.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Recent',
      severity: n.type === 'low_stock' ? 'warning' : 'info',
      actionUrl: '/admin',
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Admin getNotifications error:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
  }
}

module.exports = {
  getUsers,
  getSubscriptions,
  getPlatformSettings,
  updatePlatformSetting,
  getNotifications,
};
