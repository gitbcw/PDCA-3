import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage, StreamingTextResponse } from "ai";

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";

export const runtime = "edge";

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const TEMPLATE = `You are a pirate named Patchy. All responses must be extremely verbose and in pirate dialect.

Current conversation:
{chat_history}

User: {input}
AI:`;

/**
 * This handler initializes and calls a simple chain with a prompt,
 * chat model, and output parser. See the docs for more information:
 *
 * https://js.langchain.com/docs/guides/expression_language/cookbook#prompttemplate--llm--outputparser
 */
export async function POST(req: NextRequest) {
  try {
    console.log(`[API] /api/chat: 开始处理请求`);
    const body = await req.json();
    console.log(`[API] /api/chat: 收到请求体: ${JSON.stringify(body).substring(0, 200)}...`);

    const messages = body.messages ?? [];
    const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
    const currentMessageContent = messages[messages.length - 1].content;
    console.log(`[API] /api/chat: 当前消息内容: ${currentMessageContent}`);

    const prompt = PromptTemplate.fromTemplate(TEMPLATE);
    console.log(`[API] /api/chat: 创建提示模板成功`);

    /**
     * You can also try e.g.:
     *
     * import { ChatAnthropic } from "@langchain/anthropic";
     * const model = new ChatAnthropic({});
     *
     * See a full list of supported models at:
     * https://js.langchain.com/docs/modules/model_io/models/
     */
    console.log(`[API] /api/chat: 开始创建LLM模型, 环境变量 LLM_PROVIDER=${process.env.LLM_PROVIDER || 'undefined'}`);

    // 使用我们的工厂函数创建LLM实例
    let model;
    try {
      // 如果已经导入了我们的工厂函数，就使用它
      const { createLLMFromEnv } = require("@/utils/llm/LLMFactory");
      console.log(`[API] /api/chat: 尝试使用自定义LLM工厂函数`);
      model = createLLMFromEnv();
      console.log(`[API] /api/chat: 成功创建自定义LLM实例: ${model.constructor.name}`);
    } catch (error) {
      // 如果导入失败，回退到默认的OpenAI
      console.log(`[API] /api/chat: 自定义LLM工厂函数导入失败: ${error instanceof Error ? error.message : String(error)}`);
      console.log(`[API] /api/chat: 回退到默认的OpenAI模型`);
      model = new ChatOpenAI({
        temperature: 0.8,
        model: "gpt-4o-mini",
      });
    }

    /**
     * Chat models stream message chunks rather than bytes, so this
     * output parser handles serialization and byte-encoding.
     */
    console.log(`[API] /api/chat: 创建HttpResponseOutputParser`);
    const outputParser = new HttpResponseOutputParser();

    /**
     * Can also initialize as:
     *
     * import { RunnableSequence } from "@langchain/core/runnables";
     * const chain = RunnableSequence.from([prompt, model, outputParser]);
     */
    console.log(`[API] /api/chat: 创建链式调用`);
    const chain = prompt.pipe(model).pipe(outputParser);

    console.log(`[API] /api/chat: 开始流式调用链`);
    try {
      const stream = await chain.stream({
        chat_history: formattedPreviousMessages.join("\n"),
        input: currentMessageContent,
      });
      console.log(`[API] /api/chat: 流式调用成功，返回响应`);
      return new StreamingTextResponse(stream);
    } catch (streamError) {
      console.error(`[API] /api/chat: 流式调用失败: ${streamError instanceof Error ? streamError.stack : String(streamError)}`);
      throw streamError; // 重新抛出错误，以便外层catch捕获
    }
  } catch (e: any) {
    console.error(`[API] /api/chat: 处理请求时出错: ${e instanceof Error ? e.stack : String(e)}`);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
