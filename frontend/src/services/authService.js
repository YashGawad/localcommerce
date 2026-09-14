import apiClient from './api.js';

/**
 * Authentication service interacting with real backend authentication endpoints.
 */
export const authService = {
  /**
   * Log in user with email and password.
   * Backend endpoint: POST /api/auth/login
   * Returns: { token, user }
   */
  async login(email, password) {
    const response = await apiClient.post('/api/auth/login', {
      email: email.trim().toLowerCase(),
      password,
    });
    return response.data;
  },

  /**
   * Register a new customer account.
   * Backend endpoint: POST /api/auth/register
   * Returns: { user }
   */
  async register({ name, email, password, phone }) {
    const response = await apiClient.post('/api/auth/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone ? phone.trim() : null,
    });
    return response.data;
  },

  /**
   * Register a new business owner and initial store.
   * Backend endpoint: POST /api/auth/business/register
   * Returns: { token, user, store }
   */
  async registerBusiness({ name, email, password, phone, store }) {
    const response = await apiClient.post('/api/auth/business/register', {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone ? phone.trim() : null,
      store: {
        name: store.name.trim(),
        slug: store.slug ? store.slug.trim().toLowerCase() : undefined,
        description: store.description ? store.description.trim() : null,
        phone: store.phone ? store.phone.trim() : null,
        email: store.email ? store.email.trim().toLowerCase() : null,
        address: store.address ? store.address.trim() : null,
        city: store.city ? store.city.trim() : null,
        state: store.state ? store.state.trim() : 'Maharashtra',
        postal_code: store.postal_code ? store.postal_code.trim() : null,
      },
    });
    return response.data;
  },

  /**
   * Retrieve the current authenticated user profile using token.
   * Backend endpoint: GET /api/auth/me
   * Returns: { user }
   */
  async getCurrentUser(token) {
    const options = token
      ? { headers: { Authorization: `Bearer ${token}` } }
      : {};
    const response = await apiClient.get('/api/auth/me', options);
    return response.data.user;
  },
};

export default authService;
