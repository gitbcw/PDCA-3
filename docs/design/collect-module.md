# Collect 模块设计

## 1. 功能概述
Collect 模块负责从多个信息源收集数据，将不同来源的信息标准化后存入系统。作为个人助手的信息采集层，需要支持多样化的信息源接入。

## 2. 信息源类型

### 2.1 内部信息源
- Input模块输入
- 系统生成的任务和记录
- 用户反馈和操作记录

### 2.2 外部信息源
- 笔记工具 (如Flomo, Notion)
- 即时通讯 (如微信, Telegram)
- RSS订阅
- 邮件
- API接口
- 文件导入 (如Markdown, CSV)

## 3. 技术实现

### 3.1 数据模型
```python
class Source(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    type: str  # 信息源类型
    config: dict  # 信息源配置
    enabled: bool = True
    last_sync: Optional[datetime] = None
    user_id: uuid.UUID

class CollectedItem(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    source_id: uuid.UUID
    content: str
    original_content: dict  # 原始数据
    metadata: dict  # 元数据（时间、标签等）
    created_at: datetime
    collected_at: datetime
    processed: bool = False
    user_id: uuid.UUID
```

### 3.2 信息源接口
```python
class SourceInterface(Protocol):
    async def connect(self) -> bool:
        """连接信息源"""
        ...
    
    async def collect(self) -> List[Dict]:
        """采集数据"""
        ...
    
    async def transform(self, data: Dict) -> CollectedItem:
        """转换数据为标准格式"""
        ...
```

### 3.3 API设计
```
# 信息源管理
POST /api/v1/sources - 添加信息源
GET /api/v1/sources - 获取信息源列表
PUT /api/v1/sources/{id} - 更新信息源配置
DELETE /api/v1/sources/{id} - 删除信息源

# 数据采集
POST /api/v1/collect/{source_id} - 手动触发采集
GET /api/v1/collected-items - 获取采集记录
```

## 4. 采集流程

### 4.1 自动采集流程
1. 定时任务触发采集
2. 检查需要同步的信息源
3. 调用对应源的采集方法
4. 数据标准化处理
5. 存储采集结果
6. 触发后续处理（如LLM分析）

### 4.2 手动采集流程
1. 用户触发特定源的采集
2. 执行采集操作
3. 实时反馈采集状态
4. 存储采集结果

## 5. 数据处理

### 5.1 数据标准化
- 时间格式统一
- 内容格式转换
- 元数据提取
- 标签处理

### 5.2 数据清洗
- 去重处理
- 内容过滤
- 敏感信息处理
- 数据验证

## 6. 开发优先级

### 第一阶段
1. 基础框架搭建
   - 信息源管理
   - 数据模型实现
   - 采集流程框架

2. 实现基础信息源
   - Input模块集成
   - 文件导入功能
   - RSS订阅支持

### 第二阶段
1. 扩展信息源
   - Flomo集成
   - 邮件采集
   - 更多RSS增强

2. 功能增强
   - 自动采集调度
   - 数据清洗优化
   - 采集状态监控

### 第三阶段
1. 高级功能
   - 即时通讯集成
   - API对接能力
   - 自定义源支持

## 7. 数据源备注

### 7.1 优先级考虑
- Input模块作为最基础的数据源，优先实现
- 文件导入和RSS是相对独立且容易实现的数据源，可以作为第二优先级
- API对接类的数据源（如Flomo）需要考虑认证和授权，作为第三优先级
- 即时通讯类数据源涉及到隐私和复杂度较高，放在最后实现

### 7.2 技术注意事项
- 每个数据源的认证方式不同，需要设计灵活的认证配置机制
- 数据源的同步频率需要可配置，避免过度请求
- 需要考虑数据源API的限制和错误处理
- 某些数据源可能需要特殊的数据清洗规则

### 7.3 待调研数据源
1. Flomo API
   - 认证机制
   - API限制
   - 数据格式

2. RSS源
   - 支持的RSS格式
   - 更新检测机制
   - 内容提取策略

3. 文件导入
   - 支持的文件格式
   - 解析规则
   - 批量导入机制

4. 邮件采集
   - 邮件协议支持
   - 过滤规则
   - 附件处理

### 7.4 后续扩展考虑
- 自定义数据源的插件机制
- 数据源的健康监控
- 采集任务的调度优化
- 数据源之间的数据去重
