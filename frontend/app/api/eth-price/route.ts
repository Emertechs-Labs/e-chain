import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch ETH price from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
        headers: {
          'User-Agent': 'Echain-App/1.0'
        }
      }
    );

    if (!response.ok) {
      console.warn('CoinGecko API failed, using fallback price');
      // Fallback to a reasonable ETH price if API fails
      const fallbackPrice = 2500; // $2500 per ETH
      return NextResponse.json({
        ethPrice: fallbackPrice,
        ethAmountForOneDollar: 1 / fallbackPrice,
        lastUpdated: new Date().toISOString(),
        source: 'fallback'
      });
    }

    const data = await response.json();
    const ethPrice = data.ethereum.usd;

    if (!ethPrice || typeof ethPrice !== 'number' || ethPrice <= 0) {
      console.warn('Invalid ETH price from API, using fallback');
      const fallbackPrice = 2500;
      return NextResponse.json({
        ethPrice: fallbackPrice,
        ethAmountForOneDollar: 1 / fallbackPrice,
        lastUpdated: new Date().toISOString(),
        source: 'fallback'
      });
    }

    // Calculate ETH amount needed for $1
    const ethAmountForOneDollar = 1 / ethPrice;

    return NextResponse.json({
      ethPrice,
      ethAmountForOneDollar,
      lastUpdated: new Date().toISOString(),
      source: 'coingecko'
    });
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    // Return fallback price on any error
    const fallbackPrice = 2500;
    return NextResponse.json({
      ethPrice: fallbackPrice,
      ethAmountForOneDollar: 1 / fallbackPrice,
      lastUpdated: new Date().toISOString(),
      source: 'error-fallback'
    });
  }
}