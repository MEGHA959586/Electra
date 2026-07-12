import React, { useState } from "react";
import { ClipboardList, Heart, MapPin, Calendar, Truck, ArrowLeft, Trash2, ShoppingCart, Check } from "lucide-react";
import { Order, Product } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

interface ProfileProps {
  orders: Order[];
  wishlist: Product[];
  onRemoveWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onReturnToShopping: () => void;
  cartQuantities: { [productId: string]: number };
}

type ProfileTab = "orders" | "wishlist" | "addresses";

export const Profile: React.FC<ProfileProps> = ({
  orders,
  wishlist,
  onRemoveWishlist,
  onAddToCart,
  onViewProduct,
  onReturnToShopping,
  cartQuantities
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("orders");

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = user?.name || "Guest";
  const initials = getInitials(displayName);

  return (
    <div id="profile-container" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <button
        id="profile-back-btn"
        onClick={onReturnToShopping}
        className="inline-flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-zinc-950 font-bold uppercase tracking-widest transition-all cursor-pointer"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Catalog</span>
      </button>

      <div className="bg-white rounded-none border border-zinc-200 p-6 shadow-none flex flex-col md:flex-row items-center md:items-start gap-5">
        <div className="h-16 w-16 bg-zinc-900 rounded-none flex items-center justify-center text-white text-xl font-black shrink-0 font-mono">
          {initials}
        </div>
        <div className="text-center md:text-left space-y-1">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-zinc-950">{displayName}</h2>
          <p className="text-xs text-zinc-400 font-mono uppercase tracking-wider">
            {user?.role === 'seller' ? 'Seller Account' : 'Buyer Account'} • Verified member since June 2024
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] uppercase tracking-wider font-bold text-zinc-500 pt-1">
            <span className="flex items-center gap-1">
              <ClipboardList className="h-3.5 w-3.5 text-zinc-400" />
              <b>{orders.length}</b> orders placed
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5 text-zinc-400" />
              <b>{wishlist.length}</b> saved items
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 shrink-0">
          <button
            id="tab-orders"
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-none border text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-zinc-950 text-white border-zinc-950"
                : "text-zinc-500 hover:bg-zinc-50 border-transparent hover:border-zinc-200"
            }`}
          >
            <ClipboardList className="h-4 w-4" />
            <span>Order History ({orders.length})</span>
          </button>
          
          <button
            id="tab-wishlist"
            onClick={() => setActiveTab("wishlist")}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-none border text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "wishlist"
                ? "bg-zinc-950 text-white border-zinc-950"
                : "text-zinc-500 hover:bg-zinc-50 border-transparent hover:border-zinc-200"
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>My Wishlist ({wishlist.length})</span>
          </button>

          <button
            id="tab-addresses"
            onClick={() => setActiveTab("addresses")}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-none border text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "addresses"
                ? "bg-zinc-950 text-white border-zinc-950"
                : "text-zinc-500 hover:bg-zinc-50 border-transparent hover:border-zinc-200"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Saved Addresses</span>
          </button>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {activeTab === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {orders.length === 0 ? (
                  <div className="bg-white rounded-none border border-zinc-200 p-12 text-center shadow-none">
                    <ClipboardList className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                    <p className="font-display uppercase tracking-widest font-bold text-zinc-900 text-xs">No Orders Found</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      You haven't checked out any orders yet. Explore the catalog and buy some premium gadgets!
                    </p>
                    <button
                      id="browse-now-from-orders"
                      onClick={onReturnToShopping}
                      className="mt-4 px-4 py-2.5 bg-zinc-900 text-white rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 border border-zinc-950 hover:border-blue-600 transition-all cursor-pointer"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div key={ord.id} className="bg-white border border-zinc-200 rounded-none overflow-hidden">
                      <div className="bg-[#F8F9FA] px-5 py-4 border-b border-zinc-200 flex flex-wrap gap-4 items-center justify-between text-xs text-zinc-500 font-mono">
                        <div>
                          <span className="font-bold block uppercase text-[9px] text-zinc-400">Order ID</span>
                          <span className="font-bold text-zinc-900 text-sm">{ord.id}</span>
                        </div>
                        <div>
                          <span className="font-bold block uppercase text-[9px] text-zinc-400">Date</span>
                          <span className="font-semibold text-zinc-800">{ord.date}</span>
                        </div>
                        <div>
                          <span className="font-bold block uppercase text-[9px] text-zinc-400">Total</span>
                          <span className="font-black text-zinc-900 text-sm">${ord.total.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="font-bold block uppercase text-[9px] text-zinc-400">Status</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-none text-[9px] font-bold uppercase tracking-wider ${
                            ord.status === "Processing" 
                              ? "bg-blue-50 text-blue-600 border border-blue-200"
                              : "bg-zinc-900 text-white border border-zinc-900"
                          }`}>
                            {ord.status}
                          </span>
                        </div>
                      </div>
                      <div className="p-5 space-y-4 font-sans">
                        <div className="divide-y divide-zinc-150">
                          {ord.items.map((item) => (
                            <div key={item.product.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-4">
                              <div className="flex items-center gap-3">
                                <img src={item.product.image} alt={item.product.title} className="h-10 w-10 object-cover rounded-none border border-zinc-200 bg-zinc-50 shrink-0" />
                                <div className="space-y-0.5">
                                  <span className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest block font-mono">{item.product.brand}</span>
                                  <p onClick={() => onViewProduct(item.product)} className="font-display font-medium text-zinc-800 hover:text-blue-600 cursor-pointer text-xs max-w-sm truncate leading-snug">
                                    {item.product.title}
                                  </p>
                                  <p className="text-[10px] text-zinc-400 font-mono uppercase">Qty: {item.quantity} • Unit: ${item.product.price.toFixed(2)}</p>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-bold text-zinc-950 shrink-0">
                                ${(item.product.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-500 font-mono">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4.5 w-4.5 text-zinc-700" />
                            <div className="space-y-0.5 font-sans">
                              <span className="font-bold text-zinc-800 text-[11px] uppercase tracking-wider font-mono">Secure Delivery</span>
                              <p className="text-[10px] text-zinc-400">Estimated transit: 2-3 days</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold">
                            <span className="text-blue-600">Billed</span>
                            <span className="text-zinc-300">→</span>
                            <span className={ord.status === "Shipped" || ord.status === "Delivered" ? "text-blue-600" : "text-amber-500"}>Processing</span>
                            <span className="text-zinc-300">→</span>
                            <span className={ord.status === "Delivered" ? "text-blue-600" : "text-zinc-400"}>Delivered</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "wishlist" && (
              <motion.div
                key="wishlist"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {wishlist.length === 0 ? (
                  <div className="bg-white rounded-none border border-zinc-200 p-12 text-center shadow-none">
                    <Heart className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                    <p className="font-display font-bold uppercase tracking-widest text-zinc-900 text-xs">Wishlist is Empty</p>
                    <button onClick={onReturnToShopping} className="mt-4 px-4 py-2.5 bg-zinc-900 text-white rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 border border-zinc-950 hover:border-blue-600 transition-all cursor-pointer">
                      Browse Tech Catalog
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.map((prod) => {
                      const inBagQty = cartQuantities[prod.id] || 0;
                      return (
                        <div key={prod.id} className="bg-white border border-zinc-200 rounded-none overflow-hidden flex p-4.5 gap-4 relative">
                          <div className="h-20 w-20 rounded-none overflow-hidden shrink-0 cursor-pointer bg-zinc-50 border border-zinc-200" onClick={() => onViewProduct(prod)}>
                            <img src={prod.image} alt={prod.title} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">{prod.brand}</span>
                              <h4 onClick={() => onViewProduct(prod)} className="font-display font-medium text-zinc-800 text-xs hover:text-blue-600 cursor-pointer line-clamp-1 leading-snug">
                                {prod.title}
                              </h4>
                              <p className="text-xs font-mono font-bold text-zinc-950">${prod.price.toFixed(2)}</p>
                            </div>
                            <div className="flex gap-2.5 pt-1.5 items-center">
                              {prod.stock > 0 ? (
                                <button onClick={() => onAddToCart(prod)} className={`px-3 py-1.5 rounded-none text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 transition-all border cursor-pointer ${
                                  inBagQty > 0 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-zinc-950 text-white hover:bg-blue-600 border-zinc-950 hover:border-blue-600"
                                }`}>
                                  {inBagQty > 0 ? <><Check className="h-3 w-3 stroke-[2.5]" /><span>In Bag ({inBagQty})</span></> : <><ShoppingCart className="h-3 w-3" /><span>Add to Bag</span></>}
                                </button>
                              ) : (
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-1 rounded-none border border-zinc-200">Out of Stock</span>
                              )}
                            </div>
                          </div>
                          <button onClick={() => onRemoveWishlist(prod)} className="absolute top-3 right-3 p-1.5 text-zinc-300 hover:text-red-600 transition-colors cursor-pointer">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "addresses" && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-none border border-zinc-200 p-5 shadow-none space-y-4"
              >
                <h3 className="font-display font-bold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2.5 border-b border-zinc-200">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                  <span>Your Delivery Addresses</span>
                </h3>
                <div className="p-4 border border-zinc-200 rounded-none bg-zinc-50 flex justify-between items-start font-mono text-[11px]">
                  <div className="space-y-1 text-xs font-sans">
                    <span className="bg-zinc-900 text-white text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-none tracking-widest">Primary Default</span>
                    <p className="font-display font-bold text-zinc-900 text-sm pt-1.5">{displayName}</p>
                    <p className="text-zinc-600 font-mono text-[11px]">123 Silicon Boulevard, Apt 4B</p>
                    <p className="text-zinc-600 font-mono text-[11px]">San Francisco, CA 94107</p>
                    <p className="text-zinc-600 font-mono text-[11px]">Phone: (555) 019-2834</p>
                  </div>
                  <button className="text-[9px] text-zinc-400 hover:text-zinc-950 font-mono font-bold uppercase tracking-widest cursor-pointer">Edit</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};