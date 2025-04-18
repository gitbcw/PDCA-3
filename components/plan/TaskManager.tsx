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
  DialogTitle
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
  Clock,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  ArrowUpCircle,
  ArrowDownCircle,
  Link as LinkIcon
} from "lucide-react";

// 任务状态映射
const taskStatusMap = {
  TODO: { label: "待办", color: "bg-gray-100 text-gray-800" },
  IN_PROGRESS: { label: "进行中", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "已取消", color: "bg-red-100 text-red-800" }
};

// 任务优先级映射
const taskPriorityMap = {
  LOW: { label: "低", color: "bg-gray-100 text-gray-800", icon: ArrowDownCircle },
  MEDIUM: { label: "中", color: "bg-yellow-100 text-yellow-800", icon: null },
  HIGH: { label: "高", color: "bg-orange-100 text-orange-800", icon: ArrowUpCircle },
  URGENT: { label: "紧急", color: "bg-red-100 text-red-800", icon: ArrowUpCircle }
};

export default function TaskManager() {
  const { userId } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState("all");

  // 表单状态
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    priority: "MEDIUM",
    dueDate: "",
    goalId: "",
    parentId: ""
  });

  // 加载任务
  const loadTasks = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/tasks?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("加载任务失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载目标
  const loadGoals = async () => {
    if (!userId) return;

    try {
      const response = await fetch(`/api/goals?userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch goals");
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("加载目标失败");
    }
  };

  // 创建任务
  const createTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: userId, // 使用当前用户ID
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
          goalId: formData.goalId || undefined,
          parentId: formData.parentId || undefined
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create task");
      }

      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      resetForm();
      setOpenDialog(false);
      toast.success("任务创建成功");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(error.message || "创建任务失败");
    }
  };

  // 更新任务
  const updateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
          goalId: formData.goalId || undefined,
          parentId: formData.parentId || undefined
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update task");
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      resetForm();
      setOpenDialog(false);
      toast.success("任务更新成功");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error(error.message || "更新任务失败");
    }
  };

  // 删除任务
  const deleteTask = async (id) => {
    if (!confirm("确定要删除这个任务吗？")) return;

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete task");
      }

      setTasks(tasks.filter(task => task.id !== id));
      toast.success("任务删除成功");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error(error.message || "删除任务失败");
    }
  };

  // 更新任务状态
  const updateTaskStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/tasks/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update task status");
      }

      const updatedTask = await response.json();
      setTasks(tasks.map(task => task.id === updatedTask.id ? updatedTask : task));
      toast.success("任务状态更新成功");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error(error.message || "更新任务状态失败");
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      goalId: "",
      parentId: ""
    });
    setSelectedTask(null);
  };

  // 打开编辑对话框
  const openEditDialog = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      goalId: task.goalId || "",
      parentId: task.parentId || ""
    });
    setOpenDialog(true);
  };

  // 打开新建对话框
  const openCreateDialog = () => {
    resetForm();
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

  // 过滤任务
  const filteredTasks = () => {
    if (filter === "all") return tasks;
    return tasks.filter(task => task.status === filter);
  };

  // 获取目标标题
  const getGoalTitle = (goalId) => {
    const goal = goals.find(g => g.id === goalId);
    return goal ? goal.title : "未关联目标";
  };

  // 获取父任务标题
  const getParentTaskTitle = (parentId) => {
    const parent = tasks.find(t => t.id === parentId);
    return parent ? parent.title : "未关联父任务";
  };

  // 初始加载
  useEffect(() => {
    if (userId) {
      loadTasks();
      loadGoals();
    }
  }, [userId]);

  // 任务分组
  const groupedTasks = {
    TODO: filteredTasks().filter(task => task.status === "TODO"),
    IN_PROGRESS: filteredTasks().filter(task => task.status === "IN_PROGRESS"),
    COMPLETED: filteredTasks().filter(task => task.status === "COMPLETED"),
    CANCELLED: filteredTasks().filter(task => task.status === "CANCELLED")
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="筛选任务" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有任务</SelectItem>
              <SelectItem value="TODO">待办</SelectItem>
              <SelectItem value="IN_PROGRESS">进行中</SelectItem>
              <SelectItem value="COMPLETED">已完成</SelectItem>
              <SelectItem value="CANCELLED">已取消</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={loadTasks}>
            刷新
          </Button>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusCircle className="h-4 w-4 mr-2" />
          新建任务
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      ) : filteredTasks().length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">暂无任务</p>
          <Button onClick={openCreateDialog}>
            <PlusCircle className="h-4 w-4 mr-2" />
            创建第一个任务
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(taskStatusMap).map(([status, { label, color }]) => (
            <div key={status} className="space-y-4">
              <div className={`flex items-center justify-between p-2 rounded-t-lg ${color}`}>
                <h3 className="font-medium">{label}</h3>
                <Badge variant="outline">{groupedTasks[status]?.length || 0}</Badge>
              </div>

              <div className="space-y-2">
                {groupedTasks[status]?.map((task) => (
                  <Card key={task.id} className="overflow-hidden">
                    <CardHeader className="p-3 pb-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{task.title}</CardTitle>
                        <Badge className={taskPriorityMap[task.priority]?.color || "bg-gray-100"}>
                          {taskPriorityMap[task.priority]?.label || task.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                      )}

                      {task.dueDate && (
                        <div className="flex items-center text-xs text-muted-foreground mb-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>截止: {new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      {task.goalId && (
                        <div className="flex items-center text-xs text-muted-foreground mb-1">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          <span>目标: {getGoalTitle(task.goalId)}</span>
                        </div>
                      )}

                      {task.parentId && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <LinkIcon className="h-3 w-3 mr-1" />
                          <span>父任务: {getParentTaskTitle(task.parentId)}</span>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="p-3 pt-0 flex justify-between">
                      <div className="flex gap-1">
                        {status !== "COMPLETED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-500"
                            onClick={() => updateTaskStatus(task.id, "COMPLETED")}
                          >
                            <CheckCircle2 className="h-3 w-3" />
                          </Button>
                        )}
                        {status !== "IN_PROGRESS" && status !== "COMPLETED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-500"
                            onClick={() => updateTaskStatus(task.id, "IN_PROGRESS")}
                          >
                            <Clock className="h-3 w-3" />
                          </Button>
                        )}
                        {status !== "CANCELLED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={() => updateTaskStatus(task.id, "CANCELLED")}
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(task)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500" onClick={() => deleteTask(task.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}

                {groupedTasks[status]?.length === 0 && (
                  <div className="text-center py-4 border border-dashed rounded-lg">
                    <p className="text-xs text-muted-foreground">暂无{label}任务</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedTask ? "编辑任务" : "创建新任务"}</DialogTitle>
            <DialogDescription>
              {selectedTask
                ? "修改任务信息和状态"
                : "创建一个新的任务，设置优先级和截止日期"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={selectedTask ? updateTask : createTask}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  任务标题
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
                <Label htmlFor="status" className="text-right">
                  状态
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择任务状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">待办</SelectItem>
                    <SelectItem value="IN_PROGRESS">进行中</SelectItem>
                    <SelectItem value="COMPLETED">已完成</SelectItem>
                    <SelectItem value="CANCELLED">已取消</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priority" className="text-right">
                  优先级
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => handleSelectChange("priority", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择任务优先级" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">低</SelectItem>
                    <SelectItem value="MEDIUM">中</SelectItem>
                    <SelectItem value="HIGH">高</SelectItem>
                    <SelectItem value="URGENT">紧急</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dueDate" className="text-right">
                  截止日期
                </Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleFormChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="goalId" className="text-right">
                  关联目标
                </Label>
                <Select
                  value={formData.goalId}
                  onValueChange={(value) => handleSelectChange("goalId", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择关联目标" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无关联目标</SelectItem>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parentId" className="text-right">
                  父任务
                </Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => handleSelectChange("parentId", value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="选择父任务" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">无父任务</SelectItem>
                    {tasks
                      .filter(task => !selectedTask || task.id !== selectedTask.id)
                      .map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
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
                {selectedTask ? "更新任务" : "创建任务"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
