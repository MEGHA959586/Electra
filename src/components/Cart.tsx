import React, { useState } from "react";
import { ShoppingBag, Trash2, ArrowLeft, Ticket, ShoppingCart, Minus, Plus } from "lucide-react";
import { CartItem, Coupon } from "../types";
import { motion } from "motion/react";

interface CartProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onContinueShopping: () => void;
  onProceedToCheckout: (appliedDiscount: number, appliedCode: string) => void;
  coupons: Coupon[];
}

export const Cart: React.FC<CartProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onContinueShopping,
  onProceedToCheckout,
  coupons
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const estimatedTax = taxableSubtotal * 0.08; // 8% sales tax
  const shippingFee = taxableSubtotal > 50 || taxableSubtotal === 0 ? 0 : 9.99;
  const grandTotal = taxableSubtotal + estimatedTax + shippingFee;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError("");
    setPromoSuccess("");

    if (!promoCode.trim()) return;

    const matched = coupons.find((c) => c.code.toUpperCase() === promoCode.trim().toUpperCase());
    if (matched) {
      setAppliedCoupon(matched);
      setPromoSuccess(`Coupon "${matched.code}" applied! ${matched.discountPercent}% discount saved on subtotal.`);
    } else {
      setAppliedCoupon(null);
      setPromoError("Invalid promotional coupon code. Try WELCOME10, TECH20, or SUPERDEAL.");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setPromoCode("");
    setPromoSuccess("");
    setPromoError("");
  };

  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-xl mx-auto text-center py-16 px-4 bg-white border border-zinc-200 rounded-none shadow-none mt-8"
      >
        <div className="h-16 w-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-400 mb-4 border border-zinc-100">
          <ShoppingCart className="h-6 w-6" />
        </div>
        <h2 className="font-display text-xl font-bold text-zinc-950 uppercase tracking-wider">Your Cart is Empty</h2>
        <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
          Looks like you haven't added any premium gadgets or electronics to your shopping bag yet. Take a look at our current catalog!
        </p>
        <button
          id="go-shopping-empty"
          onClick={onContinueShopping}
          className="mt-6 inline-flex items-center gap-1.5 px-5 py-3 bg-zinc-950 text-white rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 shadow-none transition-all cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Browse Products</span>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left main: Cart List */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
            <div>
              <h2 className="font-display text-2xl font-black text-zinc-950 tracking-tight uppercase">Shopping Bag</h2>
              <p className="text-xs text-zinc-400 mt-0.5 font-medium">Review and modify the premium items in your order.</p>
            </div>
            <button
              id="clear-cart-btn"
              onClick={onClearCart}
              className="text-[10px] uppercase tracking-widest text-red-600 hover:text-red-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Empty Bag</span>
            </button>
          </div>

          {/* Cart Item Grid */}
          <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-none overflow-hidden bg-white shadow-none">
            {cartItems.map((item) => (
              <div 
                key={item.product.id} 
                id={`cart-row-${item.product.id}`}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 bg-white hover:bg-[#F8F9FA] transition-colors"
              >
                {/* Media and info pairing */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    referrerPolicy="no-referrer"
                    className="h-20 w-20 rounded-none object-cover border border-zinc-200 shrink-0 bg-[#F8F9FA]"
                  />
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">
                      {item.product.brand}
                    </span>
                    <h4 className="font-display font-medium text-zinc-900 text-sm hover:text-blue-600 leading-snug line-clamp-2 max-w-sm">
                      {item.product.title}
                    </h4>
                    <span className="text-[10px] font-mono font-bold text-emerald-600">
                      In Stock ({item.product.stock} left)
                    </span>
                  </div>
                </div>

                {/* Quantitative management, sub-prices & deletion triggers */}
                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity manager */}
                  <div className="flex items-center border border-zinc-200 rounded-none bg-white overflow-hidden shadow-none">
                    <button
                      id={`dec-cart-${item.product.id}`}
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-xs text-zinc-850">
                      {item.quantity}
                    </span>
                    <button
                      id={`inc-cart-${item.product.id}`}
                      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="p-1.5 text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Single item line subtotal */}
                  <div className="text-right w-24 shrink-0">
                    <span className="text-[9px] text-zinc-400 block font-bold uppercase tracking-wider">Subtotal</span>
                    <span className="font-mono font-bold text-zinc-950 text-sm">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  {/* Single item deletion button */}
                  <button
                    id={`remove-cart-${item.product.id}`}
                    onClick={() => onRemoveItem(item.product.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-none transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <button
            id="cart-continue-shopping"
            onClick={onContinueShopping}
            className="inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-950 font-bold uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Catalog / Keep Shopping</span>
          </button>
        </div>

        {/* Right side: Summary Column */}
        <div className="w-full lg:w-96 space-y-6">
          
          {/* Coupon Entry Panel */}
          <div className="bg-white p-5 rounded-none border border-zinc-200 shadow-none space-y-4">
            <h3 className="font-display font-bold text-zinc-950 text-xs uppercase tracking-wider flex items-center gap-1.5 pb-2.5 border-b border-zinc-100">
              <Ticket className="h-4 w-4 text-zinc-500" />
              <span>Promotional Coupons</span>
            </h3>

            {appliedCoupon ? (
              <div className="p-3 bg-blue-50 border border-blue-150 text-blue-900 rounded-none text-xs space-y-2 flex items-center justify-between">
                <div>
                  <span className="font-bold block uppercase tracking-widest font-mono text-[10px]">CODE: {appliedCoupon.code}</span>
                  <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wide">{appliedCoupon.discountPercent}% OFF Subtotal Applied</p>
                </div>
                <button
                  id="remove-coupon-btn"
                  onClick={handleRemoveCoupon}
                  className="p-1 text-red-600 hover:bg-red-50 rounded-none transition-colors font-bold text-[9px] uppercase tracking-wider cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  id="promo-input"
                  type="text"
                  placeholder="e.g. WELCOME10"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 py-1.5 px-3 border border-zinc-200 rounded-none text-xs uppercase font-mono font-bold focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                />
                <button
                  type="submit"
                  className="bg-zinc-950 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-none hover:bg-blue-600 transition-all cursor-pointer border border-zinc-950 hover:border-blue-600"
                >
                  Apply
                </button>
              </form>
            )}

            {promoError && <p className="text-[10px] text-red-600 font-bold uppercase tracking-wide">{promoError}</p>}
            {promoSuccess && <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">{promoSuccess}</p>}
            
            {!appliedCoupon && (
              <div className="bg-zinc-50 p-3 rounded-none border border-zinc-150 text-[10px] text-zinc-500 space-y-1 font-mono">
                <span className="font-bold block uppercase text-[8px] text-zinc-400 tracking-wider">Available coupons:</span>
                <p>• <b>WELCOME10</b> (10% off subtotal)</p>
                <p>• <b>TECH20</b> (20% off subtotal)</p>
                <p>• <b>SUPERDEAL</b> (30% off subtotal)</p>
              </div>
            )}
          </div>

          {/* Pricing Calculations Sheet */}
          <div className="bg-white p-5 rounded-none border border-zinc-200 shadow-none space-y-4">
            <h3 className="font-display font-bold text-zinc-950 text-xs uppercase tracking-wider pb-2.5 border-b border-zinc-100">Order Summary</h3>
            
            <div className="text-xs space-y-2.5">
              <div className="flex justify-between text-zinc-500 font-medium">
                <span>Subtotal ({cartItems.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-mono font-bold text-zinc-950">${subtotal.toFixed(2)}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-blue-600 font-bold">
                  <span>Discount ({appliedCoupon.discountPercent}%)</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-zinc-500 font-medium">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-mono font-bold text-zinc-950">${estimatedTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-zinc-500 font-medium">
                <span>Shipping Fee</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-blue-600 uppercase text-[9px] tracking-wider">Free Shipping</span>
                ) : (
                  <span className="font-mono font-bold text-zinc-950">${shippingFee.toFixed(2)}</span>
                )}
              </div>

              {shippingFee > 0 && (
                <p className="text-[9px] text-zinc-500 uppercase tracking-wider leading-normal bg-zinc-50 p-2.5 border border-zinc-150 font-mono">
                  💡 Tip: Add <b>${(50 - taxableSubtotal).toFixed(2)}</b> more to unlock <b>Free Shipping</b>!
                </p>
              )}

              <div className="pt-3 border-t border-zinc-100 flex justify-between items-baseline">
                <span className="font-display font-bold uppercase tracking-wider text-zinc-950 text-xs">Grand Total</span>
                <span id="cart-grand-total" className="font-mono font-bold text-xl text-zinc-950">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              id="proceed-checkout-btn"
              onClick={() => onProceedToCheckout(discountAmount, appliedCoupon?.code || "")}
              className="w-full bg-zinc-950 text-white font-bold py-3 text-[10px] uppercase tracking-widest hover:bg-blue-600 text-center block shadow-none transition-all cursor-pointer rounded-none border border-zinc-950 hover:border-blue-600"
            >
              Proceed to Secure Checkout
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
};
