/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import { TOKEN_STORAGE_KEY } from '../services/api';

const AuthContext = createContext(null);

const AUTH_USER_STORAGE_KEY = 'localcommerce_auth_user';

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

/**
 * Generates initials avatar from user full name
 */
function getInitialsAvatar(name) {
  if (!name || typeof name !== 'string') return 'LC';
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'LC';
}

export function AuthProvider({ children }) {
  // Stored JWT Token
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });

  // Current authenticated user profile
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_USER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Loading indicator for initial startup session restore and async actions
  const [loading, setLoading] = useState(true);

  /**
   * On mount, if a token exists, verify and refresh user profile with GET /api/auth/me
   */
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (!storedToken) {
        if (isMounted) {
          setCurrentUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      try {
        const freshUser = await authService.getCurrentUser(storedToken);
        if (isMounted) {
          const userWithAvatar = {
            ...freshUser,
            avatar: freshUser.avatar || getInitialsAvatar(freshUser.name),
          };
          setCurrentUser(userWithAvatar);
          setToken(storedToken);
          try {
            localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userWithAvatar));
          } catch {
            // ignore storage errors
          }
        }
      } catch (err) {
        console.warn('Session restoration failed or token expired:', err.message);
        if (isMounted) {
          setCurrentUser(null);
          setToken(null);
          try {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(AUTH_USER_STORAGE_KEY);
          } catch {
            // ignore
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log in user with email and password via backend POST /api/auth/login
   */
  const login = useCallback(
    async (email, password) => {
      setLoading(true);
      try {
        const data = await authService.login(email, password);
        const receivedToken = data.token;
        const rawUser = data.user;

        const userWithAvatar = {
          ...rawUser,
          avatar: rawUser.avatar || getInitialsAvatar(rawUser.name),
        };

        setToken(receivedToken);
        setCurrentUser(userWithAvatar);

        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, receivedToken);
          localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userWithAvatar));
        } catch {
          // ignore storage errors
        }

        return {
          success: true,
          user: userWithAvatar,
          destination: getRoleDestination(userWithAvatar.role),
        };
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Authentication failed. Please verify your credentials.',
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Register a new CUSTOMER account via backend POST /api/auth/register,
   * then auto-authenticates via login
   */
  const signup = useCallback(
    async ({ name, email, phone, password }) => {
      setLoading(true);
      try {
        await authService.register({ name, email, phone, password });

        // Automatically log in the newly registered customer
        const loginResult = await authService.login(email, password);
        const receivedToken = loginResult.token;
        const rawUser = loginResult.user;

        const userWithAvatar = {
          ...rawUser,
          avatar: rawUser.avatar || getInitialsAvatar(rawUser.name),
        };

        setToken(receivedToken);
        setCurrentUser(userWithAvatar);

        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, receivedToken);
          localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userWithAvatar));
        } catch {
          // ignore
        }

        return {
          success: true,
          user: userWithAvatar,
          destination: '/',
        };
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Failed to create account.',
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Register a new business owner account and initial store via POST /api/auth/business/register,
   * then saves token and user profile into state & localStorage, redirecting to /business
   */
  const registerBusiness = useCallback(
    async ({ name, email, phone, password, store }) => {
      setLoading(true);
      try {
        const data = await authService.registerBusiness({ name, email, phone, password, store });
        const receivedToken = data.token;
        const rawUser = data.user;

        const userWithAvatar = {
          ...rawUser,
          avatar: rawUser.avatar || getInitialsAvatar(rawUser.name),
        };

        setToken(receivedToken);
        setCurrentUser(userWithAvatar);

        try {
          localStorage.setItem(TOKEN_STORAGE_KEY, receivedToken);
          localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userWithAvatar));
        } catch {
          // ignore
        }

        return {
          success: true,
          user: userWithAvatar,
          store: data.store,
          destination: '/business',
        };
      } catch (error) {
        return {
          success: false,
          error: error.message || 'Failed to create business account.',
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Refreshes the currently authenticated user's profile and store_roles from GET /api/auth/me
   */
  const refreshCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) return null;
    try {
      const freshUser = await authService.getCurrentUser(storedToken);
      const userWithAvatar = {
        ...freshUser,
        avatar: freshUser.avatar || getInitialsAvatar(freshUser.name),
      };
      setCurrentUser(userWithAvatar);
      try {
        localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(userWithAvatar));
      } catch {
        // ignore
      }
      return userWithAvatar;
    } catch (err) {
      console.warn('Failed to refresh current user:', err.message);
      return null;
    }
  }, []);

  /**
   * Mock password reset request (backend endpoint not yet implemented in V1)
   */
  const resetPassword = useCallback(async (_identifier) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      return { success: true };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Log out user: clears state and localStorage credentials
   */
  const logout = useCallback(() => {
    setCurrentUser(null);
    setToken(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_STORAGE_KEY);
      localStorage.removeItem('localcommerce_selected_store_id');
    } catch {
      // ignore
    }
  }, []);

  const value = {
    currentUser,
    token,
    isAuthenticated: Boolean(token && currentUser),
    role: currentUser?.role || null,
    loading,
    login,
    signup,
    registerBusiness,
    refreshCurrentUser,
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
