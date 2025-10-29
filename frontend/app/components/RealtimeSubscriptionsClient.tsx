"use client";

import React from 'react';
import useRealtimeSubscriptions from '../hooks/useRealtimeSubscriptions';

const RealtimeSubscriptionsClient: React.FC = () => {
  useRealtimeSubscriptions();
  return null;
};

export default RealtimeSubscriptionsClient;
