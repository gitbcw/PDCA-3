# Feedback 模块设计

## 1. 功能概述

Feedback 模块负责向用户提供任务执行情况和进展的反馈，包括即时反馈、总结性反馈和预测性反馈。通过多层次的反馈机制，帮助用户更好地掌控任务进展。

## 2. 核心功能

### 2.1 即时反馈
- 任务状态变更通知
- 截止日期提醒
- 重要事项提醒
- 成就解锁通知

### 2.2 总结性反馈
- 日/周/月任务完成情况
- 时间利用统计
- 效率分析报告

### 2.3 预测性反馈
- 任务延期风险预警
- 工作量预估提醒
- 进度预警通知

## 3. 数据模型

### 3.1 反馈数据
```python
class Feedback(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID
    type: FeedbackType
    content: dict
    created_at: datetime = Field(default_factory=datetime.utcnow)
    priority: str = "normal"  # high, normal, low
    is_read: bool = False
```

### 3.2 反馈类型
```python
class FeedbackType(str, Enum):
    # 即时反馈
    TASK_STATUS = "task_status"  # 任务状态变更
    DUE_REMINDER = "due_reminder"  # 截止提醒
    ACHIEVEMENT = "achievement"  # 成就解锁
    
    # 总结性反馈
    DAILY_SUMMARY = "daily_summary"  # 日报
    WEEKLY_SUMMARY = "weekly_summary"  # 周报
    MONTHLY_SUMMARY = "monthly_summary"  # 月报
    
    # 预测性反馈
    DELAY_RISK = "delay_risk"  # 延期风险
    WORKLOAD_ALERT = "workload_alert"  # 工作量预警
    PROGRESS_ALERT = "progress_alert"  # 进度预警
```

## 4. 核心服务

### 4.1 反馈生成服务
```python
class FeedbackService:
    async def generate_instant_feedback(self, event: dict) -> Feedback:
        """生成即时反馈"""
        feedback_type = self._determine_feedback_type(event)
        content = self._generate_content(event)
        return await self._create_feedback(feedback_type, content)
    
    async def generate_summary_feedback(self, period: str) -> List[Feedback]:
        """生成总结性反馈"""
        stats = await self._collect_statistics(period)
        return await self._create_summary_feedback(period, stats)
    
    async def generate_predictive_feedback(self) -> List[Feedback]:
        """生成预测性反馈"""
        risks = await self._analyze_risks()
        return await self._create_risk_feedback(risks)
```

### 4.2 通知服务
```python
class NotificationService:
    async def send_notification(self, feedback: Feedback):
        """发送通知"""
        if not self._should_notify(feedback):
            return
            
        notification = self._create_notification(feedback)
        await self._send(notification)
    
    def _should_notify(self, feedback: Feedback) -> bool:
        """判断是否需要发送通知"""
        rules = {
            FeedbackType.TASK_STATUS: lambda f: f.priority == "high",
            FeedbackType.DUE_REMINDER: lambda f: True,
            FeedbackType.ACHIEVEMENT: lambda f: True,
            FeedbackType.DELAY_RISK: lambda f: True,
            FeedbackType.WORKLOAD_ALERT: lambda f: f.priority == "high"
        }
        return rules.get(feedback.type, lambda _: False)(feedback)
```

## 5. 定时任务

### 5.1 定时任务配置
```python
SCHEDULE_CONFIG = {
    "daily_summary": "0 20 * * *",  # 每天晚上8点
    "weekly_summary": "0 18 * * 5",  # 每周五晚上6点
    "monthly_summary": "0 10 1 * *",  # 每月1号上午10点
    "risk_analysis": "*/30 * * * *"  # 每30分钟
}
```

### 5.2 任务执行器
```python
class FeedbackScheduler:
    async def run_scheduled_tasks(self):
        """执行定时任务"""
        await self._generate_summaries()
        await self._analyze_risks()
        await self._clean_old_feedback()
```

## 6. 数据存储

### 6.1 查询接口
```python
class FeedbackRepository:
    async def get_unread_feedback(
        self,
        user_id: uuid.UUID,
        feedback_type: Optional[FeedbackType] = None
    ) -> List[Feedback]:
        """获取未读反馈"""
        query = select(Feedback).where(
            Feedback.user_id == user_id,
            Feedback.is_read == False
        )
        if feedback_type:
            query = query.where(Feedback.type == feedback_type)
        return await database.fetch_all(query)
    
    async def mark_as_read(self, feedback_id: uuid.UUID):
        """标记反馈为已读"""
        query = update(Feedback).where(
            Feedback.id == feedback_id
        ).values(is_read=True)
        await database.execute(query)
```
