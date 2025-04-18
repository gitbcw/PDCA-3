# 智谱AI GLM-4 API 集成指南

本文档详细说明了如何在PDCA个人助手系统中使用智谱AI的GLM-4 API。

## 概述

PDCA个人助手系统现已支持智谱AI的GLM-4大语言模型，这是一个强大的中文大语言模型，具有优秀的中文理解和生成能力。

GLM-4支持以下功能：
- 文本生成和对话
- 流式输出
- 温度和top_p等参数控制
- 上下文理解

## 配置方法

### 环境变量配置

在项目根目录的`.env.local`文件中添加以下配置：

```
# LLM提供商选择
LLM_PROVIDER="glm"  # 可选值: openai, anthropic, custom, glm

# 智谱AI GLM-4配置
GLM_API_KEY="你的GLM API密钥"
GLM_BASE_URL="https://open.bigmodel.cn"  # 默认值，通常不需要修改
GLM_MODEL="glm-4"  # 默认值，也可以使用其他支持的模型

# 通用LLM配置
LLM_TEMPERATURE="0.7"  # 可选，控制生成文本的随机性
LLM_MAX_TOKENS="1000"  # 可选，控制生成文本的最大长度
LLM_STREAMING="true"   # 可选，是否启用流式输出
```

### 配置项说明

| 配置项 | 说明 | 默认值 |
|-------|------|-------|
| LLM_PROVIDER | LLM提供商选择 | openai |
| GLM_API_KEY | 智谱AI的API密钥 | - |
| GLM_BASE_URL | 智谱AI的API基础URL | https://open.bigmodel.cn |
| GLM_MODEL | 使用的模型名称 | glm-4 |
| LLM_TEMPERATURE | 生成温度参数 | 0.7 |
| LLM_MAX_TOKENS | 最大生成令牌数 | - |
| LLM_STREAMING | 是否启用流式输出 | false |

## 获取API密钥

要使用GLM-4 API，您需要：

1. 访问[智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册并登录账号
3. 在控制台中创建API密钥
4. 将API密钥复制到`.env.local`文件中的`GLM_API_KEY`配置项

## 代码使用示例

### 基本使用

```typescript
import { GLMLLM } from "@/utils/llm/GLMLLM";

const glmLLM = new GLMLLM({
  apiKey: "your-api-key",
  baseUrl: "https://open.bigmodel.cn",
  model: "glm-4",
  temperature: 0.7
});

const result = await glmLLM.invoke("请告诉我关于PDCA循环的信息");
console.log(result);
```

### 使用工厂函数

```typescript
import { createLLM } from "@/utils/llm/LLMFactory";

const llm = createLLM({
  provider: "glm",
  apiKey: "your-api-key",
  model: "glm-4",
  temperature: 0.7
});

const result = await llm.invoke("请告诉我关于PDCA循环的信息");
console.log(result);
```

### 从环境变量创建

```typescript
import { createLLMFromEnv } from "@/utils/llm/LLMFactory";

// 确保在.env.local中设置了LLM_PROVIDER="glm"
const llm = createLLMFromEnv();
const result = await llm.invoke("请告诉我关于PDCA循环的信息");
console.log(result);
```

### 流式输出

```typescript
const stream = await glmLLM.stream("请告诉我关于PDCA循环的信息");
for await (const chunk of stream) {
  process.stdout.write(chunk.text);
}
```

## 与LangChain集成

GLM-4 LLM类完全兼容LangChain的其他组件，可以与提示模板、检索器等无缝集成：

```typescript
import { PromptTemplate } from "@langchain/core/prompts";
import { createLLM } from "@/utils/llm/LLMFactory";

const llm = createLLM({
  provider: "glm",
  apiKey: "your-api-key"
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

系统提供了一个示例页面，可以用来测试不同的LLM提供商，包括GLM-4：

访问路径：`/examples/custom-llm`

在这个页面上，您可以：
- 选择GLM-4作为LLM提供商
- 配置API密钥和其他参数
- 输入提示词并获取响应
- 测试流式输出

## 常见问题

### 1. 如何处理API错误？

如果您遇到API错误，请检查：
- API密钥是否正确
- 账户余额是否充足
- 网络连接是否正常
- 请求参数是否有效

### 2. GLM-4与其他模型的区别？

GLM-4是智谱AI开发的大语言模型，具有以下特点：
- 优秀的中文理解和生成能力
- 支持多轮对话
- 支持流式输出
- API格式与OpenAI类似但有区别

### 3. 如何调整生成文本的质量？

您可以通过以下参数调整生成文本的质量：
- `temperature`：控制生成文本的随机性，值越高随机性越大
- `top_p`：控制生成文本的多样性，与temperature类似但机制不同
- `max_tokens`：控制生成文本的最大长度

## 参考资料

- [智谱AI GLM-4 API文档](https://bigmodel.cn/dev/api/normal-model/glm-4)
- [LangChain.js文档](https://js.langchain.com/docs/)
- [PDCA个人助手系统文档](./README.md)
