import { auth } from "@/auth";

export default auth((request) => {
  if (!request.auth && request.nextUrl.pathname.startsWith("/admin")) {
    const signInUrl = new URL("/admin/login", request.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return Response.redirect(signInUrl);
  }

  return undefined;
});

export const config = {
  matcher: ["/admin/:path*"]
};
