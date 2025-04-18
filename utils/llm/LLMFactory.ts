import { BaseLLM } from "@langchain/core/language_models/llms";
import { BaseLanguageModel } from "@langchain/core/language_models/base";
import { ChatOpenAI } from "@langchain/openai";
// 注释掉Anthropic导入，因为我们可能没有安装这个包
// import { ChatAnthropic } from "@langchain/anthropic";
import { CustomLLM } from "./CustomLLM";
import { GLMLLM } from "./GLMLLM";

/**
 * LLM提供商类型
 */
export type LLMProvider = "openai" | "anthropic" | "custom" | "glm";

/**
 * LLM配置接口
 */
export interface LLMConfig {
  /** LLM提供商 */
  provider: LLMProvider;
  /** API密钥 */
  apiKey?: string;
  /** 模型名称 */
  model?: string;
  /** 温度参数 */
  temperature?: number;
  /** 最大令牌数 */
  maxTokens?: number;
  /** 自定义LLM的基础URL */
  baseUrl?: string;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 是否启用流式输出 */
  streaming?: boolean;
}

/**
 * 创建LLM实例的工厂函数
 * @param config LLM配置
 * @returns LLM实例
 */
export function createLLM(config: LLMConfig): BaseLanguageModel {
  console.log(`[LLMFactory] 开始创建LLM实例, 提供商: ${config.provider}`);

  const {
    provider,
    apiKey,
    model,
    temperature = 0.7,
    maxTokens,
    baseUrl,
    headers,
    streaming
  } = config;

  switch (provider) {
    case "openai":
      console.log(`[LLMFactory] 创建OpenAI实例, 模型: ${model || "gpt-4o-mini"}, 温度: ${temperature}`);
      return new ChatOpenAI({
        openAIApiKey: apiKey || process.env.OPENAI_API_KEY,
        modelName: model || "gpt-4o-mini",
        temperature,
        maxTokens,
        streaming
      });

    case "anthropic":
      console.log(`[LLMFactory] 创建Anthropic实例, 模型: ${model || "claude-3-haiku-20240307"}, 温度: ${temperature}`);
      console.error(`[LLMFactory] Anthropic支持尚未实现或包未安装`);
      throw new Error("当前环境不支持Anthropic API，请安装@langchain/anthropic包");

    case "glm":
      console.log(`[LLMFactory] 创建GLM实例, 模型: ${model || "glm-4"}, 温度: ${temperature}`);
      const glmBaseUrl = baseUrl || "https://open.bigmodel.cn"; // GLM-4的默认API基础URL
      return new GLMLLM({
        apiKey: apiKey || process.env.GLM_API_KEY || "",
        baseUrl: glmBaseUrl,
        model: model || "glm-4",
        temperature,
        maxTokens,
        headers,
        streaming
      });

    case "custom":
      if (!baseUrl) {
        console.error(`[LLMFactory] 创建CustomLLM失败: 缺少baseUrl`);
        throw new Error("使用自定义LLM提供商时必须提供baseUrl");
      }

      console.log(`[LLMFactory] 创建CustomLLM实例, baseUrl: ${baseUrl}, 模型: ${model || '默认'}, 温度: ${temperature}`);
      return new CustomLLM({
        apiKey: apiKey || "",
        baseUrl,
        model,
        temperature,
        maxTokens,
        headers,
        streaming
      });

    default:
      console.error(`[LLMFactory] 不支持的LLM提供商: ${provider}`);
      throw new Error(`不支持的LLM提供商: ${provider}`);
  }
}

/**
 * 从环境变量创建LLM实例
 * @returns LLM实例
 */
export function createLLMFromEnv(): BaseLanguageModel {
  console.log(`[LLMFactory] 从环境变量创建LLM实例`);

  const provider = (process.env.LLM_PROVIDER || "openai") as LLMProvider;
  console.log(`[LLMFactory] 从环境变量读取到提供商: ${provider}`);

  const config: LLMConfig = {
    provider,
    model: process.env.LLM_MODEL,
    temperature: process.env.LLM_TEMPERATURE ? parseFloat(process.env.LLM_TEMPERATURE) : undefined,
    maxTokens: process.env.LLM_MAX_TOKENS ? parseInt(process.env.LLM_MAX_TOKENS, 10) : undefined,
    streaming: process.env.LLM_STREAMING === "true"
  };

  console.log(`[LLMFactory] 环境变量配置: 模型=${config.model || '默认'}, 温度=${config.temperature || '默认'}, 流式=${config.streaming}`);

  if (provider === "custom") {
    config.apiKey = process.env.CUSTOM_LLM_API_KEY;
    config.baseUrl = process.env.CUSTOM_LLM_BASE_URL;
    config.model = process.env.CUSTOM_LLM_MODEL;
    console.log(`[LLMFactory] 自定义LLM配置: baseUrl=${config.baseUrl || '未设置'}, apiKey长度=${config.apiKey ? config.apiKey.length : 0}`);

    // 解析自定义请求头
    if (process.env.CUSTOM_LLM_HEADERS) {
      try {
        config.headers = JSON.parse(process.env.CUSTOM_LLM_HEADERS);
        console.log(`[LLMFactory] 成功解析自定义请求头: ${config.headers ? Object.keys(config.headers).join(', ') : '无'}`);
      } catch (error) {
        console.warn(`[LLMFactory] 解析CUSTOM_LLM_HEADERS时出错: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  } else if (provider === "glm") {
    config.apiKey = process.env.GLM_API_KEY;
    config.baseUrl = process.env.GLM_BASE_URL || "https://open.bigmodel.cn";
    config.model = process.env.GLM_MODEL || "glm-4";
    console.log(`[LLMFactory] GLM配置: baseUrl=${config.baseUrl}, model=${config.model}, apiKey长度=${config.apiKey ? config.apiKey.length : 0}`);
  }

  return createLLM(config);
}
