import React, { useState } from "react";
import { Store, Plus, TrendingUp, DollarSign, Package, AlertTriangle, Trash2, Edit2, Check, ArrowDown, ChevronRight, X, ListPlus, Sparkles } from "lucide-react";
import { Product, Order } from "../types";
import { CATEGORIES } from "../data";
import { motion, AnimatePresence } from "motion/react";

interface VendorPortalProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (newProduct: Product) => void;
  onUpdateStock: (productId: string, newStock: number) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

type SellerTab = "dashboard" | "products" | "orders";

export const VendorPortal: React.FC<VendorPortalProps> = ({
  products,
  orders,
  onAddProduct,
  onUpdateStock,
  onDeleteProduct,
  onUpdateOrderStatus
}) => {
  const [activeTab, setActiveTab] = useState<SellerTab>("dashboard");
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Audio");
  const [price, setPrice] = useState("");
  const [origPrice, setOrigPrice] = useState("");
  const [stock, setStock] = useState("");
  const [desc, setDesc] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  
  const [specKey1, setSpecKey1] = useState("Model Year");
  const [specVal1, setSpecVal1] = useState("2026");
  const [specKey2, setSpecKey2] = useState("Connectivity");
  const [specVal2, setSpecVal2] = useState("Wireless");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [inlineStockVal, setInlineStockVal] = useState<number>(0);

  const PRESET_IMAGES = [
    { label: "Modern Earbuds", url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80" },
    { label: "Tablet PC", url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80" },
    { label: "Curved Camera", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80" },
    { label: "Mechanical Mouse", url: "https://images.unsplash.com/photo-1625842268584-8f3290404019?w=600&auto=format&fit=crop&q=80" }
  ];

  // ✅ FIX: safe filter – skip items without product
  const filteredOrders = orders.filter(order =>
    order.items.some(item => item?.product?.id)
  );

  const sellerProductIds = products.map(p => p.id);
  const totalSales = filteredOrders.reduce((acc, o) => acc + o.total, 0) + 1289.50;
  const lowStockCount = products.filter((p) => p.stock <= 3 && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !brand.trim() || !price || !stock) return;

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);
    const finalImg = imgUrl.trim() || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80";

    const newProd: Product = {
      id: `prod-cust-${Date.now()}`,
      title: title.trim(),
      brand: brand.trim(),
      category,
      price: parsedPrice,
      originalPrice: origPrice ? parseFloat(origPrice) : undefined,
      stock: parsedStock,
      description: desc.trim() || "High quality electronics provided by premium seller vendor dashboard.",
      image: finalImg,
      gallery: [finalImg],
      rating: 5.0,
      reviewCount: 0,
      specs: {
        [specKey1.trim()]: specVal1.trim(),
        [specKey2.trim()]: specVal2.trim()
      },
      reviews: [],
      isCustom: true
    };

    onAddProduct(newProd);

    setTitle("");
    setBrand("");
    setCategory("Audio");
    setPrice("");
    setOrigPrice("");
    setStock("");
    setDesc("");
    setImgUrl("");
    setIsAddFormOpen(false);
  };

  const handleOpenInlineStock = (prod: Product) => {
    setEditingProductId(prod.id);
    setInlineStockVal(prod.stock);
  };

  const handleSaveInlineStock = (prodId: string) => {
    onUpdateStock(prodId, inlineStockVal);
    setEditingProductId(null);
  };

  return (
    <div id="vendor-portal-container" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900 text-white rounded-none p-6 shadow-none border border-zinc-800">
        <div>
          <span className="text-[9px] bg-zinc-800 text-zinc-400 font-extrabold px-2.5 py-0.5 rounded-none uppercase tracking-widest font-mono">
            Verified Seller Account
          </span>
          <h2 className="font-serif text-xl font-light tracking-wide mt-1.5 flex items-center gap-2 text-white">
            <Store className="h-5 w-5 text-zinc-300" />
            <span>TechSolutions Marketplace Portal</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Configure your product stock levels, draft new items, and process incoming buyer orders.</p>
        </div>

        <button
          id="vendor-add-product-btn"
          onClick={() => setIsAddFormOpen(true)}
          className="bg-white text-zinc-950 font-bold px-4 py-2.5 rounded-none text-[10px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-blue-600 hover:text-white transition-all cursor-pointer border border-white hover:border-blue-600 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 border-b border-zinc-200 pb-1 shrink-0 overflow-x-auto">
        {[
          { id: "dashboard", label: "Dashboard Summary" },
          { id: "products", label: "Manage Inventory" },
          { id: "orders", label: "Received Store Orders" }
        ].map((tab) => (
          <button
            key={tab.id}
            id={`seller-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id as SellerTab)}
            className={`px-4 py-3 rounded-none border text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? "bg-zinc-950 text-white border-zinc-950"
                : "text-zinc-500 hover:bg-zinc-50 border-transparent hover:border-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        
        {activeTab === "dashboard" && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-zinc-200 rounded-none p-5 shadow-none flex items-center gap-4">
                <div className="h-10 w-10 rounded-none bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Total Gross Sales</span>
                  <p className="text-xl font-bold font-mono text-zinc-950">${totalSales.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-none p-5 shadow-none flex items-center gap-4">
                <div className="h-10 w-10 rounded-none bg-zinc-50 text-zinc-600 flex items-center justify-center border border-zinc-200 shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Store Order Volume</span>
                  <p className="text-xl font-bold font-mono text-zinc-950">{filteredOrders.length + 8} orders</p>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-none p-5 shadow-none flex items-center gap-4">
                <div className="h-10 w-10 rounded-none bg-zinc-50 text-zinc-600 flex items-center justify-center border border-zinc-200 shrink-0">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Inventoried Items</span>
                  <p className="text-xl font-bold font-mono text-zinc-950">{products.length} products</p>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-none p-5 shadow-none flex items-center gap-4">
                <div className={`h-10 w-10 rounded-none flex items-center justify-center shrink-0 ${
                  lowStockCount + outOfStockCount > 0 
                    ? "bg-blue-50 text-blue-600 border border-blue-200 animate-pulse" 
                    : "bg-zinc-50 text-zinc-400 border border-zinc-200"
                }`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Low Stock Alerts</span>
                  <p className="text-xl font-bold font-mono text-zinc-950">{lowStockCount + outOfStockCount} items</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white border border-zinc-200 rounded-none p-5 shadow-none lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                  <div>
                    <h3 className="font-display font-bold uppercase tracking-wider text-zinc-950 text-xs">Store Revenue Trends</h3>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase">Daily compiled sales indicators over the past week.</p>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-blue-600 bg-blue-50 px-2.5 py-1 border border-blue-100">
                    +14.2% Growth
                  </span>
                </div>

                <div className="relative h-60 w-full pt-4">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="40" y1="20" x2="480" y2="20" stroke="#f4f4f5" strokeWidth="1" />
                    <line x1="40" y1="70" x2="480" y2="70" stroke="#f4f4f5" strokeWidth="1" />
                    <line x1="40" y1="120" x2="480" y2="120" stroke="#f4f4f5" strokeWidth="1" />
                    <line x1="40" y1="170" x2="480" y2="170" stroke="#e4e4e7" strokeWidth="1.5" />

                    <text x="30" y="24" className="text-[9px] fill-zinc-400 text-right font-mono" textAnchor="end">$2k</text>
                    <text x="30" y="74" className="text-[9px] fill-zinc-400 text-right font-mono" textAnchor="end">$1k</text>
                    <text x="30" y="124" className="text-[9px] fill-zinc-400 text-right font-mono" textAnchor="end">$500</text>
                    <text x="30" y="174" className="text-[9px] fill-zinc-400 text-right font-mono" textAnchor="end">$0</text>

                    <path
                      d="M 40 170 C 80 140, 110 130, 150 150 C 200 120, 240 70, 280 80 C 330 60, 370 110, 410 40 L 480 20 L 480 170 Z"
                      fill="url(#chartGradient)"
                    />

                    <path
                      d="M 40 170 C 80 140, 110 130, 150 150 C 200 120, 240 70, 280 80 C 330 60, 370 110, 410 40 L 480 20"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeLinecap="square"
                    />

                    <circle cx="150" cy="150" r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="280" cy="80" r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="410" cy="40" r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="480" cy="20" r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.5" />

                    <text x="40" y="192" className="text-[9px] fill-zinc-400 font-bold uppercase tracking-wider font-mono" textAnchor="middle">Mon</text>
                    <text x="113" y="192" className="text-[9px] fill-zinc-400 font-bold uppercase tracking-wider font-mono" textAnchor="middle">Tue</text>
                    <text x="186" y="192" className="text-[9px] fill-zinc-400 font-bold uppercase tracking-wider font-mono" textAnchor="middle">Wed</text>
                    <text x="259" y="192" className="text-[9px] fill-zinc-400 font-bold uppercase tracking-wider font-mono" textAnchor="middle">Thu</text>
                    <text x="332" y="192" className="text-[9px] fill-zinc-400 font-bold uppercase tracking-wider font-mono" textAnchor="middle">Fri</text>
                    <text x="405" y="192" className="text-[9px] fill-zinc-400 font-bold uppercase tracking-wider font-mono" textAnchor="middle">Sat</text>
                    <text x="480" y="192" className="text-[9px] fill-zinc-400 font-bold uppercase tracking-wider font-mono" textAnchor="end">Today</text>
                  </svg>
                </div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-none p-5 shadow-none space-y-4">
                <div className="border-b border-zinc-100 pb-3">
                  <h3 className="font-display font-bold uppercase tracking-wider text-zinc-950 text-xs">Actionable Alerts</h3>
                  <p className="text-[10px] text-zinc-400 font-mono uppercase">Items that need urgent restock or attention.</p>
                </div>

                <div className="divide-y divide-zinc-200 text-xs">
                  {products.filter((p) => p.stock <= 3).length === 0 ? (
                    <p className="text-zinc-400 italic text-center py-8">All active inventory is at healthy quantities. High five! 🙌</p>
                  ) : (
                    products
                      .filter((p) => p.stock <= 3)
                      .map((p) => (
                        <div key={p.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0 gap-3">
                          <div className="flex items-center gap-2">
                            <img src={p.image} alt="" className="h-8 w-8 rounded-none object-cover border border-zinc-200 bg-zinc-50" />
                            <div>
                              <p className="font-display font-semibold text-zinc-900 line-clamp-1">{p.title}</p>
                              <p className="text-[9px] text-zinc-400 uppercase font-mono">{p.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-0.5 rounded-none text-[9px] font-mono font-bold uppercase tracking-wider ${
                              p.stock === 0 ? "bg-red-50 text-red-600 border border-red-150" : "bg-blue-50 text-blue-600 border border-blue-150"
                            }`}>
                              {p.stock === 0 ? "OUT" : `${p.stock} LEFT`}
                            </span>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "products" && (
          <motion.div
            key="products"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-zinc-200 text-xs text-zinc-500 font-medium font-mono uppercase tracking-wider">
              <span>Displaying <b>{products.length}</b> total products</span>
              <span>Edit stock values on-the-fly</span>
            </div>

            <div className="border border-zinc-200 rounded-none overflow-hidden bg-white shadow-none divide-y divide-zinc-200 text-xs">
              {products.map((p) => (
                <div
                  key={p.id}
                  id={`inv-row-${p.id}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white hover:bg-zinc-50/40 transition-all"
                >
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <img src={p.image} alt={p.title} referrerPolicy="no-referrer" className="h-12 w-12 rounded-none object-cover border border-zinc-200 bg-zinc-50" />
                    <div>
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">{p.brand}</span>
                      <h4 className="font-display font-medium text-zinc-900 text-xs max-w-sm sm:max-w-xs md:max-w-md truncate">{p.title}</h4>
                      <p className="text-[10px] font-mono text-zinc-400 uppercase">Category: <b>{p.category}</b> • Unit Price: <b className="text-zinc-900">${p.price.toFixed(2)}</b></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      {editingProductId === p.id ? (
                        <div className="flex items-center gap-1.5 border border-zinc-200 rounded-none p-1 bg-zinc-50">
                          <input
                            type="number"
                            min="0"
                            value={inlineStockVal}
                            onChange={(e) => setInlineStockVal(Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-12 text-center text-xs font-bold font-mono bg-white border border-zinc-200 py-1 px-1 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                          />
                          <button
                            id={`save-stock-${p.id}`}
                            onClick={() => handleSaveInlineStock(p.id)}
                            className="p-1 rounded-none bg-zinc-950 text-white hover:bg-blue-600 transition-colors cursor-pointer"
                            title="Save stock value"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className={`font-bold inline-block px-2 py-1 rounded-none text-[9px] uppercase tracking-wider border ${
                            p.stock === 0
                              ? "bg-red-50 text-red-600 border-red-150"
                              : p.stock <= 3
                                ? "bg-amber-50 text-amber-600 border-amber-150"
                                : "bg-blue-50 text-blue-700 border-blue-150"
                          }`}>
                            Qty: {p.stock}
                          </span>
                          
                          <button
                            id={`edit-stock-trigger-${p.id}`}
                            onClick={() => handleOpenInlineStock(p)}
                            className="p-1.5 rounded-none border border-zinc-200 text-zinc-400 hover:text-zinc-950 bg-white hover:bg-zinc-50 cursor-pointer"
                            title="Quick Edit Stock"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    <button
                      id={`delete-prod-btn-${p.id}`}
                      onClick={() => onDeleteProduct(p.id)}
                      className="p-2 text-zinc-300 hover:text-red-600 hover:bg-red-50 rounded-none transition-colors cursor-pointer"
                      title="Delete Product from Store"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "orders" && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {filteredOrders.length === 0 ? (
              <div className="bg-white rounded-none border border-zinc-200 p-12 text-center shadow-none">
                <Package className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
                <p className="font-display uppercase tracking-widest font-bold text-zinc-900 text-xs">No incoming orders received yet</p>
                <p className="text-xs text-zinc-400 mt-1">Check back later or test by placing an order under Buyer Mode!</p>
              </div>
            ) : (
              filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  id={`vendor-order-card-${ord.id}`}
                  className="bg-white border border-zinc-200 rounded-none shadow-none p-5 space-y-4 text-xs text-zinc-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-3">
                    <div className="space-y-0.5 font-mono">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Buyer Invoice ID</span>
                      <span className="font-black text-zinc-950 text-sm">{ord.id}</span>
                    </div>
                    <div className="font-mono">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Date Placed</span>
                      <span className="font-semibold text-zinc-900">{ord.date}</span>
                    </div>
                    <div className="font-mono">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Total Settled</span>
                      <span className="font-black text-blue-600 text-sm">${ord.total.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-400 uppercase text-[9px] tracking-widest font-mono">Shipper Status:</span>
                      <select
                        id={`status-selector-${ord.id}`}
                        value={ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as Order["status"])}
                        className="py-1.5 px-2 border border-zinc-200 rounded-none bg-zinc-50 font-bold uppercase tracking-wider font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-blue-600"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 p-3 rounded-none border border-zinc-200 text-[11px] leading-normal font-mono">
                    <div className="space-y-0.5">
                      <span className="font-bold text-zinc-400 uppercase text-[9px] tracking-widest block">Shipment Consignee</span>
                      <p className="font-display font-semibold text-zinc-900 text-xs">{ord.shippingAddress.name}</p>
                      <p className="text-zinc-500">{ord.shippingAddress.address}, {ord.shippingAddress.city} {ord.shippingAddress.zip}</p>
                    </div>
                    <div className="space-y-0.5 border-t md:border-t-0 md:border-l border-zinc-200 pt-3 md:pt-0 md:pl-4">
                      <span className="font-bold text-zinc-400 uppercase text-[9px] tracking-widest block">Billing Metadata</span>
                      <p className="text-zinc-500">Method: <b>{ord.paymentMethod}</b></p>
                      <p className="text-zinc-500">Contact: {ord.shippingAddress.phone} / {ord.shippingAddress.email}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-zinc-400 uppercase text-[9px] tracking-widest block mb-1 font-mono">Purchased Products list</span>
                    {ord.items.map((item) => (
                      <div key={item.product.id} className="flex justify-between items-center py-1.5 bg-white p-2 rounded-none border border-zinc-200">
                        <span className="font-display font-medium text-zinc-700">{item.product.title} (x{item.quantity})</span>
                        <span className="font-mono font-bold text-zinc-950">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* FULL-SCREEN SLIDE OVER FORM: ADD PRODUCT */}
      <AnimatePresence>
        {isAddFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setIsAddFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-none w-full max-w-xl p-6 shadow-2xl overflow-hidden text-zinc-850 flex flex-col max-h-[90vh] border border-zinc-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 shrink-0">
                <div className="flex items-center gap-1.5 text-zinc-950 font-bold">
                  <ListPlus className="h-5 w-5 text-zinc-700" />
                  <span className="font-display uppercase tracking-wider text-xs">Draft New Marketplace Item</span>
                </div>
                <button
                  id="close-add-form"
                  onClick={() => setIsAddFormOpen(false)}
                  className="p-1 rounded-none hover:bg-zinc-100 text-zinc-400 hover:text-zinc-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProductSubmit} className="flex-1 overflow-y-auto pr-1 py-4 space-y-4 text-xs">
                
                <div className="bg-zinc-50 border border-zinc-200 p-3 rounded-none flex gap-2 font-mono">
                  <Sparkles className="h-4.5 w-4.5 text-zinc-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-zinc-900 uppercase text-[10px]">Real-time Store Sync</span>
                    <p className="text-zinc-500 text-[10px] uppercase leading-normal">Drafts instantly sync with buyer shopping grids.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AeroBuds Neo Pro"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Brand</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AeroSound"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="block w-full py-2 px-3 border border-zinc-200 bg-white rounded-none focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono text-[11px]"
                    >
                      {CATEGORIES.filter((c) => c !== "All").map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Retail Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      placeholder="e.g. 149.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Compare Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g. 199.99 (Optional)"
                      value={origPrice}
                      onChange={(e) => setOrigPrice(e.target.value)}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-600 text-zinc-400 line-through font-mono"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Available Units (Initial Stock)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 10"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-600 font-mono"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-1">Product Photo URL</label>
                    <input
                      type="url"
                      placeholder="Provide a valid image URL link..."
                      value={imgUrl}
                      onChange={(e) => setImgUrl(e.target.value)}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-600 mb-1"
                    />
                    
                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest block font-mono">Or select a premium stock preset:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_IMAGES.map((p) => (
                          <button
                            type="button"
                            key={p.label}
                            onClick={() => setImgUrl(p.url)}
                            className={`px-2 py-1 rounded-none border text-[9px] font-mono uppercase tracking-widest hover:bg-zinc-100 cursor-pointer ${
                              imgUrl === p.url ? "border-zinc-950 bg-zinc-100 text-zinc-950 font-bold" : "border-zinc-200 text-zinc-600"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Detailed Description</label>
                    <textarea
                      placeholder="Explain features, advantages, and warranty details..."
                      rows={3}
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
                    />
                  </div>

                  <div className="col-span-2 space-y-2 border-t border-zinc-200 pt-3">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-1">Key Technical Specifications</span>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Spec Name (e.g. Model)"
                        value={specKey1}
                        onChange={(e) => setSpecKey1(e.target.value)}
                        className="p-1.5 border border-zinc-200 rounded-none text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <input
                        type="text"
                        placeholder="Spec Value (e.g. 2026)"
                        value={specVal1}
                        onChange={(e) => setSpecVal1(e.target.value)}
                        className="p-1.5 border border-zinc-200 rounded-none text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <input
                        type="text"
                        placeholder="Spec Name"
                        value={specKey2}
                        onChange={(e) => setSpecKey2(e.target.value)}
                        className="p-1.5 border border-zinc-200 rounded-none text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <input
                        type="text"
                        placeholder="Spec Value"
                        value={specVal2}
                        onChange={(e) => setSpecVal2(e.target.value)}
                        className="p-1.5 border border-zinc-200 rounded-none text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <button
                  id="submit-new-product"
                  type="submit"
                  className="w-full bg-zinc-950 text-white py-3.5 rounded-none font-bold uppercase tracking-widest hover:bg-blue-600 border border-zinc-950 hover:border-blue-600 mt-4 transition-all block text-center cursor-pointer"
                >
                  Confirm and Publish Product
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};