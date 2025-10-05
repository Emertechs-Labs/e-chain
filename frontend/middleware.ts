import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Create a response object from the incoming request
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Comprehensive Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' 'inline-speculation-rules' https://cdn.jsdelivr.net https://*.coinbase.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://localhost https://*.vercel.app;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' 
      https://sepolia.base.org 
      https://base.g.alchemy.com
      https://api.web3modal.com 
      https://*.web3modal.org 
      https://*.walletconnect.com 
      https://*.coinbase.com 
      https://*.walletconnect.org 
      https://*.bridge.walletconnect.org
      wss://*.bridge.walletconnect.org
      wss://*.walletconnect.org
      wss://*.walletconnect.com
      https://*.infura.io
      wss://*.infura.io
      https://*.pinata.cloud
      https://api.pinata.cloud
      https://gateway.pinata.cloud
      https://ipfs.io
    frame-src 'self' https://*.walletconnect.com https://*.coinbase.com;
    worker-src 'self' blob:;
    manifest-src 'self';
    media-src 'self';
  `.replace(/\s+/g, ' ').trim();
  
  response.headers.set('Content-Security-Policy', cspHeader)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}