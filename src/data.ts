import { Product, Coupon } from './types';

export const CATEGORIES = [
  "All",
  "Audio",
  "Wearables",
  "Computers",
  "Accessories",
  "Peripherals"
];

export const INITIAL_COUPONS: Coupon[] = [
  { code: "WELCOME10", discountPercent: 10 },
  { code: "TECH20", discountPercent: 20 },
  { code: "SUPERDEAL", discountPercent: 30 }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "AeroSound Pro ANC Headphones",
    description: "Immersive noise-canceling wireless over-ear headphones with custom spatial audio, high-resolution audio drivers, and up to 45 hours of continuous battery life. Perfect for professional mixing, focus sessions, or long travels.",
    price: 249.99,
    originalPrice: 299.99,
    rating: 4.8,
    reviewCount: 142,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Audio",
    brand: "AeroSound",
    stock: 12,
    specs: {
      "Driver Size": "40mm Custom Dynamic",
      "Frequency Response": "10Hz - 40kHz",
      "Battery Life": "Up to 45 Hours (ANC Off)",
      "Bluetooth Version": "5.2 (Multipoint)",
      "Charging": "USB-C Fast Charge (5m = 5h)"
    },
    reviews: [
      {
        id: "rev-1-1",
        author: "Sarah Jenkins",
        rating: 5,
        date: "2026-06-15",
        comment: "Absolutely outstanding soundstage. The ANC blocks out my noisy office entirely. Highly recommended!"
      },
      {
        id: "rev-1-2",
        author: "Michael Chen",
        rating: 4,
        date: "2026-07-02",
        comment: "Very comfortable for long sessions, but the carrying case is a bit bulky. Sound is pristine."
      }
    ]
  },
  {
    id: "prod-2",
    title: "Chronos X Active Smartwatch",
    description: "Advanced fitness tracker and elegant watch featuring a vibrant always-on AMOLED display, dual-band GPS routing, multi-sport activity tracking, 24/7 heart-rate tracking, and smart phone notification sync.",
    price: 189.99,
    rating: 4.5,
    reviewCount: 98,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Wearables",
    brand: "Chronos Labs",
    stock: 8,
    specs: {
      "Display": "1.43\" AMOLED Always-On",
      "Water Resistance": "5 ATM (Up to 50 meters)",
      "Sensors": "Optical HR, SpO2, Accelerometer, Gyro, Compass",
      "Battery Life": "Up to 10 Days (Typical Use)",
      "Connectivity": "GPS, GLONASS, Bluetooth 5.0"
    },
    reviews: [
      {
        id: "rev-2-1",
        author: "David Miller",
        rating: 5,
        date: "2026-05-20",
        comment: "Tracking is highly accurate during my runs, and the AMOLED display looks incredibly sharp in bright sunlight."
      },
      {
        id: "rev-2-2",
        author: "Emma Watson",
        rating: 4,
        date: "2026-06-28",
        comment: "Solid build quality and great battery life. Wish there were more preloaded watch faces, but custom ones work great."
      }
    ]
  },
  {
    id: "prod-3",
    title: "TacType Pro Mechanical Keyboard",
    description: "75% layout mechanical wireless keyboard with hot-swappable linear yellow switches, sound-dampening foam overlays, custom RGB lighting profiles, and direct Mac/Windows configuration modes.",
    price: 119.99,
    originalPrice: 139.99,
    rating: 4.9,
    reviewCount: 215,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Accessories",
    brand: "TacType",
    stock: 15,
    specs: {
      "Layout": "75% Form Factor (84 Keys)",
      "Switches": "Hot-swappable Tactile Yellow (Pre-lubed)",
      "Keycaps": "Double-shot PBT Cherry Profile",
      "Backlight": "South-facing Custom RGB",
      "Connectivity": "2.4Ghz Wireless, Bluetooth 5.1, Wired USB-C"
    },
    reviews: [
      {
        id: "rev-3-1",
        author: "Alex Rivera",
        rating: 5,
        date: "2026-06-11",
        comment: "This keyboard sounds incredible. Extremely creamy keystrokes and no pinging noise at all. Highly recommended!"
      }
    ]
  },
  {
    id: "prod-4",
    title: "Vertex Pro 14 Book Laptop",
    description: "High-performance portable workstation with an M2-equivalent Hexa-Core SoC, 16GB of unified high-speed memory, 512GB PCIe Gen 4 SSD storage, and a breathtaking 14-inch liquid retina color-graded screen.",
    price: 999.99,
    originalPrice: 1199.99,
    rating: 4.7,
    reviewCount: 64,
    image: "https://images.unsplash.com/photo-1496181130204-755241544e35?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1496181130204-755241544e35?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Computers",
    brand: "Vertex Tech",
    stock: 5,
    specs: {
      "Processor": "Vertex Core-V2 Octa-Core",
      "RAM": "16GB Unified LPDDR5",
      "Storage": "512GB NVMe PCIe Gen4 SSD",
      "Display": "14.2\" Liquid Retina, 120Hz ProMotion",
      "Battery": "70Wh (Up to 16 Hours web surfing)"
    },
    reviews: [
      {
        id: "rev-4-1",
        author: "Jessica Taylor",
        rating: 5,
        date: "2026-07-01",
        comment: "Fabulous display and absolute beast at compiling code. Lightweight and premium feeling."
      }
    ]
  },
  {
    id: "prod-5",
    title: "StudioCast Condenser Microphone",
    description: "Premium gold-sputtered studio condenser microphone with custom cardioid, bidirectional, and omnidirectional pickup patterns, an integrated pop filter, and high-fidelity USB-C digital connections.",
    price: 139.99,
    rating: 4.6,
    reviewCount: 83,
    image: "https://images.unsplash.com/photo-1590608897129-79da98d15969?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1590608897129-79da98d15969?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Audio",
    brand: "StudioCast",
    stock: 22,
    specs: {
      "Polar Patterns": "Cardioid, Omni, Bidirectional",
      "Frequency Range": "20Hz - 20kHz",
      "Max SPL": "120 dB",
      "Sample Rate": "24-bit / 96kHz High-Res",
      "Output": "USB-C Interface with 3.5mm Real-Time Monitor Out"
    },
    reviews: [
      {
        id: "rev-5-1",
        author: "Brian O'Connor",
        rating: 5,
        date: "2026-04-12",
        comment: "Excellent vocal clarity. Plugs right into my computer and OBS caught it instantly. Zero hiss."
      }
    ]
  },
  {
    id: "prod-6",
    title: "AuraGlide Wireless Gaming Mouse",
    description: "Ultra-lightweight 58g ergonomic gaming mouse boasting a cutting-edge 26,000 DPI optical tracking sensor, zero-latency wireless connectivity, optical microswitches, and smooth-gliding PTFE feet.",
    price: 79.99,
    originalPrice: 89.99,
    rating: 4.8,
    reviewCount: 167,
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1617900906639-cab7aeceb162?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Peripherals",
    brand: "Aura Gaming",
    stock: 18,
    specs: {
      "Sensor": "AuraPrecision 26K Optical",
      "Weight": "58 grams (Ultra-light)",
      "Polling Rate": "Up to 4000Hz (With wireless dongle)",
      "Switches": "Gen-3 Optical Mouse Switches (90M Click Life)",
      "Battery Life": "Up to 80 Hours"
    },
    reviews: [
      {
        id: "rev-6-1",
        author: "Nathan Drake",
        rating: 5,
        date: "2026-05-30",
        comment: "Insanely light and highly responsive! The stock feet are incredibly smooth on my cloth mousepad."
      }
    ]
  },
  {
    id: "prod-7",
    title: "Oculus 34\" UltraWide Curved Monitor",
    description: "Immersive 1500R curved gaming monitor with a vivid ultra-wide WQHD screen, 165Hz response rate, AMD FreeSync sync technology, and 99% sRGB color gamut replication for beautiful cinematic rendering.",
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.4,
    reviewCount: 52,
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Computers",
    brand: "Oculus Displays",
    stock: 4,
    specs: {
      "Resolution": "3440 x 1440 WQHD (21:9 Aspect Ratio)",
      "Curvature": "1500R",
      "Refresh Rate": "165Hz via DisplayPort",
      "Panel Type": "VA with HDR10 support",
      "Ports": "2x HDMI, 1x DisplayPort, 1x USB-C Power Delivery"
    },
    reviews: [
      {
        id: "rev-7-1",
        author: "Liam Neeson",
        rating: 4,
        date: "2026-06-22",
        comment: "Great contrast ratio and amazing immersion for productivity and casual racing games. Black levels are deep."
      }
    ]
  },
  {
    id: "prod-8",
    title: "Orbit 360 Portable Speaker",
    description: "Rugged omnidirectional outdoor bluetooth speaker offering loud 360° stereo acoustics, rich sub-bass, full IP67 dust/water resistance rating, and a handy integrated canvas strap.",
    price: 59.99,
    rating: 4.3,
    reviewCount: 39,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80"
    ],
    category: "Audio",
    brand: "Orbit Audio",
    stock: 25,
    specs: {
      "Sound Output": "24W Stereo Drivers with dual passive radiators",
      "Durability": "IP67 Dustproof and Waterproof",
      "Battery Life": "Up to 20 Hours play time",
      "Connectivity": "Bluetooth 5.3 + NFC Tap-and-Pair",
      "Weight": "650 grams"
    },
    reviews: [
      {
        id: "rev-8-1",
        author: "Sophia Lorenz",
        rating: 5,
        date: "2026-07-05",
        comment: "Unbelievable bass for such a small speaker. We took it camping, threw it in the pool, and it works perfectly!"
      }
    ]
  }
];
