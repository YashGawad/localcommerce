import React from 'react';
import { Link } from 'react-router-dom';
import { MOCK_STORES } from '../../data/stores';
import { MOCK_CATEGORIES } from '../../data/categories';
import { GLOBAL_PRODUCTS, STORE_LISTINGS } from '../../data/products';
import ProductCard from '../../components/customer/ProductCard';
import StoreCard from '../../components/customer/StoreCard';
import CategoryCard from '../../components/customer/CategoryCard';
import styles from './HomePage.module.css';

/**
 * Screen 1: Customer Home / Discovery
 * Visual Source of Truth: Stitch screen 'LocalCommerce Customer Home' (1febdb1b464a43eeb5dcde244de62c55)
 */
export default function HomePage() {
  // Associate popular products with default store listings for the home page showcase
  const popularProductListings = GLOBAL_PRODUCTS.map((prod) => {
    // Primary store for Thane zone: Shree Kirana (store_02) or Sharma Supermarket (store_01)
    const listings = STORE_LISTINGS.store_02 || [];
    const listing = listings.find((l) => l.productId === prod.id) || {
      storePrice: prod.mrp - 4,
      mrp: prod.mrp,
      inStock: true,
      availability: 'In Stock',
    };
    const store = MOCK_STORES.find((s) => s.id === 'store_02') || MOCK_STORES[0];

    return {
      product: prod,
      store,
      storePrice: listing.storePrice,
      mrp: listing.mrp,
      availability: listing.availability,
    };
  });

  return (
    <div className={styles.container}>
      {/* 1. Hero / Discovery Value Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          {/* Left Hero Message */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px',
                borderRadius: '4px',
                backgroundColor: '#F1EFEA',
                border: '1px solid #EDE8DF',
                fontSize: '12px',
                fontWeight: 600,
                color: '#172554',
                alignSelf: 'flex-start',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              19 local stores serving your pin code (400602)
            </div>

            <h1
              style={{
                fontSize: '34px',
                fontWeight: 800,
                color: '#172033',
                lineHeight: 1.2,
                letterSpacing: '-0.025em',
              }}
            >
              Shop from independent local stores near you.
            </h1>

            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: 1.6, maxWidth: '580px' }}>
              Find fresh groceries, daily essentials, and local specialties from trusted neighbourhood shops. Choose fast store-direct delivery or convenient in-store pickup.
            </p>

            {/* Fulfilled via tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#64748B', paddingTop: '4px' }}>
              <span style={{ fontWeight: 600, color: '#172033' }}>Fulfilled via:</span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#F6F5F2',
                  border: '1px solid #E2E8F0',
                  color: '#172033',
                  fontWeight: 500,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#10B981' }}>check_circle</span>
                Store Delivery
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#F6F5F2',
                  border: '1px solid #E2E8F0',
                  color: '#172033',
                  fontWeight: 500,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#2563EB' }}>storefront</span>
                Pickup Available
              </span>

              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: '#F6F5F2',
                  border: '1px solid #E2E8F0',
                  color: '#172033',
                  fontWeight: 500,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#F59E0B' }}>sell</span>
                Store-Direct Pricing
              </span>
            </div>
          </div>

          {/* Right Service Area Summary Card */}
          <div
            style={{
              backgroundColor: '#F6F5F2',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
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
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Selected Location:</span>
                <strong style={{ color: '#172033' }}>Panch Pakhadi, Thane (400602)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Active Merchants Open:</span>
                <strong style={{ color: '#10B981' }}>19 local stores available</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748B' }}>Estimated Delivery:</span>
                <strong style={{ color: '#172033' }}>20–35 mins</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172033', letterSpacing: '-0.01em' }}>
              Shop by Category
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
              Browse essential everyday departments from nearby shops
            </p>
          </div>
          <Link to="/categories" style={{ fontSize: '13px', color: '#2563EB', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View all categories →
          </Link>
        </div>

        <div className={styles.categoryGrid}>
          {MOCK_CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </section>

      {/* 3. Nearby Independent Stores */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172033', letterSpacing: '-0.01em' }}>
              Nearby Independent Stores
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
              Trusted neighbourhood retailers delivering directly in your area
            </p>
          </div>
        </div>

        <div className={styles.storeGrid}>
          {MOCK_STORES.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>

      {/* 4. Popular Products Near You */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#172033', letterSpacing: '-0.01em' }}>
              Popular Products Near You
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
              High-frequency grocery essentials fulfilled by nearby local merchants
            </p>
          </div>
        </div>

        <div className={styles.productGrid}>
          {popularProductListings.map((item) => (
            <ProductCard
              key={item.product.id}
              product={item.product}
              store={item.store}
              storePrice={item.storePrice}
              mrp={item.mrp}
              availability={item.availability}
            />
          ))}
        </div>
      </section>

      {/* 5. Why LocalCommerce (Concise, authentic LocalCommerce value pillars matching Stitch) */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
        }}
      >
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
