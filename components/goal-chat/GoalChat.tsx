"use client";

import { useChat } from "ai/react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { LoaderCircle, SendIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Goal } from "@prisma/client";

interface GoalChatProps {
  userId: string;
  onGoalExtracted: (goal: Partial<Goal>) => void;
}

export function GoalChat({ userId, onGoalExtracted }: GoalChatProps) {
  const chat = useChat({
    api: "/api/chat/goal",
    body: {
      userId,
    },
    onResponse(response) {
      // 检查响应头中是否包含提取的目标数据
      const goalHeader = response.headers.get("x-extracted-goal");
      if (goalHeader) {
        try {
          const extractedGoal = JSON.parse(
            Buffer.from(goalHeader, "base64").toString("utf8")
          );
          onGoalExtracted(extractedGoal);
        } catch (e) {
          console.error("Failed to parse extracted goal:", e);
        }
      }
    },
    onError: (e) =>
      toast.error(`对话出错`, {
        description: e.message,
      }),
  });

  // 初始化系统消息
  useEffect(() => {
    if (chat.messages.length === 0) {
      chat.setMessages([
        {
          id: "system-1",
          content: 
            "我是你的目标规划助手。我可以帮助你制定、分解和管理目标。" +
            "请告诉我你想要达成的目标，我会引导你完善它，并帮助你将其分解为可行的步骤。" +
            "你可以从描述你的愿景开始，或者直接告诉我一个具体的目标。",
          role: "assistant",
        },
      ]);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center mb-1">
                  <span className="mr-2">🎯</span>
                  <span className="font-semibold">目标助手</span>
                </div>
              )}
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}
        {chat.isLoading && (
          <div className="flex justify-center">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            chat.handleSubmit(e);
          }}
          className="flex space-x-2"
        >
          <Textarea
            value={chat.input}
            onChange={chat.handleInputChange}
            placeholder="描述你的目标..."
            className="flex-1 min-h-[80px] resize-none"
          />
          <Button type="submit" disabled={chat.isLoading || !chat.input.trim()}>
            <SendIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
