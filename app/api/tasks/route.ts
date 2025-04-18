import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../app/generated/prisma";
import { z } from "zod";
import { getServerSession } from "next-auth";

// 直接在 API 路由中创建 Prisma 客户端
const prisma = new PrismaClient();

// 添加调试日志
console.log("Created new PrismaClient instance in tasks API with correct import path");

// 任务创建验证模式
const taskCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional(),
  userId: z.string(),
  parentId: z.string().optional(),
  goalId: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // 获取当前用户的会话信息
    const session = await getServerSession(req);

    // 如果用户未登录或者请求的用户ID与当前用户不匹配，返回错误
    // 注意：在个人使用版本中，可以暂时注释这个检查
    /*
    if (!session?.user || session.user.id !== userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }
    */

    const tasks = await prisma.task.findMany({
      where: {
        userId: userId,
      },
      include: {
        tags: true,
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 验证请求数据
    const validation = taskCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      userId,
      parentId,
      goalId,
      tags: tagIds
    } = validation.data;

    // 在个人使用版本中，暂时跳过用户验证
    // 在未来添加用户认证时，可以取消注释以下代码
    /*
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    */

    // 创建任务
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        userId,
        parentId,
        goalId,
        ...(tagIds && tagIds.length > 0
          ? {
            tags: {
              connect: tagIds.map((id) => ({ id })),
            },
          }
          : {}),
      },
      include: {
        tags: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
