import React from "react";
import { Star, Heart, ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { Product } from "../types";
import { motion } from "motion/react";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  cartQuantity: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  cartQuantity
}) => {
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      id={`prod-card-${product.id}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-none border border-zinc-200 overflow-hidden shadow-none flex flex-col h-full group transition-all duration-300 hover:shadow-lg hover:border-zinc-300"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-square bg-[#F8F9FA] overflow-hidden cursor-pointer shrink-0" onClick={() => onViewDetails(product)}>
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover mix-blend-multiply p-4 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {product.stock <= 3 && product.stock > 0 && (
            <span className="px-2 py-1 bg-amber-500 text-white font-bold text-[8px] uppercase tracking-wider border border-black/5 shadow-sm">
              Only {product.stock} left
            </span>
          )}
          {product.stock === 0 && (
            <span className="px-2 py-1 bg-zinc-500 text-white font-bold text-[8px] uppercase tracking-wider border border-black/5 shadow-sm">
              Out of Stock
            </span>
          )}
          {discountPercent > 0 && (
            <span className="px-2 py-1 bg-blue-600 text-white font-bold text-[8px] uppercase tracking-wider border border-black/5 shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isCustom && (
            <span className="px-2 py-1 bg-zinc-950 text-white font-bold text-[8px] uppercase tracking-wider border border-black/5 shadow-sm">
              My Product
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          id={`wishlist-toggle-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 border border-zinc-200 shadow-sm flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:scale-110 active:scale-95 transition-all cursor-pointer z-10"
        >
          <Heart
            className={`h-4 w-4 transition-all ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-zinc-400 group-hover:text-zinc-600"
            }`}
          />
        </button>
      </div>

      {/* Product Details Panel */}
      <div className="p-5 flex flex-col flex-1">
        {/* Brand & Category */}
        <div className="flex items-center justify-between text-[9px] text-zinc-400 font-bold tracking-widest uppercase mb-1.5">
          <span>{product.brand}</span>
          <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 text-[8px] tracking-wider">
            {product.category}
          </span>
        </div>

        {/* Title */}
        <h3
          id={`prod-title-${product.id}`}
          onClick={() => onViewDetails(product)}
          className="font-display font-medium text-zinc-950 text-sm hover:text-blue-600 cursor-pointer line-clamp-2 min-h-[40px] leading-snug mb-2"
        >
          {product.title}
        </h3>

        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="flex items-center text-amber-400">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-mono font-bold text-zinc-700 ml-1">{product.rating}</span>
          </div>
          <span className="text-[10px] text-zinc-400 font-mono">({product.reviewCount})</span>
        </div>

        {/* Pricing & Add Button Alignment */}
        <div className="mt-auto pt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
          {/* Prices */}
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[10px] font-mono text-zinc-400 line-through -mb-0.5">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
            <span className="font-mono font-bold text-sm text-zinc-950">
              ${product.price.toFixed(2)}
            </span>
          </div>

          {/* Action Trigger */}
          {product.stock > 0 ? (
            <button
              id={`add-to-cart-${product.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className={`px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-all cursor-pointer border ${
                cartQuantity > 0
                  ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  : "bg-zinc-950 text-white border-zinc-950 hover:bg-blue-600 hover:border-blue-600 shadow-none"
              }`}
            >
              {cartQuantity > 0 ? (
                <>
                  <Check className="h-3 w-3 stroke-[2.5]" />
                  <span>Added ({cartQuantity})</span>
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" />
                  <span>Add</span>
                </>
              )}
            </button>
          ) : (
            <button
              id={`sold-out-${product.id}`}
              disabled
              className="px-3 py-1.5 rounded-none text-[10px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
            >
              Sold Out
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
