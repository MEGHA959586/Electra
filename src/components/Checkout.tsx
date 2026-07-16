import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  CheckCircle2,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  ClipboardCheck,
  Calendar,
  Info,
  MapPin,
  Plus,
} from "lucide-react";
import { CartItem, ShippingAddress, Order } from "../types";
import { motion, AnimatePresence } from "motion/react";
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

interface CheckoutProps {
  cartItems: CartItem[];
  subtotal: number;
  discount: number;
  discountCode: string;
  onPlaceOrder: (order: Order) => void;
  onCancel: () => void;
  savedAddresses: Address[];
  onRefreshAddresses: () => void;
}

type CheckoutStep = "address" | "payment" | "processing" | "success";

export const Checkout: React.FC<CheckoutProps> = ({
  cartItems,
  subtotal,
  discount,
  discountCode,
  onPlaceOrder,
  onCancel,
  savedAddresses,
  onRefreshAddresses,
}) => {
  const [step, setStep] = useState<CheckoutStep>("address");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Address State
  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    phone: "",
  });

  // Card State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // ✅ Guard against double submission
  const submittingRef = useRef(false);

  // Financial calculations
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const estimatedTax = taxableSubtotal * 0.08;
  const shippingFee = taxableSubtotal > 50 || taxableSubtotal === 0 ? 0 : 9.99;
  const grandTotal = taxableSubtotal + estimatedTax + shippingFee;

  // Auto-select default address
  useEffect(() => {
    const defaultAddr = savedAddresses.find((a) => a.is_default);
    if (defaultAddr) {
      setSelectedAddressId(defaultAddr.id);
      setUseNewAddress(false);
    } else if (savedAddresses.length > 0) {
      setSelectedAddressId(savedAddresses[0].id);
      setUseNewAddress(false);
    } else {
      setUseNewAddress(true);
    }
  }, [savedAddresses]);

  useEffect(() => {
    if (selectedAddressId) {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      if (addr) {
        setAddress({
          name: addr.name,
          email: addr.email,
          address: addr.address,
          city: addr.city,
          zip: addr.zip,
          phone: addr.phone,
        });
      }
    }
  }, [selectedAddressId, savedAddresses]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!useNewAddress && !selectedAddressId) {
      alert("Please select a saved address or add a new one.");
      return;
    }
    setStep("payment");
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    const parts = [];
    for (let i = 0; i < val.length; i += 4) {
      parts.push(val.slice(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length >= 2) {
      setCardExpiry(val.slice(0, 2) + "/" + val.slice(2));
    } else {
      setCardExpiry(val);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 3) setCardCvv(val);
  };

  // ---- Place Order (dummy payment) ----
  const handlePlaceOrder = async () => {
    // ✅ Prevent double submission
    if (submittingRef.current) return;
    submittingRef.current = true;

    // Validate card fields
    if (cardNumber.replace(/\s/g, "").length < 16) {
      alert("Please enter a valid 16-digit card number.");
      submittingRef.current = false;
      return;
    }
    if (cardExpiry.length !== 5) {
      alert("Please enter a valid expiry (MM/YY).");
      submittingRef.current = false;
      return;
    }
    if (cardCvv.length < 3) {
      alert("Please enter a valid 3-digit CVV.");
      submittingRef.current = false;
      return;
    }

    setIsProcessing(true);
    setStep("processing");

    // Simulate payment processing delay
    setTimeout(async () => {
      try {
        // 1. Call the existing order endpoint
        const response = await api.post("/orders", {
          subtotal,
          discount,
          tax: estimatedTax,
          shipping: shippingFee,
          total: grandTotal,
          shippingAddress: address,
          paymentMethod: `Card ending in ${cardNumber.slice(-4)}`,
          items: cartItems.map((item) => ({
            product: {
              ...item.product,
              id: String(item.product.id),
            },
            quantity: item.quantity,
          })),
        });

        // 2. Construct order object
        const newOrder: Order = {
          id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          items: [...cartItems],
          subtotal,
          discount,
          tax: estimatedTax,
          shipping: shippingFee,
          total: grandTotal,
          shippingAddress: { ...address },
          paymentMethod: `Card ending in ${cardNumber.slice(-4)}`,
          status: "Processing",
        };

        setConfirmedOrder(newOrder);
        onPlaceOrder(newOrder);
        setStep("success");
      } catch (error) {
        console.error("Order placement failed:", error);
        alert("Failed to place order. Please try again.");
        setStep("payment");
      } finally {
        setIsProcessing(false);
        submittingRef.current = false; // Allow retry if needed
      }
    }, 3000); // 3-second processing
  };

  // ---- Render ----
  return (
    <div id="checkout-wizard-view" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Step progress header */}
      {step !== "processing" && step !== "success" && (
        <div className="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-1.5">
            <button
              id="cancel-checkout-btn"
              onClick={onCancel}
              className="p-1.5 rounded-none border border-stone-200 text-stone-500 hover:text-stone-900 bg-white hover:bg-stone-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="ml-1">
              <h2 className="font-display text-xl font-bold text-stone-950 uppercase tracking-wide">
                Secure Checkout
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                Verify your items, addresses, and billing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {["address", "payment"].map((s, idx) => {
              const isActive = step === s;
              const isPast = (s === "address" && step === "payment");
              return (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-1">
                    <div
                      className={`h-6 w-6 rounded-none flex items-center justify-center text-[10px] font-mono font-bold border ${
                        isActive
                          ? "bg-stone-900 text-white border-stone-900"
                          : isPast
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-stone-50 text-stone-400 border-stone-200"
                      }`}
                    >
                      {isPast ? "✓" : idx + 1}
                    </div>
                    <span
                      className={`text-[9px] uppercase tracking-widest font-bold hidden sm:inline capitalize ${
                        isActive
                          ? "text-stone-900"
                          : isPast
                          ? "text-amber-600"
                          : "text-stone-400"
                      }`}
                    >
                      {s}
                    </span>
                  </div>
                  {idx < 1 && <div className="h-[1px] w-4 bg-stone-200"></div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* ----- ADDRESS STEP ----- */}
        {step === "address" && (
          <motion.form
            key="address-step"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleAddressSubmit}
            className="bg-white rounded-none border border-stone-200 p-6 shadow-none space-y-6"
          >
            <h3 className="font-display font-bold text-stone-950 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-3">
              <CheckCircle2 className="h-4 w-4 text-stone-500" />
              <span>Step 1: Shipping Destination</span>
            </h3>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                  Select a saved address
                </label>
                <div className="space-y-1.5">
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className="flex items-start gap-3 p-3 border border-stone-200 hover:bg-stone-50 cursor-pointer transition"
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === addr.id && !useNewAddress}
                        onChange={() => {
                          setSelectedAddressId(addr.id);
                          setUseNewAddress(false);
                        }}
                        className="mt-1 accent-stone-900"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-stone-900">{addr.name}</p>
                        <p className="text-stone-600">
                          {addr.address}, {addr.city} {addr.zip}
                        </p>
                        <p className="text-stone-600">
                          {addr.phone} • {addr.email}
                        </p>
                        {addr.is_default && (
                          <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest">
                            (Default)
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(true)}
                    className="text-[10px] font-bold text-amber-600 hover:text-amber-800 flex items-center gap-1 mt-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add a new address</span>
                  </button>
                </div>
              </div>
            )}

            {/* New Address Form */}
            {useNewAddress || savedAddresses.length === 0 ? (
              <div className="border-t border-stone-100 pt-4">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-3">
                  {savedAddresses.length > 0 ? "New Address" : "Enter your shipping address"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      required
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      className="block w-full py-2 px-3 border border-stone-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      className="block w-full py-2 px-3 border border-stone-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                      Street Address
                    </label>
                    <input
                      type="text"
                      required
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      className="block w-full py-2 px-3 border border-stone-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                      placeholder="Street and house number, suite or apartment"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                      City
                    </label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="block w-full py-2 px-3 border border-stone-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                      placeholder="e.g. San Francisco"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                      ZIP / Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                      className="block w-full py-2 px-3 border border-stone-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                      placeholder="e.g. 94107"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="block w-full py-2 px-3 border border-stone-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                      placeholder="e.g. (555) 019-2834"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <button
              id="address-next"
              type="submit"
              className="w-full bg-stone-900 text-white font-bold py-3 rounded-none text-[10px] uppercase tracking-widest hover:bg-blue-900 transition-all border border-stone-900 hover:border-blue-900 cursor-pointer"
            >
              Continue to Payment
            </button>
          </motion.form>
        )}

        {/* ----- PAYMENT STEP (with card fields) ----- */}
        {step === "payment" && (
          <motion.div
            key="payment-step"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="bg-white rounded-none border border-stone-200 p-6 shadow-none space-y-6"
          >
            <h3 className="font-display font-bold text-stone-950 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-100 pb-3">
              <CreditCard className="h-4 w-4 text-stone-500" />
              <span>Step 2: Payment</span>
            </h3>

            {/* Order Summary */}
            <div className="space-y-2.5 text-xs border border-stone-200 p-4 bg-stone-50">
              <div className="flex justify-between text-stone-500">
                <span className="font-medium">Subtotal</span>
                <span className="font-mono font-bold text-stone-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-amber-600 font-bold">
                  <span>Discount code ({discountCode})</span>
                  <span className="font-mono">-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-500">
                <span className="font-medium">Estimated Tax</span>
                <span className="font-mono font-bold text-stone-900">
                  ${estimatedTax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span className="font-medium">Shipping Fee</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-600 uppercase text-[9px] tracking-widest font-mono">
                    Free Shipping
                  </span>
                ) : (
                  <span className="font-mono font-bold text-stone-900">
                    ${shippingFee.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-150">
                <span className="font-display font-bold uppercase tracking-widest text-stone-900 text-xs">
                  Grand Total Due
                </span>
                <span className="font-mono font-bold text-xl text-stone-950">
                  ${grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Card Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                  Card Number
                </label>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full py-2 px-3 border border-stone-200 rounded-none text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                    Expiry (MM/YY)
                  </label>
                  <input
                    type="text"
                    placeholder="12/28"
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    className="w-full py-2 px-3 border border-stone-200 rounded-none text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                    CVV
                  </label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardCvv}
                    onChange={handleCvvChange}
                    className="w-full py-2 px-3 border border-stone-200 rounded-none text-sm font-mono focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                id="payment-back"
                type="button"
                onClick={() => setStep("address")}
                className="flex-1 py-2.5 px-3 border border-stone-200 rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 text-stone-600 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                id="pay-now-btn"
                onClick={handlePlaceOrder}
                disabled={isProcessing || submittingRef.current}
                className="flex-[2] bg-stone-900 text-white font-bold py-2.5 rounded-none text-[10px] uppercase tracking-widest hover:bg-blue-900 border border-stone-900 hover:border-blue-900 transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CreditCard className="h-4 w-4" />
                <span>Pay ${grandTotal.toFixed(2)}</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ----- PROCESSING ANIMATION ----- */}
        {step === "processing" && (
          <motion.div
            key="processing-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-none border border-stone-200 p-12 shadow-none text-center space-y-4 max-w-md mx-auto"
          >
            <Loader2 className="h-12 w-12 text-stone-900 animate-spin mx-auto" />
            <h3 className="font-display text-base font-bold uppercase tracking-widest text-stone-950">
              Processing Payment
            </h3>
            <p className="text-xs text-stone-500 font-mono font-bold uppercase animate-pulse leading-normal max-w-xs mx-auto">
              Verifying card details...<br />
              Connecting to secure gateway...<br />
              Please wait...
            </p>
            <div className="text-[9px] text-stone-400 mt-2 font-mono uppercase tracking-widest">
              🔒 SECURE LEDGER CONNECTION ACTIVE
            </div>
          </motion.div>
        )}

        {/* ----- SUCCESS ----- */}
        {step === "success" && confirmedOrder && (
          <motion.div
            key="success-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-emerald-50 border border-emerald-200 rounded-none p-6 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto stroke-[1.5]" />
              <h2 className="font-serif text-2xl font-light text-stone-950 tracking-tight">
                Payment Successful!
              </h2>
              <p className="text-xs text-stone-600 font-sans max-w-sm mx-auto leading-relaxed">
                Your order has been placed and payment confirmed. A receipt has been sent to <b>{address.email}</b>.
              </p>
            </div>

            <div className="bg-white border border-stone-200 rounded-none shadow-none p-6 space-y-5 text-xs text-stone-800 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">
                    Order ID
                  </span>
                  <span className="font-black text-sm text-stone-900">
                    {confirmedOrder.id}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block">
                    Date
                  </span>
                  <span className="font-semibold text-stone-900">
                    {confirmedOrder.date}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                {confirmedOrder.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center py-1">
                    <span className="text-stone-600 max-w-xs truncate">
                      {item.product.title} (x{item.quantity})
                    </span>
                    <span className="font-mono font-bold text-stone-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-stone-200 pt-3 space-y-1.5 font-medium">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>${confirmedOrder.subtotal.toFixed(2)}</span>
                </div>
                {confirmedOrder.discount > 0 && (
                  <div className="flex justify-between text-amber-600">
                    <span>Discount</span>
                    <span>-${confirmedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-500">
                  <span>Tax</span>
                  <span>${confirmedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Shipping</span>
                  {confirmedOrder.shipping === 0 ? (
                    <span className="font-bold text-emerald-600 uppercase text-[9px] tracking-widest">
                      Free
                    </span>
                  ) : (
                    <span>${confirmedOrder.shipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 text-stone-950 font-display">
                  <span className="font-bold text-xs uppercase tracking-wider">
                    Total Paid
                  </span>
                  <span className="font-mono font-black text-lg">
                    ${confirmedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3 flex flex-col sm:flex-row justify-between text-[10px] text-stone-400 uppercase">
                <span>
                  Payment: <b>{confirmedOrder.paymentMethod}</b>
                </span>
                <span>
                  Status: <b className="text-emerald-600">{confirmedOrder.status}</b>
                </span>
              </div>
            </div>

            <button
              id="return-shopping-success"
              onClick={onCancel}
              className="w-full bg-stone-900 text-white font-bold py-3.5 rounded-none text-[10px] uppercase tracking-widest hover:bg-blue-900 text-center block shadow-none border border-stone-900 hover:border-blue-900 transition-all cursor-pointer"
            >
              Continue Shopping
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};