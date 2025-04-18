# 自定义LLM API 集成指南

本文档详细说明了如何在PDCA个人助手系统中使用自定义LLM API。

## 概述

PDCA个人助手系统支持多种LLM提供商，包括：

1. **OpenAI** - 默认支持，使用OpenAI的API
2. **Anthropic** - 支持Claude系列模型
3. **自定义LLM API** - 支持连接到任何兼容的LLM API

自定义LLM API功能允许您连接到任何兼容的LLM服务，包括但不限于：

- 私有部署的开源模型（如Llama、Mistral等）
- 兼容OpenAI API格式的服务（如LocalAI、vLLM等）
- 其他商业LLM API服务

## 配置方法

### 环境变量配置

在项目根目录的`.env.local`文件中添加以下配置：

```
# LLM提供商选择
LLM_PROVIDER="custom"  # 可选值: openai, anthropic, custom

# 自定义LLM API配置
CUSTOM_LLM_API_KEY="你的自定义LLM API密钥"
CUSTOM_LLM_BASE_URL="https://your-custom-llm-api.com/v1"
CUSTOM_LLM_MODEL="your-model-name"
CUSTOM_LLM_HEADERS="{\"X-Custom-Header\":\"custom-value\"}"

# 通用LLM配置
LLM_TEMPERATURE="0.7"
LLM_MAX_TOKENS="1000"
LLM_STREAMING="true"
```

### 配置项说明

| 配置项 | 说明 | 默认值 |
|-------|------|-------|
| LLM_PROVIDER | LLM提供商选择 | openai |
| CUSTOM_LLM_API_KEY | 自定义LLM API密钥 | - |
| CUSTOM_LLM_BASE_URL | 自定义LLM API的基础URL | - |
| CUSTOM_LLM_MODEL | 自定义LLM的模型名称 | default |
| CUSTOM_LLM_HEADERS | 自定义请求头（JSON格式） | {} |
| LLM_TEMPERATURE | 生成温度参数 | 0.7 |
| LLM_MAX_TOKENS | 最大生成令牌数 | - |
| LLM_STREAMING | 是否启用流式输出 | false |

## API格式要求

自定义LLM API需要满足以下格式要求之一：

### 1. OpenAI兼容格式

请求格式：
```json
{
  "prompt": "用户输入",
  "model": "模型名称",
  "temperature": 0.7,
  "max_tokens": 1000,
  "stream": true
}
```

响应格式（非流式）：
```json
{
  "choices": [
    {
      "text": "生成的文本"
    }
  ]
}
```

响应格式（流式）：
```
data: {"choices":[{"text":"生成"}]}

data: {"choices":[{"text":"的"}]}

data: {"choices":[{"text":"文本"}]}

data: [DONE]
```

### 2. 通用格式

系统也支持以下通用响应格式：

```json
{
  "result": "生成的文本"
}
```

或

```json
{
  "output": "生成的文本"
}
```

或

```json
{
  "generated_text": "生成的文本"
}
```

或

```json
{
  "response": "生成的文本"
}
```

## 代码使用示例

### 基本使用

```typescript
import { CustomLLM } from "@/utils/llm/CustomLLM";

const customLLM = new CustomLLM({
  apiKey: "your-api-key",
  baseUrl: "https://your-llm-api.com/v1",
  model: "your-model-name",
  temperature: 0.7
});

const result = await customLLM.invoke("请告诉我关于PDCA循环的信息");
console.log(result);
```

### 使用工厂函数

```typescript
import { createLLM } from "@/utils/llm/LLMFactory";

const llm = createLLM({
  provider: "custom",
  apiKey: "your-api-key",
  baseUrl: "https://your-llm-api.com/v1",
  model: "your-model-name",
  temperature: 0.7
});

const result = await llm.invoke("请告诉我关于PDCA循环的信息");
console.log(result);
```

### 从环境变量创建

```typescript
import { createLLMFromEnv } from "@/utils/llm/LLMFactory";

const llm = createLLMFromEnv();
const result = await llm.invoke("请告诉我关于PDCA循环的信息");
console.log(result);
```

### 流式输出

```typescript
const stream = await customLLM.stream("请告诉我关于PDCA循环的信息");
for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
```

## 与LangChain集成

自定义LLM类完全兼容LangChain的其他组件，可以与提示模板、检索器等无缝集成：

```typescript
import { PromptTemplate } from "@langchain/core/prompts";
import { createLLM } from "@/utils/llm/LLMFactory";

const llm = createLLM({
  provider: "custom",
  apiKey: "your-api-key",
  baseUrl: "https://your-llm-api.com/v1"
});

const promptTemplate = PromptTemplate.fromTemplate(
  "请用{language}回答以下问题: {question}"
);

const chain = promptTemplate.pipe(llm);

const result = await chain.invoke({
  language: "中文",
  question: "什么是PDCA循环?"
});
```

## 示例页面

系统提供了一个示例页面，可以用来测试不同的LLM提供商：

访问路径：`/examples/custom-llm`

在这个页面上，您可以：
- 选择不同的LLM提供商
- 配置API密钥和其他参数
- 输入提示词并获取响应
- 测试流式输出

## 常见问题

### 1. 如何连接到本地运行的LLM？

如果您在本地运行LLM服务（如使用Ollama、LocalAI等），可以将`CUSTOM_LLM_BASE_URL`设置为本地服务地址，例如：

```
CUSTOM_LLM_BASE_URL="http://localhost:11434/v1"
```

### 2. 如何处理不同的API格式？

自定义LLM类已经内置了对多种常见API格式的支持。如果您的API有特殊格式，可以扩展`CustomLLM`类并重写`extractTextFromResponse`和`extractStreamChunk`方法。

### 3. 如何添加自定义请求头？

可以通过`CUSTOM_LLM_HEADERS`环境变量或在代码中直接设置：

```typescript
const customLLM = new CustomLLM({
  apiKey: "your-api-key",
  baseUrl: "https://your-llm-api.com/v1",
  headers: {
    "X-Custom-Header": "custom-value",
    "Authorization": "Bearer your-token"
  }
});
```

### 4. 如何处理API错误？

自定义LLM类会捕获并处理常见的API错误。您可以在应用中添加适当的错误处理逻辑：

```typescript
try {
  const result = await customLLM.invoke("您的提示词");
  console.log(result);
} catch (error) {
  console.error("LLM API调用失败:", error.message);
  // 处理错误...
}
```

## 支持的LLM服务示例

以下是一些可以与自定义LLM API集成的服务示例：

1. **Ollama** - 本地运行的开源模型
   - 基础URL: `http://localhost:11434/api`

2. **LocalAI** - 兼容OpenAI API的本地服务
   - 基础URL: `http://localhost:8080/v1`

3. **vLLM** - 高性能推理服务
   - 基础URL: `http://localhost:8000/v1`

4. **自托管的OpenAI兼容API**
   - 基础URL: `https://your-openai-compatible-api.com/v1`

5. **其他商业LLM API**
   - 根据提供商文档配置相应的基础URL和请求头
