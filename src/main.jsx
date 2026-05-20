import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'

// Storefront components
import StoreLayout from './components/Layout/StoreLayout'
import HomePage from './pages/store/HomePage'
import ProductDetailsPage from './pages/store/ProductDetailsPage'
import CategoryPage from './components/CategoryPage/CategoryPage'
import NotFoundPage from './pages/store/NotFoundPage'

// Auth pages
import LoginPage from './pages/store/Auth/LoginPage'
import SignupPage from './pages/store/Auth/SignupPage'
import ForgotPasswordPage from './pages/store/Auth/ForgotPasswordPage'

// Admin components
import { AdminAuthProvider } from './router/AdminAuthContext'
import ProtectedAdminRoute from './router/ProtectedAdminRoute'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'

// Customer Auth
import { CustomerAuthProvider } from './context/CustomerAuthContext'
import ProtectedCustomerRoute from './router/ProtectedCustomerRoute'

// Checkout & Cart
import { CartProvider } from './context/CartContext'
import CartPage from './pages/store/CartPage'
import CheckoutPage from './pages/store/CheckoutPage'
import ProfilePage from './pages/store/Customer/ProfilePage'
import OrdersPage from './pages/store/Customer/OrdersPage'

import { SettingsProvider } from './context/SettingsContext'

const router = createBrowserRouter([
  {
    path: '/',
    element: <StoreLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'categories/:slug', element: <CategoryPage /> },
      { path: 'product_details/:slug', element: <ProductDetailsPage /> },

      // Auth pages (no protection needed)
      { path: 'login',           element: <LoginPage /> },
      { path: 'signup',          element: <SignupPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },

      // Protected customer routes
      {
        element: <ProtectedCustomerRoute />,
        children: [
          { path: 'profile', element: <ProfilePage /> },
          { path: 'orders', element: <OrdersPage /> },
          { path: 'cart', element: <CartPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/admin_panel',
    children: [
      { index: true, element: <Navigate to="/admin_panel/dashboard" replace /> },
      { path: 'login', element: <AdminLoginPage /> },
      {
        element: <ProtectedAdminRoute />,
        children: [
          { path: 'dashboard', element: <AdminDashboardPage /> },
        ],
      },
      { path: '*', element: <Navigate to="/admin_panel" replace /> },
    ],
  },
])

import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminAuthProvider>
      <CustomerAuthProvider>
        <SettingsProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: '#1a1a1a',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              }
            }}
          />
          <CartProvider>
            <RouterProvider router={router} />
          </CartProvider>
        </SettingsProvider>
      </CustomerAuthProvider>
    </AdminAuthProvider>
  </StrictMode>,
)

