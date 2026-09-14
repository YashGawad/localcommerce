import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import storeService from '../../services/storeService';
import productService from '../../services/productService';
import StoreListingCard from '../../components/customer/StoreListingCard';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import { useCart } from '../../context/CartContext';

/**
 * Screen 5: Customer Product Details
 * Connects to real global product identity and live store product listings
 */
export default function ProductDetailsPage() {
  const { id, slug } = useParams();

  const [product, setProduct] = useState(null);
  const [listings, setListings] = useState([]);
  const [storesMap, setStoresMap] = useState({});
  const [selectedStoreId, setSelectedStoreId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addToCart } = useCart();
  const [cartState, setCartState] = useState({ added: false, count: 0 });

  useEffect(() => {
    let isMounted = true;

    async function loadProductAndListings() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch all active stores for lookup
        const allStores = await storeService.getAllStores();
        const activeStores = allStores.filter((s) => s.status === 'active');
        const sMap = {};
        activeStores.forEach((st) => {
          sMap[st.id] = st;
        });

        let targetProduct = null;
        let matchedListings = [];

        if (slug) {
          // Navigated via /store/:slug/product/:id
          const scopedStore = activeStores.find((s) => s.slug === slug);
          if (scopedStore) {
            const sp = await productService.getStoreProductById(scopedStore.id, id);
            if (sp) {
              targetProduct = sp;
              matchedListings.push({
                storeId: scopedStore.id,
                storePrice: sp.price,
                mrp: sp.mrp,
                availability: sp.availability,
                isRecommended: true,
                raw: sp,
              });

              // If mapped to global product, find other stores offering it
              if (sp.globalProductId) {
                const otherStores = activeStores.filter((s) => s.id !== scopedStore.id);
                for (const ost of otherStores) {
                  try {
                    const otherProds = await productService.getStoreProducts(ost.id);
                    const match = otherProds.find((p) => p.globalProductId === sp.globalProductId);
                    if (match) {
                      matchedListings.push({
                        storeId: ost.id,
                        storePrice: match.price,
                        mrp: match.mrp,
                        availability: match.availability,
                        isRecommended: false,
                        raw: match,
                      });
                    }
                  } catch {
                    // Ignore individual store fetch failures
                  }
                }
              }
            }
          }
        } else {
          // Direct /product/:id lookup (try global product or store product)
          try {
            const gp = await productService.getGlobalProductById(id);
            if (gp) {
              targetProduct = gp;
              for (const st of activeStores) {
                try {
                  const storeProds = await productService.getStoreProducts(st.id);
                  const match = storeProds.find((p) => p.globalProductId === gp.id);
                  if (match) {
                    matchedListings.push({
                      storeId: st.id,
                      storePrice: match.price,
                      mrp: match.mrp,
                      availability: match.availability,
                      isRecommended: matchedListings.length === 0,
                      raw: match,
                    });
                  }
                } catch {
                  // Ignore
                }
              }
            }
          } catch {
            // Not a global product UUID, try search across store products
            for (const st of activeStores) {
              try {
                const sp = await productService.getStoreProductById(st.id, id);
                if (sp) {
                  targetProduct = sp;
                  matchedListings.push({
                    storeId: st.id,
                    storePrice: sp.price,
                    mrp: sp.mrp,
                    availability: sp.availability,
                    isRecommended: true,
                    raw: sp,
                  });
                  break;
                }
              } catch {
                // Continue searching
              }
            }
          }
        }

        if (!targetProduct) {
          throw new Error('Product not found');
        }

        if (isMounted) {
          setProduct(targetProduct);
          setStoresMap(sMap);
          setListings(matchedListings);
          if (matchedListings.length > 0) {
            setSelectedStoreId(matchedListings[0].storeId);
          }
        }
      } catch (err) {
        console.error('Failed to load product details:', err);
        if (isMounted) {
          setError(err.message || 'Product not found');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProductAndListings();
    return () => {
      isMounted = false;
    };
  }, [id, slug]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1280px', margin: '60px auto', padding: '0 16px', textAlign: 'center', color: '#64748B' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <div style={{ marginTop: '16px', fontSize: '15px', fontWeight: 600 }}>Loading product specifications...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '32px 16px', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94A3B8' }}>
          inventory_2
        </span>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#172033', marginTop: '12px' }}>
          Product Not Found
        </h2>
        <p style={{ color: '#64748B', marginTop: '6px', fontSize: '14px' }}>
          The item you requested is not currently listed in our local commerce network.
        </p>
        <Link to="/" style={{ marginTop: '20px', display: 'inline-block' }}>
          <Button variant="primary">Return Home</Button>
        </Link>
      </div>
    );
  }

  const activeStore = storesMap[selectedStoreId] || Object.values(storesMap)[0] || {
    id: selectedStoreId,
    name: 'Local Merchant',
    rating: '4.8',
    deliveryTime: '20–35 mins',
  };

  const activeListing = listings.find((l) => l.storeId === selectedStoreId) || listings[0] || {
    storePrice: product.price || product.mrp,
    mrp: product.mrp || product.price,
    availability: 'In Stock',
  };

  const isOutOfStock = activeListing.availability === 'Out of Stock';

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
        <Link to="/categories" style={{ color: 'inherit' }}>Catalog</Link>
        <span>›</span>
        <span style={{ color: '#172033', fontWeight: 600 }}>{product.title || product.name}</span>
      </div>

      {/* 2. Main Dual-Column Product Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Imagery & Guarantee */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
              alt={product.title || product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
              }}
            />
            <div style={{ position: 'absolute', top: '16px', left: '16px' }}>
              <Badge variant="success" size="sm">Authentic Local Inventory</Badge>
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '12px',
              color: '#64748B',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#10B981' }}>verified_user</span>
              100% Genuine Retailer Product
            </span>
            <span>Direct Store Receipt</span>
          </div>
        </div>

        {/* Right Column: Title, Identity & Fulfilling Store Buy Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              {product.brand && (
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#2563EB',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {product.brand}
                </span>
              )}
              <span style={{ fontSize: '12px', color: '#065F46', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#10B981' }}>bolt</span>
                Hyperlocal Delivery in 20–35 mins
              </span>
            </div>

            <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#172033', letterSpacing: '-0.02em', lineHeight: 1.25, margin: 0 }}>
              {product.title || product.name}
            </h1>

            {product.description && (
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                {product.description}
              </p>
            )}

            {product.unit && (
              <div style={{ fontSize: '13px', color: '#475569' }}>
                Unit / Size: <strong>{product.unit}</strong>
              </div>
            )}
          </div>

          {/* Fulfill from Local Stores Buy Box */}
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
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#172033', margin: 0 }}>
                  Fulfill from Local Stores
                </h2>
                <p style={{ fontSize: '12px', color: '#64748B', marginTop: '2px', margin: 0 }}>
                  Select which neighborhood store fulfills this order for direct batch quality &amp; speed
                </p>
              </div>
            </div>

            {/* Store Listing Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {listings.length === 0 ? (
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '8px', color: '#64748B', fontSize: '13px' }}>
                  Currently not in stock at nearby stores.
                </div>
              ) : (
                listings.map((listing) => {
                  const store = storesMap[listing.storeId] || {
                    id: listing.storeId,
                    name: 'Local Merchant',
                    rating: '4.8',
                    reviewCount: 20,
                    distance: '0.8 km',
                    location: 'Local Neighborhood',
                    deliveryTime: '20–35 mins',
                    minOrder: 100,
                    freeDeliveryAbove: 499,
                    fulfillmentTypes: ['delivery', 'pickup'],
                  };
                  return (
                    <StoreListingCard
                      key={listing.storeId}
                      listing={listing}
                      store={store}
                      isSelected={selectedStoreId === store.id}
                      onSelect={(id) => setSelectedStoreId(id)}
                    />
                  );
                })
              )}
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
                  ₹{activeListing.storePrice || product.price || product.mrp}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  variant="primary"
                  size="lg"
                  disabled={isOutOfStock || listings.length === 0}
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
