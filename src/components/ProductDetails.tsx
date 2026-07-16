import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Heart, ShoppingBag, ShieldCheck, Truck, RefreshCw, Send, Plus, Minus, ArrowLeft } from "lucide-react";
import { Product, Review } from "../types";
import api from "../services/api";

interface ProductDetailsProps {
  products: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  isWishlisted: (productId: string) => boolean;
  onToggleWishlist: (product: Product) => void;
  onAddReview: (productId: string, reviewData: Omit<Review, "id" | "date">) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  products,
  onAddToCart,
  isWishlisted,
  onToggleWishlist,
  onAddReview
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [addedMessage, setAddedMessage] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // Fetch product from local state or API
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      // First check if product exists in local state
      const localProduct = products.find(p => p.id === id);
      if (localProduct) {
        setProduct(localProduct);
        setActiveImage(localProduct.image);
        setLoading(false);
        return;
      }

      // If not found, fetch from API
      try {
        const response = await api.get(`/products/${id}`);
        const data = response.data;
        // Map to frontend Product type
        const mappedProduct: Product = {
          id: String(data.id),
          title: data.title,
          description: data.description,
          price: Number(data.price),
          originalPrice: data.original_price ? Number(data.original_price) : undefined,
          rating: Number(data.rating || 0),
          reviewCount: Number(data.review_count || 0),
          image: data.image,
          gallery: data.gallery || [],
          category: data.category,
          brand: data.brand,
          stock: Number(data.stock),
          specs: data.specs || {},
          reviews: data.reviews || [],
          seller_id: data.seller_id ? String(data.seller_id) : null,
        };
        setProduct(mappedProduct);
        setActiveImage(mappedProduct.image);
      } catch (error) {
        console.error("Product not found:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, products]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-stone-500">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-900">Product not found</h2>
        <button onClick={() => navigate("/")} className="mt-4 bg-stone-900 text-white px-6 py-2 rounded-none hover:bg-blue-900 transition">
          Go Back
        </button>
      </div>
    );
  }

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleIncrement = () => {
    if (quantity < product.stock) setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 2500);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    onAddReview(product.id, {
      author: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim()
    });
    setReviewName("");
    setReviewRating(5);
    setReviewComment("");
  };

  const displayedReviews = showAllReviews ? product.reviews : product.reviews.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-1.5 text-[10px] text-stone-500 hover:text-stone-950 font-bold uppercase tracking-widest transition-all cursor-pointer mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Catalog</span>
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left – Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-stone-50 rounded-none overflow-hidden border border-stone-200 relative">
            <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 px-2.5 py-1 bg-amber-600 text-white font-extrabold text-[10px] uppercase tracking-widest">
                -{discountPercent}% OFF
              </span>
            )}
          </div>
          {product.gallery && product.gallery.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto py-1">
              {product.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`h-16 w-16 border overflow-hidden shrink-0 transition-all ${
                    activeImage === img ? "border-stone-950" : "border-stone-200 opacity-75 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-stone-200 text-[10px] text-stone-500 font-mono">
            <div className="flex flex-col items-center p-3 border bg-stone-50">
              <ShieldCheck className="h-4 w-4 text-stone-700 mb-1" />
              <span className="font-bold uppercase text-stone-800">1-Yr Warranty</span>
            </div>
            <div className="flex flex-col items-center p-3 border bg-stone-50">
              <Truck className="h-4 w-4 text-stone-700 mb-1" />
              <span className="font-bold uppercase text-stone-800">Free Ship</span>
            </div>
            <div className="flex flex-col items-center p-3 border bg-stone-50">
              <RefreshCw className="h-4 w-4 text-stone-700 mb-1" />
              <span className="font-bold uppercase text-stone-800">30D Return</span>
            </div>
          </div>
        </div>

        {/* Right – Details */}
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-stone-400 uppercase font-mono">{product.brand}</span>
            <h2 className="font-serif text-3xl font-light text-stone-950 tracking-tight mt-0.5">{product.title}</h2>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span className="text-xs font-mono font-bold text-stone-900 ml-1">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-stone-400">•</span>
              <span className="text-[10px] uppercase text-stone-500 font-bold font-mono">{product.reviewCount} reviews</span>
            </div>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">{product.description}</p>

          <div className="p-4 bg-stone-50 border border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-widest text-stone-400 block font-bold font-mono">Price</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-bold text-stone-950">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                  <span className="text-xs font-mono text-stone-400 line-through">${product.originalPrice.toFixed(2)}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-widest text-stone-400 block font-bold font-mono">Stock</span>
              {product.stock > 0 ? (
                <span className="text-[10px] font-mono font-bold text-emerald-600">Available ({product.stock})</span>
              ) : (
                <span className="text-[10px] font-mono font-bold text-stone-400">Out of Stock</span>
              )}
            </div>
          </div>

          {product.stock > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-stone-200 overflow-hidden">
                <button onClick={handleDecrement} disabled={quantity <= 1} className="p-2.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30">
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center font-mono font-bold text-xs">{quantity}</span>
                <button onClick={handleIncrement} disabled={quantity >= product.stock} className="p-2.5 text-stone-500 hover:bg-stone-100 disabled:opacity-30">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-stone-900 text-white py-3 px-4 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-900 flex items-center justify-center gap-2 border border-stone-900 hover:border-blue-900"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Add {quantity} to Bag</span>
              </button>
              <button
                onClick={() => onToggleWishlist(product)}
                className={`p-3 border cursor-pointer transition-all ${
                  isWishlisted(product.id) ? "border-red-200 bg-red-50 text-red-500" : "border-stone-200 hover:bg-stone-50 text-stone-500"
                }`}
              >
                <Heart className={`h-4 w-4 ${isWishlisted(product.id) ? "fill-red-500" : ""}`} />
              </button>
            </div>
          )}

          {addedMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[10px] uppercase font-bold flex items-center gap-2">
              <span>✓ Added {quantity} to bag</span>
            </div>
          )}

          {/* Specifications */}
          <div>
            <h4 className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">Specifications</h4>
            <div className="border border-stone-200 divide-y divide-stone-150 text-xs font-mono mt-1">
              {Object.entries(product.specs).map(([key, val]) => (
                <div key={key} className="flex py-2 px-3 justify-between bg-white hover:bg-stone-50">
                  <span className="font-bold text-stone-400 uppercase text-[9px]">{key}</span>
                  <span className="font-medium text-stone-900 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          <div className="border-t border-stone-200 pt-6">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-stone-950 mb-4">Customer Reviews</h3>
            
            {product.reviews.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No reviews yet. Be the first!</p>
            ) : (
              <>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {displayedReviews.map((rev) => (
                    <div key={rev.id} className="bg-white p-4 border border-stone-200 space-y-1.5">
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-stone-850 text-[10px] uppercase">{rev.author}</span>
                        <span className="text-[9px] text-stone-400">{rev.date}</span>
                      </div>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-stone-200"}`} />
                        ))}
                      </div>
                      <p className="text-xs text-stone-600 italic font-serif">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
                {product.reviews.length > 3 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="mt-3 text-[10px] font-bold uppercase tracking-widest text-amber-600 hover:text-stone-950 transition-colors"
                  >
                    {showAllReviews ? "Show less" : "See all reviews"}
                  </button>
                )}
              </>
            )}

            {/* Write review form */}
            <form onSubmit={handleSubmitReview} className="mt-6 space-y-3 bg-white p-4 border border-stone-200">
              <h4 className="text-[10px] font-bold text-stone-950 uppercase tracking-widest font-mono">Share your review</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[8px] font-bold text-stone-400 uppercase tracking-wider font-mono">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="block w-full py-1.5 px-2.5 border border-stone-200 rounded-none text-xs font-mono focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="text-[8px] font-bold text-stone-400 uppercase tracking-wider font-mono">Rating</label>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="text-amber-400 focus:outline-none cursor-pointer"
                      >
                        <Star className={`h-4.5 w-4.5 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-stone-200"}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[8px] font-bold text-stone-400 uppercase tracking-wider font-mono">Comment</label>
                <textarea
                  required
                  placeholder="Write your experience..."
                  rows={2}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="block w-full py-1.5 px-2.5 border border-stone-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-amber-600 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-stone-900 text-white py-2 text-[9px] font-bold uppercase tracking-widest hover:bg-blue-900 flex items-center justify-center gap-1 border border-stone-900 hover:border-blue-900"
              >
                <Send className="h-3 w-3" />
                <span>Submit Review</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};