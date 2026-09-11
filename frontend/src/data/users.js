/**
 * LocalCommerce Mock User Accounts
 * DEVELOPMENT-ONLY mock credentials and user directory.
 * NOTE: This is for frontend mock authentication only. No production security.
 */

export const MOCK_USERS = [
  {
    id: 'usr_customer_01',
    name: 'Amit Trivedi',
    email: 'customer@example.com',
    phone: '+91 98201 44829',
    role: 'customer',
    password: 'password123',
    avatar: 'AT',
  },
  {
    id: 'usr_owner_01',
    name: 'Suresh Sharma',
    email: 'owner@example.com',
    phone: '+91 98200 11223',
    role: 'business_owner',
    password: 'password123',
    avatar: 'SS',
    businessName: 'Shree Kirana & General Stores',
  },
  {
    id: 'usr_staff_01',
    name: 'Rahul Varma',
    email: 'staff@example.com',
    phone: '+91 98200 44556',
    role: 'staff',
    password: 'password123',
    avatar: 'RV',
    businessName: 'Shree Kirana & General Stores',
  },
  {
    id: 'usr_delivery_01',
    name: 'Ramesh Patil',
    email: 'delivery@example.com',
    phone: '+91 98330 55667',
    role: 'delivery_staff',
    password: 'password123',
    avatar: 'RP',
    vehicle: 'Hero Electric Optima (MH-04-AB-1234)',
  },
  {
    id: 'usr_admin_01',
    name: 'Vikram Malhotra',
    email: 'admin@example.com',
    phone: '+91 99000 88776',
    role: 'admin',
    password: 'password123',
    avatar: 'VM',
    title: 'Super Admin',
  },
];

/**
 * Find user by email or phone number (case-insensitive for email)
 */
export function findUserByIdentifier(identifier, users = MOCK_USERS) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const phoneClean = identifier.replace(/[\s\-()]/g, '');

  return users.find((u) => {
    const emailMatch = u.email && u.email.toLowerCase() === clean;
    const phoneMatch = u.phone && u.phone.replace(/[\s\-()]/g, '').includes(phoneClean);
    return emailMatch || phoneMatch;
  }) || null;
}

/**
 * Validate credentials against mock users
 */
export function authenticateMockUser(identifier, password, users = MOCK_USERS) {
  const user = findUserByIdentifier(identifier, users);
  if (!user) return { success: false, error: 'No account found with this email or phone number' };
  if (user.password !== password) {
    return { success: false, error: 'Incorrect password. Please verify and try again.' };
  }
  // Return user without password
  const safeUser = { ...user };
  delete safeUser.password;
  return { success: true, user: safeUser };
}
