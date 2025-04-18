"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  PlusCircle,
  Calendar,
  Target,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  ChevronRight,
  BarChart2
} from "lucide-react";

// 目标级别映射
const goalLevelMap = {
  VISION: { label: "愿景", color: "bg-purple-100 text-purple-800" },
  YEARLY: { label: "年度", color: "bg-blue-100 text-blue-800" },
  QUARTERLY: { label: "季度", color: "bg-cyan-100 text-cyan-800" },
  MONTHLY: { label: "月度", color: "bg-green-100 text-green-800" },
  WEEKLY: { label: "周", color: "bg-yellow-100 text-yellow-800" }
};

// 目标状态映射
const goalStatusMap = {
  ACTIVE: { label: "进行中", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "已取消", color: "bg-red-100 text-red-800" },
  ARCHIVED: { label: "已归档", color: "bg-gray-100 text-gray-800" }
};

export default function GoalManager() {
  const { userId } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [filter, setFilter] = useState("all");

  // 表单状态
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    level: "MONTHLY",
    startDate: "",
    endDate: "",
    metrics: [],
    resources: []
  });

  // 加载目标
  const loadGoals = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/goals?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch goals");
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("加载目标失败");
    } finally {
      setLoading(false);
    }
  };

  // 创建目标
  const createGoal = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: userId, // 使用当前用户ID
          metrics: formData.metrics.length > 0 ? formData.metrics : undefined,
          resources: formData.resources.length > 0 ? formData.resources : undefined
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create goal");
      }

      const newGoal = await response.json();
      setGoals([newGoal, ...goals]);
      resetForm();
      setOpenDialog(false);
      toast.success("目标创建成功");
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error(error.message || "创建目标失败");
    }
  };

  // 更新目标
  const updateGoal = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/goals/${selectedGoal.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update goal");
      }

      const updatedGoal = await response.json();
      setGoals(goals.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal));
      resetForm();
      setOpenDialog(false);
      toast.success("目标更新成功");
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error(error.message || "更新目标失败");
    }
  };

  // 删除目标
  const deleteGoal = async (id) => {
    if (!confirm("确定要删除这个目标吗？")) return;

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete goal");
      }

      setGoals(goals.filter(goal => goal.id !== id));
      toast.success("目标删除成功");
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error(error.message || "删除目标失败");
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      level: "MONTHLY",
      startDate: "",
      endDate: "",
      metrics: [],
      resources: []
    });
    setSelectedGoal(null);
  };

  // 打开编辑对话框
  const openEditDialog = (goal) => {
    setSelectedGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || "",
      level: goal.level,
      startDate: new Date(goal.startDate).toISOString().split('T')[0],
      endDate: new Date(goal.endDate).toISOString().split('T')[0],
      metrics: goal.metrics || [],
      resources: goal.resources || []
    });
    setOpenDialog(true);
  };

  // 打开新建对话框
  const openCreateDialog = () => {
    resetForm();
    // 设置默认开始日期为今天，结束日期为30天后
    const today = new Date();
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(today.getDate() + 30);

    setFormData({
      ...formData,
      startDate: today.toISOString().split('T')[0],
      endDate: thirtyDaysLater.toISOString().split('T')[0]
    });

    setOpenDialog(true);
  };

  // 处理表单变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 处理选择变化
  const handleSelectChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 过滤目标
  const filteredGoals = () => {
    if (filter === "all") return goals;
    return goals.filter(goal => goal.level === filter);
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadGoals();
    }
  }, [userId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="筛选目标" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有目标</SelectItem>
              <SelectItem value="VISION">愿景</SelectItem>
              <SelectItem value="YEARLY">年度目标</SelectItem>
              <SelectItem value="QUARTERLY">季度目标</SelectItem>
              <SelectItem value="MONTHLY">月度目标</SelectItem>
              <SelectItem value="WEEKLY">周目标</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadGoals}>
            刷新
          </Button>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          新建目标
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : filteredGoals().length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">暂无目标</p>
          <Button onClick={openCreateDialog}>
            <PlusCircle className="h-4 w-4 mr-2" />
            创建第一个目标
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals().map((goal) => (
            <Card key={goal.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  <div className="flex gap-1">
                    <Badge className={goalLevelMap[goal.level]?.color || "bg-gray-100"}>
                      {goalLevelMap[goal.level]?.label || goal.level}
                    </Badge>
                    <Badge className={goalStatusMap[goal.status]?.color || "bg-gray-100"}>
                      {goalStatusMap[goal.status]?.label || goal.status}
                    </Badge>
                  </div>
                </div>
                {goal.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {goal.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {new Date(goal.startDate).toLocaleDateString()} - {new Date(goal.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Target className="h-3 w-3 mr-1" />
                    <span>{Math.round(goal.progress * 100)}%</span>
                  </div>
                </div>

                <div className="mt-2 pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ width: `${goal.progress * 100}%` }}
                    ></div>
                  </div>
                </div>

                {goal.tasks && goal.tasks.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-medium mb-1">相关任务 ({goal.tasks.length})</p>
                    <div className="space-y-1">
                      {goal.tasks.slice(0, 2).map((task) => (
                        <div key={task.id} className="flex items-center text-xs">
                          {task.status === "COMPLETED" ? (
                            <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                          ) : task.status === "IN_PROGRESS" ? (
                            <Clock className="h-3 w-3 mr-1 text-blue-500" />
                          ) : task.status === "CANCELLED" ? (
                            <XCircle className="h-3 w-3 mr-1 text-red-500" />
                          ) : (
                            <Target className="h-3 w-3 mr-1 text-gray-500" />
                          )}
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                      {goal.tasks.length > 2 && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          <span>还有 {goal.tasks.length - 2} 个任务</span>
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(goal)}>
                  <Edit className="h-3 w-3 mr-1" />
                  编辑
                </Button>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm">
                    <BarChart2 className="h-3 w-3 mr-1" />
                    详情
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500" onClick={() => deleteGoal(goal.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedGoal ? "编辑目标" : "创建新目标"}</DialogTitle>
            <DialogDescription>
              {selectedGoal
                ? "修改目标信息和进度"
                : "设定一个明确、可衡量、有时限的目标"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={selectedGoal ? updateGoal : createGoal}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  目标标题
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="level" className="text-right">
                  目标级别
                </Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) => handleSelectChange("level", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择目标级别" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VISION">愿景</SelectItem>
                    <SelectItem value="YEARLY">年度目标</SelectItem>
                    <SelectItem value="QUARTERLY">季度目标</SelectItem>
                    <SelectItem value="MONTHLY">月度目标</SelectItem>
                    <SelectItem value="WEEKLY">周目标</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  开始日期
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="endDate" className="text-right">
                  结束日期
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleFormChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  描述
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="col-span-3"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenDialog(false)}>
                取消
              </Button>
              <Button type="submit">
                {selectedGoal ? "更新目标" : "创建目标"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
