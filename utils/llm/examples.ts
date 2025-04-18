import { CustomLLM } from "./CustomLLM";
import { createLLM, createLLMFromEnv } from "./LLMFactory";

/**
 * 使用自定义LLM的示例
 */
export async function customLLMExample() {
  // 直接使用CustomLLM类
  const customLLM = new CustomLLM({
    apiKey: "your-api-key",
    baseUrl: "https://your-llm-api.com/v1",
    model: "your-model-name",
    temperature: 0.5,
    maxTokens: 1000,
    headers: {
      "X-Custom-Header": "custom-value"
    }
  });

  // 调用LLM
  const result = await customLLM.invoke("请告诉我关于人工智能的信息");
  console.log("自定义LLM结果:", result);

  // 流式输出
  console.log("流式输出:");
  const stream = await customLLM.stream("请告诉我关于人工智能的信息");
  for await (const chunk of stream) {
    process.stdout.write(chunk.text);
  }
  console.log("\n流式输出完成");
}

/**
 * 使用LLM工厂函数的示例
 */
export async function llmFactoryExample() {
  // 使用OpenAI
  const openaiLLM = createLLM({
    provider: "openai",
    model: "gpt-4o-mini",
    temperature: 0.7
  });

  // 使用Anthropic
  const anthropicLLM = createLLM({
    provider: "anthropic",
    model: "claude-3-haiku-20240307",
    temperature: 0.7
  });

  // 使用自定义LLM
  const customLLM = createLLM({
    provider: "custom",
    apiKey: "your-api-key",
    baseUrl: "https://your-llm-api.com/v1",
    model: "your-model-name",
    temperature: 0.5
  });

  // 从环境变量创建LLM
  const envLLM = createLLMFromEnv();

  // 调用不同的LLM
  const prompt = "请告诉我关于人工智能的信息";
  
  console.log("OpenAI结果:");
  console.log(await openaiLLM.invoke(prompt));
  
  console.log("Anthropic结果:");
  console.log(await anthropicLLM.invoke(prompt));
  
  console.log("自定义LLM结果:");
  console.log(await customLLM.invoke(prompt));
  
  console.log("环境变量LLM结果:");
  console.log(await envLLM.invoke(prompt));
}

/**
 * 与LangChain组件集成的示例
 */
export async function langchainIntegrationExample() {
  // 导入所需的LangChain组件
  import { PromptTemplate } from "@langchain/core/prompts";
  
  // 创建自定义LLM
  const customLLM = new CustomLLM({
    apiKey: "your-api-key",
    baseUrl: "https://your-llm-api.com/v1",
    model: "your-model-name",
    temperature: 0.5
  });
  
  // 创建提示模板
  const promptTemplate = PromptTemplate.fromTemplate(
    "请用{language}回答以下问题: {question}"
  );
  
  // 创建链
  const chain = promptTemplate.pipe(customLLM);
  
  // 调用链
  const result = await chain.invoke({
    language: "中文",
    question: "什么是PDCA循环?"
  });
  
  console.log("链结果:", result);
}
