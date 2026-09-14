import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import addressService from '../../services/addressService';
import orderService from '../../services/orderService';

/**
 * Screen 2 — Customer Checkout (/checkout)
 * 3-step structured checkout:
 * Step 1: Fulfillment Mode (Store Delivery vs Self Pickup)
 * Step 2: Delivery Address & Rider Note
 * Step 3: Payment Method (UPI, Card, Net Banking, COD)
 * Right: Sticky Order Breakdown with Promo input and "Place Order" CTA
 */
export default function CheckoutPage() {
  const { store, items, itemCount, subtotal, deliveryFee, clearCart } = useCart();
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [newAddrForm, setNewAddrForm] = useState({
    label: 'Home',
    recipient_name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address_line1: '',
    address_line2: '',
    city: 'Thane',
    state: 'Maharashtra',
    postal_code: '400602',
    is_default: true,
  });

  // Checkout form state
  const [fulfillmentMode, setFulfillmentMode] = useState('delivery'); // 'delivery' | 'pickup'
  const [deliveryNote, setDeliveryNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'cod'
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [vpaVerified, setVpaVerified] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);

  // Fetch real addresses for authenticated customer
  useEffect(() => {
    let isMounted = true;
    async function loadAddresses() {
      if (!token) {
        setLoadingAddresses(false);
        return;
      }
      try {
        setLoadingAddresses(true);
        const list = await addressService.getAddresses();
        if (isMounted) {
          setAddresses(list);
          if (list.length > 0) {
            const def = list.find((a) => a.is_default) || list[0];
            setSelectedAddressId(def.id);
          }
        }
      } catch (err) {
        console.error('Failed to load customer addresses:', err);
      } finally {
        if (isMounted) setLoadingAddresses(false);
      }
    }
    loadAddresses();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0] || null;
  const activeDeliveryFee = fulfillmentMode === 'pickup' ? 0 : deliveryFee;
  const discountAmount = couponApplied ? 20 : 0;
  const finalTotal = Math.max(0, subtotal + activeDeliveryFee - discountAmount);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'WELCOME10' || couponCode.trim()) {
      setCouponApplied(true);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setOrderError(null);
    try {
      setSavingAddress(true);
      const created = await addressService.createAddress(newAddrForm);
      setAddresses((prev) => [created, ...prev]);
      setSelectedAddressId(created.id);
      setShowNewAddressForm(false);
    } catch (err) {
      setOrderError(err.data?.message || err.message || 'Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handlePlaceOrder = async () => {
    setOrderError(null);

    if (!token) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (!store?.id) {
      setOrderError('No store associated with your cart. Please add items from a local store.');
      return;
    }

    if (!items || items.length === 0) {
      setOrderError('Your cart is empty.');
      return;
    }

    if (fulfillmentMode === 'delivery' && !selectedAddressId) {
      setOrderError('A valid delivery address is required. Please add or select an address.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      const backendPaymentMethod = paymentMethod === 'netbanking' ? 'net_banking' : paymentMethod;
      const payload = {
        store_id: store.id,
        items: items.map((it) => ({
          store_product_id: it.storeProductId || it.productId,
          quantity: Number(it.quantity),
        })),
        fulfillment_type: fulfillmentMode,
        payment_method: backendPaymentMethod,
      };

      if (fulfillmentMode === 'delivery') {
        payload.customer_address_id = selectedAddressId;
      }

      if (deliveryNote && deliveryNote.trim()) {
        payload.customer_notes = deliveryNote.trim();
      }

      const createdOrder = await orderService.createOrder(payload);

      // On successful order creation in PostgreSQL, clear cart and navigate to confirmation
      clearCart();
      navigate('/order-confirmation', { state: { order: createdOrder } });
    } catch (err) {
      console.error('Error placing order:', err);
      const errMsg =
        err.data?.message ||
        err.message ||
        'Unable to place order. Some items may be out of stock or store unavailable.';
      setOrderError(errMsg);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // If cart is completely empty and no store
  if (!items || items.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#64748B' }}>
            shopping_cart
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#172554', marginTop: '12px' }}>
            Your Cart is Empty
          </h2>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '8px 0 20px 0' }}>
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            to="/"
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const storeName = store?.name || 'Shree Kirana & General Store';

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px 64px 16px' }}>
      {/* Breadcrumb Navigation */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: '#64748B',
          marginBottom: '12px',
        }}
      >
        <Link to="/cart" style={{ color: '#64748B', textDecoration: 'none' }}>
          Cart
        </Link>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
          chevron_right
        </span>
        <span style={{ color: '#172033', fontWeight: 600 }}>Checkout</span>
      </nav>

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          paddingBottom: '20px',
          borderBottom: '1px solid #E2E8F0',
          marginBottom: '32px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              backgroundColor: '#EFF6FF',
              color: '#1E40AF',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              marginBottom: '6px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px', color: '#2563EB' }}>
              verified_user
            </span>
            <span>Local Merchant Direct Settlement</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#172554', margin: 0, letterSpacing: '-0.02em' }}>
            Secure Checkout
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B', margin: '6px 0 0 0' }}>
            Fulfilling directly from <strong style={{ color: '#172033' }}>{storeName}</strong> •{' '}
            {store?.location || 'Panch Pakhadi, Thane West'}
          </p>
        </div>

        {/* Steps Progress Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: '10px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontWeight: 600, fontSize: '12px' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
              1
            </span>
            <span>Fulfillment</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#CBD5E1' }}>
            chevron_right
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontWeight: 600, fontSize: '12px' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
              2
            </span>
            <span>Address</span>
          </div>
          <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#CBD5E1' }}>
            chevron_right
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#2563EB', fontWeight: 600, fontSize: '12px' }}>
            <span style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563EB', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }}>
              3
            </span>
            <span>Payment</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: 3 Steps Form (flex 2) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', minWidth: 0, flex: 2 }}>
          {/* Real Backend Error Alert Banner */}
          {orderError && (
            <div
              style={{
                padding: '16px 20px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #F87171',
                borderRadius: '10px',
                color: '#991B1B',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(220, 38, 38, 0.1)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '22px', color: '#DC2626', flexShrink: 0 }}>
                error
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, marginBottom: '2px' }}>Unable to complete order</div>
                <div>{orderError}</div>
              </div>
              <button
                type="button"
                onClick={() => setOrderError(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#991B1B',
                  cursor: 'pointer',
                  fontSize: '18px',
                  lineHeight: 1,
                  padding: '2px',
                }}
              >
                ✕
              </button>
            </div>
          )}

          {/* STEP 1: Fulfillment Mode */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#172554',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  1
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
                    Fulfillment Method
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Select how you want to receive your order from {storeName}
                  </p>
                </div>
              </div>
            </div>

            {/* Mode Radios */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px' }}>
              {/* Option A: Store Delivery */}
              <div
                onClick={() => setFulfillmentMode('delivery')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: fulfillmentMode === 'delivery' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: fulfillmentMode === 'delivery' ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: fulfillmentMode === 'delivery' ? '5px solid #2563EB' : '2px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                        }}
                      />
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#172554' }}>
                        Store Delivery
                      </span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                    Estimated arrival: <strong>{store?.deliveryTime || '20–45 mins'}</strong>. Hand-picked &amp; dispatched by {storeName} delivery rider.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#2563EB', fontWeight: 500 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    moped
                  </span>
                  <span>Hyperlocal live tracking enabled</span>
                </div>
              </div>

              {/* Option B: In-Store Pickup */}
              <div
                onClick={() => setFulfillmentMode('pickup')}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: fulfillmentMode === 'pickup' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: fulfillmentMode === 'pickup' ? '#EFF6FF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: fulfillmentMode === 'pickup' ? '5px solid #2563EB' : '2px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          boxSizing: 'border-box',
                        }}
                      />
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#172554' }}>
                        Self Pickup
                      </span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>
                      FREE
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                    Ready in <strong>{store?.pickupTime || '15–30 mins'}</strong>. Pick up directly at counter: {store?.address?.split('-')[0] || 'Store Counter'}.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    storefront
                  </span>
                  <span>Direct counter handoff</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Delivery Address & Instructions */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#172554',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  2
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
                    {fulfillmentMode === 'pickup' ? 'Customer Contact Information' : 'Delivery Details'}
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                    {fulfillmentMode === 'pickup'
                      ? 'Store associate will verify recipient upon pickup'
                      : 'Confirm your drop location & rider instructions'}
                  </p>
                </div>
              </div>

              {fulfillmentMode === 'delivery' && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm((prev) => !prev)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    {showNewAddressForm ? 'close' : 'add_location_alt'}
                  </span>
                  <span>{showNewAddressForm ? 'Cancel New Address' : '+ Add New Address'}</span>
                </button>
              )}
            </div>

            {/* Inline New Address Form */}
            {fulfillmentMode === 'delivery' && showNewAddressForm && (
              <form
                onSubmit={handleSaveAddress}
                style={{
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  marginBottom: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#172554' }}>
                  Add Delivery Address
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>Recipient Name *</label>
                    <input
                      type="text"
                      required
                      value={newAddrForm.recipient_name}
                      onChange={(e) => setNewAddrForm({ ...newAddrForm, recipient_name: e.target.value })}
                      placeholder="e.g. John Doe"
                      style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={newAddrForm.phone}
                      onChange={(e) => setNewAddrForm({ ...newAddrForm, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>Address Label *</label>
                    <input
                      type="text"
                      required
                      value={newAddrForm.label}
                      onChange={(e) => setNewAddrForm({ ...newAddrForm, label: e.target.value })}
                      placeholder="e.g. Home, Office"
                      style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>Address Line 1 (Flat, Bldg, Street) *</label>
                  <input
                    type="text"
                    required
                    value={newAddrForm.address_line1}
                    onChange={(e) => setNewAddrForm({ ...newAddrForm, address_line1: e.target.value })}
                    placeholder="e.g. Flat 301, Sunshine Heights, Station Road"
                    style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>City *</label>
                    <input
                      type="text"
                      required
                      value={newAddrForm.city}
                      onChange={(e) => setNewAddrForm({ ...newAddrForm, city: e.target.value })}
                      placeholder="City"
                      style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>State *</label>
                    <input
                      type="text"
                      required
                      value={newAddrForm.state}
                      onChange={(e) => setNewAddrForm({ ...newAddrForm, state: e.target.value })}
                      placeholder="State"
                      style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '3px' }}>Postal Code *</label>
                    <input
                      type="text"
                      required
                      value={newAddrForm.postal_code}
                      onChange={(e) => setNewAddrForm({ ...newAddrForm, postal_code: e.target.value })}
                      placeholder="Postal Code"
                      style={{ width: '100%', height: '36px', padding: '0 10px', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: savingAddress ? 'not-allowed' : 'pointer' }}
                  >
                    {savingAddress ? 'Saving...' : 'Save & Use Address'}
                  </button>
                </div>
              </form>
            )}

            {/* Address Selection / Card */}
            {fulfillmentMode === 'pickup' ? (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                    person
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <strong style={{ fontSize: '15px', color: '#172554' }}>
                      {currentUser?.name || 'Store Customer'}
                    </strong>
                    <span style={{ fontSize: '13px', color: '#64748B' }}>
                      • {currentUser?.phone || currentUser?.email || 'Registered Customer'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 4px 0', lineHeight: 1.4 }}>
                    Pickup counter at: <strong>{storeName}</strong> ({store?.address || 'Store Location'})
                  </p>
                </div>
              </div>
            ) : loadingAddresses ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                Loading saved delivery addresses...
              </div>
            ) : addresses.length === 0 && !showNewAddressForm ? (
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#FEF3C7',
                  borderRadius: '8px',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  fontSize: '13px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <span>You do not have any saved delivery addresses yet.</span>
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#D97706',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  + Add Address
                </button>
              </div>
            ) : selectedAddress ? (
              <div style={{ marginBottom: '16px' }}>
                {addresses.length > 1 && (
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                      Choose Saved Address:
                    </label>
                    <select
                      value={selectedAddressId}
                      onChange={(e) => setSelectedAddressId(e.target.value)}
                      style={{
                        width: '100%',
                        height: '36px',
                        padding: '0 10px',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        fontSize: '13px',
                        color: '#172033',
                      }}
                    >
                      {addresses.map((addr) => (
                        <option key={addr.id} value={addr.id}>
                          {addr.label} — {addr.recipient_name} ({addr.address_line1}, {addr.city})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div
                  style={{
                    padding: '16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: '#EFF6FF',
                      color: '#2563EB',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>
                      home_pin
                    </span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '15px', color: '#172554' }}>
                        {selectedAddress.recipient_name}
                      </strong>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          backgroundColor: '#E2E8F0',
                          borderRadius: '4px',
                          fontWeight: 600,
                          color: '#334155',
                        }}
                      >
                        {selectedAddress.label || 'Delivery'}
                      </span>
                      {selectedAddress.phone && (
                        <span style={{ fontSize: '13px', color: '#64748B' }}>
                          • {selectedAddress.phone}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 4px 0', lineHeight: 1.4 }}>
                      {selectedAddress.address_line1}{selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ''}, {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.postal_code}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Delivery instructions note */}
            <div>
              <label
                htmlFor="delivery_note"
                style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#172033', marginBottom: '6px' }}
              >
                {fulfillmentMode === 'pickup' ? 'Pickup Notes (Optional)' : 'Delivery Note for Rider (Optional)'}
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '10px',
                    fontSize: '18px',
                    color: '#94A3B8',
                    pointerEvents: 'none',
                  }}
                >
                  edit_note
                </span>
                <input
                  id="delivery_note"
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="e.g., Ring bell twice, leave with tower security, watch out for dog..."
                  style={{
                    width: '100%',
                    height: '42px',
                    padding: '0 16px 0 40px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#172033',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
          </div>

          {/* STEP 3: Payment Method Selection */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#172554',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}
                >
                  3
                </div>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: 0 }}>
                    Payment Method
                  </h2>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                    Instant zero-cost settlement direct to store ledger
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748B' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#2563EB' }}>
                  lock
                </span>
                <span>256-Bit Secured</span>
              </div>
            </div>

            {/* Payment Options Stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Option 1: UPI */}
              <div
                style={{
                  borderRadius: '10px',
                  border: paymentMethod === 'upi' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: paymentMethod === 'upi' ? '#EFF6FF' : '#FFFFFF',
                  padding: '16px',
                  transition: 'all 0.15s ease',
                }}
              >
                <label
                  onClick={() => setPaymentMethod('upi')}
                  style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: paymentMethod === 'upi' ? '5px solid #2563EB' : '2px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        marginTop: '2px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#172554' }}>
                          UPI (Google Pay, PhonePe, Paytm, BHIM)
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: '#2563EB',
                            color: '#FFFFFF',
                          }}
                        >
                          Fastest
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                        Pay seamlessly with any registered VPA or UPI mobile app
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', fontWeight: 600 }}>
                      GPay
                    </span>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', fontWeight: 600 }}>
                      PhonePe
                    </span>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', fontWeight: 600 }}>
                      Paytm
                    </span>
                  </div>
                </label>

                {paymentMethod === 'upi' && (
                  <div
                    style={{
                      marginTop: '14px',
                      paddingTop: '14px',
                      borderTop: '1px solid #BFDBFE',
                      display: 'flex',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter UPI ID (e.g. mobile@oksbi)"
                      style={{
                        flex: 1,
                        minWidth: '200px',
                        height: '38px',
                        padding: '0 12px',
                        backgroundColor: '#FFFFFF',
                        borderRadius: '6px',
                        border: '1px solid #93C5FD',
                        fontSize: '13px',
                        color: '#172033',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setVpaVerified(true)}
                      style={{
                        padding: '0 16px',
                        height: '38px',
                        backgroundColor: '#2563EB',
                        color: '#FFFFFF',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {vpaVerified ? '✓ Verified' : 'Verify VPA'}
                    </button>
                  </div>
                )}
              </div>

              {/* Option 2: Credit / Debit Card */}
              <div
                onClick={() => setPaymentMethod('card')}
                style={{
                  borderRadius: '10px',
                  border: paymentMethod === 'card' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: paymentMethod === 'card' ? '#EFF6FF' : '#FFFFFF',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: paymentMethod === 'card' ? '5px solid #2563EB' : '2px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#172554' }}>
                      Credit / Debit Card
                    </span>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Visa, Mastercard, RuPay, Maestro
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>
                  credit_card
                </span>
              </div>

              {/* Option 3: Net Banking */}
              <div
                onClick={() => setPaymentMethod('netbanking')}
                style={{
                  borderRadius: '10px',
                  border: paymentMethod === 'netbanking' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: paymentMethod === 'netbanking' ? '#EFF6FF' : '#FFFFFF',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: paymentMethod === 'netbanking' ? '5px solid #2563EB' : '2px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#172554' }}>
                      Net Banking
                    </span>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                      HDFC, SBI, ICICI, Axis, Kotak &amp; 40+ banks
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>
                  account_balance
                </span>
              </div>

              {/* Option 4: Cash on Delivery */}
              <div
                onClick={() => setPaymentMethod('cod')}
                style={{
                  borderRadius: '10px',
                  border: paymentMethod === 'cod' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                  backgroundColor: paymentMethod === 'cod' ? '#EFF6FF' : '#FFFFFF',
                  padding: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: paymentMethod === 'cod' ? '5px solid #2563EB' : '2px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#172554' }}>
                      Cash on Delivery
                    </span>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                      Pay in cash or scan rider's merchant QR code upon doorstep delivery
                    </p>
                  </div>
                </div>
                <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#64748B' }}>
                  payments
                </span>
              </div>
            </div>

            {/* Direct settlement note */}
            <div
              style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: '#64748B',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#2563EB' }}>
                security
              </span>
              <span>Direct settlement with {storeName}. 100% money back guarantee on missing goods.</span>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Order Breakdown & Place Order CTA */}
        <div style={{ position: 'sticky', top: '96px', flex: 1, minWidth: '320px' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E2E8F0',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '14px',
                borderBottom: '1px solid #E2E8F0',
                marginBottom: '16px',
              }}
            >
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Neighborhood Order
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#172554', margin: '2px 0 0 0' }}>
                  Items from {storeName}
                </h3>
              </div>
              <Link
                to="/cart"
                style={{ fontSize: '13px', fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}
              >
                Edit Cart
              </Link>
            </div>

            {/* Products preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '6px',
                      backgroundColor: '#F8FAFC',
                      overflow: 'hidden',
                      flexShrink: 0,
                      border: '1px solid #E2E8F0',
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
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', color: '#94A3B8' }}>
                        inventory_2
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#172554',
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      Qty: {item.quantity} × ₹{item.price}
                    </span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#172033' }}>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <form
              onSubmit={handleApplyCoupon}
              style={{
                backgroundColor: '#F8FAFC',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                marginBottom: '20px',
              }}
            >
              <label
                htmlFor="coupon_code"
                style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#172033', marginBottom: '6px' }}
              >
                Neighborhood Promo Code
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  id="coupon_code"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter WELCOME10"
                  style={{
                    flex: 1,
                    height: '34px',
                    padding: '0 10px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0 14px',
                    backgroundColor: couponApplied ? '#10B981' : '#172554',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {couponApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
              {couponApplied && (
                <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600, display: 'block', marginTop: '6px' }}>
                  ✓ ₹20 neighborhood discount applied!
                </span>
              )}
            </form>

            {/* Price Calculations */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Item Subtotal ({itemCount} items)</span>
                <span style={{ color: '#172033', fontWeight: 600 }}>₹{subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Store Delivery Fee</span>
                <span style={{ color: '#172033', fontWeight: 600 }}>
                  {activeDeliveryFee === 0 ? 'FREE' : `₹${activeDeliveryFee}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Platform Fee</span>
                <span style={{ color: '#2563EB', fontWeight: 600 }}>Waived (₹0)</span>
              </div>
              {couponApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: 600 }}>-₹20</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Taxes &amp; Local Levies</span>
                <span>Included</span>
              </div>

              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#172554', display: 'block' }}>
                    Total Payable
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Inclusive of all taxes</span>
                </div>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#172554' }}>
                  ₹{finalTotal}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isPlacingOrder ? '#94A3B8' : '#2563EB',
                color: '#FFFFFF',
                fontSize: '15px',
                fontWeight: 700,
                cursor: isPlacingOrder ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 2px 4px rgba(37,99,235,0.25)',
                transition: 'background-color 0.15s ease',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                lock
              </span>
              <span>{isPlacingOrder ? 'Placing Order...' : `Place Order — ₹${finalTotal}`}</span>
            </button>

            <p style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', margin: '12px 0 0 0', lineHeight: 1.4 }}>
              By clicking "Place Order", you agree to LocalCommerce Terms and {storeName}'s direct fulfillment policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
