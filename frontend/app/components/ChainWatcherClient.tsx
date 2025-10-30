"use client";

import React from 'react';
import useChainWatcher from '../../app/hooks/useChainWatcher';

const ChainWatcherClient: React.FC = () => {
  // Start the chain watcher with default interval (10s)
  useChainWatcher(10_000);
  return null;
};

export default ChainWatcherClient;
