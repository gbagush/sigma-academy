import { NextResponse, userAgent } from "next/server";
import type { NextRequest } from "next/server";
// import { verifyTokenFromRequest } from "./lib/jwt";

export function middleware(request: NextRequest) {
  console.log("middleware running!");

  const userNavigatingRoute = request.nextUrl.pathname;

  // const session = verifyTokenFromRequest(request);

  // console.log(session);

  // if (session && session.decoded) {
  //   if (
  //     userNavigatingRoute.startsWith("/admin") &&
  //     session.decoded.role !== "admin"
  //   ) {
  //     return NextResponse.redirect(new URL("/not-found", request.url));
  //   }
  // }

  console.log(userNavigatingRoute);

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
