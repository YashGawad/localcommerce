import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import BusinessLayout from './layouts/BusinessLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import DeliveryLayout from './layouts/DeliveryLayout';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import StorePage from './pages/customer/StorePage';
import SearchResultsPage from './pages/customer/SearchResultsPage';
import CategoryListingPage from './pages/customer/CategoryListingPage';
import ProductDetailsPage from './pages/customer/ProductDetailsPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderConfirmationPage from './pages/customer/OrderConfirmationPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import ProfilePage from './pages/customer/ProfilePage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Business Pages
import BusinessDashboardPage from './pages/business/BusinessDashboardPage';
import BusinessPlaceholderPage from './pages/business/BusinessPlaceholderPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminPlaceholderPage from './pages/admin/AdminPlaceholderPage';

// Delivery Pages
import DeliveryDashboardPage from './pages/delivery/DeliveryDashboardPage';
import DeliveryDetailsPage from './pages/delivery/DeliveryDetailsPage';

// 404
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <CartProvider>
      <Routes>
        {/* 1. Customer Storefront Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="store/:slug" element={<StorePage />} />
          <Route path="store/:slug/products" element={<CategoryListingPage />} />
          <Route path="store/:slug/product/:id" element={<ProductDetailsPage />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="categories" element={<CategoryListingPage />} />
          <Route path="categories/:category" element={<CategoryListingPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="orders" element={<MyOrdersPage />} />
          <Route path="orders/:id" element={<OrderTrackingPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* 2. Authentication Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* 3. Business Merchant Application Routes */}
        <Route path="/business" element={<BusinessLayout />}>
          <Route index element={<BusinessDashboardPage />} />
          <Route path=":section" element={<BusinessPlaceholderPage />} />
          <Route path=":section/:id" element={<BusinessPlaceholderPage />} />
        </Route>

        {/* 4. Platform Admin Application Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path=":section" element={<AdminPlaceholderPage />} />
          <Route path=":section/:id" element={<AdminPlaceholderPage />} />
        </Route>

        {/* 5. Delivery Partner Application Routes */}
        <Route path="/delivery" element={<DeliveryLayout />}>
          <Route index element={<DeliveryDashboardPage />} />
          <Route path="orders/:id" element={<DeliveryDetailsPage />} />
        </Route>

        {/* 6. 404 Catch-All */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </CartProvider>
  );
}
