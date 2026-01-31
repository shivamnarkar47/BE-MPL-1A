import { deleteCookie } from '@/lib/getUser';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom';
import Logo from "@/assets/logo.png"
import { ShoppingCart, Heart, User, LogOut, LayoutDashboard, Package, Leaf } from 'lucide-react';
import { useGuestCart } from '@/contexts/GuestCartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout: authLogout, refreshUser } = useAuth();

  const location = useLocation();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    deleteCookie();
    authLogout();
  };

  return (
    <section className={cn(!user?.id ? "fixed w-full bg-white/80 backdrop-blur-md dark:bg-black/80 z-50 border-b border-slate-100" : "flex w-full bg-white dark:bg-black z-50 border-b")}>
      <nav className="font-inter mx-auto h-auto w-full max-w-screen-2xl lg:relative lg:top-0">
        <div className="flex flex-col px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:py-3 xl:px-20">
          <div className="flex items-center justify-between">
            {user?.id ? (
              <Link to={'/home'}>
                <img src={Logo} className="w-10" alt="Logo" />
              </Link>
            ) : (
              location.pathname != "/" ? (
                <Link to={'/'}>
                  <img src={Logo} className="w-10" alt="Logo" />
                </Link>
              ) : (
                <a href='#home'>
                  <img src={Logo} className="w-10" alt="Logo" />
                </a>
              )
            )}

            <button
              className="lg:hidden p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
                ) : (
                  <>
                    <path d="M3.75 12H20.25" strokeLinecap="round" />
                    <path d="M3.75 6H20.25" strokeLinecap="round" />
                    <path d="M3.75 18H20.25" strokeLinecap="round" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {location.pathname == "/" && (
            <div className={`mt-4 lg:mt-0 lg:flex lg:flex-row lg:space-x-8 ${isOpen ? "flex" : "hidden"}`}>
              <a href="#about" className="py-2 lg:py-0 hover:text-emerald-600 transition-colors">About</a>
              <a href="#why-us" className="py-2 lg:py-0 hover:text-emerald-600 transition-colors">Why Us</a>
            </div>
          )}

          <div className={`flex flex-col items-center space-y-4 lg:flex lg:flex-row lg:space-x-4 lg:space-y-0 mt-4 lg:mt-0 ${isOpen ? "flex" : "hidden"}`}>
            {!user?.id ? (
              <>
                <Link to="/guest-cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setIsOpen(false)}>
                  <ShoppingCart className="h-6 w-6" />
                  <GuestCartBadge />
                </Link>

                <Link to="/#wishlist" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setIsOpen(false)}>
                  <Heart className="h-6 w-6" />
                  <WishlistBadge />
                </Link>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <Link
                    className="rounded-lg bg-emerald-600 px-6 py-2.5 text-center text-white hover:bg-emerald-700 transition-colors"
                    to="/register"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-center text-gray-700 hover:bg-gray-50 transition-colors"
                    to="/login"
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link to="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setIsOpen(false)}>
                  <ShoppingCart className="h-6 w-6" />
                </Link>

                <Link to="/wishlist" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setIsOpen(false)}>
                  <Heart className="h-6 w-6" />
                  <WishlistBadge />
                </Link>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                      {user?.full_name?.split(' ')[0] || 'User'}
                    </span>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/eco-dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsProfileOpen(false)}>
                        <Leaf className="h-4 w-4 text-emerald-600" />
                        Eco Dashboard
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsProfileOpen(false)}>
                        <Package className="h-4 w-4 text-blue-600" />
                        My Orders
                      </Link>
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setIsProfileOpen(false)}>
                        <LayoutDashboard className="h-4 w-4 text-purple-600" />
                        Profile
                      </Link>
                      <div className="border-t border-gray-100 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </section>
  );
};

const GuestCartBadge = () => {
  const { guestCartCount } = useGuestCart();
  if (guestCartCount === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {guestCartCount > 99 ? '99+' : guestCartCount}
    </span>
  );
};

const WishlistBadge = () => {
  const { wishlistCount } = useWishlist();
  if (wishlistCount === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {wishlistCount > 99 ? '99+' : wishlistCount}
    </span>
  );
};

export default Navbar;
