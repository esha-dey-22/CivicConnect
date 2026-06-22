"use client";
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle, MapPin } from 'lucide-react';
import { useState } from 'react';

const Track = () => {
  const [issues] = useState([
    {
      id: 1,
      title: 'Pothole on Main Street',
      location: 'Main Street, Downtown',
      status: 'resolved',
      date: '2025-02-20',
      progress: 100,
    },
    {
      id: 2,
      title: 'Street Light Malfunction',
      location: 'Park Avenue',
      status: 'in-progress',
      date: '2025-02-25',
      progress: 60,
    },
    {
      id: 3,
      title: 'Water Leak',
      location: 'Oak Street',
      status: 'pending',
      date: '2025-02-26',
      progress: 20,
    },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return 'bg-indigo-500/20 border-indigo-500/50';
      case 'in-progress':
        return 'bg-yellow-500/20 border-yellow-500/50';
      case 'pending':
        return 'bg-red-500/20 border-red-500/50';
      default:
        return 'bg-gray-500/20 border-gray-500/50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="text-indigo-400" size={24} />;
      case 'in-progress':
        return <Clock className="text-yellow-400" size={24} />;
      case 'pending':
        return <AlertCircle className="text-red-400" size={24} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-indigo-900 to-slate-900 pt-24 sm:pt-20">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="mb-4 text-3xl font-bold text-indigo-400 sm:text-5xl md:text-6xl">📊 Track Issues</h1>
          <p className="text-base text-gray-200 sm:text-xl">Monitor the status of reported issues in your community</p>
        </motion.div>

        <div className="space-y-6">
          {issues.map((issue, index) => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card border-l-4 border-indigo-500 ${getStatusColor(issue.status)}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
                <div className="shrink-0">{getStatusIcon(issue.status)}</div>
                <div className="flex-1">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="mb-2 text-xl font-semibold text-white sm:text-2xl">{issue.title}</h3>
                      <p className="flex items-center gap-2 text-gray-300">
                        <MapPin size={16} />
                        {issue.location}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">Reported on {issue.date}</p>
                    </div>
                    <span className={`ml-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold capitalize sm:ml-4 ${
                      issue.status === 'resolved' ? 'bg-indigo-500/30 text-indigo-300' :
                      issue.status === 'in-progress' ? 'bg-yellow-500/30 text-yellow-300' :
                      'bg-red-500/30 text-red-300'
                    }`}>
                      {issue.status.replace('-', ' ')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-700/30 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="bg-linear-to-r from-indigo-400 to-indigo-600 h-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${issue.progress}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-gray-300">{issue.progress}% Complete</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Track;
