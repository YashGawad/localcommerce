import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../shared/Button';
import { useCart } from '../../context/CartContext';
import styles from './ProductCard.module.css';

/**
 * Reusable Customer Product Card
 * Matches Stitch visual design:
 * Image -> Product Name -> Size/Variant -> Store Tag -> Price & MRP -> Add Button
 */
export default function ProductCard({
  product,
  store,
  storePrice,
  mrp,
  availability = 'In Stock',
  onAddToCart,
}) {
  const [qty, setQty] = useState(0);
  const cartContext = useCart();

  const price = storePrice || (product ? product.mrp - 4 : 50);
  const originalPrice = mrp || (product ? product.mrp : 55);
  const discount = originalPrice > price ? originalPrice - price : 0;
  const isOutOfStock = availability === 'Out of Stock';

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    setQty(1);
    if (onAddToCart) {
      onAddToCart(product, store, 1);
    } else if (cartContext?.addToCart) {
      const activeStore = store || product?.store || (product?.storeId ? { id: product.storeId, name: product.storeName || 'Local Store' } : null);
      if (activeStore) {
        cartContext.addToCart(product, { storePrice: price, mrp: originalPrice, unit: product?.unit, raw: product.raw || product }, activeStore, 1);
      }
    }
  };

  const handleInc = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQty((prev) => prev + 1);
    if (onAddToCart) {
      onAddToCart(product, store, qty + 1);
    } else if (cartContext?.addToCart) {
      const activeStore = store || product?.store || (product?.storeId ? { id: product.storeId, name: product.storeName || 'Local Store' } : null);
      if (activeStore) {
        cartContext.addToCart(product, { storePrice: price, mrp: originalPrice, unit: product?.unit, raw: product.raw || product }, activeStore, 1);
      }
    }
  };

  const handleDec = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQty((prev) => Math.max(0, prev - 1));
    if (onAddToCart) {
      onAddToCart(product, store, qty - 1);
    }
  };

  const detailUrl = store?.slug
    ? `/store/${store.slug}/product/${product.id}`
    : `/product/${product.id}`;

  return (
    <div className={styles.card}>
      {/* Product Image Area */}
      <Link to={detailUrl} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div className={styles.imageArea}>
          {product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className={styles.productImage}
              loading="lazy"
            />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#CBD5E1' }}>
              inventory_2
            </span>
          )}

          {/* Discount Chip */}
          {discount > 0 && (
            <span className={styles.saveBadge}>
              SAVE ₹{discount}
            </span>
          )}

          {/* Availability Chip if low or out of stock */}
          {isOutOfStock ? (
            <span className={styles.outOfStockBadge}>
              Out of Stock
            </span>
          ) : availability === 'Low Stock' ? (
            <span className={styles.lowStockBadge}>
              Low Stock
            </span>
          ) : null}
        </div>

        {/* Content Body */}
        <div className={styles.contentBody}>
          {/* Brand & Variant */}
          <div className={styles.brandRow}>
            <span className={styles.brandText}>
              {product.brand}
            </span>
            <span className={styles.unitText}>
              {product.unit}
            </span>
          </div>

          {/* Product Title */}
          <h3 className={styles.title}>
            {product.title}
          </h3>

          {/* Fulfilling Store Tag */}
          {store && (
            <div className={styles.storeTag}>
              <span className="material-symbols-outlined" style={{ fontSize: '13px', color: '#2563EB' }}>
                storefront
              </span>
              <span className={styles.storeName}>
                {store.name}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Pricing & Add to Cart Footer */}
      <div className={styles.footer}>
        <div className={styles.priceGroup}>
          <div className={styles.priceRow}>
            <span className={styles.currentPrice}>
              ₹{price}
            </span>
            {originalPrice > price && (
              <span className={styles.originalPrice}>
                ₹{originalPrice}
              </span>
            )}
          </div>
          <span className={styles.rateLabel}>Store-direct rate</span>
        </div>

        {/* Add Button / Counter */}
        {isOutOfStock ? (
          <Button variant="ghost" size="sm" disabled style={{ fontSize: '11px', color: '#94A3B8' }}>
            Unavailable
          </Button>
        ) : qty === 0 ? (
          <Button variant="outline" size="sm" onClick={handleAdd} icon="add">
            Add
          </Button>
        ) : (
          <div className={styles.stepper}>
            <button
              onClick={handleDec}
              className={styles.stepperBtn}
              aria-label="Decrease quantity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>remove</span>
            </button>
            <span className={styles.stepperCount}>
              {qty}
            </span>
            <button
              onClick={handleInc}
              className={styles.stepperBtn}
              aria-label="Increase quantity"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
