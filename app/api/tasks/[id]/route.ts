import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma";
import { z } from "zod";

// 直接在 API 路由中创建 Prisma 客户端
const prisma = new PrismaClient();

// 添加调试日志
console.log("Created new PrismaClient instance in tasks detail API");

// 任务更新验证模式
const taskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        tags: true,
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
        subTasks: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;
    const body = await req.json();

    // 验证请求数据
    const validation = taskUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

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

    // 准备更新数据
    const updateData: any = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;

    // 处理日期和关联
    if (body.dueDate !== undefined) {
      updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    }

    if (body.goalId !== undefined) {
      if (body.goalId) {
        updateData.goal = { connect: { id: body.goalId } };
      } else {
        updateData.goal = { disconnect: true };
      }
    }

    if (body.parentId !== undefined) {
      if (body.parentId) {
        updateData.parent = { connect: { id: body.parentId } };
      } else {
        updateData.parent = { disconnect: true };
      }
    }

    // 更新任务
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        tags: true,
        goal: {
          select: {
            id: true,
            title: true,
          },
        },
        parent: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const taskId = params.id;

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

    // 删除任务
    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}
