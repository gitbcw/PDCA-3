import NextAuth from "next-auth";
import type { NextAuthOptions, User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "../../../../app/generated/prisma";

// 创建 Prisma 客户端实例
const prisma = new PrismaClient();

// 添加调试日志
console.log("Created new PrismaClient instance in NextAuth API");

// 打印当前使用的密钥（仅在开发环境中）
if (process.env.NODE_ENV === "development") {
  console.log("NextAuth using secret:", process.env.NEXTAUTH_SECRET);
}

// 定义 NextAuth 配置
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          // 查找用户
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          // 简单密码比较（在生产环境中应使用哈希）
          const isPasswordValid = credentials.password === user.password;

          if (!isPasswordValid) {
            console.log("Invalid password for user:", credentials.email);
            return null;
          }

          console.log("User authenticated successfully:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split("@")[0],
          };
        } catch (error) {
          console.error("Error in authorize callback:", error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  session: { strategy: "jwt" as const },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }: { token: JWT, user?: User }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        console.log("JWT callback - Token created for user:", user.email);
      }
      return token;
    },
    async session({ session, token }: { session: Session, token: JWT }) {
      if (session.user) {
        session.user.id = token.id;
        console.log("Session callback - Session created for user:", session.user.email);
      }
      return session;
    },
    async redirect({ url, baseUrl }: { url: string, baseUrl: string }) {
      console.log("Redirect callback - URL:", url, "Base URL:", baseUrl);

      // 如果 URL 是相对路径，则将其转换为绝对路径
      if (url.startsWith("/")) {
        const absoluteUrl = `${baseUrl}${url.substring(1)}`;
        console.log("Converting relative URL to absolute:", absoluteUrl);
        return absoluteUrl;
      }

      // 如果 URL 已经是绝对路径，则直接返回
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // 否则返回基础 URL
      console.log("Redirecting to base URL:", baseUrl);
      return baseUrl;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
