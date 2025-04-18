"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { use } from "react";
import { Goal, Task } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Edit,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
  ListTodo,
  LoaderCircle,
} from "lucide-react";
import Link from "next/link";
import { formatDate, formatLocalDate } from "@/utils/date";

interface GoalWithRelations extends Goal {
  tasks: Task[];
  parent?: {
    id: string;
    title: string;
  };
  subGoals?: {
    id: string;
    title: string;
    level: string;
    status: string;
  }[];
}

interface GoalDetailPageProps {
  params: {
    id: string;
  };
}

export default function GoalDetailPage({ params }: GoalDetailPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [goal, setGoal] = useState<GoalWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  // 使用 React.use 解包 params
  const goalId = use(Promise.resolve(params.id));

  // 如果用户未登录，重定向到登录页面
  if (status === "unauthenticated") {
    router.push(`/login?callbackUrl=/goals/${goalId}`);
    return null;
  }

  // 加载目标数据
  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetch(`/api/goals/${goalId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch goal");
          return res.json();
        })
        .then((data) => {
          setGoal(data);
        })
        .catch((error) => {
          console.error("Error loading goal:", error);
          toast.error("加载目标失败");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [params.id, status]);

  // 如果会话正在加载，显示加载状态
  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">目标不存在或已被删除</h2>
        </div>
      </div>
    );
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

  // 计算剩余天数
  const today = new Date();
  const endDate = new Date(goal.endDate);
  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  // 计算已完成的任务数量
  const completedTasks = goal.tasks.filter(task => task.status === "COMPLETED").length;
  const totalTasks = goal.tasks.length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <Button asChild>
          <Link href={`/goals/${goal.id}/edit`} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            编辑
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {/* 目标标题和状态 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{goal.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              {getLevelBadge(goal.level)}
              {getStatusBadge(goal.status)}
              <span className="text-sm text-muted-foreground">
                优先级: {goal.priority}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {formatLocalDate(goal.startDate)} - {formatLocalDate(goal.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {daysLeft > 0
                  ? `还剩 ${daysLeft} 天`
                  : daysLeft === 0
                    ? "今天截止"
                    : `已超期 ${Math.abs(daysLeft)} 天`}
              </span>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">完成进度</span>
              <span className="text-sm font-medium">
                {Math.round(goal.progress * 100)}%
              </span>
            </div>
            <Progress value={goal.progress * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* 目标描述 */}
        {goal.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">描述</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{goal.description}</p>
            </CardContent>
          </Card>
        )}

        {/* 父目标 */}
        {goal.parent && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">父目标</CardTitle>
            </CardHeader>
            <CardContent>
              <Link
                href={`/goals/${goal.parent.id}`}
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Target className="h-4 w-4" />
                {goal.parent.title}
              </Link>
            </CardContent>
          </Card>
        )}

        {/* 子目标 */}
        {goal.subGoals && goal.subGoals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">子目标</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {goal.subGoals.map((subGoal) => (
                  <li key={subGoal.id}>
                    <Link
                      href={`/goals/${subGoal.id}`}
                      className="flex items-center justify-between hover:bg-accent p-2 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>{subGoal.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getLevelBadge(subGoal.level)}
                        {getStatusBadge(subGoal.status)}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* 相关任务 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">相关任务</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {completedTasks}/{totalTasks} 已完成
              </span>
              <Progress
                value={taskCompletionRate}
                className="h-2 w-24"
              />
            </div>
          </CardHeader>
          <CardContent>
            {goal.tasks.length === 0 ? (
              <div className="text-center py-4">
                <ListTodo className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  没有相关任务
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/plan?tab=tasks">
                    创建任务
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-2">
                {goal.tasks.map((task) => (
                  <li key={task.id}>
                    <div className="flex items-center justify-between hover:bg-accent p-2 rounded-md">
                      <div className="flex items-center gap-2">
                        {task.status === "COMPLETED" ? (
                          <CheckCircle2 className="h-4 w-4 text-success" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-muted-foreground" />
                        )}
                        <span
                          className={
                            task.status === "COMPLETED"
                              ? "line-through text-muted-foreground"
                              : ""
                          }
                        >
                          {task.title}
                        </span>
                      </div>
                      <Badge
                        variant={
                          task.priority === "HIGH" || task.priority === "URGENT"
                            ? "destructive"
                            : task.priority === "MEDIUM"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
