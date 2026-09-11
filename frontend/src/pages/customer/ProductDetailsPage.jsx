import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GLOBAL_PRODUCTS, getListingsForProduct } from '../../data/products';
import { MOCK_STORES } from '../../data/stores';
import StoreListingCard from '../../components/customer/StoreListingCard';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import { useCart } from '../../context/CartContext';

/**
 * Screen 5: Customer Product Details
 * Visual Source of Truth: Stitch screen 'LocalCommerce Product Details - Amul Taaza 1L' (e5d7f49fb167407b989b817dfe39eb62)
 * Demonstrates: Canonical Global Product identity + Fulfilling Local Store selection buy box.
 */
export default function ProductDetailsPage() {
  const { id } = useParams();

  // Find global product or default to Amul Taaza
  const product = GLOBAL_PRODUCTS.find((p) => p.id === id) || GLOBAL_PRODUCTS[0];

  // Get fulfilling store listings
  const listings = getListingsForProduct(product.id);

  // Default selected store listing
  const defaultSelectedStoreId = listings.find((l) => l.isRecommended)?.storeId || listings[0]?.storeId || 'store_02';
  const [selectedStoreId, setSelectedStoreId] = useState(defaultSelectedStoreId);

  // Selected pack variant
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]?.name || product.unit);

  const { addToCart } = useCart();
  // Add to cart state feedback
  const [cartState, setCartState] = useState({ added: false, count: 0 });

  const activeStore = MOCK_STORES.find((s) => s.id === selectedStoreId) || MOCK_STORES[0];
  const activeListing = listings.find((l) => l.storeId === selectedStoreId) || listings[0];
  const isOutOfStock = activeListing?.availability === 'Out of Stock';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, activeListing, activeStore, 1);
    setCartState({ added: true, count: (cartState.count || 0) + 1 });
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 48px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Breadcrumb Strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B' }}>
        <Link to="/" style={{ color: 'inherit' }}>Home</Link>
        <span>›</span>
        <Link to={`/categories/${product.category}`} style={{ color: 'inherit' }}>{product.categoryName}</Link>
        <span>›</span>
        <span style={{ color: '#172033', fontWeight: 600 }}>{product.title}</span>
      </div>

      {/* 2. Main Dual-Column Product Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Product Imagery Gallery & Aggregate Rating */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Main Photo Box */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '380px',
              position: 'relative',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <img
              src={product.image}
              alt={product.title}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
            <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
              <Badge variant="success" size="sm">Authentic Local Batch</Badge>
            </div>
          </div>

          {/* Thumbnail Selector Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div
              style={{
                height: '74px',
                backgroundColor: '#FFFFFF',
                border: '2px solid #2563EB',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <img src={product.image} alt="Thumbnail 1" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
            </div>
            <div
              style={{
                height: '74px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                fontSize: '11px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#2563EB' }}>nutrition</span>
              <span>Nutrition</span>
            </div>
            <div
              style={{
                height: '74px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                fontSize: '11px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#10B981' }}>verified</span>
              <span>Quality Check</span>
            </div>
            <div
              style={{
                height: '74px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '6px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748B',
                fontSize: '11px',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#F59E0B' }}>qr_code</span>
              <span>Batch Stamp</span>
            </div>
          </div>

          {/* Verified Rating Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#172033', lineHeight: 1 }}>
                  {product.rating || '4.8'}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#F59E0B', fontVariationSettings: "'FILL' 1" }}>
                  star
                </span>
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#172033' }}>
                  Global Product Rating
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Based on {product.reviewsCount || 128} verified neighbourhood consumer quality checks
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Specifications, Variants & Fulfilling Store Buy Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Product Header & Description Card */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: '#2563EB',
                  backgroundColor: '#EFF6FF',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  letterSpacing: '0.04em',
                }}
              >
                {product.brand}
              </span>
              <span style={{ fontSize: '12px', color: '#065F46', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10B981' }}>bolt</span>
                Hyperlocal Delivery in 20–35 mins
              </span>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#172033', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              {product.title}
            </h1>

            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6 }}>
              {product.description}
            </p>

            {/* Pack Size Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#172033', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Select Pack Size:
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {product.variants.map((v) => {
                    const isSelected = selectedVariant === v.name;
                    return (
                      <button
                        key={v.name}
                        onClick={() => setSelectedVariant(v.name)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: 600,
                          backgroundColor: isSelected ? '#172554' : '#F8FAFC',
                          color: isSelected ? '#FFFFFF' : '#172033',
                          border: isSelected ? '1px solid #172554' : '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                        }}
                      >
                        {isSelected && <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>check</span>}
                        <span>{v.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Nutritional Spec Strip */}
            {product.nutrition && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
                  gap: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px',
                  marginTop: '4px',
                }}
              >
                {Object.entries(product.nutrition).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'capitalize' }}>{key}</span>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#172033' }}>{val}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. CORE LOCALCOMMERCE FEATURE: Choose Fulfilling Local Store */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#172033' }}>
                  Fulfill from Local Stores
                </h2>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  Choose which neighborhood store fulfills this order for direct batch quality &amp; speed
                </p>
              </div>
              <span style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px' }}>
                📍 Near Panch Pakhadi (400602)
              </span>
            </div>

            {/* Store Listing Cards List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {listings.map((listing) => {
                const store = MOCK_STORES.find((s) => s.id === listing.storeId) || MOCK_STORES[0];
                return (
                  <StoreListingCard
                    key={listing.storeId}
                    listing={listing}
                    store={store}
                    isSelected={selectedStoreId === store.id}
                    onSelect={(id) => setSelectedStoreId(id)}
                  />
                );
              })}
            </div>

            {/* Buy Box Action Shelf */}
            <div
              style={{
                marginTop: '8px',
                paddingTop: '16px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', color: '#64748B' }}>Fulfilling via {activeStore.name}</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#172033' }}>
                  ₹{activeListing?.storePrice || product.mrp}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  icon={cartState.added ? 'check_circle' : 'shopping_cart'}
                >
                  {isOutOfStock
                    ? 'Store Out of Stock'
                    : cartState.added
                    ? `Added to Cart (${cartState.count})`
                    : `Add to ${activeStore.name.split(' ')[0]} Cart`}
                </Button>

                <Link to="/cart">
                  <Button variant="outline" size="lg">
                    View Cart
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
