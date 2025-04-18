"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function useAuth() {
  const { data: session, status } = useSession();

  // 添加调试日志
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("useAuth hook - Session status:", status);
      console.log("useAuth hook - Session data:", session);
    }
  }, [session, status]);

  return {
    user: session?.user,
    userId: session?.user?.id,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
}
