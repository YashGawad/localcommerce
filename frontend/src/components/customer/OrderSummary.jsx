import { Link } from 'react-router-dom';

/**
 * Reusable OrderSummary Component
 * Displays subtotal, store delivery fee, packaging, free delivery progress, total, and primary CTA.
 */
export default function OrderSummary({
  store,
  itemsCount = 0,
  subtotal = 0,
  deliveryFee = 0,
  platformFee = 0,
  total = 0,
  savings = 0,
  freeDeliveryThreshold = 199,
  ctaText = 'Proceed to Checkout',
  ctaLink = '/checkout',
  onCtaClick,
  disabled = false,
  isCheckoutMode = false,
}) {
  const isFreeDelivery = deliveryFee === 0;
  const remainingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #E2E8F0',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#172554',
          margin: '0 0 6px 0',
        }}
      >
        {isCheckoutMode ? 'Order Payment Summary' : 'Order Summary'}
      </h2>

      {store && (
        <p
          style={{
            fontSize: '12px',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            margin: '0 0 20px 0',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
            local_shipping
          </span>
          <span>Dispatched directly by {store.name}</span>
        </p>
      )}

      {/* Breakdown Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#172033' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748B' }}>Subtotal ({itemsCount} items)</span>
          <span style={{ fontWeight: 600 }}>₹{subtotal}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ color: '#64748B', display: 'block' }}>Delivery Fee</span>
            {!isFreeDelivery && remainingForFreeDelivery > 0 && (
              <span style={{ fontSize: '11px', color: '#2563EB' }}>
                Add ₹{remainingForFreeDelivery} more for free delivery
              </span>
            )}
          </div>
          <span style={{ fontWeight: 600, color: isFreeDelivery ? '#10B981' : '#172033' }}>
            {isFreeDelivery ? 'FREE' : `₹${deliveryFee}`}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748B' }}>Store Packaging</span>
          <span style={{ color: '#2563EB', fontWeight: 500, fontSize: '13px' }}>Free</span>
        </div>

        {platformFee > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748B' }}>Platform Fee</span>
            <span style={{ fontWeight: 600 }}>₹{platformFee}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748B' }}>Platform Fee</span>
            <span style={{ color: '#2563EB', fontSize: '11px', backgroundColor: '#EFF6FF', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
              Waived (₹0)
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748B' }}>Applicable Taxes</span>
          <span style={{ color: '#64748B', fontSize: '13px' }}>Included</span>
        </div>

        {/* Free Delivery Target Indicator */}
        {!isFreeDelivery && remainingForFreeDelivery > 0 && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              marginTop: '4px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                fontWeight: 600,
                color: '#172033',
                marginBottom: '6px',
              }}
            >
              <span>Free delivery target (₹{freeDeliveryThreshold})</span>
              <span>₹{subtotal} / ₹{freeDeliveryThreshold}</span>
            </div>
            <div
              style={{
                width: '100%',
                height: '6px',
                backgroundColor: '#E2E8F0',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${freeDeliveryProgress}%`,
                  height: '100%',
                  backgroundColor: '#2563EB',
                  borderRadius: '999px',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '6px 0' }} />

        {/* Total Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#172554', display: 'block' }}>
              Total Payable
            </span>
            {savings > 0 && (
              <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>
                You save ₹{savings} on MRP
              </span>
            )}
          </div>
          <span style={{ fontSize: '26px', fontWeight: 800, color: '#172554' }}>
            ₹{total}
          </span>
        </div>
      </div>

      {/* Primary CTA */}
      <div style={{ marginTop: '20px' }}>
        {onCtaClick ? (
          <button
            type="button"
            onClick={onCtaClick}
            disabled={disabled}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: disabled ? '#94A3B8' : '#2563EB',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span>{ctaText}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_forward
            </span>
          </button>
        ) : (
          <Link
            to={ctaLink}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(37,99,235,0.2)',
              boxSizing: 'border-box',
            }}
          >
            <span>{ctaText}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              arrow_forward
            </span>
          </Link>
        )}
      </div>

      {/* Trust & Guarantee Box */}
      <div
        style={{
          marginTop: '20px',
          padding: '14px',
          backgroundColor: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #E2E8F0',
        }}
      >
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#172554',
            letterSpacing: '0.05em',
            display: 'block',
            marginBottom: '10px',
          }}
        >
          Neighborhood Retail Assurance
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: '#64748B' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
              receipt_long
            </span>
            <span>Direct printed store counter receipt</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
              shield
            </span>
            <span>Safe, contactless neighborhood delivery</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
              published_with_changes
            </span>
            <span>Doorstep replacement for damaged goods</span>
          </div>
        </div>
      </div>
    </div>
  );
}
