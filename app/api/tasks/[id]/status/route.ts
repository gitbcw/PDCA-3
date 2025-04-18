import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../../generated/prisma";
import { z } from "zod";

// 直接在 API 路由中创建 Prisma 客户端
const prisma = new PrismaClient();

// 添加调试日志
console.log("Created new PrismaClient instance in tasks status API");

// 任务状态更新验证模式
const taskStatusUpdateSchema = z.object({
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const body = await req.json();
    
    // 验证请求数据
    const validation = taskStatusUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }
    
    const { status } = validation.data;
    
    // 检查任务是否存在
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });
    
    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }
    
    // 更新任务状态
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: {
        tags: true,
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task status:", error);
    // 更详细的错误日志
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to update task status", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
