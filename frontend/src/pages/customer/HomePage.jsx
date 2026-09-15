import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import storeService from '../../services/storeService';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';
import ProductCard from '../../components/customer/ProductCard';
import StoreCard from '../../components/customer/StoreCard';
import CategoryCard from '../../components/customer/CategoryCard';
import styles from './HomePage.module.css';

/**
 * Screen 1: Customer Home / Discovery
 * Visual Source of Truth: Stitch screen 'LocalCommerce Customer Home' (1febdb1b464a43eeb5dcde244de62c55)
 */
export default function HomePage() {
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchHomeData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch active stores
        const allStores = await storeService.getAllStores();
        const activeStores = allStores.filter((s) => s.status === 'active');

        // 2. Fetch categories
        const cats = await categoryService.getCategories();

        // 3. Fetch showcase products from active stores
        let prods = [];
        if (activeStores.length > 0) {
          const storeProductPromises = activeStores.slice(0, 2).map(async (st) => {
            const list = await productService.getStoreProducts(st.id);
            return list.map((p) => ({ ...p, store: st }));
          });

          const results = await Promise.all(storeProductPromises);
          prods = results.flat().slice(0, 8);
        }

        if (isMounted) {
          setStores(activeStores);
          setCategories(cats);
          setPopularProducts(prods);
        }
      } catch (err) {
        console.error('Failed to load Home data:', err);
        if (isMounted) {
          setError(err.message || 'Unable to connect to LocalCommerce backend');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className={styles.container}>
      {/* 1. Hero / Discovery Value Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          {/* Left Hero Message */}
          <div className={styles.heroLeft}>
            <div className={styles.heroTag}>
              <span className={styles.heroTagDot} />
              19 local stores serving your pin code (400602)
            </div>

            <h1 className={styles.heroTitle}>
              Shop from independent local stores near you.
            </h1>

            <p className={styles.heroSubtitle}>
              Find fresh groceries, daily essentials, and local specialties from trusted neighbourhood shops. Choose fast store-direct delivery or convenient in-store pickup.
            </p>

            {/* Fulfilled via tags */}
            <div className={styles.fulfillmentTags}>
              <span style={{ fontWeight: 600, color: '#172033' }}>Fulfilled via:</span>
              <span className={styles.fulfillmentTagItem}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#10B981' }}>check_circle</span>
                Store Delivery
              </span>

              <span className={styles.fulfillmentTagItem}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#2563EB' }}>storefront</span>
                Pickup Available
              </span>

              <span className={styles.fulfillmentTagItem}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#F59E0B' }}>sell</span>
                Store-Direct Pricing
              </span>
            </div>
          </div>

          {/* Right Service Area Summary Card */}
          <div className={styles.serviceSummaryCard}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#172033', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Current Service Area
                </span>
              </div>
              <span style={{ fontSize: '12px', color: '#2563EB', fontWeight: 600 }}>Active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: '#64748B' }}>Selected Location:</span>
                <strong style={{ color: '#172033' }}>Panch Pakhadi, Thane (400602)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: '#64748B' }}>Active Merchants Open:</span>
                <strong style={{ color: '#10B981' }}>19 local stores available</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: '#64748B' }}>Estimated Delivery:</span>
                <strong style={{ color: '#172033' }}>20–35 mins</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                <span style={{ color: '#64748B' }}>Store Pricing:</span>
                <strong style={{ color: '#172033' }}>Set directly by local shop</strong>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748B' }}>
              <span>Delivery &amp; pickup terms set by store</span>
              <span style={{ color: '#2563EB', fontWeight: 600 }}>Direct support</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Shop by Category */}
      <section>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              Shop by Category
            </h2>
            <p className={styles.sectionSubtitle}>
              Browse essential everyday departments from nearby shops
            </p>
          </div>
          <Link to="/categories" className={styles.sectionLink}>
            View all categories →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '16px', color: '#64748B', fontSize: '13px' }}>
            No categories available at the moment.
          </div>
        ) : (
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Nearby Independent Stores */}
      <section>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              Nearby Independent Stores
            </h2>
            <p className={styles.sectionSubtitle}>
              Trusted neighbourhood retailers delivering directly in your area
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748B' }}>
            <div style={{ display: 'inline-block', width: '28px', height: '28px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ marginTop: '12px', fontSize: '14px' }}>Discovering local stores...</div>
          </div>
        ) : error ? (
          <div style={{ padding: '20px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', color: '#991B1B' }}>
            <strong>Unable to load stores:</strong> {error}
          </div>
        ) : stores.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#64748B' }}>
            No active stores found in your service area.
          </div>
        ) : (
          <div className={styles.storeGrid}>
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Popular Products Near You */}
      <section>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              Popular Products Near You
            </h2>
            <p className={styles.sectionSubtitle}>
              High-frequency grocery essentials fulfilled by nearby local merchants
            </p>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
            Loading essentials...
          </div>
        ) : popularProducts.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', color: '#64748B', fontSize: '13px' }}>
            No products listed yet. Check back soon!
          </div>
        ) : (
          <div className={styles.productGrid}>
            {popularProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                store={item.store || stores[0]}
                storePrice={item.price}
                mrp={item.mrp}
                availability={item.availability}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Why LocalCommerce (Concise, authentic LocalCommerce value pillars matching Stitch) */}
      <section className={styles.whySection}>
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 28px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#172033', letterSpacing: '-0.01em' }}>
            Why Order via LocalCommerce?
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
            Built to connect neighborhood families with independent local store owners.
          </p>
        </div>

        <div className={styles.valuePropsGrid}>
          <div style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>storefront</span>
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                Direct Local Support
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginTop: '4px' }}>
                Every rupee directly supports independent kiranas and local specialty shops in your community.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
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
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>sell</span>
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                Counter-Direct Pricing
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginTop: '4px' }}>
                Pay actual store rates without hidden platform inflation or inflated markups on basic goods.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>electric_moped</span>
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#172033' }}>
                Neighborhood Dispatch
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginTop: '4px' }}>
                Fast dispatch from stores right down your street, either via store riders or quick counter pickup.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
