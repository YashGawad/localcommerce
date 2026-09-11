import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { GLOBAL_PRODUCTS, STORE_LISTINGS } from '../../data/products';
import { MOCK_STORES } from '../../data/stores';
import ProductCard from '../../components/customer/ProductCard';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';

/**
 * Screen 2: Customer Search Results
 * Visual Source of Truth: Stitch screen 'LocalCommerce Search Results' (6cfc1e5cecc44acfabf9521793237a42)
 * Demonstrates cross-store discovery: searching "milk" shows matching products and which stores offer them.
 */
export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawQuery = searchParams.get('q');
  const query = rawQuery !== null ? rawQuery : 'milk'; // Default to "milk" per Stitch demonstration

  // Filter States
  const [selectedStores, setSelectedStores] = useState(['store_01', 'store_02']);
  const [inStockOnly, setInStockOnly] = useState(true);
  const [fulfillmentFilter, setFulfillmentFilter] = useState('all'); // 'all', 'delivery', 'pickup'

  const toggleStore = (storeId) => {
    if (selectedStores.includes(storeId)) {
      setSelectedStores(selectedStores.filter((id) => id !== storeId));
    } else {
      setSelectedStores([...selectedStores, storeId]);
    }
  };

  // Find all store listings matching the query
  const searchResults = [];
  const normalizedQuery = query.toLowerCase().trim();

  GLOBAL_PRODUCTS.forEach((prod) => {
    const matchesProduct =
      prod.title.toLowerCase().includes(normalizedQuery) ||
      prod.brand.toLowerCase().includes(normalizedQuery) ||
      prod.categoryName.toLowerCase().includes(normalizedQuery);

    if (matchesProduct) {
      // Find listings for this product across selected stores
      MOCK_STORES.forEach((store) => {
        if (selectedStores.length === 0 || selectedStores.includes(store.id)) {
          const storeItems = STORE_LISTINGS[store.id] || [];
          const listing = storeItems.find((item) => item.productId === prod.id);

          if (listing) {
            if (inStockOnly && listing.availability === 'Out of Stock') {
              return;
            }
            if (fulfillmentFilter === 'delivery' && !store.fulfillmentTypes.includes('delivery')) {
              return;
            }
            if (fulfillmentFilter === 'pickup' && !store.fulfillmentTypes.includes('pickup')) {
              return;
            }

            searchResults.push({
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
      {/* Search Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#172033', letterSpacing: '-0.015em' }}>
              Search Results
            </h1>
            <Badge variant="info" size="sm">Cross-Store Discovery</Badge>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
            Showing <strong>{searchResults.length} results</strong> for "{query}" across nearby neighbourhood stores in Panch Pakhadi (400602)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedStores(['store_01', 'store_02', 'store_03', 'store_04']);
              setInStockOnly(false);
              setFulfillmentFilter('all');
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Main Grid: Filters Column + Results Column */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Left Filter Facet Panel (Pinned on Desktop) */}
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
            maxWidth: '300px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#172033', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
              {MOCK_STORES.map((store) => (
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
                    {store.distance?.split(' ')[0]}
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

          {/* Fulfillment Type */}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.03em', marginBottom: '8px' }}>
              Fulfillment Speed
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentFilter === 'all'}
                  onChange={() => setFulfillmentFilter('all')}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>All Options</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentFilter === 'delivery'}
                  onChange={() => setFulfillmentFilter('delivery')}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>Store Delivery (20–35m)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fulfillment"
                  checked={fulfillmentFilter === 'pickup'}
                  onChange={() => setFulfillmentFilter('pickup')}
                  style={{ accentColor: '#2563EB' }}
                />
                <span>Self Pickup (Ready in 10–15m)</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Right Results Grid */}
        <div style={{ flex: 1, minWidth: '320px' }}>
          {searchResults.length === 0 ? (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '48px 24px',
                textAlign: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#94A3B8' }}>
                search_off
              </span>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172033', marginTop: '12px' }}>
                No direct matches found for "{query}"
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', maxWidth: '360px', margin: '4px auto 16px' }}>
                Try adjusting your search terms or clearing your selected store filters.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedStores(['store_01', 'store_02', 'store_03', 'store_04']);
                  setInStockOnly(false);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: '16px',
              }}
            >
              {searchResults.map((item) => (
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
