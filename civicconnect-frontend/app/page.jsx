"use client";

import { motion } from "framer-motion";

export default function Home() {
  const quotes = [
    "A smart city is not about technology — it's about empowering people.",
    "Every voice matters. Every issue counts. Every solution starts here.",
    "Building stronger communities, one report at a time."
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-16 sm:pb-20">

      {/* 🎥 Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/Futuristic_Smart_City_Promo_Video.mp4" type="video/mp4" />
      </video>

      {/* 🌑 Dark Overlay */}
      <div className="absolute inset-0 z-10 bg-black/60"></div>

      {/* 🌟 Main Content - Hero Section */}
      <div className="relative z-20 flex flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6 sm:py-32">

        {/* Top Tagline */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <span className="inline-block px-6 py-2 bg-indigo-500/30 border border-indigo-400/50 rounded-full text-indigo-300 text-sm font-semibold">
            ✨ Welcome to the Future of Civic Engagement
          </span>
        </motion.div>

        {/* 🏙️ Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="mb-6 text-4xl font-extrabold text-white drop-shadow-lg sm:text-6xl lg:text-8xl"
        >
          Civic Connect
        </motion.h1>

        {/* 📝 Animated Quotes Carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mb-8 flex h-auto items-center justify-center"
        >
          <p className="max-w-3xl px-2 text-lg font-light italic leading-relaxed text-indigo-200 sm:text-xl lg:text-2xl">
            "{quotes[0]}"
          </p>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mb-12 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg md:text-xl"
        >
          Connect communities with smart civic tools. Report issues. Track progress. Make real change happen.
        </motion.p>

        {/* 🌊 Floating Glass Card */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="max-w-2xl rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:bg-white/15 sm:p-8"
        >
          <h2 className="mb-4 text-2xl font-bold text-indigo-300 sm:text-3xl">
            Empower Your Community
          </h2>
          <p className="text-base leading-relaxed text-gray-200 sm:text-lg">
            Report civic issues, track resolutions, and collaborate with authorities to build a cleaner, safer, and smarter city.
          </p>
        </motion.div>

      </div>

      {/* 🧩 Info Cards Section */}
      <div className="relative z-20 grid gap-4 px-4 pb-16 sm:px-6 md:grid-cols-3 md:gap-8 lg:px-10 lg:pb-20">

        {[
          {
            title: "📍 Real-time Reporting",
            desc: "Submit issues instantly with location-based tracking."
          },
          {
            title: "🗺️ Smart Mapping",
            desc: "Visualize city issues on interactive maps."
          },
          {
            title: "👥 Community Driven",
            desc: "Citizens collaborate to improve city infrastructure."
          }
        ].map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className="rounded-xl border border-white/20 bg-white/10 p-5 text-center shadow-lg backdrop-blur-xl sm:p-6"
          >
            <h3 className="mb-3 text-lg font-semibold text-indigo-400 sm:text-xl">
              {card.title}
            </h3>
            <p className="text-gray-300">{card.desc}</p>
          </motion.div>
        ))}

      </div>
    </div>
  );
}