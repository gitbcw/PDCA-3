"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Goal, GoalLevel, GoalStatus } from "@prisma/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoaderCircle, Save, ArrowLeft, Trash2 } from "lucide-react";
import { formatDate } from "@/utils/date";

interface GoalEditFormProps {
  goalId?: string;
  userId: string;
}

export function GoalEditForm({ goalId, userId }: GoalEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [goal, setGoal] = useState<Partial<Goal>>({
    title: "",
    description: "",
    level: "MONTHLY" as GoalLevel,
    status: "ACTIVE" as GoalStatus,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    progress: 0,
    priority: 1,
    weight: 1.0,
    userId,
  });

  // 加载目标数据（如果是编辑现有目标）
  useEffect(() => {
    if (goalId) {
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
  }, [goalId]);

  // 处理表单字段变化
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGoal((prev) => ({ ...prev, [name]: value }));
  };

  // 处理选择字段变化
  const handleSelectChange = (name: string, value: string) => {
    setGoal((prev) => ({ ...prev, [name]: value }));
  };

  // 处理数字字段变化
  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    min: number,
    max: number
  ) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      const clampedValue = Math.min(Math.max(numValue, min), max);
      setGoal((prev) => ({ ...prev, [name]: clampedValue }));
    }
  };

  // 保存目标
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = goalId ? `/api/goals/${goalId}` : "/api/goals";
      const method = goalId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(goal),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "保存目标失败");
      }

      toast.success(goalId ? "目标已更新" : "目标已创建");
      router.push("/plan");
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error(error instanceof Error ? error.message : "保存目标失败");
    } finally {
      setSaving(false);
    }
  };

  // 删除目标
  const handleDelete = async () => {
    if (!goalId) return;
    
    if (!confirm("确定要删除这个目标吗？此操作无法撤销。")) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "删除目标失败");
      }

      toast.success("目标已删除");
      router.push("/plan");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error(error instanceof Error ? error.message : "删除目标失败");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoaderCircle className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <div className="flex gap-2">
          {goalId && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2"
            >
              {deleting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              删除
            </Button>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            保存
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6">
            {/* 基本信息 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">基本信息</h3>

              <div className="space-y-2">
                <Label htmlFor="title">目标标题 *</Label>
                <Input
                  id="title"
                  name="title"
                  value={goal.title || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={goal.description || ""}
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">目标级别</Label>
                  <Select
                    value={goal.level || "MONTHLY"}
                    onValueChange={(value) => handleSelectChange("level", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择目标级别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VISION">愿景目标 (3-5年)</SelectItem>
                      <SelectItem value="YEARLY">年度目标</SelectItem>
                      <SelectItem value="QUARTERLY">季度目标</SelectItem>
                      <SelectItem value="MONTHLY">月度目标</SelectItem>
                      <SelectItem value="WEEKLY">周目标</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">状态</Label>
                  <Select
                    value={goal.status || "ACTIVE"}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">进行中</SelectItem>
                      <SelectItem value="COMPLETED">已完成</SelectItem>
                      <SelectItem value="CANCELLED">已取消</SelectItem>
                      <SelectItem value="ARCHIVED">已归档</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 时间和进度 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">时间和进度</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">开始日期 *</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={goal.startDate ? formatDate(goal.startDate) : ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">结束日期 *</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={goal.endDate ? formatDate(goal.endDate) : ""}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="progress">
                  进度 ({Math.round((goal.progress || 0) * 100)}%)
                </Label>
                <Input
                  id="progress"
                  name="progress"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={goal.progress || 0}
                  onChange={(e) =>
                    handleNumberChange(e, 0, 1)
                  }
                />
              </div>
            </div>

            {/* 优先级和权重 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">优先级和权重</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">
                    优先级 (1-10): {goal.priority || 1}
                  </Label>
                  <Input
                    id="priority"
                    name="priority"
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={goal.priority || 1}
                    onChange={(e) =>
                      handleNumberChange(e, 1, 10)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">
                    权重 (0-1): {goal.weight?.toFixed(1) || 1.0}
                  </Label>
                  <Input
                    id="weight"
                    name="weight"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={goal.weight || 1.0}
                    onChange={(e) =>
                      handleNumberChange(e, 0, 1)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
