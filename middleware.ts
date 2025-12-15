import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/app/_lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get("session")?.value;
  const session = await decrypt(sessionCookie);

  // 🚫 Not authenticated → block access to home
  if (!session?.userId && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Authenticated → block access to auth pages
  if (
    session?.userId &&
    (pathname === "/login" || pathname === "/create-account")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/create-account"],
};
