
/**
 * CartItem Component
 * Matches Stitch Customer Cart line item styling:
 * Image -> Details (Title, Availability, Unit/Variant, Price, MRP) -> Quantity Stepper -> Subtotal -> Actions
 */
export default function CartItem({ item, onUpdateQuantity, onRemove }) {
  if (!item) return null;

  const itemSubtotal = item.price * item.quantity;
  const hasDiscount = item.mrp && item.mrp > item.price;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '16px 0',
        borderBottom: '1px solid #E2E8F0',
        flexWrap: 'wrap',
      }}
      className="cart-item-row"
    >
      {/* Product Image & Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px', flex: 1 }}>
        <div
          style={{
            width: '76px',
            height: '76px',
            borderRadius: '8px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#94A3B8' }}>
              inventory_2
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 600,
                color: '#172033',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {item.title}
            </h3>
            {item.availability && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#EFF6FF',
                  color: '#2563EB',
                }}
              >
                {item.availability}
              </span>
            )}
          </div>

          <span style={{ fontSize: '13px', color: '#64748B' }}>
            {item.variant}
          </span>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#172033' }}>
              ₹{item.price}
            </span>
            {hasDiscount && (
              <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                MRP ₹{item.mrp}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quantity Stepper & Subtotal */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        {/* Quantity Controls */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            backgroundColor: '#F1F5F9',
            borderRadius: '6px',
            padding: '2px',
            border: '1px solid #E2E8F0',
          }}
        >
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#FFFFFF',
              color: '#172033',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            title="Decrease quantity"
            aria-label="Decrease quantity"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              remove
            </span>
          </button>
          <span
            style={{
              width: '32px',
              textAlign: 'center',
              fontSize: '13px',
              fontWeight: 600,
              color: '#172033',
            }}
          >
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: '#FFFFFF',
              color: '#172033',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
            title="Increase quantity"
            aria-label="Increase quantity"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              add
            </span>
          </button>
        </div>

        {/* Item Subtotal & Action */}
        <div style={{ textAlign: 'right', minWidth: '70px' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: '#172554', display: 'block' }}>
            ₹{itemSubtotal}
          </span>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '11px',
                fontWeight: 500,
                color: '#EF4444',
                cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
