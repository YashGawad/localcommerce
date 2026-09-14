import apiClient from './api.js';

export const staffService = {
  /**
   * GET /api/stores/:storeId/staff
   * Retrieve store staff members
   * @param {string} storeId - Store UUID
   */
  async getStoreStaff(storeId) {
    const response = await apiClient.get(`/api/stores/${storeId}/staff`);
    return response.data || [];
  },

  /**
   * POST /api/stores/:storeId/staff
   * Create/invite new staff member to the store
   * @param {string} storeId - Store UUID
   * @param {Object} staffData - { name, email, phone, role, password }
   */
  async addStoreStaff(storeId, staffData) {
    const response = await apiClient.post(`/api/stores/${storeId}/staff`, staffData);
    return response.data;
  },
};

export default staffService;
