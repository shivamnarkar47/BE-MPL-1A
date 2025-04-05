import { Navigate, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import Home from "./components/Home"
import Login from "./components/Login"
import Register from "./components/Register"
import ProtectedRoute from "./components/ProtectedRoute"
import UserHomePage from "./components/UserHomePage"
import Donation from "./components/Donation"
import MarketPlace from "./components/MarketPlace"
import Tutorials from "./components/Tutorials"
import ProductPage from "./components/ProductPage"
import Cart from "./components/Cart"
import Logout from "./components/Logout"
import AIGenius from "./components/AIGenius"

function App() {

  return (
    <>
      <Navbar />
      <Routes >
        <Route element={<Home />} index path="/" />
        <Route element={<Login />} path="/login" />
        <Route element={<Logout />} path="/logout" />
        <Route element={<Register />} path="/register" />
        <Route element={<ProtectedRoute />}>
          <Route element={<UserHomePage />}>
            <Route element={<MarketPlace />} path="/home" />
            <Route element={<Donation />} path="/home/donations" />
            <Route element={<Tutorials />} path="/home/tutorials" />
            <Route element={<AIGenius />} path="/home/genius" />
            <Route element={<ProductPage />} path="/product/:productId/" />
            <Route element={<Cart />} path="/cart" />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

    </>
  )
}

export default App
