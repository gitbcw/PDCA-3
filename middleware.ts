import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// NextAuth.js 密钥，必须与 .env 文件中的 NEXTAUTH_SECRET 一致
const secret = process.env.NEXTAUTH_SECRET || "pdca3-nextauth-secret-key-do-not-change";

// 打印当前使用的密钥（仅在开发环境中）
if (process.env.NODE_ENV === "development") {
  console.log("Middleware using secret:", secret);
}

// 不需要认证的路由
const publicRoutes = ["/login", "/api/auth", "/_next", "/favicon.ico", "/images"];

// 静态资源路径
const staticPaths = ["/images", "/_next", "/favicon.ico"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 添加调试日志
  console.log("Middleware checking path:", pathname);

  // 检查是否是静态资源
  if (staticPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 检查是否是公共路由
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 获取用户令牌，使用正确的密钥
  let token;
  try {
    token = await getToken({
      req: request,
      secret: secret,
      secureCookie: process.env.NODE_ENV === "production"
    });
    console.log("Middleware token:", token ? "Found" : "Not found");
    if (token) {
      console.log("Authenticated user:", token.email || token.name || token.id);
    }
  } catch (error) {
    console.error("Error getting token in middleware:", error);
    token = null;
  }

  // 检查是否是API路由（除了auth API）
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth")) {
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    return NextResponse.next();
  }

  // 检查是否已认证
  if (!token) {
    console.log("User not authenticated, redirecting to login");
    const url = new URL("/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  console.log("User authenticated, proceeding to", pathname);

  return NextResponse.next();
}

// 配置中间件匹配的路由
export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - 静态文件（如图片、JS、CSS等）
     * - _next（Next.js内部路由）
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|_next/data|favicon.ico|images).*)(.+)",
  ],
};
