# Message 模块设计

## 1. 功能概述
Message 模块负责对系统中的信息进行统一存储和分类管理。核心功能包括信息的存储结构设计、分类体系设计以及检索功能实现。

## 2. 数据模型设计

### 2.1 基础消息模型
```python
class Message(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    content: str  # 统一格式后的内容
    raw_content: dict  # 原始内容
    source_type: str  # 信息来源类型
    source_id: uuid.UUID  # 关联的源ID
    created_at: datetime
    updated_at: datetime
    user_id: uuid.UUID
    
    # 分类相关字段
    category_id: Optional[uuid.UUID] = None  # 主分类
    tags: List[str] = []  # 标签列表
    metadata: dict = {}  # 元数据，用于存储额外的分类信息
```

### 2.2 分类模型
```python
class Category(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None  # 支持层级分类
    source_type: Optional[str] = None  # 可选关联源类型
    user_id: uuid.UUID
```

## 3. 分类策略

### 3.1 源级别分类
- 基于信息源类型的自动分类
- 每个源可以预设默认分类
- 支持源级别的自定义分类规则

### 3.2 内容级别分类
- 基于内容格式的分类（文本、链接、图片等）
- 基于内容长度的分类（短消息、长文本等）
- 支持自定义内容分类规则

### 3.3 用户自定义分类
- 手动分类和标签
- 自定义分类规则
- 批量分类工具

## 4. 存储策略

### 4.1 数据标准化
- 统一的时间格式
- 统一的内容格式
- 统一的元数据结构

### 4.2 存储优化
- 分表策略（按时间、按源类型等）
- 索引设计
- 缓存策略

## 5. 检索功能

### 5.1 基础检索
- 按源类型检索
- 按分类检索
- 按标签检索
- 全文搜索

### 5.2 高级检索
- 组合条件检索
- 时间范围检索
- 元数据检索

## 6. 开发优先级

### 第一阶段
1. 基础存储功能
   - 消息存储模型实现
   - 基础分类功能
   - 简单检索接口

### 第二阶段
1. 分类体系完善
   - 多级分类支持
   - 标签系统
   - 自定义分类规则

### 第三阶段
1. 高级功能
   - 高级检索
   - 存储优化
   - 缓存策略

## 7. 技术注意事项

### 7.1 存储考虑
- 需要考虑大量数据的存储效率
- 考虑不同类型内容的存储方式
- 考虑数据备份和恢复策略

### 7.2 分类考虑
- 分类体系要具有扩展性
- 避免过度复杂的分类规则
- 保持分类体系的灵活性

### 7.3 性能考虑
- 检索性能优化
- 大量数据的处理效率
- 缓存策略的合理使用

### 7.4 集成考虑
- 与Collect模块的无缝集成
- 与其他模块的数据交互
- 预留扩展接口

## 8. 常见存储类型定义

### 8.1 基础类型
- TEXT: 纯文本内容
- MARKDOWN: Markdown格式文本
- HTML: HTML格式内容
- URL: 链接类型
- IMAGE: 图片类型（存储路径或base64）
- FILE: 文件类型（存储路径）

### 8.2 复合类型
- NOTE: 笔记类型（可包含文本、图片等）
- TASK: 任务类型（与Task模块关联）
- RSS_ITEM: RSS文章条目
- EMAIL: 邮件内容（包含标题、正文、附件等）
- CHAT: 聊天记录类型

### 8.3 元数据字段
```python
class MessageMetadata(SQLModel):
    content_type: str  # 内容类型（如TEXT, MARKDOWN等）
    source_info: dict  # 来源信息（如RSS源URL、邮件发件人等）
    created_time: datetime  # 原始创建时间
    collected_time: datetime  # 采集时间
    tags: List[str] = []  # 标签列表
    references: List[str] = []  # 相关引用或链接
    extra: dict = {}  # 额外信息，用于存储特定类型的专有字段
```

### 8.4 类型特定字段示例
```python
# RSS条目专有字段
class RssItemExtra:
    feed_title: str
    feed_link: str
    publish_date: datetime
    author: Optional[str]

# 邮件专有字段
class EmailExtra:
    subject: str
    from_address: str
    to_address: List[str]
    cc: List[str]
    attachments: List[dict]

# 笔记专有字段
class NoteExtra:
    title: str
    format: str  # 如markdown, text等
    references: List[str]
    last_modified: datetime
```

### 8.5 存储格式示例
```json
{
    "id": "uuid",
    "content_type": "NOTE",
    "content": "# 标题\n正文内容...",
    "raw_content": {
        "original_format": "markdown",
        "content": "原始内容...",
        "assets": []
    },
    "metadata": {
        "source_type": "flomo",
        "source_info": {
            "flomo_id": "xxx",
            "url": "https://..."
        },
        "created_time": "2024-01-20T10:00:00Z",
        "collected_time": "2024-01-20T10:05:00Z",
        "tags": ["工作", "想法"],
        "extra": {
            "title": "笔记标题",
            "format": "markdown",
            "last_modified": "2024-01-20T10:00:00Z"
        }
    }
}
```