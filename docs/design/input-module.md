# Input 模块设计

## 1. 功能概述
Input 模块的核心目的是提供一个简单的界面，让用户可以直接输入想法、记录或任务，系统通过 LLM 理解并处理这些输入。

## 2. 核心功能
- 文本输入界面
- 输入内容的存储
- 通过 LLM 分析输入并创建相应的 Task

## 3. 技术实现

### 3.1 数据模型
```python
class Input(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    content: str
    user_id: uuid.UUID
    created_at: datetime
    processed: bool = False  # 标记是否已经被处理
    task_id: Optional[uuid.UUID] = None  # 关联的任务ID
```

### 3.2 前端组件
简单的文本输入组件，包含：
- 文本输入框
- 提交按钮

### 3.3 后端API
```
POST /api/v1/inputs
- 接收用户输入
- 存储输入内容
- 触发 LLM 处理

GET /api/v1/inputs
- 获取历史输入记录
```

## 4. 处理流程
1. 用户在输入框中输入内容
2. 系统保存输入内容
3. 调用 LLM API 分析内容
4. 根据 LLM 分析结果创建对应的 Task

## 5. 开发计划
1. 实现基础输入界面
2. 完成输入内容的存储功能
3. 集成 LLM API
4. 实现输入到 Task 的转换逻辑