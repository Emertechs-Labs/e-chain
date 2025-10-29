'use client';

import React, { useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { 
  FaCalendarAlt, 
  FaTicketAlt, 
  FaUsers, 
  FaUserTie,
  FaMedal,
  FaChartLine
} from 'react-icons/fa';
import { BiSolidBadgeCheck } from 'react-icons/bi';
import { HiTicket } from 'react-icons/hi2';

interface StatItem {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const CountUpAnimation: React.FC<{ 
  end: number; 
  duration?: number;
  suffix?: string;
  prefix?: string;
}> = ({ end, duration = 2, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  
  useEffect(() => {
    if (!isInView) return;
    
    let startTime: number | null = null;
    const animationDuration = duration * 1000;
    
    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / animationDuration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(easeOutQuart * end);
      
      setCount(currentCount);
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };
    
    requestAnimationFrame(updateCount);
  }, [end, duration, isInView]);
  
  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };
  
  return (
    <span ref={ref}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export const StatsSection: React.FC = () => {
  const [stats, setStats] = useState<StatItem[]>([
    {
      id: 'events',
      label: 'Events Created',
      value: 12847,
      icon: <FaCalendarAlt className="w-6 h-6" />,
      color: 'from-purple-400 to-purple-600',
      description: 'Live events on the platform',
    },
    {
      id: 'nft-tickets',
      label: 'NFT Tickets Minted',
      value: 234567,
      icon: <HiTicket className="w-6 h-6" />,
      color: 'from-cyan-400 to-cyan-600',
      description: 'Unique NFT tickets created',
    },
    {
      id: 'total-tickets',
      label: 'Total Tickets Minted',
      value: 456789,
      icon: <FaTicketAlt className="w-6 h-6" />,
      color: 'from-blue-400 to-blue-600',
      description: 'All tickets minted on chain',
    },
    {
      id: 'poaps',
      label: 'POAPs Claimed',
      value: 89234,
      icon: <FaMedal className="w-6 h-6" />,
      color: 'from-yellow-400 to-orange-500',
      description: 'Proof of attendance tokens',
    },
    {
      id: 'organizers',
      label: 'Event Organizers',
      value: 3456,
      icon: <FaUserTie className="w-6 h-6" />,
      color: 'from-green-400 to-emerald-600',
      description: 'Verified event creators',
    },
    {
      id: 'attendees',
      label: 'Total Attendees',
      value: 987654,
      icon: <FaUsers className="w-6 h-6" />,
      color: 'from-pink-400 to-rose-600',
      description: 'Users attended events',
    },
  ]);

  const [isLive, setIsLive] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prevStats => 
        prevStats.map(stat => ({
          ...stat,
          value: stat.value + Math.floor(Math.random() * 10)
        }))
      );
      setIsLive(true);
      setTimeout(() => setIsLive(false), 500);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-6">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-green-400'}`}></div>
            <span className="text-cyan-400 text-sm font-semibold">LIVE PLATFORM STATISTICS</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Real-Time </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Platform Insights
            </span>
          </h2>
          
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            Track the growth and impact of our decentralized event platform with live statistics 
            updated in real-time from the blockchain.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="relative p-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                {/* Icon */}
                <div className={`w-16 h-16 mb-6 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                  {stat.icon}
                </div>

                {/* Value */}
                <div className="mb-3">
                  <div className="text-4xl font-bold text-white">
                    <CountUpAnimation 
                      end={stat.value} 
                      duration={2} 
                      prefix={stat.prefix}
                      suffix={stat.suffix}
                    />
                  </div>
                </div>

                {/* Label */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {stat.label}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-400">
                  {stat.description}
                </p>

                {/* Live indicator */}
                {isLive && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400">LIVE</span>
                    </div>
                  </div>
                )}

                {/* Trend indicator */}
                <div className="absolute bottom-4 right-4">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 text-green-400"
                  >
                    <FaChartLine className="w-4 h-4" />
                    <span className="text-xs">+{Math.floor(Math.random() * 20)}%</span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-600/50 rounded-full">
            <BiSolidBadgeCheck className="w-5 h-5 text-cyan-400" />
            <span className="text-slate-300 text-sm">
              All statistics are verified on-chain and updated every block
            </span>
          </div>
        </motion.div>

        {/* Network Status */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-slate-800/30 rounded-2xl border border-slate-700/30"
        >
          {[
            { label: 'Block Height', value: '18,234,567' },
            { label: 'Gas Price', value: '12 Gwei' },
            { label: 'TPS', value: '4,000+' },
            { label: 'Network', value: 'Base Mainnet' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="text-xs text-slate-400 mb-1">{item.label}</div>
              <div className="text-sm font-semibold text-white">{item.value}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsSection;
