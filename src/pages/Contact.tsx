import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export const Contact: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, send the message
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-serif text-4xl font-light text-zinc-950 mb-4">Contact Us</h1>
        <div className="h-1 w-20 bg-blue-600 mb-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Address</h4>
                <p className="text-sm text-zinc-600">123 Silicon Boulevard, Suite 100<br />San Francisco, CA 94107</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Phone</h4>
                <p className="text-sm text-zinc-600">+1 (555) 019-2834</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">Email</h4>
                <p className="text-sm text-zinc-600">support@electra.com</p>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-200">
              <p className="text-xs text-zinc-500">
                Our support team is available Monday–Friday, 9:00 AM – 6:00 PM PST.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white border border-zinc-200 p-6 shadow-none">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 mb-4">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-3 border border-zinc-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full py-2 px-3 border border-zinc-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-600"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">Message</label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full py-2 px-3 border border-zinc-200 rounded-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-zinc-950 text-white py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition flex items-center justify-center gap-2 border border-zinc-950 hover:border-blue-600"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Send Message</span>
              </button>
              {submitted && (
                <p className="text-xs text-emerald-600 font-bold text-center">✓ Message sent! We’ll get back soon.</p>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};