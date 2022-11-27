import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    /*
     * The way you configure your matcher items depend on your route structure.
     * E.g. if you decide to put all your posts under `/posts/[postSlug]`,
     * you'll need to add an extra matcher item "/posts/:path*".
     * The reason we do this is to prevent the middleware from matching absolute paths
     * like "demo.vercel.pub/_sites/steven" and have the content from `steven` be served.
     *
     * Here's a breakdown of each matcher item:
     * 1. "/"               - Matches the root path of the site.
     * 2. "/([^/.]*)"       - Matches all first-level paths (e.g. demo.vercel.pub/platforms-starter-kit)
     *                        but exclude `/public` files by excluding paths containing `.` (e.g. /logo.png)
     * 3. "/site/:path*"    – for app.vercel.pub/site/[siteId]
     * 4. "/post/:path*"    – for app.vercel.pub/post/[postId]
     * 5. "/_sites/:path*"  – for all custom hostnames under the `/_sites/[site]*` dynamic route (demo.vercel.pub, platformize.co)
     *                        we do this to make sure "demo.vercel.pub/_sites/steven" is not matched and throws a 404.
     */
    "/",
    "/([^/.]*)",
    "/site/:path*",
    "/post/:path*",
    "/_sites/:path*",
  ],
};

export default function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
  const hostname = req.headers.get("host") || "www.anisimovv.agency";

  /*  You have to replace ".vercel.pub" with your own domain if you deploy this example under your domain.
      You can also use wildcard subdomains on .vercel.app links that are associated with your Vercel team slug
      in this case, our team slug is "platformize", thus *.platformize.vercel.app works. Do note that you'll
      still need to add "*.platformize.vercel.app" as a wildcard domain on your Vercel dashboard. */
  const currentHost =
    process.env.NODE_ENV === "production" && process.env.VERCEL === "1"
      ? hostname.replace(`.anisimovv.agency`, "")
      : hostname.replace(`.localhost:3000`, "");

  // rewrites for app pages
  if (currentHost == "app") {
    if (
      url.pathname === "/login" &&
      (req.cookies.get("next-auth.session-token") ||
        req.cookies.get("__Secure-next-auth.session-token"))
    ) {
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    url.pathname = `/app${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  // rewrite root application to `/home` folder
  if (hostname === "localhost:3000" || hostname === "anisimovv.agency") {
    url.pathname = `/home${url.pathname}`;

    return NextResponse.rewrite(url);
  }

  // rewrite everything else to `/_sites/[site] dynamic route
  url.pathname = `/_sites/${currentHost}${url.pathname}`;
  return NextResponse.rewrite(url);
}
