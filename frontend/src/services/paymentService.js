import apiClient from './api.js';

/**
 * Payment Service
 * Handles order payment retrieval, and mock development payment execution (pay/fail).
 */
export const paymentService = {
  /**
   * GET /api/orders/:orderId/payment
   * Retrieve payment record for an order
   * @param {string} orderId - Order UUID
   */
  async getOrderPayment(orderId) {
    const response = await apiClient.get(`/api/orders/${orderId}/payment`);
    return response.data;
  },

  /**
   * POST /api/orders/:orderId/payment/pay
   * Mock simulate successful payment
   * @param {string} orderId - Order UUID
   */
  async mockPaymentSuccess(orderId) {
    const response = await apiClient.post(`/api/orders/${orderId}/payment/pay`);
    return response.data;
  },

  /**
   * POST /api/orders/:orderId/payment/fail
   * Mock simulate failed payment
   * @param {string} orderId - Order UUID
   */
  async mockPaymentFailure(orderId) {
    const response = await apiClient.post(`/api/orders/${orderId}/payment/fail`);
    return response.data;
  },

  /**
   * GET /api/payments/:id
   * Retrieve payment by payment ID
   * @param {string} id - Payment UUID
   */
  async getPaymentById(id) {
    const response = await apiClient.get(`/api/payments/${id}`);
    return response.data;
  },
};

export default paymentService;
