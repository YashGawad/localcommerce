/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useMemo } from 'react';
import { useCatalog } from './CatalogContext';
import { INITIAL_STORE_DISCOUNTS } from '../data/discounts';

const DiscountsContext = createContext(null);

export function DiscountsProvider({ children }) {
  const { currentStore } = useCatalog();

  // Multi-store discounts map
  const [discountsMap, setDiscountsMap] = useState(INITIAL_STORE_DISCOUNTS);

  // Active store's discounts
  const storeDiscounts = useMemo(() => {
    return discountsMap[currentStore.id] || [];
  }, [discountsMap, currentStore.id]);

  /**
   * Create a new discount for the current store
   */
  const createDiscount = (discountData) => {
    const newDiscount = {
      id: `disc_${Date.now()}`,
      storeId: currentStore.id,
      name: discountData.name.trim(),
      code: discountData.code.trim().toUpperCase(),
      type: discountData.type || 'percentage',
      value: Number(discountData.value) || 0,
      appliesTo: discountData.appliesTo || 'All Products',
      appliesToType: discountData.appliesToType || 'all',
      minOrderValue: Number(discountData.minOrderValue) || 0,
      startDate: discountData.startDate || new Date().toISOString().split('T')[0],
      endDate: discountData.endDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: discountData.status || 'Active',
      usageCount: 0,
      usageLimit: discountData.usageLimit ? Number(discountData.usageLimit) : null,
      limitPerCustomer: discountData.limitPerCustomer ?? true,
      description: discountData.description || `${discountData.value}${discountData.type === 'percentage' ? '%' : '₹'} discount for ${currentStore.name}.`,
    };

    setDiscountsMap((prev) => {
      const currentList = prev[currentStore.id] || [];
      return {
        ...prev,
        [currentStore.id]: [newDiscount, ...currentList],
      };
    });

    return newDiscount;
  };

  /**
   * Update an existing discount
   */
  const updateDiscount = (discountId, updates) => {
    setDiscountsMap((prev) => {
      const currentList = prev[currentStore.id] || [];
      return {
        ...prev,
        [currentStore.id]: currentList.map((item) =>
          item.id === discountId ? { ...item, ...updates } : item
        ),
      };
    });
  };

  /**
   * Toggle Active <-> Inactive
   */
  const toggleDiscountStatus = (discountId) => {
    setDiscountsMap((prev) => {
      const currentList = prev[currentStore.id] || [];
      return {
        ...prev,
        [currentStore.id]: currentList.map((item) => {
          if (item.id === discountId) {
            const nextStatus = item.status === 'Active' ? 'Inactive' : 'Active';
            return { ...item, status: nextStatus };
          }
          return item;
        }),
      };
    });
  };

  /**
   * Delete a discount
   */
  const deleteDiscount = (discountId) => {
    setDiscountsMap((prev) => {
      const currentList = prev[currentStore.id] || [];
      return {
        ...prev,
        [currentStore.id]: currentList.filter((item) => item.id !== discountId),
      };
    });
  };

  /**
   * Duplicate a discount
   */
  const duplicateDiscount = (discountId) => {
    const target = storeDiscounts.find((d) => d.id === discountId);
    if (!target) return null;

    const duplicateCode = `${target.code}_COPY`;
    return createDiscount({
      ...target,
      name: `${target.name} (Copy)`,
      code: duplicateCode,
      status: 'Active',
      usageCount: 0,
    });
  };

  const value = {
    storeDiscounts,
    createDiscount,
    updateDiscount,
    toggleDiscountStatus,
    deleteDiscount,
    duplicateDiscount,
  };

  return (
    <DiscountsContext.Provider value={value}>
      {children}
    </DiscountsContext.Provider>
  );
}

export function useDiscounts() {
  const context = useContext(DiscountsContext);
  if (!context) {
    throw new Error('useDiscounts must be used within a DiscountsProvider');
  }
  return context;
}
