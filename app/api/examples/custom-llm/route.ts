import { NextRequest, NextResponse } from "next/server";
import { createLLM } from "@/utils/llm/LLMFactory";
import { LLMProvider } from "@/utils/llm/LLMFactory";
import { StreamingTextResponse } from "ai";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    console.log(`[API] /api/examples/custom-llm: 开始处理请求`);
    const body = await req.json();
    console.log(`[API] /api/examples/custom-llm: 收到请求体: ${JSON.stringify(body).substring(0, 200)}...`);

    const { provider, apiKey, baseUrl, model, temperature, prompt } = body;

    if (!prompt) {
      console.log(`[API] /api/examples/custom-llm: 提示词为空，返回400错误`);
      return NextResponse.json(
        { error: "提示词不能为空" },
        { status: 400 }
      );
    }

    // 验证提供商
    if (!["openai", "anthropic", "custom"].includes(provider)) {
      console.log(`[API] /api/examples/custom-llm: 不支持的提供商 ${provider}，返回400错误`);
      return NextResponse.json(
        { error: "不支持的LLM提供商" },
        { status: 400 }
      );
    }

    // 验证自定义LLM的必要参数
    if (provider === "custom" && !baseUrl) {
      console.log(`[API] /api/examples/custom-llm: 自定义LLM缺少baseUrl，返回400错误`);
      return NextResponse.json(
        { error: "使用自定义LLM时必须提供baseUrl" },
        { status: 400 }
      );
    }

    // 创建LLM实例
    console.log(`[API] /api/examples/custom-llm: 开始创建LLM实例, 提供商: ${provider}, 模型: ${model || '默认'}, baseUrl: ${baseUrl || '无'}`);
    const llm = createLLM({
      provider: provider as LLMProvider,
      apiKey,
      baseUrl,
      model,
      temperature,
      streaming: true
    });
    console.log(`[API] /api/examples/custom-llm: 成功创建LLM实例: ${llm.constructor.name}`);

    // 流式输出
    console.log(`[API] /api/examples/custom-llm: 开始流式调用LLM, 提示词长度: ${prompt.length}`);
    try {
      const stream = await llm.stream(prompt);
      console.log(`[API] /api/examples/custom-llm: 流式调用成功，返回响应`);
      return new StreamingTextResponse(stream);
    } catch (streamError) {
      console.error(`[API] /api/examples/custom-llm: 流式调用失败: ${streamError instanceof Error ? streamError.stack : String(streamError)}`);
      throw streamError; // 重新抛出错误，以便外层catch捕获
    }
  } catch (error: any) {
    console.error(`[API] /api/examples/custom-llm: 处理请求时出错: ${error instanceof Error ? error.stack : String(error)}`);
    return NextResponse.json(
      { error: `调用LLM API时出错: ${error.message}` },
      { status: 500 }
    );
  }
}
