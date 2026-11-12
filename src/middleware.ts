import { NextResponse, type NextRequest } from "next/server";

const publicAdminPrefixes = [
  "/admin/login",
  "/admin/setup",
  "/admin/forgot-password",
  "/admin/reset-password",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isPublicAdminRoute = publicAdminPrefixes.some((prefix) =>
      pathname.startsWith(prefix),
    );

    const sessionCookie =
      request.cookies.get("authjs.session-token")?.value ||
      request.cookies.get("__Secure-authjs.session-token")?.value;

    // Unauthenticated user attempting to access protected dashboard routes
    if (!sessionCookie && !isPublicAdminRoute) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
