"use client";
import { motion } from 'framer-motion';

const HeatMap = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 pt-24 sm:pt-20">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="mb-4 text-3xl font-bold text-indigo-400 sm:text-5xl md:text-6xl">🗺️ Issue Heatmap</h1>
          <p className="text-base text-gray-200 sm:text-xl">Visualize environmental issues across different regions</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card mb-12 flex h-[20rem] items-center justify-center sm:h-96"
        >
          <div className="text-center">
            <div className="mb-4 text-6xl sm:text-8xl">🗺️</div>
            <p className="text-xl text-gray-200 sm:text-2xl">Interactive map coming soon</p>
            <p className="text-gray-400 mt-2">See all reported environmental issues on an interactive map</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8"
        >
          {[
            { label: 'Total Issues', count: '1,234', color: 'text-red-400' },
            { label: 'Resolved', count: '987', color: 'text-indigo-400' },
            { label: 'Pending', count: '247', color: 'text-yellow-400' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              className="card text-center"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-gray-300 mb-3 text-lg font-medium">{stat.label}</p>
              <p className={`text-4xl font-bold sm:text-5xl ${stat.color}`}>{stat.count}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HeatMap;
