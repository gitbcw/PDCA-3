"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { GoalChatLayout } from "@/components/goal-chat/GoalChatLayout";
import { GoalChat } from "@/components/goal-chat/GoalChat";
import { GoalVisualization } from "@/components/goal-chat/GoalVisualization";
import { Goal } from "@prisma/client";

export default function GoalChatPage() {
  const { data: session, status } = useSession();
  const [extractedGoal, setExtractedGoal] = useState<Partial<Goal> | null>(null);

  // 如果用户未登录，重定向到登录页面
  if (status === "unauthenticated") {
    redirect("/login?callbackUrl=/goal-chat");
  }

  // 如果会话正在加载，显示加载状态
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const userId = session?.user?.id;

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">无法获取用户信息</h2>
          <p className="mt-2">请尝试重新登录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">目标对话</h1>
        <p className="text-muted-foreground mt-1">
          与AI助手对话，制定和管理你的目标
        </p>
      </div>

      <GoalChatLayout
        chatComponent={
          <GoalChat 
            userId={userId} 
            onGoalExtracted={(goal) => setExtractedGoal(goal)} 
          />
        }
        visualizationComponent={
          <GoalVisualization 
            userId={userId} 
            extractedGoal={extractedGoal} 
          />
        }
      />
    </div>
  );
}
