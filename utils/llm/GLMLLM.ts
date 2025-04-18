import { LLM, type BaseLLMParams } from "@langchain/core/language_models/llms";
import type { CallbackManagerForLLMRun } from "@langchain/core/callbacks/manager";
import { GenerationChunk } from "@langchain/core/outputs";

/**
 * 智谱AI GLM-4 LLM参数接口
 */
export interface GLMLLMParams extends BaseLLMParams {
  /** API密钥 */
  apiKey: string;
  /** API基础URL */
  baseUrl: string;
  /** 模型名称 */
  model?: string;
  /** 温度参数 */
  temperature?: number;
  /** 最大令牌数 */
  maxTokens?: number;
  /** 请求超时时间(毫秒) */
  timeout?: number;
  /** 请求头 */
  headers?: Record<string, string>;
  /** 是否启用流式输出 */
  streaming?: boolean;
  /** top_p参数 */
  topP?: number;
}

/**
 * 智谱AI GLM-4 LLM类
 * 实现对智谱AI GLM-4 API的支持
 * API文档: https://bigmodel.cn/dev/api/normal-model/glm-4
 */
export class GLMLLM extends LLM {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  maxTokens?: number;
  timeout?: number;
  headers: Record<string, string>;
  streaming: boolean;
  topP?: number;

  constructor(fields: GLMLLMParams) {
    super(fields);
    this.apiKey = fields.apiKey;
    this.baseUrl = fields.baseUrl;
    this.model = fields.model || "glm-4";
    this.temperature = fields.temperature || 0.7;
    this.maxTokens = fields.maxTokens;
    this.timeout = fields.timeout;
    this.headers = fields.headers || {};
    this.streaming = fields.streaming || false;
    this.topP = fields.topP;
  }

  _llmType() {
    return "glm";
  }

  /**
   * 调用GLM-4 API获取完成结果
   */
  async _call(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): Promise<string> {
    const { stop } = options;
    
    try {
      console.log(`[GLMLLM] 开始调用GLM-4 API, baseUrl: ${this.baseUrl}, model: ${this.model}`);
      
      // 构建请求体 - GLM-4使用messages格式
      const requestBody: Record<string, any> = {
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: this.temperature,
      };

      // 添加可选参数
      if (this.maxTokens) {
        requestBody.max_tokens = this.maxTokens;
      }

      if (this.topP) {
        requestBody.top_p = this.topP;
      }

      if (stop && stop.length) {
        requestBody.stop = stop;
      }

      console.log(`[GLMLLM] 请求体: ${JSON.stringify(requestBody, null, 2)}`);

      // 构建请求头 - GLM-4不需要Bearer前缀
      const headers = {
        "Content-Type": "application/json",
        "Authorization": this.apiKey,
        ...this.headers
      };

      console.log(`[GLMLLM] 请求头: ${JSON.stringify(Object.keys(headers), null, 2)}`);

      // 设置请求选项
      const fetchOptions: RequestInit = {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      };

      let response: Response;
      let data: any;
      // GLM-4的API路径
      const apiUrl = `${this.baseUrl}/api/paas/v4/chat/completions`;
      console.log(`[GLMLLM] 发送请求到: ${apiUrl}`);

      if (this.timeout) {
        console.log(`[GLMLLM] 使用超时设置: ${this.timeout}ms`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        fetchOptions.signal = controller.signal;

        try {
          response = await fetch(apiUrl, fetchOptions);
          clearTimeout(timeoutId);
          
          console.log(`[GLMLLM] 收到响应, 状态码: ${response.status}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[GLMLLM] 响应错误: ${errorText}`);
            
            let error;
            try {
              error = JSON.parse(errorText);
            } catch {
              error = { error: { message: `HTTP error ${response.status}` } };
            }
            throw new Error(`API请求失败: ${error.error?.message || response.statusText}`);
          }

          const responseText = await response.text();
          console.log(`[GLMLLM] 响应数据: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
          
          data = JSON.parse(responseText);
          const result = this.extractTextFromResponse(data);
          console.log(`[GLMLLM] 提取的文本: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
          return result;
        } catch (error) {
          clearTimeout(timeoutId);
          console.error(`[GLMLLM] 请求出错: ${error instanceof Error ? error.stack : String(error)}`);
          throw error;
        }
      } else {
        try {
          response = await fetch(apiUrl, fetchOptions);
          
          console.log(`[GLMLLM] 收到响应, 状态码: ${response.status}`);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`[GLMLLM] 响应错误: ${errorText}`);
            
            try {
              const error = JSON.parse(errorText);
              throw new Error(`API请求失败: ${error.error?.message || response.statusText}`);
            } catch (e) {
              throw new Error(`API请求失败: HTTP ${response.status} - ${response.statusText}`);
            }
          }

          const responseText = await response.text();
          console.log(`[GLMLLM] 响应数据: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
          
          try {
            data = JSON.parse(responseText);
          } catch (e) {
            console.error(`[GLMLLM] JSON解析错误: ${e instanceof Error ? e.message : String(e)}`);
            console.log(`[GLMLLM] 原始响应: ${responseText}`);
            throw new Error(`解析API响应失败: ${e instanceof Error ? e.message : String(e)}`);
          }
          
          const result = this.extractTextFromResponse(data);
          console.log(`[GLMLLM] 提取的文本: ${result.substring(0, 100)}${result.length > 100 ? '...' : ''}`);
          return result;
        } catch (error) {
          console.error(`[GLMLLM] 请求出错: ${error instanceof Error ? error.stack : String(error)}`);
          throw error;
        }
      }
    } catch (error: any) {
      console.error(`[GLMLLM] 调用失败: ${error instanceof Error ? error.stack : String(error)}`);
      throw new Error(`调用GLM-4 API失败: ${error.message}`);
    }
  }

  /**
   * 从API响应中提取文本
   * 支持GLM-4的API响应格式
   */
  private extractTextFromResponse(data: any): string {
    console.log(`[GLMLLM] 开始从响应中提取文本: ${JSON.stringify(data).substring(0, 200)}`);
    
    // GLM-4格式
    if (data.choices && data.choices.length > 0) {
      console.log(`[GLMLLM] 检测到GLM-4格式响应`);
      if (data.choices[0].message && data.choices[0].message.content) {
        console.log(`[GLMLLM] 使用choices[0].message.content: ${data.choices[0].message.content.substring(0, 50)}...`);
        return data.choices[0].message.content;
      }
    }

    // 支持通用格式
    if (data.result || data.output || data.generated_text || data.response) {
      const result = data.result || data.output || data.generated_text || data.response;
      console.log(`[GLMLLM] 检测到通用格式响应: ${result.substring(0, 50)}...`);
      return result;
    }

    // 如果找不到已知格式，尝试返回整个响应
    if (typeof data === 'string') {
      console.log(`[GLMLLM] 响应是字符串格式，直接返回: ${data.substring(0, 50)}...`);
      return data;
    }

    console.error(`[GLMLLM] 无法从响应中提取文本: ${JSON.stringify(data)}`);
    throw new Error("无法从API响应中提取文本");
  }

  /**
   * 流式输出实现
   */
  async *_streamResponseChunks(
    prompt: string,
    options: this["ParsedCallOptions"],
    runManager?: CallbackManagerForLLMRun
  ): AsyncGenerator<GenerationChunk> {
    if (!this.streaming) {
      // 如果不支持流式输出，则退回到普通调用并一次性返回结果
      console.log(`[GLMLLM] 流式输出未启用，使用普通调用`);
      const text = await this._call(prompt, options, runManager);
      yield new GenerationChunk({
        text,
      });
      return;
    }

    const { stop } = options;
    
    try {
      console.log(`[GLMLLM] 开始流式调用GLM-4 API, baseUrl: ${this.baseUrl}, model: ${this.model}`);
      
      // 构建请求体 - GLM-4使用messages格式
      const requestBody: Record<string, any> = {
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: this.temperature,
        stream: true,
      };

      // 添加可选参数
      if (this.maxTokens) {
        requestBody.max_tokens = this.maxTokens;
      }

      if (this.topP) {
        requestBody.top_p = this.topP;
      }

      if (stop && stop.length) {
        requestBody.stop = stop;
      }

      console.log(`[GLMLLM] 流式请求体: ${JSON.stringify(requestBody, null, 2)}`);

      // 构建请求头 - GLM-4不需要Bearer前缀
      const headers = {
        "Content-Type": "application/json",
        "Authorization": this.apiKey,
        ...this.headers
      };

      console.log(`[GLMLLM] 流式请求头: ${JSON.stringify(Object.keys(headers), null, 2)}`);

      // 发送请求
      const apiUrl = `${this.baseUrl}/api/paas/v4/chat/completions`;
      console.log(`[GLMLLM] 发送流式请求到: ${apiUrl}`);
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      });

      console.log(`[GLMLLM] 收到流式响应, 状态码: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[GLMLLM] 流式响应错误: ${errorText}`);
        
        let error;
        try {
          error = JSON.parse(errorText);
        } catch {
          error = { error: { message: `HTTP error ${response.status}` } };
        }
        throw new Error(`API请求失败: ${error.error?.message || response.statusText}`);
      }

      if (!response.body) {
        console.error(`[GLMLLM] 流式响应没有可读流`);
        throw new Error("响应没有可读流");
      }

      console.log(`[GLMLLM] 开始读取流式数据`);
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let chunkCounter = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(`[GLMLLM] 流式读取完成`);
          break;
        }

        // 解码收到的数据
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;
        console.log(`[GLMLLM] 收到原始数据块: ${chunk.substring(0, 100)}${chunk.length > 100 ? '...' : ''}`);

        // 处理SSE格式的数据
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            console.log(`[GLMLLM] 解析SSE数据行: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}`);
            
            // 处理SSE结束标记
            if (data === "[DONE]") {
              console.log(`[GLMLLM] 收到流式结束标记 [DONE]`);
              return;
            }

            try {
              const parsedData = JSON.parse(data);
              const text = this.extractStreamChunk(parsedData);
              
              if (text) {
                chunkCounter++;
                console.log(`[GLMLLM] 提取的文本块 #${chunkCounter}: ${text}`);
                
                const generationChunk = new GenerationChunk({
                  text,
                });
                
                // 触发回调
                if (runManager) {
                  await runManager.handleLLMNewToken(text);
                }
                
                yield generationChunk;
              } else {
                console.log(`[GLMLLM] 从数据中提取的文本为空`);
              }
            } catch (e) {
              // 忽略解析错误，继续处理下一行
              console.warn(`[GLMLLM] 解析流数据时出错: ${e instanceof Error ? e.message : String(e)}`);
              console.log(`[GLMLLM] 出错的原始数据: ${data}`);
            }
          }
        }
      }
    } catch (error: any) {
      console.error(`[GLMLLM] 流式调用失败: ${error instanceof Error ? error.stack : String(error)}`);
      throw new Error(`流式调用GLM-4 API失败: ${error.message}`);
    }
  }

  /**
   * 从流式响应中提取文本块
   */
  private extractStreamChunk(data: any): string {
    console.log(`[GLMLLM] 开始从流式数据中提取文本: ${JSON.stringify(data).substring(0, 200)}`);
    
    // GLM-4格式
    if (data.choices && data.choices.length > 0) {
      console.log(`[GLMLLM] 检测到GLM-4格式数据`);
      if (data.choices[0].delta && data.choices[0].delta.content) {
        console.log(`[GLMLLM] 使用choices[0].delta.content: ${data.choices[0].delta.content}`);
        return data.choices[0].delta.content;
      }
    }

    // 支持通用格式
    if (data.chunk || data.text || data.content) {
      const result = data.chunk || data.text || data.content;
      console.log(`[GLMLLM] 检测到通用格式数据: ${result}`);
      return result;
    }

    console.log(`[GLMLLM] 无法从数据中提取文本: ${JSON.stringify(data)}`);
    return "";
  }
}
