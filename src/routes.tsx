import { createBrowserRouter } from 'react-router';
import Layout from './layouts/Layout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import About from './pages/About';
import AccountSettings from './pages/AccountSettings';
import AuthPage from './pages/AuthPage';
import Blog from './pages/Blog';
import Cart from './pages/Cart';
import Catalog from './pages/Catalog';
import Checkout from './pages/Checkout';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import Privacy from './pages/Privacy';
import ProductDetail from './pages/ProductDetail';
import Promo from './pages/Promo';
import Terms from './pages/Terms';
import Testimonials from './pages/Testimonials';
import Wishlist from './pages/Wishlist';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCRM from './pages/admin/AdminCRM';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminFinancial from './pages/admin/AdminFinancial';
import AdminOrders from './pages/admin/AdminOrders';
import AdminPayments from './pages/admin/AdminPayments';
import AdminProducts from './pages/admin/AdminProducts';
import AdminReturns from './pages/admin/AdminReturns';
import AdminSettings from './pages/admin/AdminSettings';
import AdminShipping from './pages/admin/AdminShipping';
import AdminStock from './pages/admin/AdminStock';
import AdminUsers from './pages/admin/AdminUsers';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'account', element: <AccountSettings /> },
      { path: 'auth', element: <AuthPage /> },
      { path: 'blog', element: <Blog /> },
      { path: 'cart', element: <Cart /> },
      { path: 'catalog', element: <Catalog /> },
      { path: 'checkout', element: <Checkout /> },
      { path: 'contact', element: <Contact /> },
      { path: 'faq', element: <FAQ /> },
      { path: 'orders', element: <OrderHistory /> },
      { path: 'orders/:orderId', element: <OrderTracking /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'product/:productId', element: <ProductDetail /> },
      { path: 'promo', element: <Promo /> },
      { path: 'terms', element: <Terms /> },
      { path: 'testimonials', element: <Testimonials /> },
      { path: 'wishlist', element: <Wishlist /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'analytics', element: <AdminAnalytics /> },
      { path: 'categories', element: <AdminCategories /> },
      { path: 'crm', element: <AdminCRM /> },
      { path: 'customers', element: <AdminCustomers /> },
      { path: 'financial', element: <AdminFinancial /> },
      { path: 'orders', element: <AdminOrders /> },
      { path: 'payments', element: <AdminPayments /> },
      { path: 'products', element: <AdminProducts /> },
      { path: 'returns', element: <AdminReturns /> },
      { path: 'settings', element: <AdminSettings /> },
      { path: 'shipping', element: <AdminShipping /> },
      { path: 'stock', element: <AdminStock /> },
      { path: 'users', element: <AdminUsers /> },
    ],
  },
]);