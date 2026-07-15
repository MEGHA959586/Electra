import React, { useState, useEffect } from "react";
import { ClipboardList, Heart, MapPin, Calendar, Truck, ArrowLeft, Trash2, ShoppingCart, Check, Plus, Edit2, X } from "lucide-react";
import { Order, Product } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

interface Address {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  is_default: boolean;
}

interface ProfileProps {
  orders: Order[];
  wishlist: Product[];
  onRemoveWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onViewProduct: (product: Product) => void;
  onReturnToShopping: () => void;
  cartQuantities: { [productId: string]: number };
  addresses: Address[];
  onAddAddress: (address: Omit<Address, 'id'>) => void;
  onUpdateAddress: (id: string, address: Omit<Address, 'id'>) => void;
  onDeleteAddress: (id: string) => void;
  onSetDefaultAddress: (id: string) => void;
}

type ProfileTab = "orders" | "wishlist" | "addresses";

export const Profile: React.FC<ProfileProps> = ({
  orders,
  wishlist,
  onRemoveWishlist,
  onAddToCart,
  onViewProduct,
  onReturnToShopping,
  cartQuantities,
  addresses,
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>("orders");
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    name: user?.name || "",
    email: user?.email || "",
    address: "",
    city: "",
    zip: "",
    phone: "",
    is_default: false,
  });

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = user?.name || "Guest";
  const initials = getInitials(displayName);

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAddress(newAddress);
    setIsAddingAddress(false);
    setNewAddress({
      name: user?.name || "",
      email: user?.email || "",
      address: "",
      city: "",
      zip: "",
      phone: "",
      is_default: false,
    });
  };

  const handleEditAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAddress) {
      const { id, ...data } = editingAddress;
      onUpdateAddress(id, data);
      setEditingAddress(null);
    }
  };

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
            <span>Saved Addresses ({addresses.length})</span>
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
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <h3 className="font-display font-bold text-zinc-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                    <span>Your Delivery Addresses</span>
                  </h3>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add Address</span>
                  </button>
                </div>

                {addresses.length === 0 && !isAddingAddress ? (
                  <p className="text-xs text-zinc-400 italic">No saved addresses. Add one below.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-zinc-200 rounded-none p-4 bg-zinc-50 flex justify-between items-start">
                        <div className="space-y-1 text-xs font-sans">
                          {addr.is_default && (
                            <span className="bg-zinc-900 text-white text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-none tracking-widest">Primary Default</span>
                          )}
                          <p className="font-display font-bold text-zinc-900 text-sm pt-1.5">{addr.name}</p>
                          <p className="text-zinc-600 font-mono text-[11px]">{addr.address}</p>
                          <p className="text-zinc-600 font-mono text-[11px]">{addr.city}, {addr.zip}</p>
                          <p className="text-zinc-600 font-mono text-[11px]">Phone: {addr.phone}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {!addr.is_default && (
                            <button
                              onClick={() => onSetDefaultAddress(addr.id)}
                              className="text-[9px] text-blue-600 hover:text-blue-800 font-mono uppercase tracking-widest"
                            >
                              Set Default
                            </button>
                          )}
                          <button
                            onClick={() => setEditingAddress(addr)}
                            className="text-[9px] text-zinc-400 hover:text-zinc-950 font-mono uppercase tracking-widest"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDeleteAddress(addr.id)}
                            className="text-[9px] text-red-500 hover:text-red-700 font-mono uppercase tracking-widest"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Address Form */}
                {isAddingAddress && (
                  <form onSubmit={handleAddAddressSubmit} className="border border-zinc-200 p-4 space-y-3 mt-3 bg-white">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Add New Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Email</label>
                        <input
                          type="email"
                          required
                          value={newAddress.email}
                          onChange={(e) => setNewAddress({ ...newAddress, email: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Address</label>
                        <input
                          type="text"
                          required
                          value={newAddress.address}
                          onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">City</label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">ZIP</label>
                        <input
                          type="text"
                          required
                          value={newAddress.zip}
                          onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Phone</label>
                        <input
                          type="text"
                          required
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="new-address-default"
                          checked={newAddress.is_default}
                          onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                          className="accent-blue-600"
                        />
                        <label htmlFor="new-address-default" className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Set as default</label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Edit Address Form */}
                {editingAddress && (
                  <form onSubmit={handleEditAddressSubmit} className="border border-zinc-200 p-4 space-y-3 mt-3 bg-white">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Edit Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Full Name</label>
                        <input
                          type="text"
                          required
                          value={editingAddress.name}
                          onChange={(e) => setEditingAddress({ ...editingAddress, name: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Email</label>
                        <input
                          type="email"
                          required
                          value={editingAddress.email}
                          onChange={(e) => setEditingAddress({ ...editingAddress, email: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Address</label>
                        <input
                          type="text"
                          required
                          value={editingAddress.address}
                          onChange={(e) => setEditingAddress({ ...editingAddress, address: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">City</label>
                        <input
                          type="text"
                          required
                          value={editingAddress.city}
                          onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">ZIP</label>
                        <input
                          type="text"
                          required
                          value={editingAddress.zip}
                          onChange={(e) => setEditingAddress({ ...editingAddress, zip: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Phone</label>
                        <input
                          type="text"
                          required
                          value={editingAddress.phone}
                          onChange={(e) => setEditingAddress({ ...editingAddress, phone: e.target.value })}
                          className="w-full py-1.5 px-2.5 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      </div>
                      <div className="md:col-span-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="edit-address-default"
                          checked={editingAddress.is_default}
                          onChange={(e) => setEditingAddress({ ...editingAddress, is_default: e.target.checked })}
                          className="accent-blue-600"
                        />
                        <label htmlFor="edit-address-default" className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider">Set as default</label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition"
                      >
                        Update Address
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAddress(null)}
                        className="px-4 py-2 border border-zinc-200 text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};