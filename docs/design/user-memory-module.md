# User Memory 模块设计

## 1. 功能概述

User Memory 模块负责管理和维护用户的状态记忆，包括行为习惯、任务偏好、工作模式等信息，为系统提供用户个性化的基础数据支持。

## 2. 核心功能

### 2.1 记忆数据管理
- 行为习惯记录
- 任务偏好存储
- 工作模式记录
- 状态历史追踪

### 2.2 记忆更新机制
- 实时状态更新
- 定期记忆整合
- LLM辅助分析
- 记忆衰减处理

### 2.3 记忆查询服务
- 习惯模式查询
- 偏好信息获取
- 状态历史回溯
- 趋势分析支持

## 3. 数据模型

### 3.1 用户记忆模型
```python
class UserMemory(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID
    memory_type: MemoryType
    content: dict  # 记忆内容
    importance: float  # 重要程度
    created_at: datetime
    last_accessed: datetime
    decay_factor: float  # 记忆衰减因子
    confidence: float  # 可信度
```

### 3.2 记忆类型
```python
class MemoryType(str, Enum):
    BEHAVIOR = "behavior"      # 行为习惯
    PREFERENCE = "preference"  # 任务偏好
    WORK_MODE = "work_mode"   # 工作模式
    STATUS = "status"         # 状态记录
```

### 3.3 行为记录模型
```python
class BehaviorRecord(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID
    behavior_type: str
    context: dict  # 行为发生的上下文
    timestamp: datetime
    details: dict  # 行为详情
```

## 4. 核心服务

### 4.1 记忆管理器
```python
class MemoryManager:
    async def update_memory(
        self,
        user_id: UUID,
        memory_type: MemoryType,
        content: dict
    ):
        """更新用户记忆"""
        memory = await self._load_memory(user_id, memory_type)
        updated_content = await self._merge_memory(memory.content, content)
        await self._save_memory(memory, updated_content)
    
    async def get_memory(
        self,
        user_id: UUID,
        memory_type: MemoryType
    ) -> UserMemory:
        """获取指定类型的记忆"""
        memory = await self._load_memory(user_id, memory_type)
        await self._apply_decay(memory)  # 应用记忆衰减
        return memory
    
    async def analyze_memory(
        self,
        user_id: UUID,
        memory_type: MemoryType
    ) -> dict:
        """分析记忆内容"""
        memory = await self.get_memory(user_id, memory_type)
        return await self._analyze_with_llm(memory)
```

### 4.2 行为记录器
```python
class BehaviorRecorder:
    async def record_behavior(
        self,
        user_id: UUID,
        behavior_type: str,
        context: dict,
        details: dict
    ):
        """记录用户行为"""
        record = BehaviorRecord(
            user_id=user_id,
            behavior_type=behavior_type,
            context=context,
            details=details,
            timestamp=datetime.now()
        )
        await self._save_record(record)
        await self._update_related_memory(record)
```

### 4.3 记忆分析器
```python
class MemoryAnalyzer:
    async def analyze_patterns(self, user_id: UUID) -> dict:
        """分析用户行为模式"""
        behaviors = await self._load_recent_behaviors(user_id)
        return await self._identify_patterns(behaviors)
    
    async def generate_insights(self, user_id: UUID) -> dict:
        """生成用户洞察"""
        memories = await self._load_all_memories(user_id)
        return await self._analyze_with_llm(memories)
```

## 5. 配置项

```python
MEMORY_CONFIG = {
    "decay_rates": {
        "behavior": 0.1,    # 每天的衰减率
        "preference": 0.05,
        "work_mode": 0.08,
        "status": 0.15
    },
    "confidence_thresholds": {
        "high": 0.8,
        "medium": 0.6,
        "low": 0.4
    },
    "retention_periods": {
        "behavior": 90,     # 天
        "preference": 180,
        "work_mode": 120,
        "status": 30
    },
    "importance_threshold": 0.7  # 重要性保护阈值
}

IMPORTANCE_WEIGHTS = {
    "behavior": {
        "base_importance": 0.3,
        "usage_frequency": 0.2,
        "relation_strength": 0.1,
        "impact_scope": 0.2,
        "time_sensitivity": 0.1,
        "user_marked": 0.1
    },
    "preference": {
        "base_importance": 0.4,
        "usage_frequency": 0.3,
        "relation_strength": 0.1,
        "impact_scope": 0.1,
        "time_sensitivity": 0.1,
        "user_marked": 0.1
    },
    "work_mode": {
        "base_importance": 0.3,
        "usage_frequency": 0.3,
        "relation_strength": 0.1,
        "impact_scope": 0.2,
        "time_sensitivity": 0.1,
        "user_marked": 0.1
    },
    "status": {
        "base_importance": 0.5,
        "usage_frequency": 0.2,
        "relation_strength": 0.1,
        "impact_scope": 0.1,
        "time_sensitivity": 0.1,
        "user_marked": 0.1
    }
}
```

## 6. 开发优先级

### 第一阶段
1. 基础记忆功能
   - 基本记忆存储
   - 简单行为记录
   - 记忆查询接口

### 第二阶段
1. 记忆分析功能
   - LLM分析集成
   - 模式识别
   - 记忆衰减机制

### 第三阶段
1. 高级功能
   - 复杂行为模式分析
   - 智能记忆整合
   - 预测性分析

## 7. 记忆重要性评估器

### 7.1 功能概述

记忆重要性评估器负责评估记忆的重要性，并根据评估结果决定是否需要衰减记忆。它考虑了多种因素，如基础重要性、使用频率、关联强度、影响范围、时效性和用户标记。

### 7.2 核心功能

#### 7.2.1 评估记忆重要性
- 基础重要性因子
- 使用频率因子
- 关联强度因子
- 影响范围因子
- 时效性因子
- 用户标记因子

#### 7.2.2 判断是否需要衰减
- 基础衰减率
- 重要性保护
- 关键记忆保护
- 计算实际衰减率

### 7.3 代码实现

```python
class MemoryImportanceEvaluator:
    async def evaluate_importance(
        self,
        memory: UserMemory,
        context: dict
    ) -> float:
        """评估记忆重要性"""
        factors = {
            # 基础重要性因子
            "base_importance": memory.importance,
            
            # 使用频率因子
            "usage_frequency": await self._calculate_usage_frequency(memory),
            
            # 关联强度因子 - 与其他记忆的关联程度
            "relation_strength": await self._calculate_relation_strength(memory),
            
            # 影响范围因子 - 影响决策的范围
            "impact_scope": await self._evaluate_impact_scope(memory),
            
            # 时效性因子 - 与时间相关的重要性
            "time_sensitivity": await self._evaluate_time_sensitivity(memory, context),
            
            # 用户标记因子 - 用户手动标记的重要性
            "user_marked": memory.metadata.get("user_importance", 0.0)
        }
        
        # 根据记忆类型使用不同的权重配置
        weights = IMPORTANCE_WEIGHTS[memory.memory_type]
        return self._calculate_weighted_score(factors, weights)

    async def should_decay(
        self,
        memory: UserMemory,
        current_importance: float
    ) -> tuple[bool, float]:
        """判断是否应该衰减及衰减程度"""
        # 基础衰减率
        base_decay = MEMORY_CONFIG["decay_rates"][memory.memory_type]
        
        # 重要性保护
        if current_importance > MEMORY_CONFIG["importance_threshold"]:
            return False, 0.0
            
        # 关键记忆保护
        if await self._is_critical_memory(memory):
            return False, 0.0
            
        # 计算实际衰减率
        actual_decay = base_decay * (1 - current_importance)
        
        return True, actual_decay
```

### 7.4 核心方法

#### 7.4.1 `_calculate_usage_frequency`
- 计算记忆的使用频率
- 可以根据记忆的访问次数和时间间隔来评估

#### 7.4.2 `_calculate_relation_strength`
- 计算记忆与其他记忆的关联程度
- 可以通过分析记忆之间的共现和关联规则来评估

#### 7.4.3 `_evaluate_impact_scope`
- 评估记忆对决策的影响范围
- 可以根据记忆内容的复杂性和重要性来评估

#### 7.4.4 `_evaluate_time_sensitivity`
- 评估记忆的时效性
- 可以根据记忆的创建时间和当前时间来评估

#### 7.4.5 `_is_critical_memory`
- 判断记忆是否为关键记忆
- 可以根据记忆的内容和重要性来判断

### 7.5 重要性评估流程

1. 收集记忆的各个重要性因子
2. 根据记忆类型应用不同的权重配置
3. 计算加权后的总重要性
4. 判断是否需要衰减记忆
5. 如果需要衰减，计算实际衰减率

### 7.6 注意事项

- 重要性评估器需要定期更新和优化，以适应不同的用户行为和记忆类型
- 需要考虑记忆的长期重要性和短期重要性之间的平衡
- 可以引入机器学习模型来提高重要性评估的准确性
