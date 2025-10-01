/**
 * Example Component Using Contract Hooks with Fallback
 * 
 * This demonstrates real-world usage of the contract hooks
 * with automatic MultiBaas → Direct fallback.
 */

'use client';

import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useContractRead, useContractWrite, useContractSimulate, useMultiBaasHealth } from '@/lib/contract-hooks';
import { parseEther, formatEther } from 'viem';

/**
 * EXAMPLE 1: Event Details Component
 * Reads event data with automatic fallback
 */
export function EventDetails({ eventId }: { eventId: bigint }) {
  const { data, isLoading, error, refetch } = useContractRead(
    'EventFactory',
    'events',
    [eventId],
    {
      enabled: true,
      refetchInterval: 10000, // Auto-refresh every 10 seconds
      useMultiBaas: true, // Try MultiBaas first
    }
  );

  if (isLoading) {
    return <div className="animate-pulse">Loading event details...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        <p>Error loading event: {error.message}</p>
        <button onClick={refetch} className="btn-primary mt-2">
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <div>Event not found</div>;
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold">{data.name}</h2>
      <p className="text-gray-600">{data.description}</p>
      <div className="mt-4">
        <p><strong>Location:</strong> {data.location}</p>
        <p><strong>Start:</strong> {new Date(Number(data.startTime) * 1000).toLocaleString()}</p>
        <p><strong>End:</strong> {new Date(Number(data.endTime) * 1000).toLocaleString()}</p>
        <p><strong>Price:</strong> {formatEther(data.ticketPrice)} ETH</p>
        <p><strong>Max Tickets:</strong> {data.maxTickets.toString()}</p>
      </div>
      <button onClick={refetch} className="btn-secondary mt-4">
        Refresh
      </button>
    </div>
  );
}

/**
 * EXAMPLE 2: Ticket Purchase Component
 * Writes to contract with simulation and confirmation
 */
export function TicketPurchase({ eventId, ticketPrice }: { eventId: bigint; ticketPrice: bigint }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [quantity, setQuantity] = useState(1);

  // Simulate the purchase before executing
  const { simulate, isPending: isSimulating, error: simulateError } = useContractSimulate(
    'EventTicket',
    'purchaseTickets'
  );

  // Execute the actual purchase
  const {
    write,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    txHash,
    reset,
  } = useContractWrite('EventTicket', 'purchaseTickets', {
    waitForConfirmation: true,
    onSuccess: (hash) => {
      console.log('Purchase successful!', hash);
      alert('Tickets purchased successfully!');
    },
    onError: (err) => {
      console.error('Purchase failed:', err);
      alert('Purchase failed: ' + err.message);
    },
  });

  const handlePurchase = async () => {
    try {
      const totalCost = ticketPrice * BigInt(quantity);

      // First, simulate the transaction
      console.log('Simulating purchase...');
      await simulate([eventId, BigInt(quantity)], totalCost);
      console.log('Simulation passed!');

      // If simulation succeeds, execute the actual purchase
      await write([eventId, BigInt(quantity)], totalCost);
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="card">
        <p>Connect your wallet to purchase tickets</p>
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => connect({ connector })}
            className="btn-primary mt-2"
          >
            Connect {connector.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-xl font-bold mb-4">Purchase Tickets</h3>
      
      <div className="mb-4">
        <label className="block mb-2">
          Quantity:
          <input
            type="number"
            min="1"
            max="10"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="input ml-2"
            disabled={isPending || isConfirming}
          />
        </label>
        <p className="text-sm text-gray-600 mt-1">
          Total: {formatEther(ticketPrice * BigInt(quantity))} ETH
        </p>
      </div>

      {simulateError && (
        <div className="text-red-500 mb-4">
          <p className="text-sm">Simulation failed: {simulateError.message}</p>
        </div>
      )}

      {error && (
        <div className="text-red-500 mb-4">
          <p className="text-sm">Error: {error.message}</p>
        </div>
      )}

      {txHash && (
        <div className="mb-4">
          <p className="text-sm text-green-600">
            Transaction: {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handlePurchase}
          disabled={isPending || isConfirming || isSimulating}
          className="btn-primary"
        >
          {isSimulating && 'Simulating...'}
          {isPending && 'Confirm in wallet...'}
          {isConfirming && 'Confirming...'}
          {!isPending && !isConfirming && !isSimulating && 'Purchase'}
        </button>

        {isConfirmed && (
          <button onClick={reset} className="btn-secondary">
            Purchase More
          </button>
        )}
      </div>

      {isConfirmed && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 font-semibold">✓ Purchase Confirmed!</p>
          <p className="text-sm text-green-600">You now own {quantity} ticket(s)</p>
        </div>
      )}
    </div>
  );
}

/**
 * EXAMPLE 3: Create Event Component
 * Complex form with multiple inputs
 */
export function CreateEvent() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    ticketPrice: '',
    maxTickets: '',
  });

  const { write, isPending, isConfirming, isConfirmed, error, txHash } = useContractWrite(
    'EventFactory',
    'createEvent',
    {
      waitForConfirmation: true,
      onSuccess: (hash) => {
        console.log('Event created!', hash);
        // Reset form
        setFormData({
          name: '',
          symbol: '',
          description: '',
          location: '',
          startTime: '',
          endTime: '',
          ticketPrice: '',
          maxTickets: '',
        });
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const args = [
        formData.name,
        formData.symbol,
        formData.description,
        formData.location,
        BigInt(Math.floor(new Date(formData.startTime).getTime() / 1000)),
        BigInt(Math.floor(new Date(formData.endTime).getTime() / 1000)),
        parseEther(formData.ticketPrice),
        BigInt(formData.maxTickets),
      ];

      await write(args);
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card max-w-2xl">
      <h2 className="text-2xl font-bold mb-4">Create New Event</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Event Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="input w-full"
        />

        <input
          type="text"
          placeholder="Symbol (e.g., ETH2024)"
          value={formData.symbol}
          onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          required
          className="input w-full"
        />

        <textarea
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="input w-full h-24"
        />

        <input
          type="text"
          placeholder="Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          required
          className="input w-full"
        />

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium">Start Time</span>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              required
              className="input"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">End Time</span>
            <input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              required
              className="input"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            step="0.001"
            placeholder="Ticket Price (ETH)"
            value={formData.ticketPrice}
            onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
            required
            className="input"
          />
          <input
            type="number"
            placeholder="Max Tickets"
            value={formData.maxTickets}
            onChange={(e) => setFormData({ ...formData, maxTickets: e.target.value })}
            required
            className="input"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 mt-4">
          Error: {error.message}
        </div>
      )}

      {txHash && (
        <div className="text-green-600 mt-4">
          Transaction: {txHash}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || isConfirming}
        className="btn-primary mt-6 w-full"
      >
        {isPending && 'Confirm in wallet...'}
        {isConfirming && 'Creating event...'}
        {!isPending && !isConfirming && 'Create Event'}
      </button>

      {isConfirmed && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-700 font-semibold">✓ Event Created!</p>
        </div>
      )}
    </form>
  );
}

/**
 * EXAMPLE 4: System Health Monitor
 * Shows current fallback status
 */
export function SystemHealth() {
  const { isHealthy, isChecking, checkHealth } = useMultiBaasHealth(30000); // Check every 30s

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-2">System Status</h3>
      
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          isHealthy === null ? 'bg-gray-400' :
          isHealthy ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span>
          MultiBaas: {
            isChecking ? 'Checking...' :
            isHealthy === null ? 'Unknown' :
            isHealthy ? 'Online' : 'Offline (using fallback)'
          }
        </span>
      </div>

      <button onClick={checkHealth} className="btn-secondary mt-2">
        Check Now
      </button>
    </div>
  );
}

/**
 * EXAMPLE 5: Ticket Balance Display
 * Shows user's ticket balance with auto-refresh
 */
export function MyTickets({ eventId }: { eventId: bigint }) {
  const { address } = useAccount();

  const { data: balance, isLoading } = useContractRead(
    address ? 'EventTicket' : null,
    address ? 'balanceOf' : null,
    address ? [address, eventId] : [],
    {
      enabled: !!address,
      refetchInterval: 5000, // Refresh every 5 seconds
    }
  );

  if (!address) {
    return <div>Connect wallet to see your tickets</div>;
  }

  if (isLoading) {
    return <div>Loading balance...</div>;
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold">My Tickets</h3>
      <p className="text-3xl font-bold text-blue-600 mt-2">
        {balance?.toString() || '0'}
      </p>
    </div>
  );
}
