import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, ShoppingBag, ArrowLeft, Loader2, ClipboardCheck, Calendar, Info, MapPin, Plus } from "lucide-react";
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

type CheckoutStep = "address" | "payment" | "review" | "processing" | "success";

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

  // Address State (for new address or fallback)
  const [address, setAddress] = useState<ShippingAddress>({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    phone: ""
  });

  // Payment State
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardType, setCardType] = useState<"visa" | "mastercard" | "unknown">("unknown");

  const [processingStatus, setProcessingStatus] = useState("Connecting to secure payment gateway...");
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Financial calculations
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const estimatedTax = taxableSubtotal * 0.08;
  const shippingFee = taxableSubtotal > 50 || taxableSubtotal === 0 ? 0 : 9.99;
  const grandTotal = taxableSubtotal + estimatedTax + shippingFee;

  // Auto-select default address on load
  useEffect(() => {
    const defaultAddr = savedAddresses.find(a => a.is_default);
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

  // When a saved address is selected, populate the address state
  useEffect(() => {
    if (selectedAddressId) {
      const addr = savedAddresses.find(a => a.id === selectedAddressId);
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
    if (val.length > 16) val = val.substring(0, 16);
    if (val.startsWith("4")) setCardType("visa");
    else if (/^5[1-5]/.test(val)) setCardType("mastercard");
    else setCardType("unknown");
    const parts = [];
    for (let i = 0; i < val.length; i += 4) {
      parts.push(val.substring(i, i + 4));
    }
    setCardNumber(parts.join(" "));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length >= 2) {
      setCardExpiry(`${val.substring(0, 2)}/${val.substring(2)}`);
    } else {
      setCardExpiry(val);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 3) setCardCvv(val);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("review");
  };

  const handlePlaceOrder = () => {
    setStep("processing");
    setTimeout(() => {
      setProcessingStatus("Verifying card holder verification protocols...");
      setTimeout(() => {
        setProcessingStatus("Deducting inventory balances from marketplace servers...");
        setTimeout(() => {
          setProcessingStatus("Settling secure bank ledger entries...");
          setTimeout(() => {
            const newOrder: Order = {
              id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
              date: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              }),
              items: [...cartItems],
              subtotal,
              discount,
              tax: estimatedTax,
              shipping: shippingFee,
              total: grandTotal,
              shippingAddress: { ...address },
              paymentMethod: `Credit Card (ending in ${cardNumber.slice(-4)})`,
              status: "Processing"
            };
            setConfirmedOrder(newOrder);
            onPlaceOrder(newOrder);
            setStep("success");
          }, 800);
        }, 800);
      }, 800);
    }, 800);
  };

  return (
    <div id="checkout-wizard-view" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {step !== "processing" && step !== "success" && (
        <div className="flex justify-between items-center mb-8 border-b border-zinc-200 pb-4">
          <div className="flex items-center gap-1.5">
            <button
              id="cancel-checkout-btn"
              onClick={onCancel}
              className="p-1.5 rounded-none border border-zinc-200 text-zinc-500 hover:text-zinc-900 bg-white hover:bg-zinc-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="ml-1">
              <h2 className="font-display text-xl font-bold text-zinc-950 uppercase tracking-wide">Secure Checkout</h2>
              <p className="text-xs text-zinc-400 font-medium">Verify your items, addresses, and billing.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {["address", "payment", "review"].map((s, idx) => {
              const isActive = step === s;
              const isPast = 
                (s === "address" && (step === "payment" || step === "review")) ||
                (s === "payment" && step === "review");
              
              return (
                <React.Fragment key={s}>
                  <div className="flex items-center gap-1">
                    <div className={`h-6 w-6 rounded-none flex items-center justify-center text-[10px] font-mono font-bold border ${
                      isActive 
                        ? "bg-zinc-950 text-white border-zinc-950" 
                        : isPast 
                          ? "bg-blue-600 text-white border-blue-600" 
                          : "bg-zinc-50 text-zinc-400 border-zinc-200"
                    }`}>
                      {isPast ? "✓" : idx + 1}
                    </div>
                    <span className={`text-[9px] uppercase tracking-widest font-bold hidden sm:inline capitalize ${
                      isActive ? "text-zinc-900" : isPast ? "text-blue-600" : "text-zinc-400"
                    }`}>
                      {s}
                    </span>
                  </div>
                  {idx < 2 && <div className="h-[1px] w-4 bg-zinc-200"></div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        
        {step === "address" && (
          <motion.form
            key="address-step"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handleAddressSubmit}
            className="bg-white rounded-none border border-zinc-200 p-6 shadow-none space-y-6"
          >
            <h3 className="font-display font-bold text-zinc-950 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
              <CheckCircle2 className="h-4 w-4 text-zinc-500" />
              <span>Step 1: Shipping Destination</span>
            </h3>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Select a saved address</label>
                <div className="space-y-1.5">
                  {savedAddresses.map((addr) => (
                    <label key={addr.id} className="flex items-start gap-3 p-3 border border-zinc-200 hover:bg-zinc-50 cursor-pointer transition">
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={selectedAddressId === addr.id && !useNewAddress}
                        onChange={() => {
                          setSelectedAddressId(addr.id);
                          setUseNewAddress(false);
                        }}
                        className="mt-1 accent-zinc-950"
                      />
                      <div className="text-xs">
                        <p className="font-bold text-zinc-900">{addr.name}</p>
                        <p className="text-zinc-600">{addr.address}, {addr.city} {addr.zip}</p>
                        <p className="text-zinc-600">{addr.phone} • {addr.email}</p>
                        {addr.is_default && <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">(Default)</span>}
                      </div>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setUseNewAddress(true)}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add a new address</span>
                  </button>
                </div>
              </div>
            )}

            {/* New Address Form (or fallback) */}
            {useNewAddress || savedAddresses.length === 0 ? (
              <div className="border-t border-zinc-100 pt-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                  {savedAddresses.length > 0 ? "New Address" : "Enter your shipping address"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Contact Name</label>
                    <input
                      type="text"
                      required
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Email Address</label>
                    <input
                      type="email"
                      required
                      value={address.email}
                      onChange={(e) => setAddress({ ...address, email: e.target.value })}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Street Address</label>
                    <input
                      type="text"
                      required
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                      placeholder="Street and house number, suite or apartment"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">City</label>
                    <input
                      type="text"
                      required
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                      placeholder="e.g. San Francisco"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">ZIP / Postal Code</label>
                    <input
                      type="text"
                      required
                      value={address.zip}
                      onChange={(e) => setAddress({ ...address, zip: e.target.value })}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                      placeholder="e.g. 94107"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      className="block w-full py-2 px-3 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                      placeholder="e.g. (555) 019-2834"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            <button
              id="address-next"
              type="submit"
              className="w-full bg-zinc-950 text-white font-bold py-3 rounded-none text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all border border-zinc-950 hover:border-blue-600 cursor-pointer"
            >
              Continue to Billing Info
            </button>
          </motion.form>
        )}

        {/* Payment and Review steps remain unchanged – they use the address state */}
        {step === "payment" && (
          <motion.form
            key="payment-step"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            onSubmit={handlePaymentSubmit}
            className="bg-white rounded-none border border-zinc-200 p-6 shadow-none space-y-6"
          >
            <h3 className="font-display font-bold text-zinc-950 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
              <CreditCard className="h-4 w-4 text-zinc-500" />
              <span>Step 2: Billing & Credit Card</span>
            </h3>

            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-none text-xs text-zinc-500 flex gap-2 font-mono">
              <Info className="h-4 w-4 shrink-0 text-zinc-700" />
              <div>
                <span className="font-bold block uppercase text-[10px] text-zinc-700">Simulator Sandbox Mode</span>
                <span className="text-[10px]">Type any card details. (Type <b>4</b> for Visa, <b>51</b> for Mastercard)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Card Number</label>
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                    <span className={cardType === "visa" ? "text-blue-600 bg-blue-50 px-1 py-0.5 rounded-none border border-blue-200" : ""}>VISA</span>
                    <span className={cardType === "mastercard" ? "text-orange-600 bg-orange-50 px-1 py-0.5 rounded-none border border-orange-200" : ""}>MASTERCARD</span>
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="block w-full py-2 px-3 border border-zinc-200 rounded-none text-sm font-mono font-bold tracking-widest placeholder-zinc-300 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="4000 1234 5678 9010"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Cardholder Name</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="block w-full py-2 px-3 border border-zinc-200 rounded-none text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="e.g. JOHN DOE"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={handleExpiryChange}
                    className="block w-full py-2 px-3 border border-zinc-200 rounded-none text-xs text-center placeholder-zinc-300 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="12/28"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">CVV</label>
                  <input
                    type="password"
                    required
                    value={cardCvv}
                    onChange={handleCvvChange}
                    className="block w-full py-2 px-3 border border-zinc-200 rounded-none text-xs text-center placeholder-zinc-300 font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                    placeholder="•••"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                id="payment-back"
                type="button"
                onClick={() => setStep("address")}
                className="flex-1 py-2.5 px-3 border border-zinc-200 rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                id="payment-next"
                type="submit"
                className="flex-[2] bg-zinc-950 text-white font-bold py-2.5 rounded-none text-[10px] uppercase tracking-widest hover:bg-blue-600 border border-zinc-950 hover:border-blue-600 transition-all cursor-pointer"
              >
                Continue to Review
              </button>
            </div>
          </motion.form>
        )}

        {step === "review" && (
          <motion.div
            key="review-step"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-none border border-zinc-200 p-6 shadow-none space-y-6">
              <h3 className="font-display font-bold text-zinc-950 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 pb-3">
                <ClipboardCheck className="h-4.5 w-4.5 text-zinc-500" />
                <span>Step 3: Confirm and Purchase</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-zinc-50 p-4 rounded-none border border-zinc-200 font-mono">
                <div className="space-y-1">
                  <span className="font-bold text-zinc-400 uppercase block tracking-wider text-[9px]">Shipping Destination</span>
                  <p className="font-bold text-zinc-900">{address.name}</p>
                  <p className="text-zinc-600">{address.address}</p>
                  <p className="text-zinc-600">{address.city}, {address.zip}</p>
                  <p className="text-zinc-600">{address.phone}</p>
                </div>
                <div className="space-y-1 border-t md:border-t-0 md:border-l border-zinc-200 pt-3 md:pt-0 md:pl-4">
                  <span className="font-bold text-zinc-400 uppercase block tracking-wider text-[9px]">Payment Details</span>
                  <p className="font-bold text-zinc-900 uppercase">Card ending in •••• {cardNumber.slice(-4)}</p>
                  <p className="text-zinc-600">Cardholder: {cardName.toUpperCase()}</p>
                  <p className="text-zinc-600">Expires: {cardExpiry}</p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-2 font-mono">Itemized Invoice List</span>
                <div className="divide-y divide-zinc-150 border border-zinc-200 rounded-none overflow-hidden bg-white text-xs">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="p-3 flex items-center justify-between bg-white hover:bg-[#F8F9FA]">
                      <div className="flex items-center gap-2.5">
                        <img src={item.product.image} alt={item.product.title} referrerPolicy="no-referrer" className="h-8 w-8 rounded-none object-cover border bg-zinc-50 shrink-0" />
                        <div>
                          <p className="font-display font-medium text-zinc-900 line-clamp-1 max-w-[250px]">{item.product.title}</p>
                          <p className="text-[10px] font-mono text-zinc-400 uppercase">{item.product.brand} • Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-zinc-950">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 text-xs border-t border-zinc-150 pt-4">
                <div className="flex justify-between text-zinc-500">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-mono font-bold text-zinc-900">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-blue-600 font-bold">
                    <span>Discount code ({discountCode})</span>
                    <span className="font-mono">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span className="font-medium">Estimated Tax</span>
                  <span className="font-mono font-bold text-zinc-900">${estimatedTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span className="font-medium">Shipping Fee</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-blue-600 uppercase text-[9px] tracking-widest font-mono">Free Shipping</span>
                  ) : (
                    <span className="font-mono font-bold text-zinc-900">${shippingFee.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-zinc-150">
                  <span className="font-display font-bold uppercase tracking-widest text-zinc-900 text-xs">Grand Total Due</span>
                  <span id="checkout-grand-total" className="font-mono font-bold text-xl text-zinc-950">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  id="review-back"
                  onClick={() => setStep("payment")}
                  className="flex-1 py-2.5 px-3 border border-zinc-200 rounded-none text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-50 text-zinc-600 transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="place-order-btn"
                  onClick={handlePlaceOrder}
                  className="flex-[2] bg-zinc-950 text-white font-bold py-2.5 rounded-none text-[10px] uppercase tracking-widest hover:bg-blue-600 border border-zinc-950 hover:border-blue-600 transition-all shadow-none flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Place Order (${grandTotal.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "processing" && (
          <motion.div
            key="processing-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-none border border-zinc-200 p-12 shadow-none text-center space-y-4 max-w-md mx-auto"
          >
            <Loader2 className="h-10 w-10 text-zinc-900 animate-spin mx-auto" />
            <h3 className="font-display text-base font-bold uppercase tracking-widest text-zinc-950">Processing Payment</h3>
            <p id="gateway-status" className="text-xs text-zinc-500 font-mono font-bold uppercase animate-pulse leading-normal max-w-xs mx-auto">
              {processingStatus}
            </p>
            <div className="text-[9px] text-zinc-400 mt-2 font-mono uppercase tracking-widest">
              SECURE LEDGER CONNECTION SHIELD ACTIVE
            </div>
          </motion.div>
        )}

        {step === "success" && confirmedOrder && (
          <motion.div
            key="success-step"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-none p-6 text-center space-y-3">
              <CheckCircle2 className="h-12 w-12 text-blue-600 mx-auto stroke-[1.5]" />
              <h2 className="font-serif text-2xl font-light text-zinc-950 tracking-tight">Order Placed Successfully</h2>
              <p className="text-xs text-zinc-600 font-sans max-w-sm mx-auto leading-relaxed">
                Thank you for your purchase. Your payment has been cleared and settled. A copy of your invoice receipt has been sent to <b>{address.email}</b>.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-none shadow-none p-6 space-y-5 text-xs text-zinc-800 font-mono">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div>
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Order ID Reference</span>
                  <span id="confirmed-order-id" className="font-black text-sm text-zinc-900">{confirmedOrder.id}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block">Settlement Date</span>
                  <span className="font-semibold text-zinc-900">{confirmedOrder.date}</span>
                </div>
              </div>

              <div className="p-3 bg-[#F8F9FA] border border-zinc-200 rounded-none flex items-center gap-3">
                <Calendar className="h-5 w-5 text-zinc-600 animate-pulse" />
                <div>
                  <span className="font-bold text-zinc-800 block text-[10px] uppercase tracking-wide">Estimated Shipment Delivery</span>
                  <p className="text-zinc-500 text-[10px]">Your order is scheduled to arrive in 2-3 business days.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest block mb-2">Invoice Summary Breakdown</span>
                {confirmedOrder.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center py-1 font-sans">
                    <span className="text-zinc-600 max-w-xs truncate">{item.product.title} (x{item.quantity})</span>
                    <span className="font-mono font-bold text-zinc-900">${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-200 pt-3 space-y-1.5 font-medium">
                <div className="flex justify-between text-zinc-500">
                  <span>Subtotal</span>
                  <span>${confirmedOrder.subtotal.toFixed(2)}</span>
                </div>
                {confirmedOrder.discount > 0 && (
                  <div className="flex justify-between text-blue-600">
                    <span>Discount</span>
                    <span>-${confirmedOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-500">
                  <span>Tax (8%)</span>
                  <span>${confirmedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-500">
                  <span>Shipping</span>
                  {confirmedOrder.shipping === 0 ? (
                    <span className="font-bold text-blue-600 uppercase text-[9px] tracking-widest">Free Shipping</span>
                  ) : (
                    <span>${confirmedOrder.shipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-zinc-200 text-zinc-950 font-display">
                  <span className="font-bold text-xs uppercase tracking-wider">Grand Total Billed</span>
                  <span className="font-mono font-black text-lg">${confirmedOrder.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-3 flex flex-col sm:flex-row justify-between text-[10px] text-zinc-400 uppercase">
                <span>Payment Mode: <b>{confirmedOrder.paymentMethod}</b></span>
                <span>Status: <b className="text-blue-600">{confirmedOrder.status}</b></span>
              </div>
            </div>

            <button
              id="return-shopping-success"
              onClick={onCancel}
              className="w-full bg-zinc-950 text-white font-bold py-3.5 rounded-none text-[10px] uppercase tracking-widest hover:bg-blue-600 text-center block shadow-none border border-zinc-950 hover:border-blue-600 transition-all cursor-pointer"
            >
              Continue Shopping / Home
            </button>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};