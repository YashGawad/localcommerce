import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_CATEGORIES } from '../../data/categories';
import { GLOBAL_PRODUCTS, STORE_LISTINGS } from '../../data/products';
import { MOCK_STORES, getStoreBySlug } from '../../data/stores';
import ProductCard from '../../components/customer/ProductCard';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

/**
 * Screen 4: Customer Category / Product Listing
 * Visual Source of Truth: Stitch screen 'LocalCommerce Category - Groceries' (eecba68bca6d4f50906be035863d7841)
 * Handles /categories, /categories/:category, and /store/:slug/products
 */
export default function CategoryListingPage() {
  const { category, slug } = useParams();

  // If scoped to a specific store via /store/:slug/products
  const storeScope = slug ? getStoreBySlug(slug) : null;

  // Selected Category
  const activeCategory = MOCK_CATEGORIES.find((c) => c.slug === category) || MOCK_CATEGORIES[0];

  // Filters
  const [selectedStores, setSelectedStores] = useState(storeScope ? [storeScope.id] : ['store_01', 'store_02']);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [selectedFulfillment, setSelectedFulfillment] = useState('all');

  const toggleStore = (storeId) => {
    if (selectedStores.includes(storeId)) {
      setSelectedStores(selectedStores.filter((id) => id !== storeId));
    } else {
      setSelectedStores([...selectedStores, storeId]);
    }
  };

  // Find products matching the category
  const matchingProducts = [];

  GLOBAL_PRODUCTS.forEach((prod) => {
    // If browsing specific category, or browsing all
    const matchesCategory =
      !category ||
      prod.category === category ||
      (category === 'groceries' && (prod.category === 'groceries' || prod.category === 'bakery-dairy'));

    if (matchesCategory) {
      MOCK_STORES.forEach((store) => {
        if (selectedStores.includes(store.id)) {
          const storeItems = STORE_LISTINGS[store.id] || [];
          const listing = storeItems.find((item) => item.productId === prod.id);

          if (listing) {
            if (inStockOnly && listing.availability === 'Out of Stock') return;
            if (selectedFulfillment === 'delivery' && !store.fulfillmentTypes.includes('delivery')) return;
            if (selectedFulfillment === 'pickup' && !store.fulfillmentTypes.includes('pickup')) return;

            matchingProducts.push({
              key: `${prod.id}_${store.id}`,
              product: prod,
              store,
              storePrice: listing.storePrice,
              mrp: listing.mrp,
              availability: listing.availability,
            });
          }
        }
      });
    }
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
        <Link to="/" style={{ color: 'inherit' }}>Home</Link>
        <span>›</span>
        <Link to="/categories" style={{ color: 'inherit' }}>Categories</Link>
        <span>›</span>
        <span style={{ color: '#172033', fontWeight: 600 }}>{activeCategory.name}</span>
      </div>

      {/* Category Header Banner */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '10px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '10px',
              backgroundColor: activeCategory.color || '#EFF6FF',
              color: activeCategory.iconColor || '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '30px' }}>
              {activeCategory.icon || 'shopping_basket'}
            </span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#172033', letterSpacing: '-0.015em' }}>
                {storeScope ? `${storeScope.name} — Catalog` : activeCategory.name}
              </h1>
              <Badge variant="info" size="sm">
                {matchingProducts.length} Items Available
              </Badge>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              Daily essentials, groceries, and staples fulfilled directly by participating neighbourhood stores.
            </p>
          </div>
        </div>

        {/* Quick Category switcher pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {MOCK_CATEGORIES.slice(0, 4).map((c) => (
            <Link
              key={c.id}
              to={`/categories/${c.slug}`}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: c.slug === category ? '#172554' : '#F1F5F9',
                color: c.slug === category ? '#FFFFFF' : '#475569',
                textDecoration: 'none',
              }}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid: Filters Column + Products Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Filter Panel */}
        <aside
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            maxWidth: '280px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#172033', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>tune</span>
              Filters
            </span>
            <button
              onClick={() => {
                setSelectedStores(['store_01', 'store_02', 'store_03', 'store_04']);
                setInStockOnly(false);
                setSelectedFulfillment('all');
              }}
              style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}
            >
              Reset
            </button>
          </div>

          {/* Fulfilling Stores */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.03em', marginBottom: '8px' }}>
              Fulfilling Stores
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {MOCK_STORES.map((s) => (
                <label
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: '#172033',
                    cursor: 'pointer',
                    padding: '3px 0',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={selectedStores.includes(s.id)}
                      onChange={() => toggleStore(s.id)}
                      style={{ accentColor: '#2563EB' }}
                    />
                    <span>{s.name}</span>
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 5px', borderRadius: '3px' }}>
                    {s.distance?.split(' ')[0]}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Stock Status */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.03em', marginBottom: '8px' }}>
              Stock Status
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#172033', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ accentColor: '#2563EB' }}
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Fulfillment Method */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.03em', marginBottom: '8px' }}>
              Fulfillment Method
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="cat_fulfillment"
                  checked={selectedFulfillment === 'all'}
                  onChange={() => setSelectedFulfillment('all')}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>All Options</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="cat_fulfillment"
                  checked={selectedFulfillment === 'delivery'}
                  onChange={() => setSelectedFulfillment('delivery')}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>Store Delivery</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="cat_fulfillment"
                  checked={selectedFulfillment === 'pickup'}
                  onChange={() => setSelectedFulfillment('pickup')}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>Self Pickup</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          {matchingProducts.length === 0 ? (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '40px', textAlign: 'center' }}>
              <p style={{ color: '#64748B', fontSize: '14px' }}>No products match your selected filters in this category.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStores(['store_01', 'store_02', 'store_03', 'store_04']);
                  setInStockOnly(false);
                }}
                style={{ marginTop: '12px' }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {matchingProducts.map((item) => (
                <ProductCard
                  key={item.key}
                  product={item.product}
                  store={item.store}
                  storePrice={item.storePrice}
                  mrp={item.mrp}
                  availability={item.availability}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
