import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sessionCookieName, verifySessionToken } from "@shared/auth/sessionToken";

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(sessionCookieName)?.value;
  if (!token) {
    const url = new URL("/auth", request.url);
    return NextResponse.redirect(url);
  }

  const session = await verifySessionToken(token);
  if (!session) {
    const url = new URL("/auth", request.url);
    return NextResponse.redirect(url);
  }

  if (!session.hasAcceptedTerms || !session.hasAcceptedPrivacy) {
    const url = new URL("/terms", request.url);
    return NextResponse.redirect(url);
  }

  if (session.role !== "ADMIN" && session.role !== "MODERATOR") {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
