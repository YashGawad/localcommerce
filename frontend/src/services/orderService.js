import apiClient from './api.js';

/**
 * Generates lifecycle timeline steps based on backend status and fulfillment type.
 */
export function generateTimeline(status, fulfillmentType, storeName = 'Store') {
  const isPickup = fulfillmentType === 'pickup';

  if (status === 'CANCELLED') {
    return [
      { step: 1, label: 'Order Placed', time: 'Completed', completed: true, note: 'Order originally received' },
      { step: 2, label: 'Order Cancelled', time: 'Terminated', completed: true, current: true, note: 'This order was cancelled.' },
    ];
  }

  const deliverySteps = [
    { key: 'PLACED', label: 'Order Placed', note: 'Received and routed to store merchant' },
    { key: 'CONFIRMED', label: `Confirmed by ${storeName}`, note: 'Inventory verified and accepted' },
    { key: 'PREPARING', label: 'Preparing & Packing', note: 'Merchant partner carefully packing items' },
    { key: 'READY', label: 'Ready for Dispatch', note: 'Handed over to delivery associate' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', note: 'Rider is on the way to your doorstep' },
    { key: 'DELIVERED', label: 'Delivered', note: 'Contactless handover complete' },
  ];

  const pickupSteps = [
    { key: 'PLACED', label: 'Order Placed', note: 'Received and routed to store merchant' },
    { key: 'CONFIRMED', label: `Confirmed by ${storeName}`, note: 'Inventory verified and accepted' },
    { key: 'PREPARING', label: 'Preparing & Packing', note: 'Items being gathered at counter' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', note: 'Ready for counter collection at store' },
    { key: 'PICKED_UP', label: 'Picked Up', note: 'Order collected by customer' },
  ];

  const steps = isPickup ? pickupSteps : deliverySteps;
  const currentIndex = steps.findIndex((s) => s.key === status);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return steps.map((s, idx) => ({
    step: idx + 1,
    label: s.label,
    time: idx < activeIndex ? 'Completed' : idx === activeIndex ? 'In Progress' : 'Pending',
    completed: idx <= activeIndex,
    current: idx === activeIndex,
    note: s.note,
  }));
}

/**
 * Normalizes an order record from the backend into a consistent format for frontend components.
 */
export function normalizeOrder(raw) {
  if (!raw) return null;

  const orderNumber = raw.order_number ? (raw.order_number.startsWith('#') ? raw.order_number : `#${raw.order_number}`) : `#LC-${raw.id.slice(-6)}`;
  const status = raw.status || 'PLACED';
  const fulfillmentType = (raw.fulfillment_type || 'delivery').toLowerCase();
  const storeName = raw.store_name || raw.store?.name || 'Local Merchant';

  const subtotal = Number(raw.subtotal) || 0;
  const deliveryFee = Number(raw.delivery_fee) || 0;
  const taxAmount = Number(raw.tax_amount) || 0;
  const discountAmount = Number(raw.discount_amount) || 0;
  const total = Number(raw.total_amount) || Number(raw.total) || (subtotal + deliveryFee + taxAmount - discountAmount);

  const rawPaymentMethod = (raw.payment_method || 'cod').toLowerCase();
  const paymentMethodDisplay =
    rawPaymentMethod === 'upi'
      ? 'UPI'
      : rawPaymentMethod === 'card'
      ? 'Credit/Debit Card'
      : rawPaymentMethod === 'net_banking' || rawPaymentMethod === 'netbanking'
      ? 'Net Banking'
      : 'Cash on Delivery';

  const paymentStatus = raw.payment_status || (raw.payment ? raw.payment.status : 'PENDING');

  // Status badge variant
  let statusBadgeVariant = 'info';
  let statusLabel = status;
  if (status === 'PLACED') {
    statusLabel = 'Order Placed';
    statusBadgeVariant = 'warning';
  } else if (status === 'CONFIRMED') {
    statusLabel = 'Confirmed';
    statusBadgeVariant = 'info';
  } else if (status === 'PREPARING') {
    statusLabel = 'Preparing';
    statusBadgeVariant = 'info';
  } else if (status === 'READY') {
    statusLabel = 'Ready for Dispatch';
    statusBadgeVariant = 'primary';
  } else if (status === 'READY_FOR_PICKUP') {
    statusLabel = 'Ready for Pickup';
    statusBadgeVariant = 'primary';
  } else if (status === 'OUT_FOR_DELIVERY') {
    statusLabel = 'Out for Delivery';
    statusBadgeVariant = 'warning';
  } else if (status === 'DELIVERED') {
    statusLabel = 'Delivered';
    statusBadgeVariant = 'success';
  } else if (status === 'PICKED_UP') {
    statusLabel = 'Picked Up';
    statusBadgeVariant = 'success';
  } else if (status === 'CANCELLED') {
    statusLabel = 'Cancelled';
    statusBadgeVariant = 'error';
  }

  // Items normalization
  const items = Array.isArray(raw.items)
    ? raw.items.map((it) => ({
        id: it.id || it.store_product_id,
        storeProductId: it.store_product_id,
        title: it.product_name || it.name || it.title || 'Product',
        name: it.product_name || it.name || it.title || 'Product',
        unit: it.unit || it.sku || '',
        price: Number(it.unit_price) || Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
        total: Number(it.line_total) || (Number(it.unit_price || it.price || 0) * Number(it.quantity || 1)),
        image: it.image || it.image_url,
      }))
    : [];

  // Delivery Address normalization
  const deliveryAddress = raw.delivery_recipient_name || raw.delivery_address_line1
    ? {
        recipientName: raw.delivery_recipient_name || '',
        recipient_name: raw.delivery_recipient_name || '',
        phone: raw.delivery_recipient_phone || '',
        type: 'Delivery Drop',
        addressLine: raw.delivery_address_line1 || '',
        address_line1: raw.delivery_address_line1 || '',
        address_line2: raw.delivery_address_line2 || '',
        area: raw.delivery_address_line2 || '',
        city: raw.delivery_address_city || '',
        state: raw.delivery_address_state || '',
        pincode: raw.delivery_address_postal_code || '',
        postal_code: raw.delivery_address_postal_code || '',
        deliveryNote: raw.customer_notes || '',
      }
    : raw.deliveryAddress || null;

  const timeline = generateTimeline(status, fulfillmentType, storeName);

  // Format date
  const createdDate = raw.created_at ? new Date(raw.created_at).toLocaleString() : 'Just now';

  return {
    id: raw.id,
    orderNumber,
    order_number: raw.order_number || raw.id,
    storeId: raw.store_id || raw.storeId,
    store_id: raw.store_id || raw.storeId,
    customerId: raw.customer_id,
    customer_id: raw.customer_id,
    customer: raw.customer || (raw.delivery_recipient_name ? { name: raw.delivery_recipient_name, phone: raw.delivery_recipient_phone } : null),
    storeName,
    store_name: storeName,
    status,
    statusLabel,
    statusBadgeVariant,
    fulfillmentType,
    fulfillment_type: fulfillmentType,
    fulfillmentLabel: fulfillmentType === 'pickup' ? 'Self Pickup' : 'Store Delivery',
    subtotal,
    deliveryFee,
    taxAmount,
    discountAmount,
    total,
    paymentMethod: paymentMethodDisplay,
    payment_method: rawPaymentMethod,
    paymentStatus,
    payment_status: paymentStatus,
    payment: raw.payment || null,
    deliveryAddress,
    customerNotes: raw.customer_notes || '',
    items,
    timeline,
    placedAt: createdDate,
    created_at: raw.created_at,
    estimatedDelivery: fulfillmentType === 'pickup' ? '15–20 mins' : '20–35 mins',
    raw,
  };
}

export const orderService = {
  /**
   * POST /api/orders
   * Place a new single-store order
   * @param {Object} payload - { store_id, items, fulfillment_type, customer_address_id, payment_method, customer_notes }
   */
  async createOrder(payload) {
    const response = await apiClient.post('/api/orders', payload);
    return normalizeOrder(response.data);
  },

  /**
   * GET /api/orders
   * Retrieve order list (scoped by role: customer own orders, or merchant store orders)
   * @param {Object} params - e.g. { store_id }
   */
  async getOrders(params = {}) {
    let endpoint = '/api/orders';
    if (params.store_id) {
      endpoint += `?store_id=${encodeURIComponent(params.store_id)}`;
    }
    const response = await apiClient.get(endpoint);
    const list = response.data || [];
    return list.map(normalizeOrder);
  },

  /**
   * GET /api/orders/:id
   * Retrieve single order details with items and payment
   * @param {string} id - Order UUID
   */
  async getOrderById(id) {
    const response = await apiClient.get(`/api/orders/${id}`);
    return normalizeOrder(response.data);
  },

  /**
   * PATCH /api/orders/:id/status
   * Update order status lifecycle
   * @param {string} id - Order UUID
   * @param {string} status - New target status (e.g. 'CONFIRMED', 'CANCELLED', etc.)
   */
  async updateOrderStatus(id, status) {
    const response = await apiClient.patch(`/api/orders/${id}/status`, { status });
    return normalizeOrder(response.data);
  },
};

export default orderService;

