# Goal 模块设计

## 1. 功能概述

Goal 模块是系统的顶层模块，负责管理用户的各层级目标，为其他模块提供目标导向的上下文信息，确保所有活动都服务于用户的核心目标。

## 2. 核心功能

### 2.1 目标层级管理
- 愿景目标（3-5年）
- 年度目标
- 季度目标
- 月度目标
- 周目标

### 2.2 基于 LLM 的对话式目标设定
- 自然语言目标输入
- 交互式目标完善
- 智能目标分解建议
- 实时目标结构化
- 上下文感知的目标调整

### 2.3 目标制定辅助
- SMART 原则验证
- 目标可行性分析
- 资源需求评估
- 智能建议生成

### 2.4 目标分解与追踪
- 目标自动分解
- 进度追踪
- 完成度评估
- 偏差分析

### 2.5 目标关联分析
- 目标间依赖关系
- 目标冲突检测
- 资源竞争分析
- 优先级建议

## 3. 数据模型

### 3.1 目标模型
```python
class Goal(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    description: str
    level: GoalLevel  # Vision/Yearly/Quarterly/Monthly/Weekly
    status: GoalStatus
    start_date: datetime
    end_date: datetime
    progress: float = 0.0
    parent_goal_id: Optional[uuid.UUID] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: uuid.UUID
    
    # 目标特征
    metrics: List[dict]  # 衡量指标
    resources: List[dict]  # 所需资源
    priority: int  # 优先级
    weight: float  # 权重
    
    # LLM 对话相关
    conversation_history: List[dict]  # 目标设定的对话历史
    ai_suggestions: dict  # AI 生成的建议和分析
    context_info: dict  # 目标上下文信息
```

### 3.2 目标进度模型
```python
class GoalProgress(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    goal_id: uuid.UUID
    timestamp: datetime
    progress: float
    notes: Optional[str]
    related_tasks: List[uuid.UUID]  # 相关任务
```

## 4. 对话式目标设定流程

### 4.1 基础对话流程
1. 用户发起目标设定请求
2. AI 引导用户描述目标
3. AI 通过对话收集关键信息：
   - 目标具体内容
   - 时间框架
   - 成功标准
   - 资源约束
4. AI 实时构建目标结构
5. 用户确认和调整

### 4.2 目标完善对话
1. AI 基于 SMART 原则提出完善建议
2. 引导用户设定可衡量的指标
3. 讨论可能的障碍和解决方案
4. 确定关键里程碑
5. 建立进度追踪方式

### 4.3 目标分解对话
1. AI 建议目标分解方案
2. 用户确认或调整分解结果
3. 建立子目标间的关联
4. 设定各级目标的时间节点
5. 生成初始任务建议

## 5. 界面设计

### 5.1 对话式交互界面
- 类聊天界面的目标设定区域
- 实时目标体系可视化
- 目标结构树形展示
- 时间轴视图
- 进度追踪仪表板

### 5.2 交互功能
- 自然语言输入
- 实时目标预览
- 拖拽调整目标层级
- 快速编辑目标属性
- 进度更新操作

## 6. 开发优先级

### 第一阶段：基础对话功能
1. 基础目标 CRUD 操作
2. 简单对话式目标设定
3. 基础目标结构化
4. 简单进度追踪

### 第二阶段：智能辅助
1. LLM 高级对话能力
2. SMART 原则集成
3. 智能目标分解
4. 进阶可视化

### 第三阶段：高级特性
1. 多维度分析
2. 预测性建议
3. 自适应调优
4. 高级数据可视化
