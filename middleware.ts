import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { JWTPayload } from "./lib/jwt";

export function middleware(request: NextRequest) {
  const userNavigatingRoute = request.nextUrl.pathname;
  const token = request.cookies.get("session_token");

  let session: JWTPayload | null = null;
  if (token && token.value) {
    session = jwtDecode<JWTPayload>(token.value);
  }

  if (session) {
    if (userNavigatingRoute.match(/^\/auth\/[^/]+\/(login|signup)$/)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (userNavigatingRoute.startsWith("/admin") && session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (
      userNavigatingRoute.startsWith("/instructor") &&
      session.role !== "instructor"
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (userNavigatingRoute.startsWith("/auth/")) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/auth/:role*"],
};
