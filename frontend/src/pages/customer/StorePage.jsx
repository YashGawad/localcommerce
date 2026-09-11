import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStoreBySlug } from '../../data/stores';
import { GLOBAL_PRODUCTS, STORE_LISTINGS } from '../../data/products';
import ProductCard from '../../components/customer/ProductCard';
import Badge from '../../components/shared/Badge';
import Button from '../../components/shared/Button';

/**
 * Screen 3: Customer Store Page
 * Visual Source of Truth: Stitch screen 'LocalCommerce Store - Shree Kirana' (e6971e8ca6c74d37970c7d392be0fc44)
 */
export default function StorePage() {
  const { slug } = useParams();
  const store = getStoreBySlug(slug);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [storeSearchQuery, setStoreSearchQuery] = useState('');
  const [cartAlert, setCartAlert] = useState(null);

  // Get listings specific to this store
  const storeCatalogItems = STORE_LISTINGS[store.id] || [];

  // Filter catalog by selected category & in-store search
  const filteredProducts = storeCatalogItems
    .map((item) => {
      const globalProd = GLOBAL_PRODUCTS.find((p) => p.id === item.productId);
      if (!globalProd) return null;
      return {
        product: globalProd,
        storePrice: item.storePrice,
        mrp: item.mrp,
        availability: item.availability,
        isRecommended: item.isRecommended,
      };
    })
    .filter(Boolean)
    .filter((entry) => {
      // In-store search
      if (storeSearchQuery.trim()) {
        const q = storeSearchQuery.toLowerCase();
        const matches =
          entry.product.title.toLowerCase().includes(q) ||
          entry.product.brand.toLowerCase().includes(q);
        if (!matches) return false;
      }
      // Category filter
      if (activeCategoryFilter === 'all') return true;
      if (activeCategoryFilter === 'dairy' && entry.product.category === 'bakery-dairy') return true;
      if (activeCategoryFilter === 'staples' && entry.product.category === 'groceries') return true;
      if (activeCategoryFilter === 'beverages' && entry.product.category === 'beverages') return true;
      return false;
    });

  const handleAddToCart = (product, storeInfo, qty) => {
    // ONE CART = ONE STORE architecture demonstration
    setCartAlert({
      productName: product.title,
      storeName: store.name,
      qty,
    });
    setTimeout(() => setCartAlert(null), 3500);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
            height: '180px',
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '12px', color: '#475569' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#64748B' }}>schedule</span>
                  {store.hours || '8:00 AM – 10:30 PM (Daily)'}
                </span>
                <span>•</span>
                <span>Owner: <strong>{store.ownerName}</strong></span>
              </div>
            </div>
          </div>

          {/* Fulfillment Badges Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid #F1F5F9',
            }}
          >
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>electric_moped</span>
                Fast Delivery
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#172033', marginTop: '4px' }}>
                {store.deliveryTime}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>By dedicated store rider</div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#172554', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>storefront</span>
                Self Pickup
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#172033', marginTop: '4px' }}>
                {store.pickupTime || '15 mins'}
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>Ready at checkout counter</div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#065F46', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>shopping_bag</span>
                Order Limits
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#172033', marginTop: '4px' }}>
                Min ₹{store.minOrder}
              </div>
              <div style={{ fontSize: '11px', color: '#10B981', fontWeight: 600 }}>Free delivery over ₹{store.freeDeliveryAbove}</div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#D97706', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>sell</span>
                Pricing Policy
              </div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#172033', marginTop: '4px' }}>
                Store Counter Rates
              </div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>No third-party inflation</div>
            </div>
          </div>
        </div>
      </section>

      {/* Cart Feedback Notification */}
      {cartAlert && (
        <div
          style={{
            backgroundColor: '#172554',
            color: '#FFFFFF',
            borderRadius: '8px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(23, 37, 84, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="material-symbols-outlined" style={{ color: '#10B981' }}>check_circle</span>
            <span style={{ fontSize: '13px' }}>
              Added <strong>{cartAlert.productName}</strong> to your {cartAlert.storeName} cart.
            </span>
          </div>
          <Link to="/cart" style={{ color: '#93C5FD', fontWeight: 700, fontSize: '13px', textDecoration: 'underline' }}>
            View Cart
          </Link>
        </div>
      )}

      {/* 2. Store Search and Aisle Shelf (Sticky) */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
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
              All Items ({storeCatalogItems.length})
            </button>
            <button
              onClick={() => setActiveCategoryFilter('dairy')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: activeCategoryFilter === 'dairy' ? '#172554' : '#F1F5F9',
                color: activeCategoryFilter === 'dairy' ? '#FFFFFF' : '#475569',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              Dairy &amp; Bakery
            </button>
            <button
              onClick={() => setActiveCategoryFilter('staples')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: activeCategoryFilter === 'staples' ? '#172554' : '#F1F5F9',
                color: activeCategoryFilter === 'staples' ? '#FFFFFF' : '#475569',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              Atta, Dal &amp; Staples
            </button>
            <button
              onClick={() => setActiveCategoryFilter('beverages')}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: activeCategoryFilter === 'beverages' ? '#172554' : '#F1F5F9',
                color: activeCategoryFilter === 'beverages' ? '#FFFFFF' : '#475569',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              Beverages &amp; Cold Drinks
            </button>
          </div>
        </div>
      </section>

      {/* 3. Store Product Catalog Grid */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172033' }}>
              Store Catalog ({filteredProducts.length} items)
            </h2>
            <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              Prices and stock verified for direct fulfillment by {store.name}
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '36px', textAlign: 'center' }}>
            <p style={{ color: '#64748B', fontSize: '14px' }}>No items match your selected filter in this store.</p>
            <Button variant="outline" size="sm" onClick={() => { setActiveCategoryFilter('all'); setStoreSearchQuery(''); }} style={{ marginTop: '12px' }}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {filteredProducts.map((entry) => (
              <ProductCard
                key={entry.product.id}
                product={entry.product}
                store={store}
                storePrice={entry.storePrice}
                mrp={entry.mrp}
                availability={entry.availability}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
