import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    q: "What is ELECTRA?",
    a: "ELECTRA is a premium electronics marketplace that curates high‑quality audio, computing, and wearable devices from trusted brands and independent makers."
  },
  {
    q: "How do I place an order?",
    a: "Simply browse our catalog, add items to your cart, and proceed to checkout. You’ll need an account to complete the purchase."
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards (Visa, Mastercard, Amex) and PayPal. All transactions are secured with 256‑bit encryption."
  },
  {
    q: "How long does shipping take?",
    a: "We ship within 1–2 business days. Delivery times vary by location – usually 2–5 business days within the continental US."
  },
  {
    q: "What is your return policy?",
    a: "We offer a 30‑day hassle‑free return policy. Items must be in original condition with all packaging. Contact support to initiate a return."
  },
  {
    q: "Do you offer international shipping?",
    a: "Currently we only ship within the United States. We plan to expand internationally in 2027."
  }
];

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-serif text-4xl font-light text-zinc-950 mb-4">Frequently Asked Questions</h1>
        <div className="h-1 w-20 bg-blue-600 mb-8"></div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border border-zinc-200 bg-white">
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-zinc-900 hover:bg-zinc-50 transition"
              >
                <span>{faq.q}</span>
                {openIndex === idx ? (
                  <ChevronUp className="h-4 w-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-zinc-500" />
                )}
              </button>
              {openIndex === idx && (
                <div className="px-5 pb-5 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};