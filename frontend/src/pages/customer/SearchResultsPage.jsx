import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import storeService from '../../services/storeService';
import productService from '../../services/productService';
import ProductCard from '../../components/customer/ProductCard';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import styles from './SearchResultsPage.module.css';

/**
 * Screen 2: Customer Search Results
 * Connects cross-store discovery with real active stores and live store product listings
 */
export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const rawQuery = searchParams.get('q');
  const query = rawQuery !== null ? rawQuery : 'milk';

  const [stores, setStores] = useState([]);
  const [allStoreProducts, setAllStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedStores, setSelectedStores] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSearchCatalog() {
      try {
        setLoading(true);
        const loadedStores = await storeService.getAllStores();
        const activeStores = loadedStores.filter((s) => s.status === 'active');

        // Fetch products for active stores
        const productPromises = activeStores.map(async (st) => {
          const prods = await productService.getStoreProducts(st.id);
          return prods.map((p) => ({ ...p, store: st }));
        });

        const storeProductLists = await Promise.all(productPromises);
        const flatProducts = storeProductLists.flat();

        if (isMounted) {
          setStores(activeStores);
          setSelectedStores(activeStores.map((s) => s.id));
          setAllStoreProducts(flatProducts);
        }
      } catch (err) {
        console.error('Failed to load search catalog:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSearchCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleStore = (storeId) => {
    if (selectedStores.includes(storeId)) {
      setSelectedStores(selectedStores.filter((id) => id !== storeId));
    } else {
      setSelectedStores([...selectedStores, storeId]);
    }
  };

  // Filter results
  const normalizedQuery = query.toLowerCase().trim();
  const searchResults = allStoreProducts.filter((item) => {
    // 1. Store filter
    if (selectedStores.length > 0 && !selectedStores.includes(item.storeId)) {
      return false;
    }

    // 2. Stock filter
    if (inStockOnly && item.availability === 'Out of Stock') {
      return false;
    }

    // 3. Fulfillment filter
    if (fulfillmentFilter === 'delivery' && !item.store?.fulfillmentTypes?.includes('delivery')) {
      return false;
    }
    if (fulfillmentFilter === 'pickup' && !item.store?.fulfillmentTypes?.includes('pickup')) {
      return false;
    }

    // 4. Text query match
    if (!normalizedQuery) return true;
    const titleMatch = (item.title || item.name || '').toLowerCase().includes(normalizedQuery);
    const brandMatch = (item.brand || '').toLowerCase().includes(normalizedQuery);
    const catMatch = (item.categoryName || '').toLowerCase().includes(normalizedQuery);
    return titleMatch || brandMatch || catMatch;
  });

  return (
    <div className={styles.container}>
      {/* Search Header Banner */}
      <div className={styles.headerRow}>
        <div>
          <div className={styles.headerTitleGroup}>
            <h1 className={styles.headerTitle}>
              Search Results
            </h1>
            <Badge variant="info" size="sm">Cross-Store Discovery</Badge>
          </div>
          <p className={styles.headerSub}>
            Showing <strong>{searchResults.length} results</strong> for "{query}" across nearby neighbourhood stores
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={styles.filterToggleBtn}
            aria-label="Toggle search filters"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>tune</span>
            <span>{showMobileFilters ? 'Close Filters' : 'Filters'}</span>
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStores(stores.map((s) => s.id));
              setInStockOnly(false);
              setFulfillmentFilter('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Main Grid: Filters Column + Results Column */}
      <div className={styles.mainLayout}>
        {/* Left Filter Facet Panel */}
        <aside className={`${styles.filterAside} ${showMobileFilters ? styles.filterAsideOpen : ''}`}>
          <div className={styles.filterHeader}>
            <span className={styles.filterTitle}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>tune</span>
              Refine Results
            </span>
          </div>

          {/* Fulfilling Stores */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.03em', marginBottom: '8px' }}>
              Nearby Stores
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {stores.map((store) => (
                <label
                  key={store.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: '#172033',
                    cursor: 'pointer',
                    padding: '4px 0',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(store.id)}
                      onChange={() => toggleStore(store.id)}
                      style={{ accentColor: '#2563EB', width: '15px', height: '15px' }}
                    />
                    <span>{store.name}</span>
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>
                    {store.distance?.split(' ')[0] || '0.8km'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Stock Availability */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.03em', marginBottom: '8px' }}>
              Stock Availability
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
              Fulfillment Method
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#172033' }}>
              {['all', 'delivery', 'pickup'].map((mode) => (
                <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="fulfillment"
                    checked={fulfillmentFilter === mode}
                    onChange={() => setFulfillmentFilter(mode)}
                    style={{ accentColor: '#2563EB' }}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{mode === 'all' ? 'All Methods' : mode}</span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Search Results Column */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <div style={{ padding: '48px 16px', textAlign: 'center', color: '#64748B' }}>
              <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 500 }}>Searching local stores...</div>
            </div>
          ) : searchResults.length === 0 ? (
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
                search_off
              </span>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172033', marginTop: '12px' }}>
                No items matching "{query}"
              </h2>
              <p style={{ fontSize: '13px', marginTop: '4px' }}>
                Try adjusting your search terms or uncheck filters to explore other local offerings.
              </p>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {searchResults.map((item) => (
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
