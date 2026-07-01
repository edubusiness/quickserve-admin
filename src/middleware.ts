import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Route protection: every page requires an authenticated session except the
 * login screen, NextAuth's own API routes, and static assets. Unauthenticated
 * users are redirected to /login with a callback back to their target page.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuth = !!req.auth;
  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/icon.svg";

  if (isPublic) return NextResponse.next();

  if (!isAuth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
