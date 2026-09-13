import styles from './CartItem.module.css';

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
    <div className={styles.row}>
      {/* Product Image & Info */}
      <div className={styles.productInfo}>
        <div className={styles.imageWrapper}>
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className={styles.productImg}
            />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#94A3B8' }}>
              inventory_2
            </span>
          )}
        </div>

        <div className={styles.detailsCol}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>
              {item.title}
            </h3>
            {item.availability && (
              <span className={styles.availabilityBadge}>
                {item.availability}
              </span>
            )}
          </div>

          <span className={styles.variantText}>
            {item.variant}
          </span>

          <div className={styles.priceRow}>
            <span className={styles.currentPrice}>
              ₹{item.price}
            </span>
            {hasDiscount && (
              <span className={styles.mrpText}>
                MRP ₹{item.mrp}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quantity Stepper & Subtotal */}
      <div className={styles.controlsGroup}>
        {/* Quantity Controls */}
        <div className={styles.stepper}>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            className={styles.stepperBtn}
            title="Decrease quantity"
            aria-label="Decrease quantity"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              remove
            </span>
          </button>
          <span className={styles.stepperCount}>
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            className={styles.stepperBtn}
            title="Increase quantity"
            aria-label="Increase quantity"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              add
            </span>
          </button>
        </div>

        {/* Item Subtotal & Action */}
        <div className={styles.subtotalCol}>
          <span className={styles.subtotalText}>
            ₹{itemSubtotal}
          </span>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              className={styles.removeBtn}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
