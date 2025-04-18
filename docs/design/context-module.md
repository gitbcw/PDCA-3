# Context 模块设计

## 1. 功能概述

Context 模块负责收集、管理和提供系统运行所需的各类上下文信息，为其他模块提供实时的上下文数据支持。

## 2. 核心功能

### 2.1 上下文数据采集
- 时间上下文（当前时间、时区、工作时间等）
- 设备上下文（设备状态、性能指标、网络状态等）
- 用户状态（在线状态、活跃度、专注状态等）
- 任务上下文（当前任务、进度状态、截止时间等）

### 2.2 上下文数据管理
- 上下文数据存储
- 数据更新机制
- 历史记录维护
- 数据清理策略

### 2.3 上下文订阅服务
- 实时上下文推送
- 上下文变更通知
- 数据订阅管理

## 3. 数据模型

### 3.1 上下文数据模型
```python
class ContextData(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID
    type: ContextType
    data: dict
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
```

### 3.2 上下文类型
```python
class ContextType(str, Enum):
    TIME = "time"           # 时间上下文
    DEVICE = "device"       # 设备上下文
    USER_STATE = "user"     # 用户状态
    TASK = "task"          # 任务上下文
```

## 4. 核心服务

### 4.1 上下文管理器
```python
class ContextManager:
    async def get_context(self, user_id: UUID, context_type: ContextType) -> ContextData:
        """获取指定类型的上下文数据"""
        return await self._load_context(user_id, context_type)
    
    async def update_context(self, user_id: UUID, context_type: ContextType, data: dict):
        """更新上下文数据"""
        context = await self._load_context(user_id, context_type)
        await self._update_context(context, data)
        await self._notify_subscribers(context)
    
    async def subscribe(self, subscriber_id: UUID, context_type: ContextType):
        """订阅上下文变更"""
        await self._add_subscriber(subscriber_id, context_type)
```

### 4.2 上下文收集器
```python
class ContextCollector:
    async def collect_time_context(self) -> dict:
        """收集时间上下文"""
        return {
            "current_time": datetime.now(),
            "timezone": time.tzname[0],
            "is_working_hours": self._check_working_hours()
        }
    
    async def collect_device_context(self) -> dict:
        """收集设备上下文"""
        return {
            "device_type": platform.system(),
            "memory_usage": psutil.virtual_memory().percent,
            "cpu_usage": psutil.cpu_percent(),
            "network_status": self._check_network_status()
        }
    
    async def collect_user_context(self, user_id: UUID) -> dict:
        """收集用户状态"""
        return {
            "is_online": await self._check_user_online(user_id),
            "last_active": await self._get_last_active(user_id),
            "focus_state": await self._get_focus_state(user_id)
        }
```

### 4.3 上下文提供者
```python
class ContextProvider:
    async def get_current_context(self, user_id: UUID) -> dict:
        """获取当前完整上下文"""
        return {
            "time": await self.context_manager.get_context(user_id, ContextType.TIME),
            "device": await self.context_manager.get_context(user_id, ContextType.DEVICE),
            "user": await self.context_manager.get_context(user_id, ContextType.USER_STATE),
            "task": await self.context_manager.get_context(user_id, ContextType.TASK)
        }
    
    async def subscribe_context_changes(
        self,
        subscriber_id: UUID,
        callback: Callable
    ):
        """订阅上下文变更"""
        pass
```

## 5. 配置项

```python
CONTEXT_CONFIG = {
    "update_intervals": {
        "time": 60,        # 秒
        "device": 300,     # 秒
        "user": 120,       # 秒
        "task": 60         # 秒
    },
    "retention_period": {
        "time": 86400,     # 1天
        "device": 604800,  # 7天
        "user": 86400,     # 1天
        "task": 604800     # 7天
    },
    "working_hours": {
        "start": "09:00",
        "end": "18:00"
    }
}
```

## 6. 开发优先级

### 第一阶段
1. 基础上下文功能
   - 时间上下文采集
   - 设备基本信息采集
   - 简单的用户状态跟踪

### 第二阶段
1. 高级上下文功能
   - 完整的设备状态监控
   - 详细的用户行为跟踪
   - 任务上下文关联

### 第三阶段
1. 智能化增强
   - 上下文预测
   - 异常检测
   - 智能数据清理