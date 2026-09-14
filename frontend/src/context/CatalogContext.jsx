/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { storeService } from '../services/storeService';
import { categoryService } from '../services/categoryService';
import { productService } from '../services/productService';

/**
 * Standardized Inventory Status Rule:
 * - stock > lowStockThreshold  => 'In Stock'
 * - stock > 0 && stock <= lowStockThreshold => 'Low Stock'
 * - stock === 0 (or negative) => 'Out of Stock'
 */
export const calculateStockStatus = (stock, lowStockThreshold = 5) => {
  const s = Number(stock) || 0;
  const t = Number(lowStockThreshold) || 0;
  if (s <= 0) return 'Out of Stock';
  if (s <= t) return 'Low Stock';
  return 'In Stock';
};

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  const { currentUser } = useAuth();

  // Stores state
  const [allStores, setAllStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState(() => {
    return typeof localStorage !== 'undefined'
      ? localStorage.getItem('localcommerce_selected_store_id') || ''
      : '';
  });
  const [loadingStores, setLoadingStores] = useState(true);

  // Catalog data for active currentStore
  const [storeProducts, setStoreProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allGlobalProducts, setAllGlobalProducts] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [catalogError, setCatalogError] = useState(null);

  // Store online status
  const [customOnlineState, setCustomOnlineState] = useState(null);

  // 1. Fetch all stores from backend on mount
  useEffect(() => {
    let isMounted = true;
    async function loadInitialStores() {
      try {
        const stores = await storeService.getAllStores();
        if (isMounted) {
          setAllStores(stores);
        }
      } catch (err) {
        console.error('Failed to load stores:', err);
      } finally {
        if (isMounted) {
          setLoadingStores(false);
        }
      }
    }
    loadInitialStores();
    return () => {
      isMounted = false;
    };
  }, []);

  // Helper to re-fetch all stores from backend on demand
  const reloadStores = useCallback(async (selectStoreId = null) => {
    setLoadingStores(true);
    try {
      const stores = await storeService.getAllStores();
      setAllStores(stores);
      if (selectStoreId) {
        setSelectedStoreId(selectStoreId);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('localcommerce_selected_store_id', selectStoreId);
        }
      }
      return stores;
    } catch (err) {
      console.error('Failed to reload stores:', err);
      return [];
    } finally {
      setLoadingStores(false);
    }
  }, []);

  // 2. Compute availableStores for the authenticated user
  const availableStores = useMemo(() => {
    if (!currentUser) return allStores;
    if (currentUser.role === 'admin') return allStores;

    if (currentUser.store_roles && currentUser.store_roles.length > 0) {
      const allowedIds = new Set(currentUser.store_roles.map((sr) => sr.store_id));
      const filtered = allStores.filter((s) => allowedIds.has(s.id));
      return filtered.length > 0 ? filtered : allStores;
    }

    return allStores;
  }, [allStores, currentUser]);

  // 3. Derived currentStore
  const currentStore = useMemo(() => {
    if (availableStores.length === 0) return null;
    return (
      availableStores.find((s) => s.id === selectedStoreId) ||
      availableStores[0] ||
      null
    );
  }, [availableStores, selectedStoreId]);

  // Save selection whenever currentStore is explicitly changed
  const handleSetCurrentStore = useCallback((store) => {
    if (store?.id) {
      setSelectedStoreId(store.id);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('localcommerce_selected_store_id', store.id);
      }
    }
  }, []);

  const isOnline = customOnlineState !== null ? customOnlineState : currentStore?.status === 'active';

  // 4. Fetch catalog data (products, categories, global products) for currentStore
  const reloadCatalog = useCallback(async (storeId) => {
    if (!storeId) return;
    try {
      const [cats, globals] = await Promise.all([
        categoryService.getCategories(storeId).catch(() => []),
        productService.getGlobalProducts().catch(() => []),
      ]);

      const categoriesMap = {};
      cats.forEach((c) => {
        categoriesMap[c.id] = c;
      });

      const prods = await productService.getStoreProducts(storeId, categoriesMap);

      setCategories(cats);
      setAllGlobalProducts(globals);
      setStoreProducts(prods);
      setLoadingCatalog(false);
      setCatalogError(null);
    } catch (err) {
      setCatalogError(err.message || 'Failed to load catalog items');
      setLoadingCatalog(false);
    }
  }, []);

  useEffect(() => {
    const storeId = currentStore?.id;
    if (!storeId) return;

    let isSubscribed = true;
    (async () => {
      try {
        const [cats, globals] = await Promise.all([
          categoryService.getCategories(storeId).catch(() => []),
          productService.getGlobalProducts().catch(() => []),
        ]);

        const categoriesMap = {};
        cats.forEach((c) => {
          categoriesMap[c.id] = c;
        });

        const prods = await productService.getStoreProducts(storeId, categoriesMap);

        if (isSubscribed) {
          setCategories(cats);
          setAllGlobalProducts(globals);
          setStoreProducts(prods);
          setLoadingCatalog(false);
          setCatalogError(null);
        }
      } catch (err) {
        if (isSubscribed) {
          setCatalogError(err.message || 'Failed to load catalog items');
          setLoadingCatalog(false);
        }
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, [currentStore?.id]);

  // 5. Mutators connected to real backend APIs

  /**
   * Add product to current store via POST /api/stores/:storeId/products
   */
  const addProduct = async (productData) => {
    if (!currentStore?.id) throw new Error('No store selected');

    const created = await productService.createStoreProduct(currentStore.id, productData);
    await reloadCatalog(currentStore.id);
    return created;
  };

  /**
   * Update product via PATCH /api/stores/:storeId/products/:id
   */
  const updateProduct = async (productId, updatedFields) => {
    if (!currentStore?.id) throw new Error('No store selected');

    const updated = await productService.updateStoreProduct(currentStore.id, productId, updatedFields);
    await reloadCatalog(currentStore.id);
    return updated;
  };

  /**
   * Delete or deactivate product
   */
  const deleteProduct = async (productId) => {
    if (!currentStore?.id) return;
    try {
      await productService.updateStoreProduct(currentStore.id, productId, { status: 'inactive' });
      await reloadCatalog(currentStore.id);
    } catch (err) {
      console.error('Failed to deactivate product:', err);
      setStoreProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  /**
   * Adjust stock quantity on backend via PATCH
   */
  const adjustStock = async (productId, deltaOrQuantity, isAbsolute = false) => {
    if (!currentStore?.id) return 0;

    const existing = storeProducts.find((p) => p.id === productId);
    const currentQty = existing ? Number(existing.stock) : 0;
    const targetQty = isAbsolute
      ? Math.max(0, Number(deltaOrQuantity))
      : Math.max(0, currentQty + Number(deltaOrQuantity));

    // Optimistic local update
    setStoreProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: targetQty, stock_quantity: targetQty } : p))
    );

    try {
      await productService.updateStoreProduct(currentStore.id, productId, {
        stock: targetQty,
      });
      reloadCatalog(currentStore.id);
    } catch (err) {
      console.error('Failed to adjust stock on backend:', err);
      if (existing) {
        setStoreProducts((prev) =>
          prev.map((p) => (p.id === productId ? existing : p))
        );
      }
      throw err;
    }

    return targetQty;
  };

  /**
   * Category mutators
   */
  const addCategory = async (categoryData) => {
    if (!currentStore?.id) throw new Error('No store selected');

    const created = await categoryService.createCategory({
      store_id: currentStore.id,
      name: categoryData.name,
      description: categoryData.description || null,
      image_url: categoryData.imageUrl || categoryData.image_url || null,
      status: categoryData.status || 'active',
    });

    await reloadCatalog(currentStore.id);
    return created;
  };

  const updateCategory = async (categoryId, updatedFields) => {
    const updated = await categoryService.updateCategory(categoryId, updatedFields);
    if (currentStore?.id) {
      await reloadCatalog(currentStore.id);
    }
    return updated;
  };

  const deleteCategory = async (categoryId) => {
    try {
      await categoryService.updateCategory(categoryId, { status: 'inactive' });
      if (currentStore?.id) {
        await reloadCatalog(currentStore.id);
      }
    } catch (err) {
      console.error('Failed to deactivate category:', err);
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    }
  };

  // Mock store settings compatibility
  const storeSettings = useMemo(() => {
    return {
      storeId: currentStore?.id || '',
      storeName: currentStore?.name || '',
      acceptingOrders: isOnline,
    };
  }, [currentStore, isOnline]);

  const updateStoreSettings = (fields) => {
    if (fields.acceptingOrders !== undefined) {
      setCustomOnlineState(!!fields.acceptingOrders);
    }
  };

  const value = {
    allStores,
    availableStores,
    currentStore: currentStore || {
      id: '',
      name: 'Select Store',
      location: '',
      status: 'active',
    },
    setCurrentStore: handleSetCurrentStore,
    isOnline,
    setIsOnline: setCustomOnlineState,
    storeProducts,
    allGlobalProducts,
    categories,
    loadingStores,
    reloadStores,
    loadingCatalog,
    catalogError,
    refreshCatalog: () => currentStore?.id && reloadCatalog(currentStore.id),
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    addCategory,
    updateCategory,
    deleteCategory,
    calculateStockStatus,
    storeSettings,
    updateStoreSettings,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    return {
      allStores: [],
      availableStores: [],
      currentStore: { id: '', name: 'Select Store', location: '', status: 'active' },
      setCurrentStore: () => {},
      isOnline: true,
      setIsOnline: () => {},
      storeProducts: [],
      allGlobalProducts: [],
      categories: [],
      loadingStores: false,
      reloadStores: async () => [],
      loadingCatalog: false,
      catalogError: null,
      refreshCatalog: () => {},
      addProduct: async () => {},
      updateProduct: async () => {},
      deleteProduct: async () => {},
      adjustStock: async () => {},
      addCategory: async () => {},
      updateCategory: async () => {},
      deleteCategory: async () => {},
      calculateStockStatus: () => 'In Stock',
      storeSettings: null,
      updateStoreSettings: () => {},
    };
  }
  return context;
}

export default CatalogContext;
