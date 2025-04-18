# Action 模块设计

## 1. Action 定义
Action 是系统中的一个具体行动单元，它代表一个需要执行的操作。每个 Action 都有明确的：
- 类型（如通知、提醒、调整等）
- 输入参数
- 执行条件
- 预期输出
- 优先级
- 生命周期状态

## 2. Action 生命周期

### 2.1 状态定义
```python
class ActionStatus(str, Enum):
    CREATED = "created"      # 初始创建
    PENDING = "pending"      # 等待触发条件
    SCHEDULED = "scheduled"  # 已安排执行时间
    RUNNING = "running"      # 执行中
    COMPLETED = "completed"  # 执行完成
    FAILED = "failed"        # 执行失败
    CANCELLED = "cancelled"  # 已取消
    EXPIRED = "expired"      # 已过期
```

### 2.2 状态流转
```
CREATED -> PENDING -> SCHEDULED -> RUNNING -> COMPLETED
                                         \-> FAILED
    \-> CANCELLED
    \-> EXPIRED
```

### 2.3 触发机制
1. 时间触发
   - 指定时间点触发
   - 周期性触发
   - 延迟触发

2. 事件触发
   - 系统事件（如任务状态变更）
   - 用户行为（如完成任务）
   - 外部事件（如日历同步）

3. 条件触发
   - 阈值触发（如工作时间超过阈值）
   - 规则触发（如符合特定规则）
   - 组合条件触发

## 3. Action 接口定义

### 3.1 基础接口
```python
class ActionInterface(Protocol):
    async def validate_parameters(self, parameters: dict) -> bool:
        """验证输入参数"""
        ...

    async def check_conditions(self, context: dict) -> bool:
        """检查执行条件"""
        ...

    async def execute(self, parameters: dict) -> dict:
        """执行动作"""
        ...

    async def rollback(self) -> None:
        """回滚操作（如果支持）"""
        ...
```

### 3.2 数据模型
```python
class Action(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    type: ActionType
    parameters: dict  # 动作参数
    priority: int  # 优先级 1-100
    status: ActionStatus
    
    # 触发相关
    trigger_type: str  # time/event/condition
    trigger_config: dict  # 触发配置
    trigger_time: Optional[datetime]  # 计划触发时间
    
    # 执行相关
    created_at: datetime
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    result: Optional[dict]  # 执行结果
    error: Optional[str]  # 错误信息
    
    # 关联信息
    user_id: uuid.UUID
    source_id: Optional[uuid.UUID]  # 触发源ID（如分析结果ID）
    
    # 控制信息
    max_retries: int = 3  # 最大重试次数
    retry_count: int = 0  # 当前重试次数
    timeout: int = 300  # 执行超时时间（秒）
```

## 4. Action 类型示例

### 4.1 通知提醒
```python
class NotificationAction(ActionInterface):
    async def execute(self, parameters: dict) -> dict:
        notification = {
            "title": parameters["title"],
            "content": parameters["content"],
            "type": parameters["type"],
            "channel": parameters.get("channel", "default")
        }
        result = await notification_service.send(notification)
        return {"notification_id": result.id}
```

### 4.2 休息提醒
```python
class BreakReminderAction(ActionInterface):
    async def execute(self, parameters: dict) -> dict:
        duration = parameters.get("duration", 10)  # 默认10分钟
        notification = {
            "title": "休息提醒",
            "content": f"建议休息{duration}分钟",
            "type": "break_reminder",
            "duration": duration
        }
        result = await notification_service.send(notification)
        return {
            "notification_id": result.id,
            "break_duration": duration
        }
```

## 5. Action 执行流程

### 5.1 创建流程
1. 接收 Action 创建请求
2. 验证参数合法性
3. 设置触发条件
4. 计算优先级
5. 保存 Action 记录

### 5.2 调度流程
1. 扫描待执行的 Actions
2. 检查触发条件
3. 按优先级排序
4. 分配执行资源
5. 更新 Action 状态

### 5.3 执行流程
1. 加载 Action 配置
2. 准备执行环境
3. 执行前检查
4. 执行操作
5. 处理执行结果
6. 更新状态和结果

## 6. 错误处理

### 6.1 重试机制
- 配置重试次数
- 重试间隔策略
- 重试条件判断
- 失败后处理

### 6.2 回滚机制
- 支持回滚的操作类型
- 回滚操作记录
- 回滚失败处理

### 6.3 异常处理
- 参数验证异常
- 执行超时异常
- 资源访问异常
- 外部服务异常

## 7. 监控和日志

### 7.1 执行监控
- Action 执行状态
- 执行时间统计
- 成功/失败率
- 资源使用情况

### 7.2 日志记录
- 状态变更日志
- 执行过程日志
- 错误和异常日志
- 性能指标日志