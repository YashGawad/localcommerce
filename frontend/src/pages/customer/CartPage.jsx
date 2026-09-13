import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/customer/CartItem';
import OrderSummary from '../../components/customer/OrderSummary';

/**
 * Screen 1 — Customer Cart (/cart)
 * Faithfully matches Stitch Customer Cart visual design:
 * Single-Store Cart Banner -> Cart Items List -> Single-Store Guarantee -> Sticky Order Summary
 */
export default function CartPage() {
  const {
    store,
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    savings,
    minOrder,
    isMinOrderMet,
    freeDeliveryThreshold,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  // Empty state handling
  if (!items || items.length === 0) {
    return (
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px', minHeight: '60vh' }}>
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            padding: '48px 24px',
            textAlign: 'center',
            maxWidth: '560px',
            margin: '0 auto',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              shopping_bag
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172554', margin: '0 0 8px 0' }}>
            Your Cart is Empty
          </h2>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 24px 0', lineHeight: 1.5 }}>
            Discover fresh groceries, staples, bakery goods, and more from verified local shops in your neighborhood.
          </p>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              storefront
            </span>
            <span>Explore Local Stores</span>
          </Link>
        </div>
      </div>
    );
  }

  const storeName = store?.name || 'Local Store';
  const storeSlug = store?.slug || 'shree-kirana';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 64px 16px' }}>
      {/* Top Breadcrumb & Title */}
      <div style={{ marginBottom: '24px' }}>
        <nav
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: '#64748B',
            marginBottom: '8px',
          }}
        >
          <Link to="/" style={{ color: '#64748B', textDecoration: 'none' }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: '#172033', fontWeight: 600 }}>Cart</span>
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#172554', margin: 0, letterSpacing: '-0.01em' }}>
            Your Shopping Cart
          </h1>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '4px',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Store Fulfillment Header Card (One Cart = One Store Rule) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '20px 24px',
          marginBottom: '32px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                storefront
              </span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#172554', margin: 0 }}>
                  {storeName}
                </h2>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#F59E0B' }}>
                    star
                  </span>
                  {store?.rating || 4.8} ({store?.reviewCount || 184} reviews)
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#F1F5F9',
                    color: '#475569',
                  }}
                >
                  {store?.distance || '0.8 km away'} • {store?.location || 'Panch Pakhadi'}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#ECFDF5',
                    color: '#059669',
                  }}
                >
                  Open now
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#64748B',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
                    moped
                  </span>
                  Store Delivery: <strong style={{ color: '#172033' }}>{store?.deliveryTime || '20–45 mins'}</strong>
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
                    shopping_basket
                  </span>
                  Pickup Ready: <strong style={{ color: '#172033' }}>{store?.pickupTime || '15 mins'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                backgroundColor: isMinOrderMet ? '#ECFDF5' : '#FEF3C7',
                borderRadius: '8px',
                fontSize: '13px',
                color: isMinOrderMet ? '#065F46' : '#92400E',
                fontWeight: 500,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                {isMinOrderMet ? 'check_circle' : 'info'}
              </span>
              <span>
                Min. order ₹{minOrder} (
                <strong>{isMinOrderMet ? `Met: ₹${subtotal} in cart` : `Need ₹${minOrder - subtotal} more`}</strong>
                )
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Checkout Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Items (takes 2fr when wide) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: '0', flex: 2 }}>
          {/* Cart Items Container */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div
              style={{
                padding: '14px 20px',
                backgroundColor: '#F8FAFC',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#64748B',
                letterSpacing: '0.05em',
              }}
            >
              <span>Item Details</span>
              <span>Subtotal</span>
            </div>

            <div style={{ padding: '0 20px' }}>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))}
            </div>
          </div>

          {/* Single-Store Cart Guarantee */}
          <div
            style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                verified
              </span>
            </div>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#172554', margin: '0 0 2px 0' }}>
                Single-Store Cart Guarantee
              </h4>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                You are shopping strictly from <strong>{storeName}</strong>. Adding items from another neighborhood
                vendor will automatically prompt you to fulfill this batch first or switch baskets.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <Link
              to={`/store/${storeSlug}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: '#2563EB',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_back
              </span>
              <span>Continue Shopping from {storeName}</span>
            </Link>

            <button
              type="button"
              onClick={clearCart}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                delete_sweep
              </span>
              <span>Clear Entire Cart</span>
            </button>
          </div>
        </div>

        {/* Right Column: Sticky Summary Card */}
        <div style={{ position: 'sticky', top: '96px', flex: 1, minWidth: '300px' }}>
          <OrderSummary
            store={store}
            itemsCount={itemCount}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            total={total}
            savings={savings}
            freeDeliveryThreshold={freeDeliveryThreshold}
            ctaText="Proceed to Checkout"
            ctaLink="/checkout"
            disabled={!isMinOrderMet}
          />
        </div>
      </div>
    </div>
  );
}
