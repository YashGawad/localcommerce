/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo } from 'react';
import { MOCK_STORES } from '../data/stores';
import { GLOBAL_PRODUCTS } from '../data/products';
import { MOCK_CATEGORIES } from '../data/categories';

/**
 * Standardized Inventory Status Rule:
 * - stock > lowStockThreshold  => 'In Stock'
 * - stock > 0 && stock <= lowStockThreshold => 'Low Stock'
 * - stock === 0 (or negative) => 'Out of Stock'
 */
export const calculateStockStatus = (stock, lowStockThreshold = 10) => {
  const s = Number(stock) || 0;
  const t = Number(lowStockThreshold) || 0;
  if (s <= 0) return 'Out of Stock';
  if (s <= t) return 'Low Stock';
  return 'In Stock';
};

/**
 * Initial Store Listings Seed Data
 * Separate for each store to preserve multi-tenant context.
 */
const INITIAL_STORE_PRODUCTS = {
  store_01: [
    {
      id: 'shm_prod_amul_taaza',
      globalProductId: 'prod_amul_taaza',
      storeId: 'store_01',
      title: 'Amul Taaza Homogenised Toned Milk',
      brand: 'Amul Dairy Co.',
      category: 'bakery-dairy',
      categoryName: 'Bakery & Dairy',
      price: 55,
      cost: 46,
      mrp: 56,
      sku: 'SHM-AML-1000',
      barcode: '890126201005',
      stock: 4, // Intentionally low to match Stitch Dashboard "Low stock alert: Amul Taaza 4 units"
      lowStockThreshold: 10,
      status: 'Active',
      image: 'https://lh3.googleusercontent.com/aida/AEtjO1VVsaS-NlV_iizo17KBfTVuGAaanpyY2CDU9p_bkZi5H5HHm-Zs5vkR4b45iuhSP93NY0Wkl9wj43SgRNfTU0HHyFtoHF58-nEW_ZHvJvo_l5094O-UlcNPsvKaDIlLvj-3Q3OKmG8-eeJK_EKg77JRsOA0oYUmkyWjk8RBjHolT0U9nokpEpGDmLtB7fmT3czI-eKsPMvpplTUQceZxAZIlPOlt-ZdJyv4qUtYVpDY1PY6Qkup3p74',
      unit: '1 Litre Pouch',
      description: 'Pasteurized homogenized toned milk with 3.0% Fat and 8.5% SNF. Freshly received every morning.',
      aisle: 'Aisle 2 - Dairy & Chilled',
      updatedAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'shm_prod_brown_bread',
      globalProductId: 'prod_brown_bread',
      storeId: 'store_01',
      title: 'Modern 100% Whole Wheat Brown Bread',
      brand: 'Modern Bakery',
      category: 'bakery-dairy',
      categoryName: 'Bakery & Dairy',
      price: 52,
      cost: 41,
      mrp: 55,
      sku: 'SHM-BRD-400G',
      barcode: '890142205012',
      stock: 18,
      lowStockThreshold: 8,
      status: 'Active',
      image: 'https://lh3.googleusercontent.com/aida/AEtjO1VddSV2lNmD7RpeuAqExrt8gj-Qmmuvb9gMbJf6wVnOURW0BzidpwnTCPVBeo6zjLBPHCWMoBEkMq3ZPGGA-Fp171Kjv3peivN17ay4_iJb_ZbWIERNnz0vLbB9fykI7hF9nR7CsBxkOGNlYPvdXYZP8AMcjlEcMkjp2C8kO5QiVXtUh4n1x2-Bg7-uqBOB-e6SO1DWz_VD1oX3FiK8_z6qI8Jtt4iGDUJidyYssqXwHDXo1ROUmCtgZg',
      unit: '400 g Loaf',
      description: 'Freshly baked whole wheat bread loaf with high fiber content and soft texture.',
      aisle: 'Aisle 1 - Bakery & Breads',
      updatedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'shm_prod_aashirvaad_atta',
      globalProductId: 'prod_aashirvaad_atta',
      storeId: 'store_01',
      title: 'Aashirvaad Superior MP Shudh Chakki Atta',
      brand: 'ITC Limited',
      category: 'groceries',
      categoryName: 'Groceries & Staples',
      price: 245,
      cost: 210,
      mrp: 260,
      sku: 'SHM-ASH-5KG',
      barcode: '890103001889',
      stock: 0, // Intentionally Out of Stock to showcase Out of Stock status
      lowStockThreshold: 5,
      status: 'Active',
      image: 'https://lh3.googleusercontent.com/aida/AEtjO1V1q4rT8T03L38g2sK4j_x_8Xp-g8T4gG-v38aC4P1K0x8a1b0c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0',
      unit: '5 kg Pack',
      description: '100% whole wheat grain chakki-ground flour with zero added maida.',
      aisle: 'Aisle 4 - Staples & Flours',
      updatedAt: new Date(Date.now() - 14400000).toISOString(),
    },
    {
      id: 'shm_prod_tata_salt',
      globalProductId: 'prod_tata_salt',
      storeId: 'store_01',
      title: 'Tata Salt Vacuum Evaporated Iodised Salt',
      brand: 'Tata Consumer',
      category: 'groceries',
      categoryName: 'Groceries & Staples',
      price: 26,
      cost: 20,
      mrp: 28,
      sku: 'SHM-TAT-1KG',
      barcode: '890103038291',
      stock: 42,
      lowStockThreshold: 15,
      status: 'Active',
      image: 'https://lh3.googleusercontent.com/aida/AEtjO1Xj_e_y_Z9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p1q2r3s4t5u6v7w8x9y0z1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z',
      unit: '1 kg Pouch',
      description: 'Desh Ka Namak - vacuum-evaporated iodised salt for everyday cooking.',
      aisle: 'Aisle 3 - Spices & Seasonings',
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'shm_prod_thums_up_cola',
      globalProductId: 'prod_thums_up_cola',
      storeId: 'store_01',
      title: 'Thums Up Charged Strong Cola Beverage',
      brand: 'Coca-Cola India',
      category: 'beverages',
      categoryName: 'Beverages & Drinks',
      price: 40,
      cost: 32,
      mrp: 45,
      sku: 'SHM-THM-750M',
      barcode: '890176401201',
      stock: 35,
      lowStockThreshold: 12,
      status: 'Active',
      image: 'https://lh3.googleusercontent.com/aida/AEtjO1UVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmNoPqRsTuV',
      unit: '750 ml Bottle',
      description: 'Carbonated spicy cola drink packed with strong carbonation and fizzy punch.',
      aisle: 'Aisle 5 - Cold Beverages',
      updatedAt: new Date(Date.now() - 43200000).toISOString(),
    },
    {
      id: 'shm_prod_fortune_oil',
      globalProductId: null,
      storeId: 'store_01',
      title: 'Fortune Sunlite Refined Sunflower Oil',
      brand: 'Adani Wilmar',
      category: 'groceries',
      categoryName: 'Groceries & Staples',
      price: 138,
      cost: 118,
      mrp: 155,
      sku: 'SHM-FRT-1L',
      barcode: '890600728109',
      stock: 6,
      lowStockThreshold: 10,
      status: 'Active',
      image: 'https://lh3.googleusercontent.com/aida/AEtjO1WWaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz00112233445566778899aabbccddeeffgghhiijjkkllmmnnooppqqrrssttuuvvwwxxyyzz',
      unit: '1 Litre Pouch',
      description: 'Light and healthy refined sunflower cooking oil enriched with Vitamins A & D.',
      aisle: 'Aisle 4 - Cooking Oils',
      updatedAt: new Date(Date.now() - 50000000).toISOString(),
    },
  ],
  store_02: [
    {
      id: 'shr_prod_amul_taaza',
      globalProductId: 'prod_amul_taaza',
      storeId: 'store_02',
      title: 'Amul Taaza Homogenised Toned Milk',
      brand: 'Amul Dairy Co.',
      category: 'bakery-dairy',
      categoryName: 'Bakery & Dairy',
      price: 54,
      cost: 45,
      mrp: 56,
      sku: 'SHR-AML-1000',
      barcode: '890126201005',
      stock: 25,
      lowStockThreshold: 10,
      status: 'Active',
      image: 'https://lh3.googleusercontent.com/aida/AEtjO1VVsaS-NlV_iizo17KBfTVuGAaanpyY2CDU9p_bkZi5H5HHm-Zs5vkR4b45iuhSP93NY0Wkl9wj43SgRNfTU0HHyFtoHF58-nEW_ZHvJvo_l5094O-UlcNPsvKaDIlLvj-3Q3OKmG8-eeJK_EKg77JRsOA0oYUmkyWjk8RBjHolT0U9nokpEpGDmLtB7fmT3czI-eKsPMvpplTUQceZxAZIlPOlt-ZdJyv4qUtYVpDY1PY6Qkup3p74',
      unit: '1 Litre Pouch',
      description: 'Fresh toned milk stocked daily at Shree Kirana.',
      aisle: 'Dairy Cooler A1',
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'shr_prod_brown_bread',
      globalProductId: 'prod_brown_bread',
      storeId: 'store_02',
      title: 'Modern 100% Whole Wheat Brown Bread',
      brand: 'Modern Bakery',
      category: 'bakery-dairy',
      categoryName: 'Bakery & Dairy',
      price: 50,
      cost: 40,
      mrp: 55,
      sku: 'SHR-BRD-400G',
      barcode: '890142205012',
      stock: 14,
      lowStockThreshold: 5,
      status: 'Active',
      image: 'https://lh3.googleusercontent.com/aida/AEtjO1VddSV2lNmD7RpeuAqExrt8gj-Qmmuvb9gMbJf6wVnOURW0BzidpwnTCPVBeo6zjLBPHCWMoBEkMq3ZPGGA-Fp171Kjv3peivN17ay4_iJb_ZbWIERNnz0vLbB9fykI7hF9nR7CsBxkOGNlYPvdXYZP8AMcjlEcMkjp2C8kO5QiVXtUh4n1x2-Bg7-uqBOB-e6SO1DWz_VD1oX3FiK8_z6qI8Jtt4iGDUJidyYssqXwHDXo1ROUmCtgZg',
      unit: '400 g Loaf',
      description: 'Whole wheat daily bread loaf.',
      aisle: 'Bread Rack B1',
      updatedAt: new Date().toISOString(),
    },
  ],
};

const CatalogContext = createContext(null);

export function CatalogProvider({ children }) {
  // Currently selected store (defaults to Sharma Supermarket)
  const [currentStore, setCurrentStore] = useState(MOCK_STORES[0]);
  const [isOnline, setIsOnline] = useState(true);

  // Store-specific products dictionary keyed by storeId
  const [storeProductsMap, setStoreProductsMap] = useState(INITIAL_STORE_PRODUCTS);

  // Store categories (initially from MOCK_CATEGORIES)
  const [categories, setCategories] = useState(MOCK_CATEGORIES);

  // Products belonging to the currently active store
  const storeProducts = useMemo(() => {
    return storeProductsMap[currentStore.id] || [];
  }, [storeProductsMap, currentStore.id]);

  /**
   * Add a new product to the current store
   */
  const addProduct = (productData) => {
    const newId = `prod_${Date.now()}`;
    const newProduct = {
      ...productData,
      id: newId,
      storeId: currentStore.id,
      price: Number(productData.price) || 0,
      cost: Number(productData.cost) || 0,
      mrp: Number(productData.mrp) || Number(productData.price) || 0,
      stock: Math.max(0, Number(productData.stock) || 0),
      lowStockThreshold: Math.max(0, Number(productData.lowStockThreshold) || 10),
      status: productData.status || 'Active',
      updatedAt: new Date().toISOString(),
    };

    setStoreProductsMap((prev) => ({
      ...prev,
      [currentStore.id]: [newProduct, ...(prev[currentStore.id] || [])],
    }));

    return newProduct;
  };

  /**
   * Update an existing product in the current store
   */
  const updateProduct = (productId, updatedFields) => {
    setStoreProductsMap((prev) => {
      const currentList = prev[currentStore.id] || [];
      const nextList = currentList.map((item) => {
        if (item.id === productId) {
          const newStock = updatedFields.stock !== undefined
            ? Math.max(0, Number(updatedFields.stock))
            : item.stock;

          const newLowStockThreshold = updatedFields.lowStockThreshold !== undefined
            ? Math.max(0, Number(updatedFields.lowStockThreshold))
            : item.lowStockThreshold;

          return {
            ...item,
            ...updatedFields,
            stock: newStock,
            lowStockThreshold: newLowStockThreshold,
            price: updatedFields.price !== undefined ? Number(updatedFields.price) : item.price,
            cost: updatedFields.cost !== undefined ? Number(updatedFields.cost) : item.cost,
            mrp: updatedFields.mrp !== undefined ? Number(updatedFields.mrp) : item.mrp,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      });

      return {
        ...prev,
        [currentStore.id]: nextList,
      };
    });
  };

  /**
   * Delete a product from current store
   */
  const deleteProduct = (productId) => {
    setStoreProductsMap((prev) => {
      const currentList = prev[currentStore.id] || [];
      return {
        ...prev,
        [currentStore.id]: currentList.filter((item) => item.id !== productId),
      };
    });
  };

  /**
   * Adjust stock quantity for an item (e.g. +5, -1, or set absolute count)
   * Prevents stock from becoming negative (< 0).
   */
  const adjustStock = (productId, deltaOrQuantity, isAbsolute = false) => {
    let resultStock = 0;
    setStoreProductsMap((prev) => {
      const currentList = prev[currentStore.id] || [];
      const nextList = currentList.map((item) => {
        if (item.id === productId) {
          const currentQty = Number(item.stock) || 0;
          const targetQty = isAbsolute
            ? Number(deltaOrQuantity)
            : currentQty + Number(deltaOrQuantity);

          resultStock = Math.max(0, targetQty);
          return {
            ...item,
            stock: resultStock,
            updatedAt: new Date().toISOString(),
          };
        }
        return item;
      });

      return {
        ...prev,
        [currentStore.id]: nextList,
      };
    });
    return resultStock;
  };

  /**
   * Category Management (Add, Update, Delete)
   */
  const addCategory = (categoryData) => {
    const newCat = {
      id: `cat_${Date.now()}`,
      slug: categoryData.slug || categoryData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: categoryData.name,
      storesCount: 1,
      icon: categoryData.icon || 'category',
      color: '#EFF6FF',
      iconColor: '#2563EB',
      status: categoryData.status || 'Active',
    };
    setCategories((prev) => [...prev, newCat]);
    return newCat;
  };

  const updateCategory = (categoryId, updatedFields) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === categoryId ? { ...c, ...updatedFields } : c))
    );
  };

  const deleteCategory = (categoryId) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const value = {
    currentStore,
    setCurrentStore,
    isOnline,
    setIsOnline,
    storeProducts,
    allGlobalProducts: GLOBAL_PRODUCTS,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    addCategory,
    updateCategory,
    deleteCategory,
    calculateStockStatus,
  };

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) {
    throw new Error('useCatalog must be used within a CatalogProvider');
  }
  return context;
}
