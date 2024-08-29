import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default authMiddleware({
  afterAuth: (auth, req, evt) => {
    // Log the authentication object and request URL for debugging
    console.log('Auth Object:', auth);
    console.log('Request URL:', req.nextUrl.href);

    const url = req.nextUrl;

    // Allow access to the home page ('/'), sign-in page ('/sign-in'), and sign-up page ('/sign-up') even if not authenticated
    if (url.pathname === '/' || url.pathname === '/sign-in' || url.pathname === '/sign-up') {
      return NextResponse.next();
    }

    // Redirect to the sign-in page if the user is not authenticated and trying to access a protected route
    if (!auth.userId) {
      console.log('User not authenticated, redirecting to /sign-in');
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    // Allow access to other routes if authenticated
    console.log('User authenticated, allowing access');
    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
