import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import { z } from "zod";

// 直接在 API 路由中创建 Prisma 客户端
const prisma = new PrismaClient();

// 添加调试日志
console.log("Created new PrismaClient instance in goals detail API");

// 目标更新验证模式
const goalUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  level: z.enum(["VISION", "YEARLY", "QUARTERLY", "MONTHLY", "WEEKLY"]).optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "CANCELLED", "ARCHIVED"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  progress: z.number().min(0).max(1).optional(),
  parentId: z.string().optional().nullable(),
  metrics: z.array(z.any()).optional(),
  resources: z.array(z.any()).optional(),
  priority: z.number().int().min(1).max(10).optional(),
  weight: z.number().min(0).max(1).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goalId = params.id;

    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        tags: true,
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        subGoals: {
          select: {
            id: true,
            title: true,
            level: true,
            status: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(goal);
  } catch (error) {
    console.error("Error fetching goal:", error);
    return NextResponse.json(
      { error: "Failed to fetch goal" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goalId = params.id;
    const body = await req.json();

    // 验证请求数据
    const validation = goalUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    // 检查目标是否存在
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    // 准备更新数据
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.level !== undefined) updateData.level = body.level;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.progress !== undefined) updateData.progress = body.progress;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.weight !== undefined) updateData.weight = body.weight;

    // 处理日期和关联
    if (body.startDate !== undefined) {
      updateData.startDate = new Date(body.startDate);
    }

    if (body.endDate !== undefined) {
      updateData.endDate = new Date(body.endDate);
    }

    if (body.metrics !== undefined) {
      updateData.metrics = JSON.stringify(body.metrics);
    }

    if (body.resources !== undefined) {
      updateData.resources = JSON.stringify(body.resources);
    }

    if (body.parentId !== undefined) {
      if (body.parentId) {
        updateData.parent = { connect: { id: body.parentId } };
      } else {
        updateData.parent = { disconnect: true };
      }
    }

    // 更新目标
    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: updateData,
      include: {
        tags: true,
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const goalId = params.id;

    // 检查目标是否存在
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Goal not found" },
        { status: 404 }
      );
    }

    // 删除目标
    await prisma.goal.delete({
      where: { id: goalId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return NextResponse.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
