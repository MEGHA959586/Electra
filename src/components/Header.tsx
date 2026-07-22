import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Store, LogOut, Percent } from "lucide-react";
import { CATEGORIES } from "../data";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  currentCategory: string;
  setCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount: number;
  wishlistCount: number;
  currentView: "buyer" | "seller" | "cart" | "profile" | "checkout";
  setView: (view: "buyer" | "seller" | "cart" | "profile" | "checkout") => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCategory,
  setCategory,
  searchQuery,
  setSearchQuery,
  cartCount,
  wishlistCount,
  currentView,
  setView,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setView("buyer");
    navigate("/");
  };

  const userRole = user?.role || "buyer";

  return (
    <header 
      id="app-header" 
      className="sticky top-0 z-40 w-full border-b border-stone-200 bg-stone-800 shadow-lg transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 cursor-pointer select-none shrink-0">
            <span className="font-serif text-2xl font-black italic tracking-tighter uppercase text-white">
              ELECTRA<span className="text-amber-400">.</span>
            </span>
          </Link>

          {/* Search Bar */}
          {currentView === "buyer" && (
            <div id="search-container" className="flex-1 max-w-md relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-stone-400" />
              </div>
              <input
                id="search-input"
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-4 py-2 border border-stone-600 rounded-md bg-stone-700 text-white text-xs tracking-wide placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all font-mono"
              />
              {searchQuery && (
                <button 
                  id="search-clear"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          {/* Right Controls */}
          <div id="nav-controls" className="flex items-center gap-2">
            
            {/* Auth buttons or user info */}
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-amber-500 text-stone-950 text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-all border border-amber-500 hover:border-amber-400"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {/* Seller Dashboard link */}
                {userRole === "seller" && (
                  <Link
                    to="/seller"
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                      currentView === "seller"
                        ? "bg-stone-700 text-white border-stone-600"
                        : "bg-amber-500 text-stone-950 border-amber-500 hover:bg-amber-400"
                    }`}
                    onClick={() => setView("seller")}
                  >
                    <Store className="h-3 w-3" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* Buyer-only features: Wishlist & Cart */}
                {userRole === "buyer" && (
                  <>
                    <Link
                      to="/profile"
                      className="w-9 h-9 rounded-full border border-stone-600 flex items-center justify-center text-stone-300 hover:text-white hover:bg-stone-700 relative transition-all cursor-pointer bg-stone-800"
                      title="View Wishlist"
                    >
                      <Heart className="h-4 w-4" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-stone-950 font-bold text-[8px] flex items-center justify-center shadow-sm">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/cart"
                      className={`w-9 h-9 rounded-full border flex items-center justify-center relative transition-all cursor-pointer bg-stone-800 ${
                        currentView === "cart" 
                          ? "text-white bg-stone-700 border-stone-600" 
                          : "text-stone-300 border-stone-600 hover:text-white hover:bg-stone-700 hover:border-stone-500"
                      }`}
                      title="View Shopping Cart"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-amber-500 text-stone-950 font-bold text-[8px] flex items-center justify-center shadow-sm animate-pulse">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {/* Profile (visible to all) */}
                <Link
                  to="/profile"
                  className={`w-9 h-9 rounded-full border flex items-center justify-center relative transition-all cursor-pointer bg-stone-800 ${
                    currentView === "profile" 
                      ? "text-white bg-stone-700 border-stone-600" 
                      : "text-stone-300 border-stone-600 hover:text-white hover:bg-stone-700 hover:border-stone-500"
                  }`}
                  title="My Account"
                >
                  <User className="h-4 w-4" />
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-full border border-stone-600 flex items-center justify-center text-stone-300 hover:text-red-400 hover:bg-red-900/30 transition-all cursor-pointer bg-stone-800"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {currentView === "buyer" && (
          <div id="mobile-search-container" className="block md:hidden pb-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-stone-400" />
              </div>
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search premium electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-stone-600 rounded-md bg-stone-700 text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 placeholder-stone-400"
              />
            </div>
          </div>
        )}

        {/* Categories Bar – now wraps on mobile */}
        {currentView === "buyer" && (
          <div id="categories-bar" className="flex flex-wrap items-center overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none border-t border-stone-700 pt-3 gap-2 sm:gap-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`cat-${cat.toLowerCase()}`}
                onClick={() => setCategory(cat)}
                className={`text-[10px] font-bold uppercase tracking-widest pb-2 cursor-pointer transition-all border-b-2 whitespace-nowrap ${
                  currentCategory === cat
                    ? "border-amber-500 text-amber-400"
                    : "border-transparent text-stone-400 hover:text-white hover:border-stone-500"
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="ml-auto pl-4 hidden lg:flex items-center gap-1.5 text-[9px] text-amber-400 font-bold uppercase tracking-wider bg-stone-700 border border-stone-600 px-3 py-1 rounded-md shrink-0">
              <Percent className="h-3 w-3" />
              <span>Use code <b className="font-black text-amber-300">WELCOME10</b> for 10% off</span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};