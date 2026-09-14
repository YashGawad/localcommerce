import apiClient from './api.js';

/**
 * Normalizes backend store record to match frontend UI component expectations
 */
export const normalizeStore = (store) => {
  if (!store) return null;
  const addressParts = [store.address, store.city, store.postal_code].filter(Boolean);
  return {
    id: store.id,
    name: store.name,
    slug: store.slug,
    description: store.description || '',
    phone: store.phone || '',
    email: store.email || '',
    address: addressParts.join(', ') || store.address || '',
    city: store.city || '',
    state: store.state || '',
    postalCode: store.postal_code || '',
    status: store.status,
    isOpen: store.status === 'active',
    rating: '4.8', // Default until store review ratings are aggregated
    reviewCount: 42,
    deliveryTime: '20–35 mins',
    minOrder: 100,
    freeDeliveryAbove: 499,
    fulfillmentTypes: ['delivery', 'pickup'],
    distance: '0.8 km',
    category: 'General Store',
    image:
      store.image_url ||
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
    raw: store,
  };
};

export const storeService = {
  /**
   * GET /api/stores - List all stores [Public]
   */
  async getAllStores() {
    const response = await apiClient.get('/api/stores');
    const list = response.data || [];
    return list.map(normalizeStore);
  },

  /**
   * GET /api/stores/:id - Get store by UUID [Public]
   */
  async getStoreById(id) {
    const response = await apiClient.get(`/api/stores/${id}`);
    return normalizeStore(response.data);
  },

  /**
   * GET /api/stores/slug/:slug - Get store by unique slug [Public]
   */
  async getStoreBySlug(slug) {
    const response = await apiClient.get(`/api/stores/slug/${slug}`);
    return normalizeStore(response.data);
  },

  /**
   * POST /api/stores - Create a new store [Business Owner / Admin]
   */
  async createStore(storeData) {
    const response = await apiClient.post('/api/stores', storeData);
    return normalizeStore(response.data);
  },
};

export default storeService;
