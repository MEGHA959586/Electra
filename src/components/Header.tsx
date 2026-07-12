import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Store, ArrowLeftRight, Percent, LogOut } from "lucide-react";
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
  userRole: "buyer" | "seller";
  setUserRole: (role: "buyer" | "seller") => void;
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
  userRole,
  setUserRole
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setUserRole("buyer");
    setView("buyer");
    navigate("/");
  };

  return (
    <header id="app-header" className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white shadow-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1 cursor-pointer select-none shrink-0">
            <span className="font-serif text-2xl font-black italic tracking-tighter uppercase text-zinc-950">
              ELECTRA<span className="text-blue-600">.</span>
            </span>
          </Link>

          {/* Search Bar */}
          {currentView === "buyer" && (
            <div id="search-container" className="flex-1 max-w-md relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <input
                id="search-input"
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-md bg-zinc-50 text-zinc-900 text-xs tracking-wide placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all font-mono"
              />
              {searchQuery && (
                <button 
                  id="search-clear"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[10px] font-bold uppercase tracking-wider text-zinc-400 hover:text-zinc-600"
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
                  className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-700 hover:text-zinc-950 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all border border-zinc-950 hover:border-blue-600"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                {/* Role Switcher */}
                <button
                  id="role-switch-btn"
                  onClick={() => {
                    const nextRole = userRole === "buyer" ? "seller" : "buyer";
                    setUserRole(nextRole);
                    setView(nextRole === "seller" ? "seller" : "buyer");
                    navigate(nextRole === "seller" ? "/seller" : "/");
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full border border-zinc-200 text-[10px] font-bold uppercase tracking-widest text-zinc-700 bg-white hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all cursor-pointer"
                  title={userRole === "buyer" ? "Switch to Seller Dashboard" : "Switch to Shopping Catalog"}
                >
                  <ArrowLeftRight className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {userRole === "buyer" ? "Seller Panel" : "Buyer Mode"}
                  </span>
                </button>

                {/* Seller Quick Access */}
                {userRole === "seller" && currentView !== "seller" && (
                  <Link
                    to="/seller"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-blue-600 text-[10px] font-bold uppercase tracking-widest text-white hover:bg-blue-700 transition-all cursor-pointer"
                    onClick={() => setView("seller")}
                  >
                    <Store className="h-3 w-3" />
                    <span>My Store</span>
                  </Link>
                )}

                {/* Wishlist */}
                {userRole === "buyer" && (
                  <Link
                    to="/profile"
                    className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-white hover:bg-zinc-950 relative transition-all cursor-pointer"
                    title="View Wishlist"
                  >
                    <Heart className="h-4 w-4" />
                    {wishlistCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-white font-bold text-[8px] flex items-center justify-center shadow-sm">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Cart */}
                {userRole === "buyer" && (
                  <Link
                    to="/cart"
                    className={`w-9 h-9 rounded-full border flex items-center justify-center relative transition-all cursor-pointer ${
                      currentView === "cart" 
                        ? "text-white bg-zinc-950 border-zinc-950" 
                        : "text-zinc-600 border-zinc-200 hover:text-white hover:bg-zinc-950 hover:border-zinc-950"
                    }`}
                    title="View Shopping Cart"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-white font-bold text-[8px] flex items-center justify-center shadow-sm animate-pulse">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}

                {/* Profile */}
                <Link
                  to="/profile"
                  className={`w-9 h-9 rounded-full border flex items-center justify-center relative transition-all cursor-pointer ${
                    currentView === "profile" 
                      ? "text-white bg-zinc-950 border-zinc-950" 
                      : "text-zinc-600 border-zinc-200 hover:text-white hover:bg-zinc-950 hover:border-zinc-950"
                  }`}
                  title="My Account"
                >
                  <User className="h-4 w-4" />
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
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
                <Search className="h-3.5 w-3.5 text-zinc-400" />
              </div>
              <input
                id="mobile-search-input"
                type="text"
                placeholder="Search premium electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-4 py-2 border border-zinc-200 rounded-md bg-zinc-50 text-zinc-900 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-zinc-950 focus:border-zinc-950"
              />
            </div>
          </div>
        )}

        {/* Categories Bar */}
        {currentView === "buyer" && (
          <div id="categories-bar" className="flex items-center overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none border-t border-zinc-100 pt-3 gap-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                id={`cat-${cat.toLowerCase()}`}
                onClick={() => setCategory(cat)}
                className={`text-[10px] font-bold uppercase tracking-widest pb-2 cursor-pointer transition-all border-b-2 ${
                  currentCategory === cat
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-zinc-400 hover:text-zinc-950 hover:border-zinc-300"
                }`}
              >
                {cat}
              </button>
            ))}
            <div className="ml-auto pl-4 hidden lg:flex items-center gap-1.5 text-[9px] text-blue-600 font-bold uppercase tracking-wider bg-blue-50 border border-blue-100 px-3 py-1 rounded-md shrink-0">
              <Percent className="h-3 w-3" />
              <span>Use code <b className="font-black text-blue-700">WELCOME10</b> for 10% off</span>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};