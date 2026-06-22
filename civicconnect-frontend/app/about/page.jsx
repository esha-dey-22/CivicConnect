"use client";

import { motion } from "framer-motion";
import { CheckCircle, Users, Target, Zap } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: Zap,
      title: "Smart Reporting",
      desc: "Report civic issues instantly with location tagging and real-time updates."
    },
    {
      icon: Users,
      title: "Community Engagement",
      desc: "Collaborate with your community to resolve issues faster."
    },
    {
      icon: Target,
      title: "Real-time Tracking",
      desc: "Track issue status and progress with complete transparency."
    },
  ];

  const values = [
    { title: "Transparency", desc: "Open communication between citizens and authorities" },
    { title: "Efficiency", desc: "Quick response times and faster issue resolution" },
    { title: "Community", desc: "Empowering people to build smarter cities" },
    { title: "Innovation", desc: "Using technology for civic good" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-900 via-cyan-900 to-slate-900">
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16 sm:px-6 sm:py-20">
        {/* Video Background */}
        <video
          autoPlay
          muted
          loop
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/Video_Generation_With_Location_Change.mp4" type="video/mp4" />
        </video>

        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>

        {/* Animated gradient accent overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-10 top-20 hidden h-72 w-72 rounded-full bg-cyan-500 mix-blend-multiply filter blur-3xl animate-pulse sm:block"></div>
          <div className="absolute right-10 top-40 hidden h-72 w-72 rounded-full bg-teal-500 mix-blend-multiply filter blur-3xl animate-pulse delay-2000 sm:block"></div>
          <div className="absolute -bottom-8 left-20 hidden h-72 w-72 rounded-full bg-blue-500 mix-blend-multiply filter blur-3xl animate-pulse delay-4000 sm:block"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-4xl text-center"
        >
          <h1 className="mb-6 text-4xl font-extrabold bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-lg sm:text-6xl md:text-7xl">
            About CivicConnect
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-cyan-100 drop-shadow-md sm:text-xl md:text-2xl">
            Transforming communities through smart civic engagement and transparent governance
          </p>
          <p className="mx-auto max-w-2xl text-base text-cyan-200 drop-shadow-md sm:text-lg">
            CivicConnect bridges the gap between citizens and authorities, enabling faster issue resolution and stronger community bonds.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="relative bg-gradient-to-r from-slate-900 via-cyan-900/20 to-slate-800 px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-6">Our Mission</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              To empower communities by providing a transparent, efficient platform where citizens can report civic issues, track resolutions, and collaborate with local authorities to create smarter, cleaner, and safer cities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative bg-gradient-to-b from-slate-800/50 to-slate-900 px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why Choose CivicConnect?</h2>
            <p className="text-xl text-cyan-400/80">Powerful features designed for modern cities</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3 md:gap-8">
            {features.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 p-8 border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/0 to-emerald-600/0 group-hover:from-cyan-600/10 group-hover:to-emerald-600/10 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <Icon className="w-12 h-12 text-cyan-400 mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="relative bg-gradient-to-r from-slate-900 via-emerald-900/20 to-slate-800 px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Core Values</h2>
            <p className="text-xl text-cyan-400/80">Guiding principles that drive everything we do</p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 md:gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.15 }}
                className="flex gap-4 items-start p-6 rounded-xl bg-gradient-to-r from-cyan-900/20 to-emerald-900/20 border border-cyan-500/30"
              >
                <CheckCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{value.title}</h3>
                  <p className="text-gray-400">{value.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="relative bg-gradient-to-b from-slate-800/50 to-slate-900 px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Our Impact</h2>
            <p className="text-xl text-cyan-400/80">Making real differences in communities</p>
          </motion.div>

          <div className="grid gap-4 md:grid-cols-4 md:gap-6">
            {[
              { number: "50K+", label: "Active Users" },
              { number: "10K+", label: "Issues Resolved" },
              { number: "150+", label: "Partner Towns" },
              { number: "99%", label: "Satisfaction" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center p-8 rounded-xl bg-gradient-to-br from-cyan-600/10 to-emerald-600/10 border border-cyan-500/30"
              >
                <h3 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">{stat.number}</h3>
                <p className="text-gray-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-cyan-900 to-emerald-900 px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Join the Movement</h2>
            <p className="text-xl text-cyan-100 mb-8">
              Be part of a global community working to make cities smarter and communities stronger.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-cyan-400 text-slate-900 font-bold rounded-lg hover:bg-emerald-400 transition-colors duration-300"
            >
              Be a part of change!!
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}