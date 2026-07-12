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
import { INITIAL_PRODUCTS, INITIAL_COUPONS } from "./data";
import {
  Filter, ArrowRight, Truck, RefreshCw, ShieldCheck, CreditCard,
  Facebook, Twitter, Instagram, Youtube, Send, Mail, Phone, MapPin, Calendar, User, ChevronDown, ChevronUp
} from "lucide-react";
import { motion } from "motion/react";
import { useFrameAnimationRef } from "./hooks/useFrameAnimationRef";

// Protected route wrapper
const RequireAuth = ({ children, redirectTo = "/login" }: { children: JSX.Element; redirectTo?: string }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

// Inner component
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Refs for sections
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ========== STATE ==========
  const [userRole, setUserRole] = useState<"buyer" | "seller">("buyer");
  const [currentView, setView] = useState<"buyer" | "seller" | "cart" | "profile" | "checkout">("buyer");

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem("em_products");
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("em_cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem("em_wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("em_orders");
    return saved ? JSON.parse(saved) : [];
  });

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

  useEffect(() => {
    localStorage.setItem("em_products", JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem("em_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem("em_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem("em_orders", JSON.stringify(orders));
  }, [orders]);

  // Sync user role from auth context
  useEffect(() => {
    if (user) {
      setUserRole(user.role || "buyer");
      setView(user.role === "seller" ? "seller" : "buyer");
    } else {
      setUserRole("buyer");
      setView("buyer");
    }
  }, [user]);

  const availableBrands = Array.from(
    new Set(
      products
        .filter((p) => selectedCategory === "All" || p.category === selectedCategory)
        .map((p) => p.brand)
    )
  ).sort();

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

  const handleAddToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const matchIdx = prev.findIndex((item) => item.product.id === product.id);
      if (matchIdx > -1) {
        const next = [...prev];
        const updatedQty = next[matchIdx].quantity + quantity;
        next[matchIdx] = {
          ...next[matchIdx],
          quantity: Math.min(product.stock, updatedQty)
        };
        return next;
      }
      return [...prev, { product, quantity: Math.min(product.stock, quantity) }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return;

    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.min(targetProduct.stock, Math.max(1, quantity)) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleAddReview = (productId: string, reviewData: Omit<Review, "id" | "date">) => {
    const freshReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]
    };

    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const nextReviews = [freshReview, ...p.reviews];
        const sum = nextReviews.reduce((acc, r) => acc + r.rating, 0);
        const nextRating = parseFloat((sum / nextReviews.length).toFixed(1));

        return {
          ...p,
          reviews: nextReviews,
          reviewCount: nextReviews.length,
          rating: nextRating
        };
      })
    );
  };

  const handleCheckoutInitiate = (discount: number, code: string) => {
    setAppliedDiscount(discount);
    setAppliedDiscountCode(code);
    navigate("/checkout");
  };

  const handlePlaceOrder = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    setProducts((prev) =>
      prev.map((p) => {
        const itemInCart = newOrder.items.find((item) => item.product.id === p.id);
        if (itemInCart) {
          return {
            ...p,
            stock: Math.max(0, p.stock - itemInCart.quantity)
          };
        }
        return p;
      })
    );

    setCartItems([]);
    navigate("/profile");
  };

  const handleAddCustomProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  // ========== FILTERING & SORTING ==========
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Object.values(p.specs) as string[]).some((v) => v.toLowerCase().includes(searchQuery.toLowerCase()));

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
  const cartQuantitiesMap = cartItems.reduce<{ [id: string]: number }>((acc, item) => {
    acc[item.product.id] = item.quantity;
    return acc;
  }, {});

  // ========== FRAME ANIMATION REFS ==========
  const laptopRef = useFrameAnimationRef("laptop_10fps", 80, 10);
  const airpodsRef = useFrameAnimationRef("airpod_10fps", 80, 10);
  const phoneRef = useFrameAnimationRef("phone_frames", 161, 10);

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
            <h2 className="text-xl font-bold text-zinc-950 tracking-tight">
              {selectedCategory === "All" ? "Featured Products" : `${selectedCategory} Devices`}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              Showing {sortedProducts.length} premium electronic products matching criteria.
            </p>
          </div>
          {onlyInStock && (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full">
              In Stock Only
            </span>
          )}
        </div>

        {sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200 shadow-sm max-w-lg mx-auto">
            <Filter className="h-5 w-5 text-zinc-400 mx-auto mb-3" />
            <p className="font-bold text-zinc-900 text-sm">No Products Found</p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onViewDetails={(prod) => navigate(`/product/${prod.id}`)}
                isWishlisted={wishlist.some((w) => w.id === p.id)}
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

  // Blog posts
  const blogPosts = [
    { title: "The Future of Wireless Audio", excerpt: "How lossless Bluetooth and spatial audio are changing the way we listen.", date: "July 8, 2026", author: "Alex Rivera", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80" },
    { title: "Why Silicon Notebooks Are Dominating 2026", excerpt: "Ultra‑thin, fanless, and incredibly powerful – the new standard in portable computing.", date: "July 2, 2026", author: "Jessica Taylor", image: "https://images.unsplash.com/photo-1496181130204-755241544e35?w=400&auto=format&fit=crop&q=80" },
    { title: "The Art of Mechanical Keyboards", excerpt: "From tactile switches to custom keycaps – why enthusiasts are obsessed.", date: "June 25, 2026", author: "Nathan Drake", image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop&q=80" }
  ];

  return (
    <div className="relative min-h-screen bg-zinc-50 text-zinc-900 transition-colors duration-300 flex flex-col font-sans">
      <div className="absolute inset-0 -z-10 pointer-events-none bg-zinc-50" />

      <Header
        currentCategory={selectedCategory}
        setCategory={setCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        currentView={currentView}
        setView={setView}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      <main className="flex-1">
        <Routes>
          {/* Home Page */}
          <Route path="/" element={
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
              {/* HERO – Laptop animation */}
              <div className="relative w-full border border-zinc-200 bg-white/40 rounded-none overflow-hidden shadow-none">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <img 
                    ref={laptopRef} 
                    src="/laptop_10fps/ezgif-frame-001.jpg" 
                    alt="Laptop" 
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover" 
                    onError={(e) => { console.error('Laptop image error:', e); (e.target as HTMLImageElement).style.display = 'none'; }} 
                  />
                  <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px]"></div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.2 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="relative z-10 max-w-2xl p-8 md:p-12 flex flex-col justify-center min-h-[300px] md:min-h-[400px]"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 mb-3 font-mono">Product Spotlight — 2026</p>
                  <h1 className="font-serif text-4xl md:text-6xl font-light leading-[1.1] mb-6 tracking-tight text-zinc-950">
                    The New <br/><span className="font-black italic font-serif">Standard</span> <br/>in Precision.
                  </h1>
                  <p className="text-zinc-700 text-xs md:text-sm leading-relaxed max-w-md mb-8 font-sans">
                    Engineered for clinical acoustic perfection and raw computing power. Our custom-curated line of premium audio, ultra-thin silicon notebooks, and custom peripherals define the new standard of modern electronic craftsmanship.
                  </p>
                  <div className="flex flex-wrap items-center gap-6">
                    <button onClick={() => { if (!user) navigate("/login"); else { setCategory("All"); navigate("/catalog"); } }} className="bg-zinc-950 text-white border border-zinc-950 px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:border-blue-600 transition-all cursor-pointer rounded-none">
                      Shop now
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5">
                        <div className="w-7 h-7 rounded-full border border-white bg-zinc-200"></div>
                        <div className="w-7 h-7 rounded-full border border-white bg-zinc-300"></div>
                        <div className="w-7 h-7 rounded-full border border-white bg-zinc-400"></div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-600 ml-1">+14k Reviews</span>
                    </div>
                  </div>
                  <div className="border-t border-zinc-200/50 pt-6 mt-8">
                    <div className="flex justify-between items-end">
                      <div><div className="text-[9px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Release Edition</div><div className="text-sm font-mono text-zinc-800 font-bold">ED. 09 // JULY 2026</div></div>
                      <div className="text-right"><div className="text-[9px] uppercase tracking-widest font-bold text-zinc-500 mb-1">Availability</div><div className="text-sm font-mono text-green-600 font-bold">IN STOCK & VERIFIED</div></div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* WHY CHOOSE ELECTRA */}
              <div className="w-full mb-10 py-10 bg-white border border-zinc-200">
                <div className="text-center mb-8">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 font-mono">Why Choose ELECTRA</span>
                  <h2 className="font-serif text-2xl md:text-3xl font-light text-zinc-950 mt-1">Engineered for <span className="font-black italic">Excellence</span></h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4">
                  <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col items-center text-center p-4">
                    <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3"><Truck className="h-7 w-7" /></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Free Shipping</h4><p className="text-[10px] text-zinc-500 mt-1">On all orders over $50</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col items-center text-center p-4">
                    <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3"><RefreshCw className="h-7 w-7" /></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">30-Day Returns</h4><p className="text-[10px] text-zinc-500 mt-1">Hassle‑free & immediate</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col items-center text-center p-4">
                    <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3"><ShieldCheck className="h-7 w-7" /></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">1‑Year Warranty</h4><p className="text-[10px] text-zinc-500 mt-1">Full coverage on all devices</p>
                  </motion.div>
                  <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex flex-col items-center text-center p-4">
                    <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3"><CreditCard className="h-7 w-7" /></div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Secure Payment</h4><p className="text-[10px] text-zinc-500 mt-1">256‑bit encrypted checkout</p>
                  </motion.div>
                </div>
                <div className="flex flex-wrap justify-center gap-6 mt-8">
                  <motion.button initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.9, ease: "easeOut" }} onClick={() => { if (!user) navigate("/login"); else { setCategory("All"); navigate("/catalog"); } }} className="px-6 py-3 bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 border border-zinc-950 hover:border-blue-600 transition-all cursor-pointer">
                    Explore Catalog
                  </motion.button>
                  <motion.button initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 0.9, ease: "easeOut" }} onClick={() => { if (!user) navigate("/login"); else { setCategory("Audio"); navigate("/catalog"); } }} className="px-6 py-3 bg-white text-zinc-950 text-[10px] font-bold uppercase tracking-widest border border-zinc-200 hover:bg-zinc-50 transition-all cursor-pointer">
                    Shop Audio Deals
                  </motion.button>
                </div>
              </div>

              {/* AIRPODS BANNER */}
              <div className="relative w-full h-[240px] md:h-[280px] border border-zinc-200 bg-black overflow-hidden flex items-center shadow-none">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <img 
                    ref={airpodsRef} 
                    src="/airpod_10fps/ezgif-frame-001.jpg" 
                    alt="AirPods" 
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover" 
                    onError={(e) => { console.error('AirPods image error:', e); (e.target as HTMLImageElement).style.display = 'none'; }} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/10 to-transparent"></div>
                </div>
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false, amount: 0.2 }} transition={{ duration: 1.2, ease: "easeOut" }} className="relative z-10 max-w-md md:ml-12 p-6 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400 mb-2 block font-mono">Acoustic Precision</span>
                  <h2 className="font-serif text-2xl md:text-3xl font-light leading-tight mb-3 text-white">AirPods Series. <br/><span className="font-black italic font-serif text-blue-300">Pure Acoustic Art.</span></h2>
                  <p className="text-zinc-300 text-xs leading-relaxed mb-4">Featuring active noise cancellation and personalized spatial mapping. Experience sound engineered with medical-grade acoustic clarity.</p>
                  <button onClick={() => { if (!user) navigate("/login"); else { setCategory("Audio"); navigate("/catalog"); } }} className="inline-flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-blue-400 hover:text-white transition-all font-mono border-b border-blue-400 pb-0.5 cursor-pointer">
                    <span>Shop AirPods Series</span><ArrowRight className="h-3 w-3" />
                  </button>
                </motion.div>
              </div>

              {/* SHOP OUR COLLECTION */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false, amount: 0.1 }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { duration: 0.6 } }
                }}
                className="w-full py-12 bg-white border border-zinc-200"
              >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="mb-8"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 font-mono">Shop Our Collection</span>
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-zinc-950 mt-1">
                      Premium <span className="font-black italic">Electronics</span>
                    </h2>
                    <div className="h-0.5 w-16 bg-blue-600 mt-2"></div>
                  </motion.div>

                  <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.1 }}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } }
                    }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {products.slice(0, 9).map((p) => (
                      <motion.div
                        key={p.id}
                        variants={{
                          hidden: { opacity: 0, scale: 0.95 },
                          visible: { opacity: 1, scale: 1 }
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <ProductCard
                          product={p}
                          onViewDetails={(prod) => navigate(`/product/${prod.id}`)}
                          isWishlisted={wishlist.some((w) => w.id === p.id)}
                          onToggleWishlist={handleToggleWishlist}
                          onAddToCart={(product) => handleAddToCart(product, 1)}
                          cartQuantity={cartQuantitiesMap[p.id] || 0}
                        />
                      </motion.div>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
                    className="flex justify-center mt-10"
                  >
                    <button
                      onClick={() => {
                        if (!user) navigate("/login");
                        else navigate("/catalog");
                      }}
                      className="px-8 py-3 bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 border border-zinc-950 hover:border-blue-600 transition-all cursor-pointer"
                    >
                      View All Products
                    </button>
                  </motion.div>
                </div>
              </motion.div>

              {/* ABOUT – PHONE ANIMATION */}
              <div ref={aboutRef} className="scroll-mt-20 w-full h-[460px] md:h-[500px] bg-black relative overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                  <img
                    ref={phoneRef}
                    src="/phone_frames/ezgif-frame-001.jpg"
                    alt="Phone animation"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={(e) => { console.error('Phone image error:', e); (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              </div>

              {/* CONTACT – with same heading animation */}
              <div ref={contactRef} className="scroll-mt-20 w-full py-12 bg-white border border-zinc-200">
                <div className="max-w-5xl mx-auto px-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="mb-8"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 font-mono">Get in Touch</span>
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-zinc-950 mt-1">Contact Us</h2>
                    <div className="h-0.5 w-16 bg-blue-600 mt-2"></div>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div><h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Address</h4><p className="text-sm text-zinc-600">123 Silicon Boulevard, Suite 100<br />San Francisco, CA 94107</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div><h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Phone</h4><p className="text-sm text-zinc-600">+1 (555) 019-2834</p></div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div><h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Email</h4><p className="text-sm text-zinc-600">support@electra.com</p></div>
                      </div>
                    </div>
                    <div className="bg-zinc-50 p-6 border border-zinc-200">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-4">Send a message</h4>
                      <form onSubmit={(e) => { e.preventDefault(); alert("Message sent! (demo)"); }} className="space-y-3">
                        <input type="text" placeholder="Your Name" className="w-full py-2 px-3 border border-zinc-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-600" required />
                        <input type="email" placeholder="Email" className="w-full py-2 px-3 border border-zinc-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-600" required />
                        <textarea rows={3} placeholder="Message" className="w-full py-2 px-3 border border-zinc-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none" required />
                        <button type="submit" className="w-full bg-zinc-950 text-white py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition border border-zinc-950 hover:border-blue-600 flex items-center justify-center gap-2">
                          <Send className="h-3.5 w-3.5" /> Send
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>

              {/* FAQ – with same heading animation */}
              <div ref={faqRef} className="scroll-mt-20 w-full py-12 bg-white border border-zinc-200">
                <div className="max-w-3xl mx-auto px-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="mb-8"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 font-mono">Answers</span>
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-zinc-950 mt-1">Frequently Asked Questions</h2>
                    <div className="h-0.5 w-16 bg-blue-600 mt-2"></div>
                  </motion.div>
                  <div className="space-y-3">
                    {faqs.map((faq, idx) => (
                      <div key={idx} className="border border-zinc-200 bg-white">
                        <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition">
                          <span>{faq.q}</span>
                          {openFaq === idx ? <ChevronUp className="h-4 w-4 text-zinc-500" /> : <ChevronDown className="h-4 w-4 text-zinc-500" />}
                        </button>
                        {openFaq === idx && <div className="px-5 pb-5 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">{faq.a}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BLOG – with same heading animation */}
              <div ref={blogRef} className="scroll-mt-20 w-full py-12 bg-white border border-zinc-200">
                <div className="max-w-5xl mx-auto px-4">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="mb-8"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600 font-mono">Stories & Insights</span>
                    <h2 className="font-serif text-3xl md:text-4xl font-light text-zinc-950 mt-1">Latest from the Blog</h2>
                    <div className="h-0.5 w-16 bg-blue-600 mt-2"></div>
                  </motion.div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {blogPosts.map((post, idx) => (
                      <div key={idx} className="bg-white border border-zinc-200 overflow-hidden group">
                        <img src={post.image} alt={post.title} className="w-full h-40 object-cover group-hover:scale-105 transition duration-500" />
                        <div className="p-4 space-y-2">
                          <h3 className="font-display font-bold text-zinc-900 text-sm hover:text-blue-600 cursor-pointer">{post.title}</h3>
                          <p className="text-xs text-zinc-500">{post.excerpt}</p>
                          <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-mono">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                            <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          } />

          {/* OTHER ROUTES */}
          <Route path="/catalog" element={<RequireAuth><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><CatalogContent /></div></RequireAuth>} />
          <Route path="/product/:id" element={<ProductDetails products={products} onAddToCart={handleAddToCart} isWishlisted={(id) => wishlist.some((w) => w.id === id)} onToggleWishlist={handleToggleWishlist} onAddReview={handleAddReview} />} />
          <Route path="/cart" element={<RequireAuth><Cart cartItems={cartItems} onUpdateQuantity={handleUpdateCartQuantity} onRemoveItem={handleRemoveCartItem} onClearCart={handleClearCart} onContinueShopping={() => navigate("/")} onProceedToCheckout={handleCheckoutInitiate} coupons={INITIAL_COUPONS} /></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><Checkout cartItems={cartItems} subtotal={cartItems.reduce((acc, i) => acc + i.product.price * i.quantity, 0)} discount={appliedDiscount} discountCode={appliedDiscountCode} onPlaceOrder={handlePlaceOrder} onCancel={() => navigate("/cart")} /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile orders={orders} wishlist={wishlist} onRemoveWishlist={handleToggleWishlist} onAddToCart={(prod) => handleAddToCart(prod, 1)} onViewProduct={(prod) => navigate(`/product/${prod.id}`)} onReturnToShopping={() => navigate("/")} cartQuantities={cartQuantitiesMap} /></RequireAuth>} />
          <Route path="/seller" element={<RequireAuth><VendorPortal products={products} orders={orders} onAddProduct={handleAddCustomProduct} onUpdateStock={handleUpdateStock} onDeleteProduct={handleDeleteProduct} onUpdateOrderStatus={handleUpdateOrderStatus} /></RequireAuth>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-900 border-t border-zinc-800 pt-12 pb-6 text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-zinc-800">
            <div>
              <span className="font-serif text-2xl font-black italic tracking-tighter uppercase text-white">ELECTRA<span className="text-blue-500">.</span></span>
              <p className="text-xs mt-3 leading-relaxed max-w-xs">Premium electronics marketplace. Curated for quality, engineered for excellence.</p>
              <div className="flex gap-3 mt-4">
                <button className="text-zinc-400 hover:text-white transition" aria-label="Facebook"><Facebook className="h-4 w-4" /></button>
                <button className="text-zinc-400 hover:text-white transition" aria-label="Twitter"><Twitter className="h-4 w-4" /></button>
                <button className="text-zinc-400 hover:text-white transition" aria-label="Instagram"><Instagram className="h-4 w-4" /></button>
                <button className="text-zinc-400 hover:text-white transition" aria-label="Youtube"><Youtube className="h-4 w-4" /></button>
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
                <input type="email" placeholder="Your email" className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 text-xs rounded-l-none focus:outline-none focus:ring-1 focus:ring-blue-600 placeholder-zinc-500" />
                <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition flex items-center gap-1">
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

// Main App Wrapper
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}