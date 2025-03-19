import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const publicRoutes = ["/user/login", "/user/register"];
export async function middleware(req: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");
  const refreshToken = cookieStore.get("refreshToken");
  if (req.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(new URL("/user/login/", req.url));
  }
  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  return NextResponse.next();
}
