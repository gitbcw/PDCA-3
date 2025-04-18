import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage } from "ai";
import { createLLMFromEnv } from "@/utils/llm/LLMFactory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { extractGoalFromText } from "@/utils/goal-parser";

// 系统提示模板
const SYSTEM_TEMPLATE = `你是一个专业的目标规划助手，帮助用户制定和分解目标。
你的任务是引导用户明确目标，并帮助他们将目标变得具体、可衡量、可实现、相关且有时限（SMART原则）。

在对话过程中，你应该：
1. 帮助用户澄清他们的目标
2. 询问关于目标的具体细节（时间范围、衡量标准等）
3. 提供建设性的建议，使目标更加明确和可行
4. 帮助用户分解目标为更小的步骤
5. 考虑可能的障碍和解决方案

请保持友好、专业的语气，并专注于帮助用户制定高质量的目标。`;

// 人类消息模板
const HUMAN_TEMPLATE = `{input}`;

// 创建提示模板
const chatPrompt = ChatPromptTemplate.fromMessages([
  ["system", SYSTEM_TEMPLATE],
  ["human", HUMAN_TEMPLATE],
]);

// 创建LLM实例
const llm = createLLMFromEnv();

// 创建链
const chain = chatPrompt.pipe(llm).pipe(new StringOutputParser());

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages = body.messages as VercelChatMessage[];
    const userId = body.userId as string;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // 获取最后一条人类消息
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage.role !== "user") {
      return NextResponse.json(
        { error: "Last message must be from user" },
        { status: 400 }
      );
    }

    // 调用LLM
    const response = await chain.invoke({
      input: lastMessage.content,
    });

    // 尝试从响应中提取目标数据
    const extractedGoal = extractGoalFromText(lastMessage.content, response);

    // 创建响应
    const responseMessage: VercelChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: response,
    };

    // 如果成功提取到目标数据，将其添加到响应头中
    const headers: Record<string, string> = {};
    if (extractedGoal) {
      headers["x-extracted-goal"] = Buffer.from(
        JSON.stringify(extractedGoal)
      ).toString("base64");
    }

    return NextResponse.json(
      { messages: [responseMessage] },
      { headers }
    );
  } catch (error) {
    console.error("Error in goal chat:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
