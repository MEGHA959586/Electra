import React from "react";
import { motion } from "motion/react";

export const About: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-serif text-4xl font-light text-zinc-950 mb-4">About ELECTRA</h1>
        <div className="h-1 w-20 bg-blue-600 mb-6"></div>
        <p className="text-zinc-600 text-sm leading-relaxed mb-4">
          ELECTRA is a premium electronics marketplace founded in 2024 with a simple mission:
          to bring the finest audio, computing, and wearable technology to discerning customers
          who demand quality and performance.
        </p>
        <p className="text-zinc-600 text-sm leading-relaxed mb-4">
          We curate every product in our catalog – from high‑fidelity headphones to ultra‑thin
          notebooks – to ensure they meet our rigorous standards for acoustic clarity, build
          quality, and modern design.
        </p>
        <div className="bg-blue-50 border border-blue-100 p-6 rounded-none mt-6">
          <h3 className="font-bold text-zinc-900 text-sm uppercase tracking-wider">Our Values</h3>
          <ul className="mt-2 space-y-2 text-sm text-zinc-700">
            <li>🔊 <strong>Acoustic Perfection</strong> – Sound engineered with clinical precision.</li>
            <li>⚡ <strong>Raw Performance</strong> – Cutting‑edge silicon and zero‑compromise specs.</li>
            <li>🎨 <strong>Modern Craftsmanship</strong> – Every device is a piece of design art.</li>
            <li>🌍 <strong>Sustainable Innovation</strong> – Eco‑conscious packaging and energy‑efficient designs.</li>
          </ul>
        </div>
        <p className="text-zinc-500 text-xs mt-6 italic">
          ELECTRA is a registered trademark of ElectroMart Technologies. © 2026.
        </p>
      </motion.div>
    </div>
  );
};