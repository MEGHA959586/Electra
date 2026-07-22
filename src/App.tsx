import { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Header } from "./components/Header";
import { SidebarFilters } from "./components/SidebarFilters";
import { ProductCard } from "./components/ProductCard";
import { ProductDetails } from "./components/ProductDetails";
import { Cart } from "./components/Cart";
import { Checkout } from "./components/Checkout";
import { Profile } from "./components/Profile";
import { VendorPortal } from "./components/VendorPortal";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { AuthProvider, useAuth } from "./context/AuthContext";

import { Product, CartItem, Order, Review, Coupon } from "./types";
import { INITIAL_COUPONS } from "./data";
import api from "./services/api";
import {
  Filter, ArrowRight, Truck, RefreshCw, ShieldCheck, CreditCard,
  Facebook, Twitter, Instagram, Youtube, Send, Mail, Phone, MapPin, Calendar, User, ChevronDown, ChevronUp
} from "lucide-react";
import { motion } from "motion/react";
import { useFrameAnimationRef } from "./hooks/useFrameAnimationRef";

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

const RequireAuth = ({ children, redirectTo = "/login" }: { children: JSX.Element; redirectTo?: string }) => {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to={redirectTo} state={{ from: location }} replace />;
  return children;
};

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);
  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const [currentView, setView] = useState<"buyer" | "seller" | "cart" | "profile" | "checkout">("buyer");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem("em_cart") || "[]"));
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>(() => JSON.parse(localStorage.getItem("em_orders") || "[]"));
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  const initialLoadDone = useRef(false);

  const mapApiProduct = (row: any): Product => ({
    id: String(row.id),
    title: row.title,
    description: row.description,
    price: Number(row.price || 0),
    originalPrice: row.originalPrice ?? row.original_price ?? undefined,
    rating: Number(row.rating || 0),
    reviewCount: Number(row.reviewCount || row.review_count || 0),
    image: row.image,
    gallery: row.gallery || [],
    category: row.category,
    brand: row.brand,
    stock: Number(row.stock || 0),
    specs: row.specs || {},
    reviews: row.reviews || [],
    seller_id: row.seller_id !== null && row.seller_id !== undefined ? String(row.seller_id) : null,
  });

  const mapApiCartItems = (rows: any[]): CartItem[] =>
    rows.map((row) => ({ product: mapApiProduct(row), quantity: Number(row.quantity || 1) }));

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [minRating, setMinRating] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState("popular");

  const maxPriceLimit = products.reduce((acc, p) => (p.price > acc ? p.price : acc), 100);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1200]);
  useEffect(() => {
    setPriceRange([0, Math.ceil(maxPriceLimit)]);
  }, [products, maxPriceLimit]);

  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState("");

  useEffect(() => localStorage.setItem("em_cart", JSON.stringify(cartItems)), [cartItems]);
  useEffect(() => localStorage.setItem("em_orders", JSON.stringify(orders)), [orders]);

  // ========== FETCH PRODUCTS ==========
  const fetchProducts = async (showLoader = true) => {
    if (showLoader && !initialLoadDone.current) {
      setLoading(true);
    }
    try {
      const response = await api.get(`/products`);
      const mappedProducts = response.data.map((p: any) => mapApiProduct(p));
      setProducts(mappedProducts);
      if (!initialLoadDone.current) {
        initialLoadDone.current = true;
      }
    } catch (error) {
      console.error("Failed to fetch products", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // ========== FETCH SELLER ORDERS ==========
  const fetchSellerOrders = async () => {
    if (!user || user.role !== 'seller') return;
    try {
      const res = await api.get("/orders/seller");
      setSellerOrders(res.data);
    } catch (e) {
      console.error("Failed to fetch seller orders", e);
    }
  };

  // ========== FETCH BUYER ORDERS ==========
  const fetchBuyerOrders = async () => {
    if (!user) return;
    try {
      const res = await api.get("/orders");
      setOrders(res.data.map((o: any) => ({
        id: String(o.id),
        date: o.created_at || o.date || new Date().toISOString(),
        items: (o.items || []).map((item: any) => ({ product: mapApiProduct(item), quantity: Number(item.quantity || 1) })),
        total: Number(o.total || 0),
        subtotal: Number(o.subtotal || 0),
        discount: Number(o.discount || 0),
        tax: Number(o.tax || 0),
        shipping: Number(o.shipping || 0),
        shippingAddress: o.shippingAddress || { name: "", email: "", address: "", city: "", zip: "", phone: "" },
        paymentMethod: o.payment_method || o.paymentMethod || "Card",
        status: o.status || "Processing"
      })));
    } catch (e) { console.error(e); }
  };

  // ========== FETCH ADDRESSES ==========
  const fetchAddresses = async () => {
    if (!user) return;
    try {
      const res = await api.get("/addresses");
      setAddresses(res.data);
    } catch (e) {
      console.error("Failed to fetch addresses", e);
    }
  };

  // ========== ADDRESS HANDLERS ==========
  const handleAddAddress = async (address: Omit<Address, 'id'>) => {
    try {
      await api.post("/addresses", address);
      await fetchAddresses();
    } catch (e) {
      console.error("Failed to add address", e);
      throw e;
    }
  };

  const handleUpdateAddress = async (id: string, address: Omit<Address, 'id'>) => {
    try {
      await api.put(`/addresses/${id}`, address);
      await fetchAddresses();
    } catch (e) {
      console.error("Failed to update address", e);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await api.delete(`/addresses/${id}`);
      await fetchAddresses();
    } catch (e) {
      console.error("Failed to delete address", e);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    try {
      await api.patch(`/addresses/${id}/default`);
      await fetchAddresses();
    } catch (e) {
      console.error("Failed to set default address", e);
    }
  };

  // ========== ONLY FETCH ON MOUNT ==========
  useEffect(() => {
    fetchProducts(true);
  }, []);

  // ========== REFRESH WHEN SELLER DASHBOARD OPENS ==========
  useEffect(() => {
    if (user?.role === 'seller' && location.pathname === '/seller') {
      fetchProducts(false);
      fetchSellerOrders();
    }
  }, [user, location.pathname]);

  // ========== SYNC ON LOGIN ==========
  useEffect(() => {
    const sync = async () => {
      if (!user) return;
      try {
        const [cartRes] = await Promise.all([api.get("/cart")]);
        setCartItems(mapApiCartItems(cartRes.data));
        await fetchBuyerOrders();
        if (user.role === 'seller') {
          await fetchSellerOrders();
        }
        await fetchAddresses();
      } catch (e) { console.error(e); }
    };
    sync();
  }, [user]);

  // ========== FETCH WISHLIST ON LOGIN ==========
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const res = await api.get("/wishlist");
        setWishlist(res.data);
      } catch (e) {
        console.error("Failed to fetch wishlist", e);
        setWishlist([]);
      }
    };
    fetchWishlist();
  }, [user]);

  useEffect(() => {
    if (user) setView(user.role === "seller" ? "seller" : "buyer");
    else setView("buyer");
  }, [user]);

  // ========== CAROUSEL LOGIC ==========
  const latestProducts = [...products].sort((a, b) => Number(b.id) - Number(a.id));
  const productsPerSlide = 4;
  const slides = [];
  for (let i = 0; i < latestProducts.length; i += productsPerSlide) {
    slides.push(latestProducts.slice(i, i + productsPerSlide));
  }
  const totalSlides = slides.length;

  useEffect(() => {
    if (totalSlides === 0) return;
    slideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 7000);
    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, [totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
      slideInterval.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 7000);
    }
  };

  const availableBrands = Array.from(new Set(products.filter(p => selectedCategory === "All" || p.category === selectedCategory).map(p => p.brand))).sort();

  // ========== HANDLERS ==========
  const handleClearFilters = () => {
    setSearchQuery("");
    setCategory("All");
    setSelectedBrand("All");
    setPriceRange([0, Math.ceil(maxPriceLimit)]);
    setMinRating(0);
    setOnlyInStock(false);
    setSortBy("popular");
  };

  const handleAddToCart = async (product: Product, quantity = 1) => {
    if (!user) {
      setCartItems(prev => {
        const idx = prev.findIndex(i => i.product.id === product.id);
        if (idx > -1) {
          const next = [...prev];
          next[idx].quantity = Math.min(product.stock, next[idx].quantity + quantity);
          return next;
        }
        return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
      });
      return;
    }
    try {
      const res = await api.post("/cart/add", { productId: product.id, quantity });
      setCartItems(mapApiCartItems(res.data));
    } catch (e) { console.error(e); }
  };

  const handleUpdateCartQuantity = async (productId: string, quantity: number) => {
    const target = products.find(p => p.id === productId);
    if (!target) return;
    if (!user) {
      setCartItems(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: Math.min(target.stock, Math.max(1, quantity)) } : item).filter(item => item.quantity > 0));
      return;
    }
    try {
      const res = await api.put("/cart/update", { productId, quantity });
      setCartItems(mapApiCartItems(res.data));
    } catch (e) { console.error(e); }
  };

  const handleRemoveCartItem = async (productId: string) => {
    if (!user) {
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
      return;
    }
    try {
      const res = await api.delete(`/cart/remove/${productId}`);
      setCartItems(mapApiCartItems(res.data));
    } catch (e) { console.error(e); }
  };

  const handleClearCart = async () => {
    if (!user) { setCartItems([]); return; }
    try { await api.delete("/cart/clear"); setCartItems([]); } catch (e) { console.error(e); }
  };

  const handleToggleWishlist = async (product: Product) => {
    const isWishlisted = wishlist.some(p => p.id === product.id);
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        setWishlist(prev => prev.filter(p => p.id !== product.id));
      } else {
        await api.post("/wishlist", { productId: product.id });
        setWishlist(prev => [...prev, product]);
      }
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
    }
  };

  const handleAddReview = (productId: string, reviewData: Omit<Review, "id" | "date">) => {
    const freshReview: Review = { ...reviewData, id: `rev-${Date.now()}`, date: new Date().toISOString().split("T")[0] };
    setProducts(prev => prev.map(p => {
      if (p.id !== productId) return p;
      const nextReviews = [freshReview, ...p.reviews];
      const sum = nextReviews.reduce((acc, r) => acc + r.rating, 0);
      const nextRating = parseFloat((sum / nextReviews.length).toFixed(1));
      return { ...p, reviews: nextReviews, reviewCount: nextReviews.length, rating: nextRating };
    }));
  };

  const handleCheckoutInitiate = (discount: number, code: string) => {
    setAppliedDiscount(discount);
    setAppliedDiscountCode(code);
    navigate("/checkout");
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setProducts(prev => prev.map(p => {
      const item = newOrder.items.find(i => i.product.id === p.id);
      if (item) return { ...p, stock: Math.max(0, p.stock - item.quantity) };
      return p;
    }));
    setCartItems([]);
    if (user?.role === 'seller') {
      fetchSellerOrders();
    }
    navigate("/profile");
  };

  const handleAddCustomProduct = async (productData: Omit<Product, 'id' | 'rating' | 'reviewCount' | 'reviews'>) => {
    try {
      const { id, isCustom, rating, reviewCount, reviews, ...payload } = productData;
      const response = await api.post('/products', payload);
      const newProduct = response.data;
      setProducts(prev => [newProduct, ...prev]);
      setTimeout(() => fetchProducts(false), 200);
    } catch (error) {
      console.error('Failed to add product:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
      setWishlist(prev => prev.filter(p => p.id !== productId));
      setTimeout(() => fetchProducts(false), 200);
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (error) {
      console.error("Failed to update order status", error);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSellerOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert("Failed to cancel order. Please try again.");
    }
  };

  // ========== FILTERING (client‑side) ==========
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          Object.values(p.specs).some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const matchesBrand = selectedBrand === "All" || p.brand === selectedBrand;
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const matchesRating = p.rating >= minRating;
    const matchesStock = !onlyInStock || p.stock > 0;
    return matchesSearch && matchesCategory && matchesBrand && matchesPrice && matchesRating && matchesStock;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "stock") return b.stock > 0 && a.stock === 0 ? -1 : a.stock > 0 && b.stock === 0 ? 1 : 0;
    return b.reviewCount - a.reviewCount;
  });

  const cartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const cartQuantitiesMap = cartItems.reduce<{ [id: string]: number }>((acc, item) => { acc[item.product.id] = item.quantity; return acc; }, {});

  // ========== FRAME ANIMATIONS (with error handling) ==========
  const laptopRefObj = useFrameAnimationRef("laptop_10fps", 80, 10);
  const airpodsRefObj = useFrameAnimationRef("airpod_10fps", 80, 10);
  const phoneRefObj = useFrameAnimationRef("phone_frames", 161, 10);

  // ========== SELLER'S OWN PRODUCTS ==========
  const myProducts = user ? products.filter(p => String(p.seller_id) === String(user.id)) : [];

  // ========== CATALOG CONTENT ==========
  const CatalogContent = () => (
    <div className="flex flex-col lg:flex-row gap-8">
      <SidebarFilters
        brands={availableBrands}
        selectedBrand={selectedBrand}
        setSelectedBrand={setSelectedBrand}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        minRating={minRating}
        setMinRating={setMinRating}
        onlyInStock={onlyInStock}
        setOnlyInStock={setOnlyInStock}
        sortBy={sortBy}
        setSortBy={setSortBy}
        clearFilters={handleClearFilters}
        maxPriceLimit={maxPriceLimit}
      />
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-stone-950 tracking-tight">
              {selectedCategory === "All" ? "Featured Products" : `${selectedCategory} Devices`}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5 font-medium">
              Showing {sortedProducts.length} premium electronic products matching criteria.
            </p>
          </div>
          {onlyInStock && <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full">In Stock Only</span>}
        </div>
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm max-w-lg mx-auto">
            <p className="font-bold text-stone-900 text-sm">Loading products...</p>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm max-w-lg mx-auto">
            <Filter className="h-5 w-5 text-stone-400 mx-auto mb-3" />
            <p className="font-bold text-stone-900 text-sm">No Products Found</p>
            <button onClick={handleClearFilters} className="mt-4 px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold hover:bg-stone-800">Reset Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onViewDetails={(prod) => navigate(`/product/${prod.id}`)}
                isWishlisted={wishlist.some(w => w.id === p.id)}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={(product) => handleAddToCart(product, 1)}
                cartQuantity={cartQuantitiesMap[p.id] || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // FAQ data
  const faqs = [
    { q: "What is ELECTRA?", a: "ELECTRA is a premium electronics marketplace that curates high‑quality audio, computing, and wearable devices." },
    { q: "How do I place an order?", a: "Simply browse our catalog, add items to your cart, and proceed to checkout." },
    { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex) and PayPal." },
    { q: "How long does shipping take?", a: "Usually 2–5 business days within the continental US." },
    { q: "What is your return policy?", a: "We offer a 30‑day hassle‑free return policy." }
  ];
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const blogPosts = [
    { title: "The Future of Wireless Audio", excerpt: "How lossless Bluetooth and spatial audio are changing the way we listen.", date: "July 8, 2026", author: "Alex Rivera", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80" },
    { title: "Why Silicon Notebooks Are Dominating 2026", excerpt: "Ultra‑thin, fanless, and incredibly powerful – the new standard in portable computing.", date: "July 2, 2026", author: "Jessica Taylor", image: "https://images.unsplash.com/photo-1496181130204-755241544e35?w=400&auto=format&fit=crop&q=80" },
    { title: "The Art of Mechanical Keyboards", excerpt: "From tactile switches to custom keycaps – why enthusiasts are obsessed.", date: "June 25, 2026", author: "Nathan Drake", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80" }
  ];

  return (
    <div className="relative min-h-screen bg-stone-50 text-stone-900 transition-colors duration-300 flex flex-col font-sans">
      <div className="absolute inset-0 -z-10 pointer-events-none bg-stone-50" />
      <Header
        currentCategory={selectedCategory}
        setCategory={setCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        currentView={currentView}
        setView={setView}
      />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
              {/* HERO */}
              <div className="relative w-full border border-stone-200 bg-white/40 rounded-none overflow-hidden shadow-none">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <img 
                    ref={laptopRefObj.ref} 
                    src="/laptop_10fps/ezgif-frame-001.jpg" 
                    alt="Laptop" 
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover" 
                    onError={laptopRefObj.onError}
                  />
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px]"></div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                  className="relative z-10 max-w-2xl p-8 md:p-12 flex flex-col justify-center min-h-[300px] md:min-h-[400px]"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 mb-3 font-mono">Product Spotlight — 2026</p>
                  <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-light leading-[1.1] mb-6 tracking-tight text-stone-950">
                    The New <br/><span className="font-black italic font-serif">Standard</span> <br/>in Precision.
                  </h1>
                  <p className="text-stone-700 text-sm md:text-base leading-relaxed max-w-md mb-8 font-sans">
                    Engineered for clinical acoustic perfection and raw computing power. Our custom-curated line of premium audio, ultra-thin silicon notebooks, and custom peripherals define the new standard of modern electronic craftsmanship.
                  </p>
                  <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => { if (!user) navigate("/login"); else { setCategory("All"); navigate("/catalog"); } }} className="bg-stone-900 text-white border border-stone-900 px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-900 hover:border-blue-900 transition-all cursor-pointer rounded-none">Shop now</button>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        <div className="w-7 h-7 rounded-full border border-white bg-stone-200"></div>
                        <div className="w-7 h-7 rounded-full border border-white bg-stone-300"></div>
                        <div className="w-7 h-7 rounded-full border border-white bg-stone-400"></div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-stone-600 ml-1">+14k Reviews</span>
                    </div>
                  </div>
                  <div className="border-t border-stone-200/50 pt-6 mt-8">
                    <div className="flex justify-between items-end">
                      <div><div className="text-[9px] uppercase tracking-widest font-bold text-stone-500 mb-1">Release Edition</div><div className="text-sm font-mono text-stone-800 font-bold">ED. 09 // JULY 2026</div></div>
                      <div className="text-right"><div className="text-[9px] uppercase tracking-widest font-bold text-stone-500 mb-1">Availability</div><div className="text-sm font-mono text-emerald-600 font-bold">IN STOCK & VERIFIED</div></div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* WHY CHOOSE */}
              <div className="w-full mb-10 py-10 bg-white border border-stone-200">
                <div className="text-center mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 font-mono">Why Choose ELECTRA</span>
                  <h2 className="font-serif text-2xl md:text-3xl font-light text-stone-950 mt-1">Engineered for <span className="font-black italic">Excellence</span></h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="flex flex-col items-center text-center p-4"
                  >
                    <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3"><Truck className="h-7 w-7" /></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Free Shipping</h4><p className="text-[10px] text-stone-500 mt-1">On all orders over $50</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="flex flex-col items-center text-center p-4"
                  >
                    <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3"><RefreshCw className="h-7 w-7" /></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">30-Day Returns</h4><p className="text-[10px] text-stone-500 mt-1">Hassle‑free & immediate</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="flex flex-col items-center text-center p-4"
                  >
                    <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3"><ShieldCheck className="h-7 w-7" /></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">1‑Year Warranty</h4><p className="text-[10px] text-stone-500 mt-1">Full coverage on all devices</p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="flex flex-col items-center text-center p-4"
                  >
                    <div className="h-14 w-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3"><CreditCard className="h-7 w-7" /></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Secure Payment</h4><p className="text-[10px] text-stone-500 mt-1">256‑bit encrypted checkout</p>
                  </motion.div>
                </div>
                <div className="flex flex-wrap justify-center gap-6 mt-8">
                  <motion.button
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 1.3, ease: "easeOut" }}
                    onClick={() => { if (!user) navigate("/login"); else { setCategory("All"); navigate("/catalog"); } }}
                    className="px-6 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-900 border border-stone-900 hover:border-blue-900 transition-all cursor-pointer"
                  >
                    Explore Catalog
                  </motion.button>
                  <motion.button
                    initial={{ opacity: 0, x: 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 1.3, ease: "easeOut" }}
                    onClick={() => { if (!user) navigate("/login"); else { setCategory("Audio"); navigate("/catalog"); } }}
                    className="px-6 py-3 bg-white text-stone-950 text-[10px] font-bold uppercase tracking-widest border border-stone-200 hover:bg-stone-50 transition-all cursor-pointer"
                  >
                    Shop Audio Deals
                  </motion.button>
                </div>
              </div>

              {/* AIRPODS BANNER */}
              <div className="relative w-full h-[240px] md:h-[280px] border border-stone-200 bg-black overflow-hidden flex items-center shadow-none">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <img 
                    ref={airpodsRefObj.ref} 
                    src="/airpod_10fps/ezgif-frame-001.jpg" 
                    alt="AirPods" 
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover" 
                    onError={airpodsRefObj.onError}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent"></div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 1.6, ease: "easeOut" }}
                  className="relative z-10 max-w-md md:ml-12 p-6 text-white"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-400 mb-2 block font-mono">Acoustic Precision</span>
                  <h2 className="font-serif text-2xl md:text-3xl font-light leading-tight mb-3 text-white">AirPods Series. <br/><span className="font-black italic font-serif text-amber-300">Pure Acoustic Art.</span></h2>
                  <p className="text-stone-300 text-xs leading-relaxed mb-4">Featuring active noise cancellation and personalized spatial mapping. Experience sound engineered with medical-grade acoustic clarity.</p>
                  <button onClick={() => { if (!user) navigate("/login"); else { setCategory("Audio"); navigate("/catalog"); } }} className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-amber-400 hover:text-white transition-all font-mono border-b border-amber-400 pb-0.5 cursor-pointer">
                    <span>Shop AirPods Series</span><ArrowRight className="h-3 w-3" />
                  </button>
                </motion.div>
              </div>

              {/* SHOP OUR COLLECTION – CAROUSEL (responsive) */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.1 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.8 } }
                }}
                className="w-full py-12 bg-white border border-stone-200"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 1.0, ease: "easeOut" }}
                    className="mb-8"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 font-mono">Shop Our Collection</span>
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-stone-950 mt-1">
                      Premium <span className="font-black italic">Electronics</span>
                    </h2>
                    <div className="h-0.5 w-16 bg-amber-600 mt-2"></div>
                  </motion.div>

                  {loading ? (
                    <div className="text-center py-12">
                      <p className="font-bold text-stone-900 text-sm">Loading products...</p>
                    </div>
                  ) : slides.length === 0 ? (
                    <p className="text-center text-stone-500">No products available.</p>
                  ) : (
                    <>
                      <div className="relative overflow-hidden">
                        <div
                          className="flex transition-transform duration-700 ease-in-out"
                          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                        >
                          {slides.map((slide, idx) => (
                            <div
                              key={idx}
                              className="w-full flex-shrink-0 flex flex-nowrap gap-2 px-1 sm:px-2"
                            >
                              {slide.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex-[0_0_50%] sm:flex-[0_0_33.333%] lg:flex-[0_0_25%] min-w-0"
                                >
                                  <ProductCard
                                    product={product}
                                    onViewDetails={(prod) => navigate(`/product/${prod.id}`)}
                                    isWishlisted={wishlist.some(w => w.id === product.id)}
                                    onToggleWishlist={handleToggleWishlist}
                                    onAddToCart={(prod) => handleAddToCart(prod, 1)}
                                    cartQuantity={cartQuantitiesMap[product.id] || 0}
                                  />
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Dots */}
                      <div className="flex justify-center gap-2 mt-6">
                        {slides.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            className={`h-2 w-2 rounded-full transition-all ${
                              currentSlide === idx ? "bg-amber-600 w-6" : "bg-stone-300"
                            }`}
                            aria-label={`Go to slide ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.4 }}
                    className="flex justify-center mt-10"
                  >
                    <button
                      onClick={() => {
                        if (!user) navigate("/login");
                        else navigate("/catalog");
                      }}
                      className="px-8 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-900 border border-stone-900 hover:border-blue-900 transition-all cursor-pointer"
                    >
                      View All Products
                    </button>
                  </motion.div>
                </div>
              </motion.div>

              {/* ABOUT – PHONE */}
              <div ref={aboutRef} className="scroll-mt-20 w-full h-[460px] md:h-[500px] bg-black relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <img 
                    ref={phoneRefObj.ref} 
                    src="/phone_frames/ezgif-frame-001.jpg" 
                    alt="Phone animation" 
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={phoneRefObj.onError}
                  />
                </div>
              </div>

              {/* CONTACT */}
              <div ref={contactRef} className="scroll-mt-20 w-full py-12 bg-white border border-stone-200">
                <div className="max-w-5xl mx-auto px-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="mb-8"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 font-mono">Get in Touch</span>
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-stone-950 mt-1">Contact Us</h2>
                    <div className="h-0.5 w-16 bg-amber-600 mt-2"></div>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <motion.div
                      className="space-y-6"
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: false, amount: 0.2 }}
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.3, delayChildren: 0.2 }
                        }
                      }}
                    >
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0, transition: { duration: 1.0, ease: "easeOut" } }
                        }}
                        className="flex items-start gap-3"
                      >
                        <MapPin className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div><h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Address</h4><p className="text-sm text-stone-600">123 Silicon Boulevard, Suite 100<br />San Francisco, CA 94107</p></div>
                      </motion.div>
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0, transition: { duration: 1.0, ease: "easeOut" } }
                        }}
                        className="flex items-start gap-3"
                      >
                        <Phone className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div><h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Phone</h4><p className="text-sm text-stone-600">+1 (555) 019-2834</p></div>
                      </motion.div>
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 15 },
                          visible: { opacity: 1, y: 0, transition: { duration: 1.0, ease: "easeOut" } }
                        }}
                        className="flex items-start gap-3"
                      >
                        <Mail className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div><h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">Email</h4><p className="text-sm text-stone-600">support@electra.com</p></div>
                      </motion.div>
                    </motion.div>

                    {/* Contact form */}
                    <div className="bg-stone-50 p-6 border border-stone-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-4">Send a message</h4>
                      <form onSubmit={(e) => { e.preventDefault(); alert("Message sent! (demo)"); }} className="space-y-3">
                        <input type="text" placeholder="Your Name" className="w-full py-2 px-3 border border-stone-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-amber-600" required />
                        <input type="email" placeholder="Email" className="w-full py-2 px-3 border border-stone-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-amber-600" required />
                        <textarea rows={3} placeholder="Message" className="w-full py-2 px-3 border border-stone-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none" required />
                        <button type="submit" className="w-full bg-stone-900 text-white py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-900 transition border border-stone-900 hover:border-blue-900 flex items-center justify-center gap-2"><Send className="h-3.5 w-3.5" /> Send</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div ref={faqRef} className="scroll-mt-20 w-full py-12 bg-white border border-stone-200">
                <div className="max-w-3xl mx-auto px-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="mb-8"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 font-mono">Answers</span>
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-stone-950 mt-1">Frequently Asked Questions</h2>
                    <div className="h-0.5 w-16 bg-amber-600 mt-2"></div>
                  </motion.div>
                  <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 1.2, delay: idx * 0.15 }}
                        className="border border-stone-200 bg-white"
                      >
                        <button
                          onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                          className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-stone-900 hover:bg-stone-50 transition"
                        >
                          <span>{faq.q}</span>
                          {openFaq === idx ? (
                            <ChevronUp className="h-4 w-4 text-stone-500 transition-transform duration-300" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-stone-500 transition-transform duration-300" />
                          )}
                        </button>
                        <motion.div
                          initial={false}
                          animate={{ height: openFaq === idx ? "auto" : 0, opacity: openFaq === idx ? 1 : 0 }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                            {faq.a}
                          </div>
                        </motion.div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BLOG */}
              <div ref={blogRef} className="scroll-mt-20 w-full py-12 bg-white border border-stone-200">
                <div className="max-w-5xl mx-auto px-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="mb-8"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-600 font-mono">Stories & Insights</span>
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-stone-950 mt-1">Latest from the Blog</h2>
                    <div className="h-0.5 w-16 bg-amber-600 mt-2"></div>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {blogPosts.map((post, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.2 }}
                        transition={{ duration: 1.2, delay: idx * 0.15 }}
                        whileHover={{ scale: 1.02, y: -5, transition: { duration: 0.3 } }}
                        className="bg-white border border-stone-200 overflow-hidden group shadow-sm hover:shadow-lg transition-shadow duration-300"
                      >
                        <img src={post.image} alt={post.title} className="w-full h-40 object-cover group-hover:scale-105 transition duration-500" />
                        <div className="p-4 space-y-2">
                          <h3 className="font-display font-bold text-stone-900 text-sm hover:text-amber-600 cursor-pointer">{post.title}</h3>
                          <p className="text-xs text-stone-500">{post.excerpt}</p>
                          <div className="flex items-center gap-4 text-[10px] text-stone-400 font-mono">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          } />

          <Route path="/catalog" element={<RequireAuth><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><CatalogContent /></div></RequireAuth>} />
          <Route path="/product/:id" element={<ProductDetails products={products} onAddToCart={handleAddToCart} isWishlisted={(id) => wishlist.some(w => w.id === id)} onToggleWishlist={handleToggleWishlist} onAddReview={handleAddReview} />} />
          <Route path="/cart" element={<RequireAuth><Cart cartItems={cartItems} onUpdateQuantity={handleUpdateCartQuantity} onRemoveItem={handleRemoveCartItem} onClearCart={handleClearCart} onContinueShopping={() => navigate("/")} onProceedToCheckout={handleCheckoutInitiate} coupons={INITIAL_COUPONS} /></RequireAuth>} />
          <Route path="/checkout" element={
            <RequireAuth>
              <Checkout
                cartItems={cartItems}
                subtotal={cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0)}
                discount={appliedDiscount}
                discountCode={appliedDiscountCode}
                onPlaceOrder={handlePlaceOrder}
                onCancel={() => navigate("/cart")}
                savedAddresses={addresses}
                onRefreshAddresses={fetchAddresses}
              />
            </RequireAuth>
          } />
          <Route path="/profile" element={
            <RequireAuth>
              <Profile
                orders={orders}
                wishlist={wishlist}
                onRemoveWishlist={handleToggleWishlist}
                onAddToCart={handleAddToCart}
                onViewProduct={(prod) => navigate(`/product/${prod.id}`)}
                onReturnToShopping={() => navigate("/")}
                cartQuantities={cartQuantitiesMap}
                addresses={addresses}
                onAddAddress={handleAddAddress}
                onUpdateAddress={handleUpdateAddress}
                onDeleteAddress={handleDeleteAddress}
                onSetDefaultAddress={handleSetDefaultAddress}
                onCancelOrder={handleCancelOrder}
              />
            </RequireAuth>
          } />
          <Route path="/seller" element={
            <RequireAuth>
              {user?.role === "seller" ? (
                <VendorPortal products={myProducts} orders={sellerOrders} onAddProduct={handleAddCustomProduct} onUpdateStock={handleUpdateStock} onDeleteProduct={handleDeleteProduct} onUpdateOrderStatus={handleUpdateOrderStatus} />
              ) : <Navigate to="/" replace />}
            </RequireAuth>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="bg-stone-950 border-t border-stone-800 pt-12 pb-6 text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-stone-800">
            <div>
              <span className="font-serif text-2xl font-black italic tracking-tighter uppercase text-white">
                ELECTRA<span className="text-amber-500">.</span>
              </span>
              <p className="text-xs mt-3 leading-relaxed max-w-xs">
                Premium electronics marketplace. Curated for quality, engineered for excellence.
              </p>
              <div className="flex gap-3 mt-4">
                <button className="text-stone-400 hover:text-white transition" aria-label="Facebook"><Facebook className="h-4 w-4" /></button>
                <button className="text-stone-400 hover:text-white transition" aria-label="Twitter"><Twitter className="h-4 w-4" /></button>
                <button className="text-stone-400 hover:text-white transition" aria-label="Instagram"><Instagram className="h-4 w-4" /></button>
                <button className="text-stone-400 hover:text-white transition" aria-label="Youtube"><Youtube className="h-4 w-4" /></button>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollTo(aboutRef)} className="hover:text-white transition">About Us</button></li>
                <li><button onClick={() => scrollTo(contactRef)} className="hover:text-white transition">Contact</button></li>
                <li><button onClick={() => scrollTo(faqRef)} className="hover:text-white transition">FAQ</button></li>
                <li><button onClick={() => scrollTo(blogRef)} className="hover:text-white transition">Blog</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Customer Service</h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollTo(faqRef)} className="hover:text-white transition">Returns Policy</button></li>
                <li><button onClick={() => scrollTo(faqRef)} className="hover:text-white transition">Shipping Info</button></li>
                <li><button onClick={() => scrollTo(faqRef)} className="hover:text-white transition">Warranty</button></li>
                <li><button onClick={() => scrollTo(faqRef)} className="hover:text-white transition">Track Order</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Subscribe</h4>
              <p className="text-xs mb-3">Get the latest deals and updates.</p>
              <div className="flex">
                <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 bg-stone-800 border border-stone-700 text-xs rounded-l-none focus:outline-none focus:ring-1 focus:ring-amber-600 placeholder-stone-500" />
                <button className="px-4 py-2 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition flex items-center gap-1">
                  <Send className="h-3 w-3" /><span>Subscribe</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-xs pt-6">
            <span>&copy; 2026 ElectroMart. All rights reserved.</span>
            <div className="flex gap-4 mt-2 md:mt-0">
              <button onClick={() => scrollTo(aboutRef)} className="hover:text-white transition">Privacy</button>
              <button onClick={() => scrollTo(aboutRef)} className="hover:text-white transition">Terms</button>
              <button onClick={() => scrollTo(aboutRef)} className="hover:text-white transition">Cookies</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}