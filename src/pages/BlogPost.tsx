import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { ArrowLeft, Calendar, User } from "lucide-react";

const blogPosts = [
  {
    id: 1,
    title: "The Future of Wireless Audio",
    excerpt: "How lossless Bluetooth and spatial audio are changing the way we listen.",
    content: `
      <p>Wireless audio has come a long way since the first Bluetooth headphones. Today, we're on the verge of a revolution in audio quality and spatial awareness.</p>
      <p>With the introduction of lossless audio over Bluetooth, audiophiles can finally cut the cord without compromising sound quality. Companies like Apple, Sony, and Qualcomm are leading the charge with new codecs like LDAC and aptX Adaptive.</p>
      <p>Spatial audio adds another dimension, creating an immersive soundstage that makes you feel like you're in a concert hall. This is achieved through advanced DSP algorithms and head-tracking.</p>
      <p>In the next few years, we can expect wireless earbuds to rival high-end wired headphones, making premium audio accessible to everyone.</p>
    `,
    date: "July 8, 2026",
    author: "Alex Rivera",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    title: "Why Silicon Notebooks Are Dominating 2026",
    excerpt: "Ultra‑thin, fanless, and incredibly powerful – the new standard in portable computing.",
    content: `
      <p>Silicon-based laptops have taken the industry by storm. With Apple's M-series chips and Qualcomm's Snapdragon X series, the era of fanless, ultra‑thin, yet powerful laptops is here.</p>
      <p>These chips offer exceptional performance per watt, allowing for all-day battery life without sacrificing speed. The integration of CPU, GPU, and neural engine on a single chip reduces latency and power consumption.</p>
      <p>Software optimization is also key – native ARM applications are now mainstream, and even legacy x86 apps run smoothly via emulation.</p>
      <p>By 2026, silicon notebooks are expected to outsell traditional x86 laptops by a wide margin, marking a significant shift in the computing landscape.</p>
    `,
    date: "July 2, 2026",
    author: "Jessica Taylor",
    image: "https://images.unsplash.com/photo-1496181130204-755241544e35?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    title: "The Art of Mechanical Keyboards",
    excerpt: "From tactile switches to custom keycaps – why enthusiasts are obsessed.",
    content: `
      <p>Mechanical keyboards have evolved from a niche hobby to a mainstream passion. The tactile feedback, customizability, and durability of mechanical switches appeal to both typists and gamers.</p>
      <p>Switch types like Cherry MX, Gateron, and Kailh offer distinct feels – from clicky and tactile to smooth linear. Enthusiasts often build their own keyboards, choosing every component from the PCB to the keycaps.</p>
      <p>The keycap market is a subculture in itself, with artisans creating custom designs from resin and metal. The result is a keyboard that is as much a piece of art as it is a tool.</p>
      <p>As remote work continues, the demand for premium typing experiences is only growing, cementing the mechanical keyboard's place in modern culture.</p>
    `,
    date: "June 25, 2026",
    author: "Nathan Drake",
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
  }
];

export const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === Number(id));
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
    window.scrollTo(0, 0);
  }, [controls, id]);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-stone-900">Post not found</h2>
          <Link to="/blog" className="text-amber-600 hover:underline mt-4 block">Back to blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/blog" className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 transition">
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to all posts</span>
        </Link>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative h-64 md:h-96 overflow-hidden rounded-none"
        >
          <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent"></div>
        </motion.div>

        {/* Title & Meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8"
        >
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-stone-950 leading-tight">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-stone-500 font-mono">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> {post.date}</span>
            <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author}</span>
          </div>
        </motion.div>

        {/* Content with scroll animations */}
        <div className="mt-8 prose prose-stone max-w-none">
          {post.content.split('\n').map((paragraph, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="mb-4"
            >
              <p className="text-stone-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: paragraph }} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};