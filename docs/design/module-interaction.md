# Analysis 和 Decision 模块交互设计

## 1. 职责划分

### Analysis 模块职责
- 任务级别的具体分析
- 使用 LLM 进行深度分析
- 生成具体的任务属性和建议
- 提供基础的优化建议

### Decision 模块职责
- 系统级别的决策制定
- 整合多模块数据和分析结果
- 生成全局优化策略
- 协调决策的执行

## 2. 交互流程

### 2.1 数据流向
Analysis -> Decision:
- 任务分析结果
- 复杂度评估
- 依赖关系图
- 优化建议

Decision -> Analysis:
- 分析请求
- 优先级指导
- 关注点调整
- 分析参数配置

### 2.2 协作场景

1. 任务优化场景：
   - Analysis: 提供单个任务的具体分析
   - Decision: 结合全局情况制定优化策略

2. 资源分配场景：
   - Analysis: 评估任务资源需求
   - Decision: 统筹资源分配方案

3. 优先级调整场景：
   - Analysis: 分析任务特征和依赖
   - Decision: 确定最终的优先级策略

## 3. 实现建议

### 3.1 接口设计
```python
# Analysis 模块对外接口
class AnalysisService:
    async def analyze_task(self, task_id: UUID) -> AnalysisResult:
        """详细分析单个任务"""
        pass

    async def analyze_task_group(self, task_ids: List[UUID]) -> GroupAnalysisResult:
        """分析任务组"""
        pass

# Decision 模块对外接口
class DecisionService:
    async def make_system_decision(self, context: dict) -> Decision:
        """制定系统级决策"""
        pass

    async def apply_decision(self, decision_id: UUID) -> bool:
        """执行决策"""
        pass
```

### 3.2 数据交换格式
```python
class AnalysisResult:
    task_id: UUID
    complexity: int
    estimated_time: int
    dependencies: List[UUID]
    suggestions: List[dict]

class Decision:
    id: UUID
    type: DecisionType
    analysis_results: List[UUID]  # 关联的分析结果
    strategy: dict
    actions: List[dict]
```