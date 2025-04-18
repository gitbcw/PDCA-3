"use client";

import { cn } from "@/utils/cn";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Home,
  ClipboardList,
  BarChart2,
  Settings,
  BookOpen,
  Calendar,
  Users,
  Lightbulb,
  Menu,
  X,
  Database,
  Target,
  MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";
import { toast } from "sonner";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

const SidebarLink = ({ href, icon, children, onClick }: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
      )}
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
};

export function Sidebar() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // 添加调试日志
  useEffect(() => {
    console.log("Sidebar - Auth state:", { isAuthenticated, isLoading, userId: user?.id });
  }, [isAuthenticated, isLoading, user]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={toggleSidebar}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-background border-r border-border transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">PDCA 助手</h2>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="space-y-1 flex-1">
            <SidebarLink href="/" icon={<Home className="h-5 w-5" />} onClick={closeSidebar}>
              首页
            </SidebarLink>

            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-medium text-muted-foreground">PDCA 循环</p>
            </div>

            <SidebarLink href="/plan" icon={<ClipboardList className="h-5 w-5" />} onClick={closeSidebar}>
              计划 (Plan)
            </SidebarLink>
            <SidebarLink href="/goal-chat" icon={<MessageSquare className="h-5 w-5" />} onClick={closeSidebar}>
              目标对话
            </SidebarLink>
            <SidebarLink href="/do" icon={<Calendar className="h-5 w-5" />} onClick={closeSidebar}>
              执行 (Do)
            </SidebarLink>
            <SidebarLink href="/check" icon={<BarChart2 className="h-5 w-5" />} onClick={closeSidebar}>
              检查 (Check)
            </SidebarLink>
            <SidebarLink href="/act" icon={<Lightbulb className="h-5 w-5" />} onClick={closeSidebar}>
              改进 (Act)
            </SidebarLink>

            <div className="pt-4 pb-2">
              <p className="px-3 text-xs font-medium text-muted-foreground">更多功能</p>
            </div>

            <SidebarLink href="/examples" icon={<BookOpen className="h-5 w-5" />} onClick={closeSidebar}>
              示例
            </SidebarLink>
            <SidebarLink href="/team" icon={<Users className="h-5 w-5" />} onClick={closeSidebar}>
              团队
            </SidebarLink>
            <SidebarLink href="/settings" icon={<Settings className="h-5 w-5" />} onClick={closeSidebar}>
              设置
            </SidebarLink>
            <SidebarLink href="/admin/database" icon={<Database className="h-5 w-5" />} onClick={closeSidebar}>
              数据库
            </SidebarLink>
          </nav>

          <div className="pt-4 border-t">
            {isAuthenticated && (
              <div className="px-3 py-2 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{user?.name || user?.email}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      signOut({ redirect: true, callbackUrl: "/login" });
                      toast.success("已成功登出");
                    }}
                  >
                    登出
                  </Button>
                </div>
              </div>
            )}
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">© 2024 PDCA 助手</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}
