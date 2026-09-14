import apiClient from './api.js';

/**
 * Normalizes backend global product record
 */
export const normalizeGlobalProduct = (gp) => {
  if (!gp) return null;
  return {
    id: gp.id,
    title: gp.name,
    name: gp.name,
    brand: gp.brand || '',
    barcode: gp.barcode || '',
    unit: gp.unit || '',
    mrp: gp.mrp !== null ? Number(gp.mrp) : 0,
    price: gp.mrp !== null ? Number(gp.mrp) : 0,
    image:
      gp.image_url ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    description: gp.description || '',
    status: gp.status === 'active' ? 'Active' : 'Inactive',
    raw: gp,
  };
};

/**
 * Normalizes backend store product record
 */
export const normalizeStoreProduct = (sp, categoriesMap = {}) => {
  if (!sp) return null;
  const categoryName = sp.category_id && categoriesMap[sp.category_id]
    ? categoriesMap[sp.category_id].name
    : 'General';

  const categorySlug = sp.category_id && categoriesMap[sp.category_id]
    ? categoriesMap[sp.category_id].slug
    : 'groceries';

  const stock = Number(sp.stock_quantity) || 0;
  const threshold = Number(sp.low_stock_threshold) || 5;

  let availability = 'In Stock';
  if (stock <= 0) availability = 'Out of Stock';
  else if (stock <= threshold) availability = 'Low Stock';

  return {
    id: sp.id,
    storeId: sp.store_id,
    globalProductId: sp.global_product_id,
    categoryId: sp.category_id,
    category: categorySlug,
    categoryName,
    title: sp.name,
    name: sp.name,
    brand: sp.global_product?.brand || '',
    sku: sp.sku || '',
    barcode: sp.global_product?.barcode || '',
    price: Number(sp.price),
    storePrice: Number(sp.price),
    cost: sp.cost_price !== null ? Number(sp.cost_price) : 0,
    mrp: sp.global_product?.mrp ? Number(sp.global_product.mrp) : Number(sp.price),
    stock,
    lowStockThreshold: threshold,
    unit: sp.unit || sp.global_product?.unit || '',
    description: sp.description || '',
    image:
      sp.image_url ||
      sp.global_product?.image_url ||
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
    status: sp.status === 'active' ? 'Active' : 'Inactive',
    availability,
    inStock: stock > 0,
    raw: sp,
  };
};

export const productService = {
  /**
   * GET /api/global-products - List canonical products [Public]
   */
  async getGlobalProducts() {
    const response = await apiClient.get('/api/global-products');
    const list = response.data || [];
    return list.map(normalizeGlobalProduct);
  },

  /**
   * GET /api/global-products/:id - Single canonical product [Public]
   */
  async getGlobalProductById(id) {
    const response = await apiClient.get(`/api/global-products/${id}`);
    return normalizeGlobalProduct(response.data);
  },

  /**
   * GET /api/stores/:storeId/products - Store products [Public]
   */
  async getStoreProducts(storeId, categoriesMap = {}) {
    const response = await apiClient.get(`/api/stores/${storeId}/products`);
    const list = response.data || [];
    return list.map((sp) => normalizeStoreProduct(sp, categoriesMap));
  },

  /**
   * GET /api/stores/:storeId/products/:id - Single store product [Public]
   */
  async getStoreProductById(storeId, id, categoriesMap = {}) {
    const response = await apiClient.get(`/api/stores/${storeId}/products/${id}`);
    return normalizeStoreProduct(response.data, categoriesMap);
  },

  /**
   * POST /api/stores/:storeId/products - Create store product [Store Owner / Manager]
   */
  async createStoreProduct(storeId, data) {
    const payload = {
      global_product_id: data.global_product_id || data.globalProductId || null,
      category_id: data.category_id || data.categoryId || null,
      name: data.name || data.title,
      description: data.description || null,
      sku: data.sku ? data.sku.trim() : null,
      price: Number(data.price),
      cost_price: data.cost !== undefined && data.cost !== null && data.cost !== '' ? Number(data.cost) : null,
      stock_quantity: data.stock !== undefined ? Number(data.stock) : 0,
      low_stock_threshold: data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : 5,
      unit: data.unit || null,
      image_url: data.image || data.image_url || null,
      status: (data.status || 'Active').toLowerCase(),
    };

    const response = await apiClient.post(`/api/stores/${storeId}/products`, payload);
    return normalizeStoreProduct(response.data);
  },

  /**
   * PATCH /api/stores/:storeId/products/:id - Update store product [Store Owner / Manager]
   */
  async updateStoreProduct(storeId, id, data) {
    const payload = {};
    if (data.name !== undefined || data.title !== undefined) {
      payload.name = data.name || data.title;
    }
    if (data.price !== undefined) payload.price = Number(data.price);
    if (data.cost !== undefined) {
      payload.cost_price = data.cost !== null && data.cost !== '' ? Number(data.cost) : null;
    }
    if (data.stock !== undefined) payload.stock_quantity = Number(data.stock);
    if (data.lowStockThreshold !== undefined) payload.low_stock_threshold = Number(data.lowStockThreshold);
    if (data.status !== undefined) payload.status = data.status.toLowerCase();
    if (data.sku !== undefined) payload.sku = data.sku;
    if (data.unit !== undefined) payload.unit = data.unit;
    if (data.description !== undefined) payload.description = data.description;
    if (data.image !== undefined || data.image_url !== undefined) {
      payload.image_url = data.image || data.image_url;
    }
    if (data.category_id !== undefined || data.categoryId !== undefined) {
      payload.category_id = data.category_id || data.categoryId || null;
    }
    if (data.global_product_id !== undefined || data.globalProductId !== undefined) {
      payload.global_product_id = data.global_product_id || data.globalProductId || null;
    }

    const response = await apiClient.patch(`/api/stores/${storeId}/products/${id}`, payload);
    return normalizeStoreProduct(response.data);
  },
};

export default productService;
