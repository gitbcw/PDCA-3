import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * 扩展 Session 类型，添加用户 ID
   */
  interface Session {
    user?: {
      id: string;
    } & DefaultSession["user"];
  }

  /**
   * 扩展 User 类型，添加用户 ID
   */
  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * 扩展 JWT 类型，添加用户 ID
   */
  interface JWT {
    id: string;
  }
}
