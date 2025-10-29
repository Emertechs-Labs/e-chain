'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  SiEthereum, 
  SiPolkadot,
  SiChainlink,
  SiBinance 
} from 'react-icons/si';
import { 
  FaShieldAlt, 
  FaNetworkWired, 
  FaCoins,
  FaCube 
} from 'react-icons/fa';

export const BlockchainSection: React.FC = () => {
  const blockchains = [
    {
      name: 'Base',
      description: 'Primary Network',
      icon: <FaCube className="w-8 h-8" />,
      color: 'from-blue-400 to-blue-600',
      isPrimary: true,
    },
    {
      name: 'Ethereum',
      description: 'Layer 1',
      icon: <SiEthereum className="w-8 h-8" />,
      color: 'from-slate-400 to-slate-600',
    },
    {
      name: 'Polygon',
      description: 'Scaling Solution',
      icon: <FaNetworkWired className="w-8 h-8" />,
      color: 'from-purple-400 to-purple-600',
    },
    {
      name: 'Arbitrum',
      description: 'Layer 2',
      icon: <FaShieldAlt className="w-8 h-8" />,
      color: 'from-cyan-400 to-cyan-600',
    },
    {
      name: 'Optimism',
      description: 'Layer 2',
      icon: <FaCoins className="w-8 h-8" />,
      color: 'from-red-400 to-red-600',
    },
  ];

  const features = [
    {
      title: 'Cross-Chain Compatible',
      description: 'Seamless transactions across multiple blockchain networks',
      icon: <FaNetworkWired className="w-6 h-6" />,
    },
    {
      title: 'Low Transaction Fees',
      description: 'Optimized for cost-effective ticket purchases and transfers',
      icon: <FaCoins className="w-6 h-6" />,
    },
    {
      title: 'Enterprise Security',
      description: 'Industry-leading security protocols and smart contract audits',
      icon: <FaShieldAlt className="w-6 h-6" />,
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent_50%)]"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
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
          <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-6">
            <span className="text-blue-400 text-sm font-semibold">BLOCKCHAIN INFRASTRUCTURE</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Powered by Base
            </span>
            <span className="text-white"> & Leading Chains</span>
          </h2>
          
          <p className="text-slate-400 text-lg max-w-3xl mx-auto">
            Built on the most reliable and innovative blockchain networks, ensuring fast, 
            secure, and cost-effective transactions for millions of users worldwide.
          </p>
        </motion.div>

        {/* Blockchain Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-16"
        >
          {blockchains.map((chain, index) => (
            <motion.div
              key={chain.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative group ${chain.isPrimary ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <div className={`
                relative p-6 rounded-xl border transition-all duration-300
                ${chain.isPrimary 
                  ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/20' 
                  : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600/50'
                }
                hover:scale-105 hover:shadow-xl
              `}>
                {chain.isPrimary && (
                  <div className="absolute -top-3 -right-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full">
                      PRIMARY
                    </span>
                  </div>
                )}
                
                <div className={`
                  w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center
                  bg-gradient-to-br ${chain.color} text-white
                `}>
                  {chain.icon}
                </div>
                
                <h3 className="text-white font-semibold text-center mb-1">
                  {chain.name}
                </h3>
                
                <p className="text-slate-400 text-xs text-center">
                  {chain.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8 mt-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400">
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Base Partnership Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-2xl">
            <FaCube className="w-8 h-8 text-blue-400" />
            <div className="text-left">
              <p className="text-slate-400 text-sm">Official Partner</p>
              <p className="text-white font-bold text-lg">Powered by Base</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {[
            { value: '5+', label: 'Blockchain Networks' },
            { value: '<1s', label: 'Transaction Speed' },
            { value: '$0.01', label: 'Average Gas Fee' },
            { value: '99.9%', label: 'Uptime' },
          ].map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default BlockchainSection;
