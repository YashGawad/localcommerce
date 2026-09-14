import apiClient from './api.js';

/**
 * Normalizes backend category record to match frontend expectations
 */
export const normalizeCategory = (cat) => {
  if (!cat) return null;
  return {
    id: cat.id,
    storeId: cat.store_id,
    name: cat.name,
    slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: cat.description || '',
    imageUrl: cat.image_url || '',
    status: cat.status === 'active' ? 'Active' : 'Inactive',
    icon: 'category',
    storesCount: 1,
    color: '#EFF6FF',
    iconColor: '#2563EB',
    raw: cat,
  };
};

export const categoryService = {
  /**
   * GET /api/categories - List categories, optional ?store_id=...
   */
  async getCategories(storeId) {
    const endpoint = storeId ? `/api/categories?store_id=${storeId}` : '/api/categories';
    const response = await apiClient.get(endpoint);
    const list = response.data || [];
    return list.map(normalizeCategory);
  },

  /**
   * GET /api/categories/:id - Get category by ID
   */
  async getCategoryById(id) {
    const response = await apiClient.get(`/api/categories/${id}`);
    return normalizeCategory(response.data);
  },

  /**
   * POST /api/categories - Create category [Store Owner / Manager]
   */
  async createCategory({ store_id, name, description, image_url, status }) {
    const response = await apiClient.post('/api/categories', {
      store_id,
      name: name.trim(),
      description: description || null,
      image_url: image_url || null,
      status: status ? status.toLowerCase() : 'active',
    });
    return normalizeCategory(response.data);
  },

  /**
   * PATCH /api/categories/:id - Update category [Store Owner / Manager]
   */
  async updateCategory(id, updates) {
    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name.trim();
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.image_url !== undefined) payload.image_url = updates.image_url;
    if (updates.status !== undefined) payload.status = updates.status.toLowerCase();

    const response = await apiClient.patch(`/api/categories/${id}`, payload);
    return normalizeCategory(response.data);
  },
};

export default categoryService;
