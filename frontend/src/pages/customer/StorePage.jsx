import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import storeService from '../../services/storeService';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import ProductCard from '../../components/customer/ProductCard';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

/**
 * Screen 3: Customer Store Page
 * Connects to real store endpoint GET /api/stores/slug/:slug and store products
 */
export default function StorePage() {
  const { slug } = useParams();

  const [store, setStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [cartAlert, setCartAlert] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadStoreAndCatalog() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch store by slug
        const loadedStore = await storeService.getStoreBySlug(slug);
        if (!loadedStore) {
          throw new Error('Store not found');
        }

        // 2. Fetch categories and store products in parallel
        const [cats, prods] = await Promise.all([
          categoryService.getCategories(loadedStore.id).catch(() => []),
          productService.getStoreProducts(loadedStore.id).catch(() => []),
        ]);

        if (isMounted) {
          setStore(loadedStore);
          setCategories(cats);
          setStoreProducts(prods);
        }
      } catch (err) {
        console.error(`Error loading store ${slug}:`, err);
        if (isMounted) {
          setError(err.message || 'Store not found');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadStoreAndCatalog();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '60px auto', padding: '0 16px', textAlign: 'center', color: '#64748B' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: '16px', fontSize: '15px', fontWeight: 600 }}>Loading Storefront...</div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '32px 16px', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94A3B8' }}>
          storefront
        </span>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#172033', marginTop: '12px' }}>
          Store Not Found
        </h2>
        <p style={{ color: '#64748B', marginTop: '6px', fontSize: '14px' }}>
          The merchant you are looking for ({slug}) does not exist or may be temporarily unavailable.
        </p>
        <Link to="/" style={{ marginTop: '20px', display: 'inline-block' }}>
          <Button variant="primary">Return to Stores</Button>
        </Link>
      </div>
    );
  }

  // Filter catalog by selected category & in-store search
  const filteredProducts = storeProducts
    .filter((entry) => {
      // In-store search
      if (storeSearchQuery.trim()) {
        const q = storeSearchQuery.toLowerCase();
        const matches =
          (entry.title || entry.name || '').toLowerCase().includes(q) ||
          (entry.brand || '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Category filter
      if (activeCategoryFilter === 'all') return true;
      return entry.categoryId === activeCategoryFilter || entry.category === activeCategoryFilter;
    });

  const handleAddToCart = (product, storeInfo, qty) => {
    setCartAlert({
      productName: product.title || product.name,
      storeName: store.name,
      qty,
    });
    setTimeout(() => setCartAlert(null), 3500);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: 'clamp(16px, 3vw, 24px) clamp(12px, 2vw, 16px) 48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Store Header Hero Card */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
        {/* Storefront Banner Image */}
        <div
          style={{
            height: 'clamp(130px, 22vw, 180px)',
            width: '100%',
            backgroundColor: '#F1F5F9',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {store.image ? (
            <img
              src={store.image}
              alt={store.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94A3B8' }}>storefront</span>
            </div>
          )}

          {/* Top floating badges */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
            <Badge variant={store.isOpen ? 'success' : 'neutral'} dot size="md">
              {store.isOpen ? 'Store Open & Fulfilling' : 'Closed'}
            </Badge>
            <span
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                backdropFilter: 'blur(4px)',
              }}
            >
              📍 {store.distance || '0.8 km'}
            </span>
          </div>
        </div>

        {/* Store Identity & Stats */}
        <div style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#172033', letterSpacing: '-0.02em' }}>
                  {store.name}
                </h1>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    color: '#F59E0B',
                    fontWeight: 700,
                    backgroundColor: '#FFFBEB',
                    border: '1px solid #FDE68A',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>star</span>
                  {store.rating} ({store.reviewCount} verified reviews)
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                {store.category} • {store.address}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#172033' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>electric_moped</span>
                  <strong>{store.deliveryTime}</strong> delivery
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>storefront</span>
                  In-Store Pickup ready in 15 mins
                </span>
                <span>•</span>
                <span style={{ color: '#64748B' }}>
                  Min order: ₹{store.minOrder}
                </span>
              </div>
            </div>

            {/* Direct Merchant Badge */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '12px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span>
                Verified Merchant
              </div>
              <span style={{ color: '#64748B' }}>Prices set directly by store</span>
              <span style={{ color: '#2563EB', fontWeight: 500 }}>Fulfillment direct to customer</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Notification Bar (One Cart = One Store feedback) */}
      {cartAlert && (
        <div
          style={{
            backgroundColor: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '8px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: '#1E40AF',
            fontSize: '13px',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>shopping_cart</span>
            Added <strong>{cartAlert.productName}</strong> ({cartAlert.qty}x) from <strong>{cartAlert.storeName}</strong>
          </div>
          <Link to="/cart" style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
            View Cart →
          </Link>
        </div>
      )}

      {/* 2. In-Store Discovery Toolbar & Department Category Filter */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* In-Store Search */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <span
              className="material-symbols-outlined"
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#64748B',
                fontSize: '18px',
              }}
            >
              search
            </span>
            <input
              type="text"
              value={storeSearchQuery}
              onChange={(e) => setStoreSearchQuery(e.target.value)}
              placeholder={`Search in ${store.name}...`}
              style={{
                width: '100%',
                height: '36px',
                padding: '0 12px 0 34px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '6px',
                fontSize: '13px',
              }}
            />
          </div>

          {/* Aisle Category Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px', maxWidth: '100%' }}>
            <button
              onClick={() => setActiveCategoryFilter('all')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: activeCategoryFilter === 'all' ? '#172554' : '#F1F5F9',
                color: activeCategoryFilter === 'all' ? '#FFFFFF' : '#475569',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              All Items ({storeProducts.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: activeCategoryFilter === cat.id ? '#172554' : '#F1F5F9',
                  color: activeCategoryFilter === cat.id ? '#FFFFFF' : '#475569',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Catalog Products Grid */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172033' }}>
              Store Catalog ({filteredProducts.length} items)
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B' }}>
              Inventory and prices updated live by {store.name}
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '48px 16px',
              textAlign: 'center',
              color: '#64748B',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#94A3B8' }}>
              production_quantity_limits
            </span>
            <div style={{ marginTop: '8px', fontSize: '15px', fontWeight: 600, color: '#172033' }}>
              No products found
            </div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>
              {storeSearchQuery ? `No items matching "${storeSearchQuery}"` : 'This store has not added items to this department yet.'}
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 150px), 1fr))',
              gap: '10px',
            }}
          >
            {filteredProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                store={store}
                storePrice={item.price}
                mrp={item.mrp}
                availability={item.availability}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
