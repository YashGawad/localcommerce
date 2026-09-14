import api from './api';

export const adminService = {
  getUsers: async () => {
    const res = await api.get('/admin/users');
    return res.data?.data || [];
  },

  getSubscriptions: async () => {
    const res = await api.get('/admin/subscriptions');
    return res.data?.data || [];
  },

  getPlatformSettings: async () => {
    const res = await api.get('/admin/platform-settings');
    return res.data?.data?.settings || {};
  },

  updatePlatformSetting: async (key, value) => {
    const res = await api.patch(`/admin/platform-settings/${key}`, { value });
    return res.data?.data;
  },

  getNotifications: async () => {
    const res = await api.get('/admin/notifications');
    return res.data?.data || [];
  },
};

export default adminService;
