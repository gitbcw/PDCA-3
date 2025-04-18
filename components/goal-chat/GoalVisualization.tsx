"use client";

import { useState, useEffect } from "react";
import { Goal } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Plus, Target, Calendar, LoaderCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/utils/date";
import { toast } from "sonner";

interface GoalVisualizationProps {
  userId: string;
  extractedGoal: Partial<Goal> | null;
}

export function GoalVisualization({
  userId,
  extractedGoal,
}: GoalVisualizationProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  // 加载用户的所有目标
  useEffect(() => {
    async function loadGoals() {
      try {
        const response = await fetch(`/api/goals?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setGoals(data);
        }
      } catch (error) {
        console.error("Failed to load goals:", error);
      } finally {
        setLoading(false);
      }
    }

    loadGoals();
  }, [userId]);

  // 当提取到新目标时，高亮显示
  const [highlightedGoalId, setHighlightedGoalId] = useState<string | null>(null);

  // 保存提取的目标
  async function saveExtractedGoal() {
    if (!extractedGoal) return;

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...extractedGoal,
          userId,
          startDate: extractedGoal.startDate || new Date().toISOString(),
          endDate: extractedGoal.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (response.ok) {
        const newGoal = await response.json();
        setGoals([newGoal, ...goals]);
        setHighlightedGoalId(newGoal.id);

        // 3秒后取消高亮
        setTimeout(() => {
          setHighlightedGoalId(null);
        }, 3000);

        toast.success("目标已保存");
      }
    } catch (error) {
      console.error("Failed to save goal:", error);
      toast.error("保存目标失败");
    }
  }

  // 删除目标
  async function deleteGoal(goalId: string) {
    if (!confirm("确定要删除这个目标吗？此操作无法撤销。")) {
      return;
    }

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setGoals(goals.filter(goal => goal.id !== goalId));
        toast.success("目标已删除");
      } else {
        throw new Error("删除目标失败");
      }
    } catch (error) {
      console.error("Failed to delete goal:", error);
      toast.error("删除目标失败");
    }
  }

  function getLevelBadge(level: string) {
    switch (level) {
      case "VISION":
        return <Badge variant="outline">愿景</Badge>;
      case "YEARLY":
        return <Badge variant="outline">年度</Badge>;
      case "QUARTERLY":
        return <Badge variant="outline">季度</Badge>;
      case "MONTHLY":
        return <Badge variant="outline">月度</Badge>;
      case "WEEKLY":
        return <Badge variant="outline">周</Badge>;
      default:
        return null;
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="success">已完成</Badge>;
      case "ACTIVE":
        return <Badge>进行中</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">已取消</Badge>;
      case "ARCHIVED":
        return <Badge variant="secondary">已归档</Badge>;
      default:
        return null;
    }
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">目标视图</h2>
        <Button asChild>
          <Link href="/goals/new">
            <Plus className="h-4 w-4 mr-2" />
            新建目标
          </Link>
        </Button>
      </div>

      {/* 提取的目标预览 */}
      {extractedGoal && (
        <Card className="border-2 border-primary">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">
                {extractedGoal.title || "新目标"}
              </CardTitle>
              {extractedGoal.level && getLevelBadge(extractedGoal.level)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {extractedGoal.description || "无描述"}
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {extractedGoal.startDate
                  ? formatDate(new Date(extractedGoal.startDate))
                  : "未设置"} -
                {extractedGoal.endDate
                  ? formatDate(new Date(extractedGoal.endDate))
                  : "未设置"}
              </div>
              <Button onClick={saveExtractedGoal}>
                保存目标
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 目标列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">我的目标</h3>

        {loading ? (
          <div className="flex justify-center p-4">
            <LoaderCircle className="h-6 w-6 animate-spin" />
          </div>
        ) : goals.length === 0 ? (
          <div className="text-center p-8 border rounded-lg">
            <Target className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">
              你还没有创建任何目标
            </p>
            <Button className="mt-4" asChild>
              <Link href="/goals/new">
                <Plus className="h-4 w-4 mr-2" />
                创建第一个目标
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1">
            {goals.map((goal) => (
              <Card
                key={goal.id}
                className={`${highlightedGoalId === goal.id
                    ? "border-2 border-primary animate-pulse"
                    : ""
                  }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <div className="flex space-x-2">
                      {getLevelBadge(goal.level)}
                      {getStatusBadge(goal.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {goal.description || "无描述"}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/goals/${goal.id}`}>
                          查看
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/goals/${goal.id}/edit`}>
                          <Edit className="h-4 w-4 mr-1" />
                          编辑
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
