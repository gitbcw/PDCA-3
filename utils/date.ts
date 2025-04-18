/**
 * 格式化日期为 YYYY-MM-DD 格式
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * 格式化日期为本地化格式（YYYY年MM月DD日）
 * @param date 日期对象
 * @returns 格式化后的日期字符串
 */
export function formatLocalDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 获取当前日期的ISO字符串（不含时间部分）
 * @returns 当前日期的ISO字符串
 */
export function getCurrentDateISOString(): string {
  return new Date().toISOString().split('T')[0] + 'T00:00:00.000Z';
}

/**
 * 获取未来指定天数的日期的ISO字符串
 * @param days 天数
 * @returns 未来日期的ISO字符串
 */
export function getFutureDateISOString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
}
