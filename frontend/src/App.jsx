import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Route Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicAuthRoute from './components/auth/PublicAuthRoute';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import BusinessLayout from './layouts/BusinessLayout';
import AdminLayout from './layouts/AdminLayout';
import AuthLayout from './layouts/AuthLayout';
import DeliveryLayout from './layouts/DeliveryLayout';

// Customer Pages (Batch 2 & Batch 3)
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

// Auth Pages (Batch 4)
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

// Business Pages (Batch 1, Batch 5 & Batch 6)
import BusinessDashboardPage from './pages/business/BusinessDashboardPage';
import BusinessProductsPage from './pages/business/BusinessProductsPage';
import BusinessAddProductPage from './pages/business/BusinessAddProductPage';
import BusinessEditProductPage from './pages/business/BusinessEditProductPage';
import BusinessProductDetailsPage from './pages/business/BusinessProductDetailsPage';
import BusinessCategoriesPage from './pages/business/BusinessCategoriesPage';
import BusinessInventoryPage from './pages/business/BusinessInventoryPage';
import BusinessOrdersPage from './pages/business/BusinessOrdersPage';
import BusinessOrderDetailsPage from './pages/business/BusinessOrderDetailsPage';
import BusinessFulfillmentPage from './pages/business/BusinessFulfillmentPage';
import BusinessCustomersPage from './pages/business/BusinessCustomersPage';
import BusinessCustomerDetailsPage from './pages/business/BusinessCustomerDetailsPage';
import BusinessStaffPage from './pages/business/BusinessStaffPage';
import BusinessDiscountsPage from './pages/business/BusinessDiscountsPage';
import BusinessAnalyticsPage from './pages/business/BusinessAnalyticsPage';
import BusinessNotificationsPage from './pages/business/BusinessNotificationsPage';
import BusinessSettingsPage from './pages/business/BusinessSettingsPage';
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
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* 1. Customer Storefront Routes (Open & Public Browsing) */}
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

          {/* 2. Authentication Routes (Guarded: Authenticated users redirected to their role app) */}
          <Route element={<PublicAuthRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>
          </Route>

          {/* 3. Business Merchant Application Routes (Protected: business_owner, staff) */}
          <Route element={<ProtectedRoute allowedRoles={['business_owner', 'staff']} />}>
            <Route path="/business" element={<BusinessLayout />}>
              <Route index element={<BusinessDashboardPage />} />
              <Route path="products" element={<BusinessProductsPage />} />
              <Route path="products/new" element={<BusinessAddProductPage />} />
              <Route path="products/:id/edit" element={<BusinessEditProductPage />} />
              <Route path="products/:id" element={<BusinessProductDetailsPage />} />
              <Route path="categories" element={<BusinessCategoriesPage />} />
              <Route path="inventory" element={<BusinessInventoryPage />} />
              <Route path="orders" element={<BusinessOrdersPage />} />
              <Route path="orders/:id" element={<BusinessOrderDetailsPage />} />
              <Route path="fulfillment" element={<BusinessFulfillmentPage />} />
              <Route path="customers" element={<BusinessCustomersPage />} />
              <Route path="customers/:id" element={<BusinessCustomerDetailsPage />} />
              <Route path="staff" element={<BusinessStaffPage />} />
              <Route path="discounts" element={<BusinessDiscountsPage />} />
              <Route path="analytics" element={<BusinessAnalyticsPage />} />
              <Route path="notifications" element={<BusinessNotificationsPage />} />
              <Route path="settings" element={<BusinessSettingsPage />} />
              <Route path=":section" element={<BusinessPlaceholderPage />} />
              <Route path=":section/:id" element={<BusinessPlaceholderPage />} />
            </Route>
          </Route>

          {/* 4. Platform Admin Application Routes (Protected: admin) */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path=":section" element={<AdminPlaceholderPage />} />
              <Route path=":section/:id" element={<AdminPlaceholderPage />} />
            </Route>
          </Route>

          {/* 5. Delivery Partner Application Routes (Protected: delivery_staff) */}
          <Route element={<ProtectedRoute allowedRoles={['delivery_staff']} />}>
            <Route path="/delivery" element={<DeliveryLayout />}>
              <Route index element={<DeliveryDashboardPage />} />
              <Route path="orders/:id" element={<DeliveryDetailsPage />} />
            </Route>
          </Route>

          {/* 6. 404 Catch-All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}
