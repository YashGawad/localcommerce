/**
 * LocalCommerce Store Settings Seed Data
 * Isolated per storeId to ensure multi-tenant security and zero configuration leakage.
 */

export const INITIAL_STORE_SETTINGS = {
  store_01: {
    storeId: 'store_01',
    storeCode: '#0102',
    branchTag: 'Scoped to Koramangala Branch',
    storeName: 'Sharma Supermarket',
    license: 'KA-BLR-RET-2024-8910',
    slug: 'sharma-supermarket-koramangala',
    description: 'Neighborhood grocery and fresh daily essentials store serving Koramangala 1st to 8th Block.',
    phone: '+91 98450-00001',
    email: 'orders.koramangala@sharmasupermarket.in',
    address: 'Shop #14 & 15, Ground Floor, 80 Feet Road, 4th Block, Koramangala',
    landmark: 'Opposite Koramangala Club Gate 2',
    pinCode: '560034',
    city: 'Bengaluru',
    state: 'Karnataka',
    hubName: 'Koramangala 4th Block Hub',
    hubCoords: 'Latitude: 12.9352° N, Longitude: 77.6245° E (Zone: South-East Bengaluru)',
    
    // Live Availability (Synchronized with CatalogContext / BusinessHeader isOnline)
    acceptingOrders: true,
    
    // Store Hours
    hoursWeekday: { open: '08:00 AM', close: '10:00 PM', status: 'Open (14h)' },
    hoursSaturday: { open: '08:00 AM', close: '10:00 PM', status: 'Open (14h)' },
    hoursSunday: { open: '08:30 AM', close: '10:30 PM', status: 'Open (14h)' },
    
    // Fulfillment Parameters
    expressDeliveryEnabled: true,
    freeDeliveryAbove: 499,
    deliveryFee: 20,
    maxRadius: 8.0,
    minOrder: 150,
    pickupEnabled: true,
    pickupPrepTime: 'Immediate (0 min)',
    courierShippingEnabled: true,
    
    // Payment Rails
    upiEnabled: true,
    cardsEnabled: true,
    codEnabled: true,
    codMaxLimit: 3000,
    
    // Tax & GST
    gstin: '29AAAAA0000A1Z5',
    pricesIncludeGst: true,
    
    // Inventory Rules
    lowStockThreshold: 10,
    allowBackorders: false,
    posAutoDeduction: true,
    
    // Notification Alerts
    soundAlarmOnNewOrder: true,
    dailyMorningDigest: true,
    unauthorizedLoginAlert: true,
  },
  store_02: {
    storeId: 'store_02',
    storeCode: '#0201',
    branchTag: 'Scoped to Thane West Branch',
    storeName: 'Shree Kirana & General Store',
    license: 'MH-THN-RET-2023-4412',
    slug: 'shree-kirana-thane',
    description: 'Your neighborhood kirana providing daily household essentials, fresh grains, and dairy in Thane West.',
    phone: '+91 98210-99887',
    email: 'orders.thane@shreekirana.in',
    address: 'Shop 4, Ground Floor, Panch Pakhadi, Thane West',
    landmark: 'Near Panch Pakhadi Post Office',
    pinCode: '400602',
    city: 'Thane',
    state: 'Maharashtra',
    hubName: 'Panch Pakhadi Central Hub',
    hubCoords: 'Latitude: 19.1860° N, Longitude: 72.9754° E (Zone: Thane West)',
    
    // Live Availability
    acceptingOrders: true,
    
    // Store Hours
    hoursWeekday: { open: '07:30 AM', close: '11:00 PM', status: 'Open (15.5h)' },
    hoursSaturday: { open: '07:30 AM', close: '11:00 PM', status: 'Open (15.5h)' },
    hoursSunday: { open: '08:00 AM', close: '10:00 PM', status: 'Open (14h)' },
    
    // Fulfillment Parameters
    expressDeliveryEnabled: true,
    freeDeliveryAbove: 299,
    deliveryFee: 15,
    maxRadius: 5.0,
    minOrder: 50,
    pickupEnabled: true,
    pickupPrepTime: '10 mins',
    courierShippingEnabled: false,
    
    // Payment Rails
    upiEnabled: true,
    cardsEnabled: true,
    codEnabled: true,
    codMaxLimit: 2000,
    
    // Tax & GST
    gstin: '27BBBBB1111B1Z2',
    pricesIncludeGst: true,
    
    // Inventory Rules
    lowStockThreshold: 5,
    allowBackorders: false,
    posAutoDeduction: true,
    
    // Notification Alerts
    soundAlarmOnNewOrder: true,
    dailyMorningDigest: true,
    unauthorizedLoginAlert: false,
  },
};
