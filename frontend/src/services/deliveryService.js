import apiClient from './api.js';

export const deliveryService = {
  /**
   * GET /api/delivery/assignments
   * List delivery assignments based on authenticated actor role
   * @param {Object} params - { status, store_id, my_deliveries }
   */
  async getAssignments(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.store_id) query.append('store_id', params.store_id);
    if (params.my_deliveries) query.append('my_deliveries', params.my_deliveries);

    const queryString = query.toString();
    const endpoint = `/api/delivery/assignments${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(endpoint);
    return response.data || [];
  },

  /**
   * GET /api/delivery/assignments/:id
   * Fetch single assignment details
   * @param {string} id - Assignment UUID
   */
  async getAssignmentById(id) {
    const response = await apiClient.get(`/api/delivery/assignments/${id}`);
    return response.data;
  },

  /**
   * PATCH /api/delivery/assignments/:id/status
   * Update delivery assignment status and sync associated order status
   * Transitions:
   * assigned -> out_for_delivery
   * out_for_delivery -> delivered
   * @param {string} id - Assignment UUID
   * @param {string} status - 'out_for_delivery' | 'delivered' | 'failed'
   * @param {string} [failureReason]
   */
  async updateAssignmentStatus(id, status, failureReason = null) {
    const payload = { status };
    if (failureReason) payload.failure_reason = failureReason;

    const response = await apiClient.patch(`/api/delivery/assignments/${id}/status`, payload);
    return response.data;
  },

  /**
   * POST /api/orders/:orderId/delivery-assignment
   * Assign or reassign delivery staff member to an order
   * @param {string} orderId - Order UUID
   * @param {string} deliveryStaffUserId - User UUID of delivery staff member
   */
  async assignDeliveryStaff(orderId, deliveryStaffUserId) {
    const response = await apiClient.post(`/api/orders/${orderId}/delivery-assignment`, {
      delivery_staff_user_id: deliveryStaffUserId,
    });
    return response.data;
  },
};

export default deliveryService;
