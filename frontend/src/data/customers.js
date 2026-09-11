/**
 * LocalCommerce Customer Profile & Address Mock Data
 * Multi-address support with default markers and neighborhood tags.
 */

export const MOCK_CUSTOMER = {
  id: 'cust_01',
  name: 'Amit Trivedi',
  firstName: 'Amit',
  lastName: 'Trivedi',
  phone: '+91 98201 44829',
  email: 'amit.trivedi@example.com',
  memberSince: 'August 2025',
  ordersCount: 8,
  loyaltyPoints: 340,
  defaultAddressId: 'addr_01',
};

export const MOCK_ADDRESSES = [
  {
    id: 'addr_01',
    type: 'Home',
    recipientName: 'Amit Trivedi',
    phone: '+91 98201 44829',
    addressLine: 'Flat 402, Shree Ganesh Heights, Ram Maruti Road',
    area: 'Panch Pakhadi',
    city: 'Thane West',
    state: 'Maharashtra',
    pincode: '400602',
    landmark: 'Opposite Saraswati High School Ground',
    isDefault: true,
  },
  {
    id: 'addr_02',
    type: 'Work / Office',
    recipientName: 'Amit Trivedi',
    phone: '+91 98201 44829',
    addressLine: 'Office 604, 6th Floor, Centrum Business Square',
    area: 'Road No. 16, Wagle Industrial Estate',
    city: 'Thane West',
    state: 'Maharashtra',
    pincode: '400604',
    landmark: 'Near Passport Seva Kendra',
    isDefault: false,
  },
  {
    id: 'addr_03',
    type: 'Parents / Relatives',
    recipientName: 'Ramesh Trivedi',
    phone: '+91 98200 11223',
    addressLine: 'Bungalow 12, Sahakar Nagar, Naupada',
    area: 'Naupada',
    city: 'Thane West',
    state: 'Maharashtra',
    pincode: '400602',
    landmark: 'Near Alok Hotel',
    isDefault: false,
  },
];
