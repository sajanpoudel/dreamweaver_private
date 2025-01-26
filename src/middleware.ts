import { withAuth } from "next-auth/middleware";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Protect routes that require authentication
export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
});

// Additional middleware for API routes and uploads
export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip auth check for auth-related routes and session
  if (pathname.startsWith('/auth/') || pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  // Handle authentication for other API routes
  if (pathname.startsWith('/api/')) {
    // Skip auth for public endpoints
    if (pathname.startsWith('/api/public/')) {
      return NextResponse.next();
    }

    const token = await getToken({ req: request as any });
    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  // Allow access to all image URLs
  if (pathname.startsWith('/uploads/') || 
      pathname.startsWith('/_next/image') || 
      pathname.includes('.blob.core.windows.net')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/feed/:path*',
    '/profile/:path*',
    '/dreams/:path*',
    '/communities/:path*',
    '/uploads/:path*',
    '/_next/image:path*',
    '/((?!auth|_next/static|_next/image|favicon.ico).*)',
  ],
}; 