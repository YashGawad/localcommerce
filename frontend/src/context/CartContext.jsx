/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const getCartStorageKey = (userId) => {
  return userId ? `localcommerce_cart_${userId}` : 'localcommerce_cart_guest';
};

const getInitialCart = () => {
  return {
    store: null,
    storeId: null,
    items: [],
  };
};

const loadCartFromStorage = (userId) => {
  if (typeof localStorage === 'undefined') return getInitialCart();
  try {
    const key = getCartStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) return getInitialCart();
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.items)) {
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load cart from localStorage:', err);
  }
  return getInitialCart();
};

export function CartProvider({ children }) {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || null;

  const [cart, setCart] = useState(() => loadCartFromStorage(currentUserId));
  const [prevUserId, setPrevUserId] = useState(currentUserId);
  const [storeConflict, setStoreConflict] = useState(null);

  // Isolate cart by customer: when active customer changes, switch to that customer's cart
  if (prevUserId !== currentUserId) {
    setPrevUserId(currentUserId);
    setCart(loadCartFromStorage(currentUserId));
  }

  // Customer-isolated persistence updater
  const updateCartState = useCallback(
    (updater) => {
      setCart((prev) => {
        const nextCart = typeof updater === 'function' ? updater(prev) : updater;
        if (typeof localStorage !== 'undefined') {
          try {
            const key = getCartStorageKey(currentUserId);
            localStorage.setItem(key, JSON.stringify(nextCart));
          } catch (err) {
            console.warn('Failed to persist customer cart:', err);
          }
        }
        return nextCart;
      });
    },
    [currentUserId]
  );

  /**
   * Add Item with strict ONE CART = ONE STORE validation
   */
  const addToCart = (product, storeListing, store, quantity = 1) => {
    if (!product || !store) return;

    // Check if cart already has items from a different store
    if (cart.storeId && cart.items.length > 0 && cart.storeId !== store.id) {
      setStoreConflict({
        currentStore: cart.store,
        newStore: store,
        pendingProduct: product,
        pendingListing: storeListing,
        pendingQuantity: quantity,
      });
      return;
    }

    const storeProductId =
      storeListing?.raw?.id ||
      storeListing?.storeProductId ||
      product.storeProductId ||
      product.id;

    updateCartState((prev) => {
      const price = storeListing?.storePrice || product.price || (product.mrp ? product.mrp - 2 : 50);
      const mrp = storeListing?.mrp || product.mrp || price;
      const variant = storeListing?.unit || product.unit || '1 unit';

      const existingIndex = prev.items.findIndex(
        (item) => item.storeProductId === storeProductId && item.variant === variant
      );

      let newItems;
      if (existingIndex >= 0) {
        newItems = prev.items.map((item, idx) =>
          idx === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem = {
          id: `cart_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          storeProductId,
          productId: product.id,
          title: product.title || product.name,
          variant,
          price,
          mrp,
          quantity,
          image: product.image,
          availability: storeListing?.availability || 'In Stock',
        };
        newItems = [...prev.items, newItem];
      }

      return {
        store,
        storeId: store.id,
        items: newItems,
      };
    });
  };

  /**
   * Confirm clearing previous store and adding from new store
   */
  const confirmSwitchStore = () => {
    if (!storeConflict) return;
    const { newStore, pendingProduct, pendingListing, pendingQuantity } = storeConflict;

    const storeProductId =
      pendingListing?.raw?.id ||
      pendingListing?.storeProductId ||
      pendingProduct.storeProductId ||
      pendingProduct.id;

    const price = pendingListing?.storePrice || pendingProduct.price || (pendingProduct.mrp ? pendingProduct.mrp - 2 : 50);
    const mrp = pendingListing?.mrp || pendingProduct.mrp || price;
    const variant = pendingListing?.unit || pendingProduct.unit || '1 unit';

    updateCartState({
      store: newStore,
      storeId: newStore.id,
      items: [
        {
          id: `cart_${Date.now()}`,
          storeProductId,
          productId: pendingProduct.id,
          title: pendingProduct.title || pendingProduct.name,
          variant,
          price,
          mrp,
          quantity: pendingQuantity,
          image: pendingProduct.image,
          availability: pendingListing?.availability || 'In Stock',
        },
      ],
    });
    setStoreConflict(null);
  };

  /**
   * Cancel switching stores
   */
  const cancelSwitchStore = () => {
    setStoreConflict(null);
  };

  /**
   * Update quantity of an item
   */
  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    updateCartState((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ),
    }));
  };

  /**
   * Remove item from cart
   */
  const removeFromCart = (itemId) => {
    updateCartState((prev) => {
      const remainingItems = prev.items.filter((item) => item.id !== itemId);
      return {
        ...prev,
        store: remainingItems.length === 0 ? null : prev.store,
        storeId: remainingItems.length === 0 ? null : prev.storeId,
        items: remainingItems,
      };
    });
  };

  /**
   * Clear all items in cart
   */
  const clearCart = () => {
    updateCartState({
      store: null,
      storeId: null,
      items: [],
    });
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart.items]);

  const totalMrp = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + (item.mrp || item.price) * item.quantity, 0);
  }, [cart.items]);

  const savings = totalMrp > subtotal ? totalMrp - subtotal : 0;

  const itemCount = useMemo(() => {
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart.items]);

  const deliveryFee = useMemo(() => {
    if (cart.items.length === 0) return 0;
    const storeDeliveryFee = cart.store?.deliveryFee ?? 20;
    const freeDeliveryAbove = cart.store?.freeDeliveryAbove ?? 199;
    return subtotal >= freeDeliveryAbove ? 0 : storeDeliveryFee;
  }, [cart.items.length, cart.store, subtotal]);

  const total = subtotal + deliveryFee;

  const minOrder = cart.store?.minOrder ?? 99;
  const isMinOrderMet = subtotal >= minOrder;
  const freeDeliveryThreshold = cart.store?.freeDeliveryAbove ?? 199;

  return (
    <CartContext.Provider
      value={{
        cart,
        store: cart.store,
        items: cart.items,
        itemCount,
        subtotal,
        deliveryFee,
        total,
        savings,
        minOrder,
        isMinOrderMet,
        freeDeliveryThreshold,
        storeConflict,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        confirmSwitchStore,
        cancelSwitchStore,
      }}
    >
      {children}

      {/* Global Store Conflict Modal */}
      {storeConflict && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  store
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#172554', margin: 0 }}>
                  Replace Cart Items?
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>One Cart = One Store Policy</span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5', margin: '0 0 20px 0' }}>
              Your cart currently contains items from <strong>{storeConflict.currentStore?.name}</strong>.
              LocalCommerce orders are fulfilled directly by individual neighborhood shops.
              <br /><br />
              Would you like to clear your existing cart and start a new order from <strong>{storeConflict.newStore?.name}</strong>?
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={cancelSwitchStore}
                style={{
                  padding: '9px 16px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Keep Current Cart
              </button>
              <button
                type="button"
                onClick={confirmSwitchStore}
                style={{
                  padding: '9px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Clear Cart &amp; Add
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
