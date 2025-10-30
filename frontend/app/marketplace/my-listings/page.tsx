"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDistanceToNow } from 'date-fns';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { Loader2, AlertCircle, Check, RefreshCw, PlusCircle } from "lucide-react";
import { useUserListings, useCancelMarketplaceListing } from "../../hooks/useMarketplace";
import { useWalletHelpers } from "@polymathuniversata/echain-wallet/hooks";

export const dynamic = 'force-dynamic';

export default function MyListingsPage() {
  const { address, isConnected } = useAccount();
  const { connectWallet, formatEth, formatAddress } = useWalletHelpers();
  const { data: myListings, isLoading, refetch } = useUserListings();
  const { mutateAsync: cancelListing, isPending } = useCancelMarketplaceListing();
  
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  
  // Handle listing cancellation
  const handleCancelListing = async (listingId: string) => {
    try {
      setCancelingId(listingId);
      await cancelListing(listingId);
      toast.success("Listing cancelled successfully");
      refetch();
    } catch (error: any) {
      console.error("Error cancelling listing:", error);
      toast.error(error.message || "Failed to cancel listing");
    } finally {
      setCancelingId(null);
    }
  };
  
  // If not connected, show connect prompt
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-900">
        <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">My Listings</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Manage your marketplace listings
            </p>
          </div>
        </section>
        
        <section className="py-16 bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center py-16 bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700">
                <div className="text-6xl mb-6">🔐</div>
                <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
                <p className="text-gray-400 mb-8">Connect your wallet to view your listings</p>
                <Button
                  onClick={connectWallet}
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold"
                >
                  Connect Wallet
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <section className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 mb-6 text-cyan-400">
            <span className="text-purple-400">📋</span>
            <span className="text-sm font-medium">Seller Dashboard</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">My Listings</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Manage your active marketplace listings
          </p>
        </div>
      </section>

      {/* Listings Section */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/" className="text-gray-400 hover:text-white">Home</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/marketplace" className="text-gray-400 hover:text-white">Marketplace</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbPage className="text-white">My Listings</BreadcrumbPage>
                </BreadcrumbList>
              </Breadcrumb>
              
              <div className="flex gap-3">
                <Button 
                  variant="outlined"
                  className="border-slate-700 text-white hover:bg-slate-800"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                
                <Link href="/marketplace/create">
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Listing
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Listings Grid */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 animate-spin text-cyan-400 mb-4" />
                <p className="text-gray-400">Loading your listings...</p>
              </div>
            ) : !myListings || myListings.length === 0 ? (
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700 p-16 text-center">
                <div className="text-6xl mb-6">🎫</div>
                <h2 className="text-2xl font-bold text-white mb-4">No Active Listings</h2>
                <p className="text-gray-400 mb-8">You don&apos;t have any active listings on the marketplace.</p>
                <Link href="/marketplace/create" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 font-semibold">
                  <Button>
                    List a Ticket
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((listing) => (
                  <Card key={listing.id} className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border-b border-slate-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">{listing.eventName}</CardTitle>
                          <CardDescription className="text-gray-400">
                            {listing.ticketType} · Token #{listing.tokenId}
                          </CardDescription>
                        </div>
                        <div className="bg-cyan-500/20 text-cyan-300 text-sm font-medium py-1 px-3 rounded-full">
                          {formatEth(listing.price)} ETH
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-4">
                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Event Date:</span>
                          <span className="text-white">{new Date(listing.eventDate * 1000).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Location:</span>
                          <span className="text-white">{listing.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Listed:</span>
                          <span className="text-white">{formatDistanceToNow(new Date(listing.listedAt * 1000), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </CardContent>
                    
                    <CardFooter className="border-t border-slate-700 pt-4">
                      <Button
                        variant="outlined"
                        className="w-full"
                        onClick={() => handleCancelListing(listing.id)}
                        disabled={cancelingId === listing.id || isPending}
                      >
                        {cancelingId === listing.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          "Cancel Listing"
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
      
      {/* Info Section */}
      <section className="py-16 bg-slate-800/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Marketplace Listing Management</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-3">About Listings</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex gap-2">
                    <svg className="h-6 w-6 text-cyan-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Your listings are active until sold or cancelled</span>
                  </li>
                  <li className="flex gap-2">
                    <svg className="h-6 w-6 text-cyan-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>When a ticket sells, you receive payment automatically</span>
                  </li>
                  <li className="flex gap-2">
                    <svg className="h-6 w-6 text-cyan-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>A 2.5% fee is charged on successful sales</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-3">Managing Listings</h3>
                <ul className="space-y-2 text-gray-400">
                  <li className="flex gap-2">
                    <svg className="h-6 w-6 text-cyan-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>You can cancel a listing at any time</span>
                  </li>
                  <li className="flex gap-2">
                    <svg className="h-6 w-6 text-cyan-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>To change the price, cancel and create a new listing</span>
                  </li>
                  <li className="flex gap-2">
                    <svg className="h-6 w-6 text-cyan-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Refresh the page to see the latest status</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}