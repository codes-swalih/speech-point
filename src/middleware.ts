import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  
  // Manage route protection
  const isAuthenticated = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  const isAuthPage = path.startsWith("/auth");
  
  // Redirect authenticated users away from auth pages
  if (isAuthPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/app", req.url));
    }
    return NextResponse.next();
  }
  
  // Protect app routes
  if (path.startsWith("/app") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/auth/:path*"],
};