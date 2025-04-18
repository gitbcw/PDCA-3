"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 在组件加载时清除会话
  useEffect(() => {
    // 清除会话 cookie
    const clearSession = async () => {
      try {
        await fetch('/api/auth/clear-session');
        console.log('Session cookies cleared');
      } catch (error) {
        console.error('Failed to clear session:', error);
      }
    };

    clearSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 获取URL中的callbackUrl参数
      const searchParams = new URLSearchParams(window.location.search);
      let callbackUrl = searchParams.get("callbackUrl") || "/";

      // 确保 callbackUrl 是一个有效的 URL 或者相对路径
      if (!callbackUrl.startsWith("/") && !callbackUrl.startsWith("http")) {
        callbackUrl = "/";
      }

      // 如果是完整的 URL，确保它是有效的
      if (callbackUrl.startsWith("http")) {
        try {
          new URL(callbackUrl);
        } catch (e) {
          console.error("Invalid callback URL, using default", e);
          callbackUrl = "/";
        }
      }

      console.log("Attempting to sign in with callback URL:", callbackUrl);

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        toast.error("登录失败，请检查邮箱和密码");
        console.error("Login error:", result.error);
      } else {
        toast.success("登录成功");
        console.log("Login successful, redirecting to:", callbackUrl);

        // 使用延时确保会话已完全建立
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 1000); // 增加延时时间
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("登录过程中发生错误");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">PDCA 助手</CardTitle>
          <CardDescription className="text-center">
            请登录以访问您的个人助手
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            这是一个个人助手应用，请使用您的凭据登录
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
