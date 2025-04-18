import { PrismaClient } from '@prisma/client'

// PrismaClient 是一个重量级对象，不应该在每个请求中都创建一个新实例
// 在开发环境中，我们将 PrismaClient 实例保存在全局对象中，以避免在热重载时创建多个实例
// 在生产环境中，我们为每个 PrismaClient 实例创建一个连接池

// 添加调试日志
console.log('Initializing PrismaClient in lib/prisma.ts')

// 定义全局类型
declare global {
  var prisma: PrismaClient | undefined
}

// 创建或使用已存在的 Prisma 实例
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// 在非生产环境中将 prisma 实例保存到全局变量中
if (process.env.NODE_ENV !== 'production') global.prisma = prisma

export default prisma
