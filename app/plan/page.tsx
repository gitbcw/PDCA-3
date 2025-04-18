"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ListTodo, Target, Calendar } from "lucide-react";
import GoalManager from "@/components/plan/GoalManager";
import TaskManager from "@/components/plan/TaskManager";
import AiAssistant from "@/components/plan/AiAssistant";

export default function PlanPage() {
  const [activeTab, setActiveTab] = useState("goals");

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">计划 (Plan)</h1>
          <p className="text-muted-foreground mt-1">
            设定目标，分解任务，制定行动计划
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            时间线视图
          </Button>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            新建目标
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-3">
          <TabsTrigger value="goals">
            <Target className="h-4 w-4 mr-2" />
            目标管理
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ListTodo className="h-4 w-4 mr-2" />
            任务分解
          </TabsTrigger>
          <TabsTrigger value="ai-assist" className="hidden md:flex">
            <svg
              className="h-4 w-4 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 8V16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 12H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            AI 助手
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          <GoalManager />
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <TaskManager />
        </TabsContent>

        <TabsContent value="ai-assist" className="space-y-4">
          <AiAssistant />
        </TabsContent>
      </Tabs>
    </div>
  );
}
