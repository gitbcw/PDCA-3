"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function DatabaseTestPage() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  
  // 用户表单状态
  const [userForm, setUserForm] = useState({
    email: "",
    name: "",
    password: "",
  });
  
  // 任务表单状态
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });
  
  // 目标表单状态
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    level: "MONTHLY",
    startDate: "",
    endDate: "",
  });
  
  // 加载用户
  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      if (data.length > 0 && !selectedUserId) {
        setSelectedUserId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    }
  };
  
  // 加载任务
  const loadTasks = async () => {
    if (!selectedUserId) return;
    try {
      const response = await fetch(`/api/tasks?userId=${selectedUserId}`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast.error("Failed to load tasks");
    }
  };
  
  // 加载目标
  const loadGoals = async () => {
    if (!selectedUserId) return;
    try {
      const response = await fetch(`/api/goals?userId=${selectedUserId}`);
      if (!response.ok) throw new Error("Failed to fetch goals");
      const data = await response.json();
      setGoals(data);
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("Failed to load goals");
    }
  };
  
  // 创建用户
  const createUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userForm),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }
      
      const newUser = await response.json();
      setUsers([...users, newUser]);
      setUserForm({ email: "", name: "", password: "" });
      toast.success("User created successfully");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.message || "Failed to create user");
    }
  };
  
  // 创建任务
  const createTask = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Please select a user first");
      return;
    }
    
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskForm,
          userId: selectedUserId,
          dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create task");
      }
      
      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      setTaskForm({ title: "", description: "", dueDate: "" });
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(error.message || "Failed to create task");
    }
  };
  
  // 创建目标
  const createGoal = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast.error("Please select a user first");
      return;
    }
    
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...goalForm,
          userId: selectedUserId,
          startDate: new Date(goalForm.startDate).toISOString(),
          endDate: new Date(goalForm.endDate).toISOString(),
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create goal");
      }
      
      const newGoal = await response.json();
      setGoals([newGoal, ...goals]);
      setGoalForm({
        title: "",
        description: "",
        level: "MONTHLY",
        startDate: "",
        endDate: "",
      });
      toast.success("Goal created successfully");
    } catch (error) {
      console.error("Error creating goal:", error);
      toast.error(error.message || "Failed to create goal");
    }
  };
  
  // 初始加载
  useEffect(() => {
    loadUsers();
  }, []);
  
  // 当选择的用户改变时，加载任务和目标
  useEffect(() => {
    if (selectedUserId) {
      loadTasks();
      loadGoals();
    }
  }, [selectedUserId]);
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">数据库测试</h1>
      
      <div className="mb-6">
        <Label htmlFor="user-select">选择用户</Label>
        <div className="flex gap-4 mt-2">
          <select
            id="user-select"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            <option value="">选择用户</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
          <Button onClick={loadUsers}>刷新</Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="users">用户</TabsTrigger>
          <TabsTrigger value="tasks">任务</TabsTrigger>
          <TabsTrigger value="goals">目标</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>创建用户</CardTitle>
                <CardDescription>
                  添加新用户到系统
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">邮箱</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input
                      id="name"
                      value={userForm.name}
                      onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">密码</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full">创建用户</Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>用户列表</CardTitle>
                <CardDescription>
                  系统中的所有用户
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-muted-foreground">暂无用户</p>
                  ) : (
                    users.map((user) => (
                      <div key={user.id} className="border p-4 rounded-lg">
                        <p className="font-medium">{user.name || "未命名"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          创建于: {new Date(user.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>创建任务</CardTitle>
                <CardDescription>
                  为选定用户添加新任务
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">标题</Label>
                    <Input
                      id="task-title"
                      required
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">描述</Label>
                    <Input
                      id="task-description"
                      value={taskForm.description}
                      onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-due-date">截止日期</Label>
                    <Input
                      id="task-due-date"
                      type="datetime-local"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={!selectedUserId}>
                    创建任务
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>任务列表</CardTitle>
                <CardDescription>
                  选定用户的所有任务
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!selectedUserId ? (
                    <p className="text-muted-foreground">请先选择用户</p>
                  ) : tasks.length === 0 ? (
                    <p className="text-muted-foreground">暂无任务</p>
                  ) : (
                    tasks.map((task) => (
                      <div key={task.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{task.title}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            task.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                            task.status === "IN_PROGRESS" ? "bg-blue-100 text-blue-800" :
                            task.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm mt-2">{task.description}</p>
                        )}
                        {task.dueDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            截止日期: {new Date(task.dueDate).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="goals">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>创建目标</CardTitle>
                <CardDescription>
                  为选定用户添加新目标
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createGoal} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-title">标题</Label>
                    <Input
                      id="goal-title"
                      required
                      value={goalForm.title}
                      onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-description">描述</Label>
                    <Input
                      id="goal-description"
                      value={goalForm.description}
                      onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-level">级别</Label>
                    <select
                      id="goal-level"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                      value={goalForm.level}
                      onChange={(e) => setGoalForm({ ...goalForm, level: e.target.value })}
                    >
                      <option value="VISION">愿景</option>
                      <option value="YEARLY">年度</option>
                      <option value="QUARTERLY">季度</option>
                      <option value="MONTHLY">月度</option>
                      <option value="WEEKLY">周</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-start-date">开始日期</Label>
                    <Input
                      id="goal-start-date"
                      type="datetime-local"
                      required
                      value={goalForm.startDate}
                      onChange={(e) => setGoalForm({ ...goalForm, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-end-date">结束日期</Label>
                    <Input
                      id="goal-end-date"
                      type="datetime-local"
                      required
                      value={goalForm.endDate}
                      onChange={(e) => setGoalForm({ ...goalForm, endDate: e.target.value })}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={!selectedUserId}>
                    创建目标
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>目标列表</CardTitle>
                <CardDescription>
                  选定用户的所有目标
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!selectedUserId ? (
                    <p className="text-muted-foreground">请先选择用户</p>
                  ) : goals.length === 0 ? (
                    <p className="text-muted-foreground">暂无目标</p>
                  ) : (
                    goals.map((goal) => (
                      <div key={goal.id} className="border p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{goal.title}</p>
                          <div className="flex gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-800">
                              {goal.level}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              goal.status === "COMPLETED" ? "bg-green-100 text-green-800" :
                              goal.status === "CANCELLED" ? "bg-red-100 text-red-800" :
                              goal.status === "ARCHIVED" ? "bg-gray-100 text-gray-800" :
                              "bg-blue-100 text-blue-800"
                            }`}>
                              {goal.status}
                            </span>
                          </div>
                        </div>
                        {goal.description && (
                          <p className="text-sm mt-2">{goal.description}</p>
                        )}
                        <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                          <span>开始: {new Date(goal.startDate).toLocaleDateString()}</span>
                          <span>结束: {new Date(goal.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs font-medium">进度: {Math.round(goal.progress * 100)}%</p>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${goal.progress * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
