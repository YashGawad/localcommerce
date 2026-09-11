/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MOCK_USERS, authenticateMockUser, findUserByIdentifier } from '../data/users';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'localcommerce_auth_user';
const USERS_STORAGE_KEY = 'localcommerce_registered_users';

/**
 * Returns the default home destination route based on a user's role.
 */
export function getRoleDestination(role) {
  switch (role) {
    case 'business_owner':
    case 'staff':
      return '/business';
    case 'delivery_staff':
      return '/delivery';
    case 'admin':
      return '/admin';
    case 'customer':
    default:
      return '/';
  }
}

export function AuthProvider({ children }) {
  // Registered customer accounts created during this session or persisted in browser
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Current authenticated user
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync registered users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(registeredUsers));
    } catch {
      // ignore storage errors
    }
  }, [registeredUsers]);

  // Combined pool of mock + dynamically registered users
  const allUsers = [...MOCK_USERS, ...registeredUsers];

  /**
   * Log in user with identifier (email or phone) and password
   */
  const login = useCallback(
    async (identifier, password) => {
      setLoading(true);
      try {
        // Simulate short network delay for realism
        await new Promise((resolve) => setTimeout(resolve, 250));

        const result = authenticateMockUser(identifier, password, allUsers);
        if (!result.success) {
          return { success: false, error: result.error };
        }

        const user = result.user;
        setCurrentUser(user);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
        } catch {
          // ignore
        }

        return { success: true, user, destination: getRoleDestination(user.role) };
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registeredUsers]
  );

  /**
   * Register a new CUSTOMER account
   */
  const signup = useCallback(
    async ({ name, email, phone, password }) => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 250));

        // Check if email already registered
        const existing = findUserByIdentifier(email, allUsers);
        if (existing) {
          return { success: false, error: 'An account with this email or phone already exists.' };
        }

        const newUser = {
          id: `usr_cust_${Date.now()}`,
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          role: 'customer',
          password,
          avatar: name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
        };

        setRegisteredUsers((prev) => [...prev, newUser]);

        // Automatically authenticate the new user (without password)
        const safeUser = { ...newUser };
        delete safeUser.password;
        setCurrentUser(safeUser);
        try {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(safeUser));
        } catch {
          // ignore
        }

        return { success: true, user: safeUser, destination: '/' };
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [registeredUsers]
  );

  /**
   * Mock password reset request
   */
  const resetPassword = useCallback(async (_identifier) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      // For privacy & security according to Stitch design, always return success without leaking registration
      return { success: true };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log out user
   */
  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    role: currentUser?.role || null,
    loading,
    login,
    signup,
    logout,
    resetPassword,
    getRoleDestination,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
