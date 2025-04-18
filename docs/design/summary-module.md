# Summary 模块设计

## 1. 功能概述
Summary 模块负责对系统中的信息进行智能总结和统计分析，主要包括基于 LLM 的内容总结和用户行为统计分析两大功能。

## 2. LLM 总结功能

### 2.1 总结类型
- 单条内容总结：对单条较长内容进行摘要
- 批量内容总结：对同类型多条内容进行汇总
- 定期总结报告：按时间维度的内容回顾
- 主题关联总结：相关主题内容的关联分析

### 2.2 总结策略
```python
class SummaryStrategy(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    type: str  # 总结类型
    prompt_template: str  # LLM提示模板
    target_length: int  # 目标总结长度
    source_types: List[str]  # 支持的源类型
    user_id: uuid.UUID
```

### 2.3 总结结果存储
```python
class Summary(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    strategy_id: uuid.UUID
    content: str  # 总结内容
    source_messages: List[uuid.UUID]  # 关联的原始消息
    created_at: datetime
    metadata: dict  # 元数据（如关键词、主题等）
    user_id: uuid.UUID
```

## 3. 统计分析功能

### 3.1 基础统计指标
- 信息量统计（按类型、来源等）
- 时间分布分析
- 标签使用频率
- 关键词提取

### 3.2 用户行为分析
- 活跃度分析
- 内容偏好分析
- 使用习惯分析
- 时间投入分析

### 3.3 统计结果模型
```python
class StatisticsResult(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    type: str  # 统计类型
    period: str  # 统计周期
    data: dict  # 统计结果
    created_at: datetime
    user_id: uuid.UUID
```

## 4. 处理流程

### 4.1 LLM总结流程
1. 触发条件检查（定时/手动/阈值触发）
2. 内容收集和预处理
3. 生成LLM提示
4. 调用LLM服务
5. 结果处理和存储
6. 关联更新

### 4.2 统计分析流程
1. 数据收集
2. 指标计算
3. 结果汇总
4. 可视化处理
5. 存储和缓存

## 5. 开发优先级

### 第一阶段
1. 基础LLM总结功能
   - 单条内容总结
   - 简单的总结模板
   - 基础统计功能

### 第二阶段
1. 高级总结功能
   - 批量内容总结
   - 定期总结报告
   - 更多统计指标

### 第三阶段
1. 智能化功能
   - 自适应总结策略
   - 深度行为分析
   - 个性化推荐

## 6. 技术注意事项

### 6.1 LLM相关
- 控制API调用频率和成本
- 处理LLM响应超时和错误
- 优化提示模板
- 结果质量评估

### 6.2 性能相关
- 大量数据的统计计算优化
- 结果缓存策略
- 异步处理机制

### 6.3 存储相关
- 总结结果的存储策略
- 统计数据的聚合存储
- 历史数据的归档策略

### 6.4 扩展性
- 支持多种LLM服务
- 灵活的统计指标定义
- 可配置的总结策略