import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import storeService from '../../services/storeService';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import ProductCard from '../../components/customer/ProductCard';
import Badge from '../../components/shared/Badge';
import styles from './CategoryListingPage.module.css';

/**
 * Screen 4: Customer Category / Product Listing
 * Handles /categories, /categories/:category, and /store/:slug/products
 * Fully integrated with real store and category endpoints.
 */
export default function CategoryListingPage() {
  const { category, slug } = useParams();

  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStores, setSelectedStores] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [selectedFulfillment, setSelectedFulfillment] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        const [loadedStores, loadedCategories] = await Promise.all([
          storeService.getAllStores(),
          categoryService.getCategories(),
        ]);

        const activeStores = loadedStores.filter((s) => s.status === 'active');

        let targetStores = activeStores;
        if (slug) {
          const scopedStore = activeStores.find((s) => s.slug === slug);
          if (scopedStore) {
            targetStores = [scopedStore];
          }
        }

        // Fetch products for target stores
        const productPromises = targetStores.map(async (st) => {
          const list = await productService.getStoreProducts(st.id);
          return list.map((p) => ({ ...p, store: st }));
        });

        const storeProductLists = await Promise.all(productPromises);
        const flatProducts = storeProductLists.flat();

        if (isMounted) {
          setStores(activeStores);
          setCategories(loadedCategories);
          setSelectedStores(targetStores.map((s) => s.id));
          setProducts(flatProducts);
        }
      } catch (err) {
        console.error('Failed to load category data:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [category, slug]);

  const toggleStore = (storeId) => {
    if (selectedStores.includes(storeId)) {
      setSelectedStores(selectedStores.filter((id) => id !== storeId));
    } else {
      setSelectedStores([...selectedStores, storeId]);
    }
  };

  const activeCategory =
    categories.find((c) => c.slug === category || c.id === category) || {
      name: category ? category.charAt(0).toUpperCase() + category.slice(1) : 'All Departments',
      description: 'Browse fresh items available from trusted local retailers',
      icon: 'category',
    };

  // Find products matching the category
  const matchingProducts = products.filter((item) => {
    // Category match
    if (category && category !== 'all') {
      const matchSlug = item.category === category;
      const matchId = item.categoryId === category;
      const matchName = item.categoryName?.toLowerCase() === category.toLowerCase();
      if (!matchSlug && !matchId && !matchName) return false;
    }

    // Store match
    if (selectedStores.length > 0 && !selectedStores.includes(item.storeId)) {
      return false;
    }

    // Stock availability
    if (inStockOnly && item.availability === 'Out of Stock') {
      return false;
    }

    // Fulfillment match
    if (selectedFulfillment === 'delivery' && !item.store?.fulfillmentTypes?.includes('delivery')) {
      return false;
    }
    if (selectedFulfillment === 'pickup' && !item.store?.fulfillmentTypes?.includes('pickup')) {
      return false;
    }

    return true;
  });

  return (
    <div className={styles.container}>
      {/* Breadcrumbs */}
      <div className={styles.breadcrumbs}>
        <Link to="/" style={{ color: 'inherit' }}>Home</Link>
        <span>›</span>
        <Link to="/categories" style={{ color: 'inherit' }}>Categories</Link>
        <span>›</span>
        <span style={{ color: '#172033', fontWeight: 600 }}>{activeCategory.name}</span>
      </div>

      {/* Category Header Banner */}
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.bannerIconBox}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              {activeCategory.icon || 'shopping_basket'}
            </span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 className={styles.bannerTitle}>
                {activeCategory.name}
              </h1>
              <Badge variant="info" size="sm">Local Department</Badge>
            </div>
            <p className={styles.bannerSub}>
              {activeCategory.description || 'Browse everyday items stocked by neighborhood shops'}
            </p>
          </div>
        </div>

        <div className={styles.bannerRight}>
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={styles.filterToggleBtn}
            aria-label="Toggle category filters"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>tune</span>
            <span>{showMobileFilters ? 'Close Filters' : 'Filters'}</span>
          </button>
          <div style={{ fontSize: '13px', color: '#64748B' }}>
            Showing <strong>{matchingProducts.length} items</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Filters + Products */}
      <div className={styles.mainLayout}>
        {/* Left Filter Column */}
        <aside className={`${styles.filterAside} ${showMobileFilters ? styles.filterAsideOpen : ''}`}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#172033', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            Filter Catalog
          </div>

          {/* Stores Filter */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.03em', marginBottom: '8px' }}>
              Stores
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {stores.map((store) => (
                <label key={store.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#172033', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={selectedStores.includes(store.id)}
                    onChange={() => toggleStore(store.id)}
                    style={{ accentColor: '#2563EB', width: '15px', height: '15px' }}
                  />
                  <span>{store.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Stock Filter */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.03em', marginBottom: '8px' }}>
              Availability
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#172033', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ accentColor: '#2563EB', width: '15px', height: '15px' }}
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Fulfillment Method */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.03em', marginBottom: '8px' }}>
              Fulfillment
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#172033' }}>
              {['all', 'delivery', 'pickup'].map((mode) => (
                <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="cat_fulfillment"
                    checked={selectedFulfillment === mode}
                    onChange={() => setSelectedFulfillment(mode)}
                    style={{ accentColor: '#2563EB' }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{mode === 'all' ? 'All Methods' : mode}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Products Grid */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ padding: '48px 16px', textAlign: 'center', color: '#64748B' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 500 }}>Loading category products...</div>
            </div>
          ) : matchingProducts.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '48px 24px',
                textAlign: 'center',
                color: '#64748B',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94A3B8' }}>
                inventory_2
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172033', marginTop: '12px' }}>
                No products found in this category
              </h2>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Check back soon or explore other departments from nearby stores.
              </p>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {matchingProducts.map((item) => (
                <ProductCard
                  key={`${item.id}_${item.storeId}`}
                  product={item}
                  store={item.store}
                  storePrice={item.price}
                  mrp={item.mrp}
                  availability={item.availability}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
