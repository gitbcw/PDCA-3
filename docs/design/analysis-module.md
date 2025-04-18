# Analysis 模块设计

## 1. 功能概述
Analysis 模块是一个基于 LLM 的任务分析引擎，负责分析任务的复杂度、依赖关系和优先级，并提供任务优化建议。

## 2. 核心功能

### 2.1 任务分析
- 复杂度评估
- 依赖关系识别
- 优先级建议
- 任务分解建议
- 任务合并建议

### 2.2 分析结果处理
- 任务属性更新
- 任务结构调整
- 任务优化执行

## 3. 技术实现

### 3.1 数据模型
```python
class AnalysisResult(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    task_id: uuid.UUID
    analysis_type: str  # 分析类型：复杂度/依赖/优先级
    result: dict  # LLM 分析结果
    suggestions: List[dict]  # 优化建议列表
    created_at: datetime
    applied: bool = False  # 是否已应用建议
    user_id: uuid.UUID

class AnalysisAction(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    analysis_id: uuid.UUID
    action_type: str  # 动作类型：更新/分解/合并/删除
    action_params: dict  # 动作参数
    status: str  # 状态：待执行/已执行/失败
    executed_at: Optional[datetime]
    result: Optional[dict]  # 执行结果

class ActionType(str, Enum):
    NOTIFICATION = "notification"  # 通知提醒
    BREAK_REMINDER = "break_reminder"  # 休息提醒
    SCHEDULE_ADJUSTMENT = "schedule_adjustment"  # 日程调整
    TASK_AUTOMATION = "task_automation"  # 任务自动化
    EXTERNAL_INTEGRATION = "external_integration"  # 外部集成

class Action(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    type: ActionType
    parameters: dict  # 动作参数
    priority: int  # 动作优先级
    trigger_time: datetime  # 触发时间
    expiry_time: Optional[datetime]  # 过期时间
    status: str  # pending/executing/completed/failed
    created_at: datetime
    executed_at: Optional[datetime]
    result: Optional[dict]  # 执行结果
    user_id: uuid.UUID
    analysis_id: Optional[uuid.UUID]  # 关联的分析结果ID

class ActionTriggerRule(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    action_type: ActionType
    conditions: dict  # 触发条件
    parameters_template: dict  # 参数模板
    enabled: bool = True
    user_id: uuid.UUID
```

### 3.2 LLM 提示模板
```python
COMPLEXITY_PROMPT = """
分析以下任务的复杂度:
任务标题: {title}
任务描述: {description}
相关上下文: {context}

请提供:
1. 复杂度评分(1-10)
2. 评分依据
3. 建议的任务分解方案(如果需要)
"""

DEPENDENCY_PROMPT = """
分析以下任务的依赖关系:
当前任务: {task}
相关任务列表: {related_tasks}

请提供:
1. 识别的依赖任务
2. 依赖类型(前置/后置/并行)
3. 依赖关系调整建议
"""

PRIORITY_PROMPT = """
分析以下任务的优先级:
任务信息: {task}
当前上下文: {context}
现有任务列表: {task_list}

请提供:
1. 建议优先级(P0-P3)
2. 优先级判断依据
3. 任务排序建议
"""
```

### 3.3 API 设计
```
POST /api/v1/analysis/tasks/{task_id}
- 触发任务分析
- 参数：分析类型、上下文信息

GET /api/v1/analysis/results/{task_id}
- 获取分析结果

POST /api/v1/analysis/apply/{analysis_id}
- 应用分析建议
```

### 3.4 Action 处理器示例
```python
class ActionHandler:
    async def handle_break_reminder(self, action: Action):
        # 处理休息提醒
        notification = {
            "title": "休息提醒",
            "content": "您已连续工作2小时，建议休息10分钟",
            "type": "break",
            "duration": 10
        }
        await self.notification_service.send(notification)

    async def handle_schedule_adjustment(self, action: Action):
        # 处理日程调整
        adjustments = action.parameters.get("adjustments", [])
        for adj in adjustments:
            await self.calendar_service.adjust_schedule(adj)

    async def handle_task_automation(self, action: Action):
        # 处理任务自动化
        automation = action.parameters.get("automation")
        await self.automation_service.execute(automation)
```

## 4. 处理流程

### 4.1 分析流程
1. 接收分析请求
2. 收集任务上下文
3. 生成 LLM 提示
4. 调用 LLM API
5. 解析分析结果
6. 生成优化建议
7. 存储分析结果

### 4.2 优化执行流程
1. 接收优化请求
2. 验证优化建议
3. 生成执行计划
4. 执行优化动作
5. 更新任务状态
6. 记录执行结果

## 5. 优化动作类型

### 5.1 任务属性更新
- 更新复杂度评分
- 调整优先级
- 修改预期时间

### 5.2 任务结构调整
- 任务分解
- 任务合并
- 依赖关系更新
- 任务删除

## 6. 开发优先级

### 第一阶段
1. 基础分析功能
   - LLM 集成
   - 基础复杂度分析
   - 简单优化执行

### 第二阶段
1. 高级分析功能
   - 依赖关系分析
   - 优先级优化
   - 批量任务分析

### 第三阶段
1. 智能化增强
   - 自适应提示优化
   - 历史数据学习
   - 预测性分析

## 7. 技术注意事项

### 7.1 LLM 相关
- 提示词模板优化
- 结果解析稳定性
- 错误处理机制
- API 调用成本控制

### 7.2 执行安全
- 优化动作验证
- 执行结果回滚
- 并发处理控制
- 操作日志记录

### 7.3 性能考虑
- 异步分析处理
- 结果缓存策略
- 批量分析优化

### 7.4 扩展性
- 支持多种分析类型
- 灵活的优化策略
- 可配置的执行规则

## 8. Action 系统设计

### 8.1 Action 类型
1. 通知提醒
   - 休息提醒
   - 任务截止提醒
   - 工作状态提醒
   - 健康建议

2. 日程调整
   - 自动调整任务时间
   - 重排优先级
   - 插入休息时间

3. 任务自动化
   - 自动创建子任务
   - 自动设置提醒
   - 自动归档完成任务

4. 外部集成
   - 日历同步
   - 通讯工具集成
   - 第三方服务调用

### 8.2 触发机制
1. 分析触发
   - 基于任务分析结果
   - 基于工作模式分析
   - 基于用户状态分析

2. 时间触发
   - 定时检查
   - 周期性提醒
   - 截止时间提醒

3. 条件触发
   - 任务状态变更
   - 用户行为模式
   - 系统事件

### 8.3 执行流程
1. Action 生成
   - 分析结果转换
   - 触发条件检查
   - 参数生成

2. 优先级排序
   - 紧急程度评估
   - 用户偏好考虑
   - 资源占用评估

3. 执行控制
   - 并发控制
   - 失败重试
   - 结果反馈

### 8.4 配置管理
1. 触发规则配置
   - 条件定义
   - 参数模板
   - 启用/禁用控制

2. 执行策略配置
   - 重试策略
   - 超时设置
   - 并发限制

3. 用户偏好配置
   - 通知方式
   - 提醒频率
   - 自动化级别
