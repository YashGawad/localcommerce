import apiClient from './api.js';

/**
 * Address Service
 * Manages customer saved delivery addresses.
 */
export const addressService = {
  /**
   * GET /api/customers/me/addresses
   * List all saved addresses for authenticated customer
   */
  async getAddresses() {
    const response = await apiClient.get('/api/customers/me/addresses');
    return response.data || [];
  },

  /**
   * POST /api/customers/me/addresses
   * Create a new address for authenticated customer
   * @param {Object} payload - { label, recipient_name, phone, address_line1, address_line2, city, state, postal_code, is_default }
   */
  async createAddress(payload) {
    const response = await apiClient.post('/api/customers/me/addresses', payload);
    return response.data;
  },

  /**
   * PATCH /api/customers/me/addresses/:id
   * Update existing address
   */
  async updateAddress(id, payload) {
    const response = await apiClient.patch(`/api/customers/me/addresses/${id}`, payload);
    return response.data;
  },

  /**
   * DELETE /api/customers/me/addresses/:id
   * Delete existing address
   */
  async deleteAddress(id) {
    const response = await apiClient.delete(`/api/customers/me/addresses/${id}`);
    return response.data;
  },
};

export default addressService;
