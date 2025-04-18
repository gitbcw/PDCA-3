"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  PlusCircle, 
  Sparkles, 
  Target, 
  ListTodo, 
  Calendar, 
  Lightbulb
} from "lucide-react";

// 预设提示模板
const promptTemplates = [
  {
    id: "goal-setting",
    title: "目标设定",
    icon: Target,
    description: "帮助制定 SMART 目标",
    prompt: "我想设定一个新的目标。请帮我制定一个符合 SMART 原则（具体、可衡量、可实现、相关性、时限性）的目标。我的目标大致是："
  },
  {
    id: "task-breakdown",
    title: "任务分解",
    icon: ListTodo,
    description: "将目标分解为可执行的任务",
    prompt: "我有一个目标：「{goal}」。请帮我将这个目标分解为具体的、可执行的任务，并按照优先级排序。"
  },
  {
    id: "time-planning",
    title: "时间规划",
    icon: Calendar,
    description: "制定时间表和截止日期",
    prompt: "我需要在 {deadline} 前完成以下任务：\n{tasks}\n\n请帮我制定一个合理的时间表，包括每个任务的开始时间和截止日期。"
  },
  {
    id: "improvement",
    title: "计划改进",
    icon: Lightbulb,
    description: "分析并改进现有计划",
    prompt: "我当前的计划如下：\n{plan}\n\n请分析这个计划的优缺点，并提出改进建议。"
  }
];

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "你好！我是你的 PDCA 助手。我可以帮助你制定目标、分解任务、规划时间，以及改进你的计划。你可以直接向我提问，或者使用下方的提示模板。"
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
  const messagesEndRef = useRef(null);
  
  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 发送消息
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = {
      role: "user",
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // 在实际应用中，这里应该调用 LLM API
      // 这里使用模拟响应
      setTimeout(() => {
        const assistantMessage = {
          role: "assistant",
          content: generateMockResponse(input)
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("发送消息失败");
      setIsLoading(false);
    }
  };
  
  // 使用提示模板
  const useTemplate = (templateId) => {
    const template = promptTemplates.find(t => t.id === templateId);
    if (template) {
      setInput(template.prompt);
      setSelectedTemplate("");
    }
  };
  
  // 生成模拟响应（实际应用中应替换为真实的 LLM 调用）
  const generateMockResponse = (message) => {
    if (message.includes("目标") && message.includes("SMART")) {
      return `
根据 SMART 原则，我为你制定了以下目标：

**具体 (Specific)**: 明确定义你想要达成什么
**可衡量 (Measurable)**: 设定具体的衡量标准
**可实现 (Achievable)**: 确保目标在你的能力范围内
**相关性 (Relevant)**: 与你的长期目标相关联
**时限性 (Time-bound)**: 设定明确的截止日期

建议你将目标表述为：
"在 [截止日期] 前，通过 [具体行动]，实现 [具体成果]，可以通过 [衡量标准] 来评估进度。"

例如：
"在 6 月底前，通过每周阅读 2 本书并撰写读书笔记，阅读完 20 本专业书籍，可以通过读书笔记数量和内容质量来评估进度。"

你可以在 PDCA 系统中创建这个目标，并设置相应的开始日期、结束日期和衡量标准。
      `;
    } else if (message.includes("任务") && message.includes("分解")) {
      return `
我已将你的目标分解为以下任务，按优先级排序：

### 高优先级任务
1. **任务 A**
   - 截止日期：[日期]
   - 预计耗时：X 小时
   - 依赖关系：无

2. **任务 B**
   - 截止日期：[日期]
   - 预计耗时：X 小时
   - 依赖关系：任务 A 完成后

### 中优先级任务
3. **任务 C**
   - 截止日期：[日期]
   - 预计耗时：X 小时
   - 依赖关系：无

### 低优先级任务
4. **任务 D**
   - 截止日期：[日期]
   - 预计耗时：X 小时
   - 依赖关系：无

你可以在 PDCA 系统中创建这些任务，并关联到你的目标。
      `;
    } else if (message.includes("时间") && message.includes("规划")) {
      return `
根据你提供的任务列表和截止日期，我为你制定了以下时间表：

### 第 1 周 (MM/DD - MM/DD)
- 周一至周三：任务 A
- 周四至周五：任务 B
- 周末：休息/缓冲时间

### 第 2 周 (MM/DD - MM/DD)
- 周一至周二：任务 C
- 周三至周五：任务 D
- 周末：任务 E

### 第 3 周 (MM/DD - MM/DD)
- 周一至周三：任务 F
- 周四至周五：复查和调整
- 周末：最终完成

这个时间表考虑了任务的依赖关系和优先级，并留出了缓冲时间应对可能的延误。
      `;
    } else if (message.includes("计划") && message.includes("改进")) {
      return `
我分析了你的计划，以下是我的建议：

### 优点
- 目标明确，符合 SMART 原则
- 任务分解合理，粒度适中
- 考虑了任务间的依赖关系

### 改进建议
1. **增加缓冲时间**
   - 在关键任务后添加 1-2 天的缓冲时间
   - 避免连续安排高强度任务

2. **明确成功标准**
   - 为每个任务定义明确的"完成"标准
   - 添加中间检查点评估进度

3. **考虑资源限制**
   - 评估每个任务所需的资源和工具
   - 提前准备必要的资源

4. **添加激励机制**
   - 设置小型里程碑和奖励
   - 庆祝阶段性成果

你可以在 PDCA 系统中更新你的计划，添加这些改进建议。
      `;
    } else {
      return `
感谢你的问题！作为你的 PDCA 助手，我可以帮助你：

1. 制定符合 SMART 原则的目标
2. 将目标分解为可执行的任务
3. 制定时间表和截止日期
4. 分析并改进你的计划

你可以使用下方的提示模板，或者直接告诉我你需要什么样的帮助。
      `;
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-16rem)]">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>AI 助手</CardTitle>
          <CardDescription>
            使用 AI 辅助制定目标和任务计划
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`flex items-start space-x-2 max-w-[80%] ${
                    message.role === "assistant"
                      ? "bg-muted p-3 rounded-lg"
                      : "bg-primary text-primary-foreground p-3 rounded-lg"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                  {message.role === "user" && (
                    <User className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>思考中...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full">
            {promptTemplates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="h-auto py-2 px-3 flex flex-col items-center justify-center text-center"
                onClick={() => useTemplate(template.id)}
              >
                <template.icon className="h-4 w-4 mb-1" />
                <span className="text-xs">{template.title}</span>
              </Button>
            ))}
          </div>
          <div className="flex w-full space-x-2">
            <Textarea
              placeholder="输入你的问题或使用上方的提示模板..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
