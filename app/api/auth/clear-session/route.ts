import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // 创建响应对象
  const response = NextResponse.json(
    { success: true, message: "Session cookies cleared" },
    { status: 200 }
  );
  
  // 清除所有与 NextAuth.js 相关的 cookie
  response.cookies.delete("next-auth.session-token");
  response.cookies.delete("next-auth.callback-url");
  response.cookies.delete("next-auth.csrf-token");
  
  // 清除其他可能的会话 cookie
  response.cookies.delete("__Secure-next-auth.session-token");
  response.cookies.delete("__Secure-next-auth.callback-url");
  response.cookies.delete("__Secure-next-auth.csrf-token");
  
  return response;
}
