import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import UserHomePage from "./components/UserHomePage";
import Donation from "./components/Donation";
import MarketPlace from "./components/MarketPlace";
import Tutorials from "./components/Tutorials";
import ProductPage from "./components/ProductPage";
import Cart from "./components/Cart";
import WishlistPage from "./components/WishlistPage";
import Logout from "./components/Logout";
import AIGenius from "./components/AIGenius";
import GuestCheckout from "./components/GuestCheckout";
import GuestCart from "./components/GuestCart";
import OrderConfirmation from "./components/OrderConfirmation";
import EcoDashboard from "./components/EcoDashboard";
import StyleQuiz from "./components/StyleQuiz";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";
import { WishlistProvider } from "./contexts/WishlistContext";
import { GuestCartProvider } from "./contexts/GuestCartContext";
import { ReviewProvider } from "./contexts/ReviewContext";

function App() {
  return (
    <ReviewProvider>
      <WishlistProvider>
        <GuestCartProvider>
          <Navbar />
          <Routes>
            <Route element={<Home />} index path="/" />
            <Route element={<Login />} path="/login" />
            <Route element={<Logout />} path="/logout" />
            <Route element={<Register />} path="/register" />
            <Route element={<GuestCheckout />} path="/guest-checkout" />
            <Route element={<OrderConfirmation />} path="/order-confirmation" />
            <Route element={<GuestCart />} path="/guest-cart" />
            <Route element={<ProtectedRoute />}>
              <Route element={<UserHomePage />}>
                <Route element={<MarketPlace />} path="/home" />
                <Route element={<Donation />} path="/home/donations" />
                <Route element={<Tutorials />} path="/home/tutorials" />
                <Route element={<AIGenius />} path="/home/genius" />
                <Route element={<ProductPage />} path="/product/:productId/" />
                <Route element={<Cart />} path="/cart" />
                <Route element={<WishlistPage />} path="/wishlist" />
                <Route element={<EcoDashboard />} path="/home/impact" />
                <Route element={<StyleQuiz />} path="/home/quiz" />
                <Route element={<Profile />} path="/home/profile" />
                <Route element={<AdminDashboard />} path="/home/admin" />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </GuestCartProvider>
      </WishlistProvider>
    </ReviewProvider>
  );
}

export default App;
