import React from "react";
import { motion } from "motion/react";
import { Calendar, User } from "lucide-react";

const posts = [
  {
    title: "The Future of Wireless Audio",
    excerpt: "How lossless Bluetooth and spatial audio are changing the way we listen.",
    date: "July 8, 2026",
    author: "Alex Rivera",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "Why Silicon Notebooks Are Dominating 2026",
    excerpt: "Ultra‑thin, fanless, and incredibly powerful – the new standard in portable computing.",
    date: "July 2, 2026",
    author: "Jessica Taylor",
    image: "https://images.unsplash.com/photo-1496181130204-755241544e35?w=600&auto=format&fit=crop&q=80"
  },
  {
    title: "The Art of Mechanical Keyboards",
    excerpt: "From tactile switches to custom keycaps – why enthusiasts are obsessed.",
    date: "June 25, 2026",
    author: "Nathan Drake",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"
  }
];

export const Blog: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-serif text-4xl font-light text-zinc-950 mb-4">ELECTRA Blog</h1>
        <div className="h-1 w-20 bg-blue-600 mb-8"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post, idx) => (
            <div key={idx} className="bg-white border border-zinc-200 overflow-hidden group">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
              <div className="p-5 space-y-2">
                <h3 className="font-display font-bold text-zinc-900 text-sm hover:text-blue-600 cursor-pointer">
                  {post.title}
                </h3>
                <p className="text-xs text-zinc-500">{post.excerpt}</p>
                <div className="flex items-center gap-4 text-[10px] text-zinc-400 font-mono">
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};