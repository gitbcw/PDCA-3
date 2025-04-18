import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "../../../app/generated/prisma";
import { z } from "zod";

// 直接在 API 路由中创建 Prisma 客户端
const prisma = new PrismaClient();

// 添加调试日志
console.log("Created new PrismaClient instance in users API with correct import path");

// 用户创建验证模式
const userCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  password: z.string().min(6),
});

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 验证请求数据
    const validation = userCreateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, name, password } = validation.data;

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    // 创建用户
    // 注意：在实际应用中，应该对密码进行哈希处理
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password, // 实际应用中应该使用 bcrypt 等库进行哈希
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    // 更详细的错误日志
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return NextResponse.json(
      { error: "Failed to create user", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
