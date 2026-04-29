import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// [useContext] — ThemeProvider wraps entire app, all components can consume theme
import { ThemeProvider } from './context/ThemeContext';
import RoutineChecker from './components/RoutineChecker';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/user/HomePage';
import RestaurantPage from './pages/user/RestaurantPage';
import OffersPage from './pages/user/OffersPage';
import TrackOrderPage from './pages/user/TrackOrderPage';
import MyOrdersPage from './pages/user/MyOrdersPage';
import NeighborDeliveryPage from './pages/user/NeighborDeliveryPage';
import MysteryBoxPage from './pages/user/MysteryBoxPage';
import FlashSalesPage from './pages/user/FlashSalesPage';
import ReverseBidPage from './pages/user/ReverseBidPage';
import HomeChefPage from './pages/user/HomeChefPage';
import NameYourPricePage from './pages/user/NameYourPricePage';
import RoutineBuilderPage from './pages/user/RoutineBuilderPage';
import ExplorePage from './pages/user/ExplorePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminOffers from './pages/admin/AdminOffers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminStaff from './pages/admin/AdminStaff';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';

function Guard({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
}

function RedirectByRole() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'restaurant') return <Navigate to="/restaurant" />;
  if (user.role === 'delivery') return <Navigate to="/delivery" />;
  return <Navigate to="/home" />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<RedirectByRole />} />
      <Route path="/login" element={user ? <RedirectByRole /> : <LoginPage />} />
      <Route path="/register" element={user ? <RedirectByRole /> : <RegisterPage />} />

      <Route path="/home" element={<Guard roles={['user']}><HomePage /></Guard>} />
      <Route path="/explore" element={<Guard roles={['user']}><ExplorePage /></Guard>} />
      <Route path="/restaurant/:id" element={<Guard roles={['user']}><RestaurantPage /></Guard>} />
      <Route path="/offers" element={<Guard roles={['user']}><OffersPage /></Guard>} />
      <Route path="/track/:id" element={<Guard roles={['user']}><TrackOrderPage /></Guard>} />
      <Route path="/my-orders" element={<Guard roles={['user']}><MyOrdersPage /></Guard>} />
      <Route path="/neighbor-hub" element={<Guard roles={['user']}><NeighborDeliveryPage /></Guard>} />
      <Route path="/mystery-box" element={<Guard roles={['user']}><MysteryBoxPage /></Guard>} />
      <Route path="/flash-sales" element={<Guard roles={['user']}><FlashSalesPage /></Guard>} />
      <Route path="/reverse-bid" element={<Guard roles={['user']}><ReverseBidPage /></Guard>} />
      <Route path="/home-chef" element={<Guard roles={['user']}><HomeChefPage /></Guard>} />
      <Route path="/name-your-price" element={<Guard roles={['user']}><NameYourPricePage /></Guard>} />
      <Route path="/routine-builder" element={<Guard roles={['user']}><RoutineBuilderPage /></Guard>} />

      <Route path="/admin" element={<Guard roles={['admin']}><AdminDashboard /></Guard>} />
      <Route path="/admin/restaurants" element={<Guard roles={['admin']}><AdminRestaurants /></Guard>} />
      <Route path="/admin/offers" element={<Guard roles={['admin']}><AdminOffers /></Guard>} />
      <Route path="/admin/orders" element={<Guard roles={['admin']}><AdminOrders /></Guard>} />
      <Route path="/admin/users" element={<Guard roles={['admin']}><AdminUsers /></Guard>} />
      <Route path="/admin/staff" element={<Guard roles={['admin']}><AdminStaff /></Guard>} />

      <Route path="/restaurant" element={<Guard roles={['restaurant']}><RestaurantDashboard /></Guard>} />
      <Route path="/delivery" element={<Guard roles={['delivery']}><DeliveryDashboard /></Guard>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* [useContext] ThemeProvider wraps entire app */}
        <ThemeProvider>
          <CartProvider>
            <RoutineChecker />
            <AppRoutes />
            <ToastContainer position="bottom-right" theme="colored" />
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
