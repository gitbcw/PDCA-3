import { GoalLevel, GoalStatus } from "@prisma/client";
import { getCurrentDateISOString, getFutureDateISOString } from "./date";

/**
 * 从文本中提取目标数据
 * @param userInput 用户输入
 * @param aiResponse AI响应
 * @returns 提取的目标数据
 */
export function extractGoalFromText(userInput: string, aiResponse: string): Partial<{
  title: string;
  description: string;
  level: GoalLevel;
  status: GoalStatus;
  startDate: string;
  endDate: string;
  metrics: any[];
  resources: any[];
  priority: number;
  weight: number;
}> | null {
  // 合并用户输入和AI响应以进行分析
  const combinedText = `${userInput}\n${aiResponse}`;
  
  // 尝试提取目标标题
  const title = extractTitle(combinedText);
  if (!title) return null; // 如果没有提取到标题，则认为没有有效的目标数据
  
  // 提取其他目标属性
  const description = extractDescription(combinedText);
  const level = extractLevel(combinedText);
  const { startDate, endDate } = extractDates(combinedText);
  const metrics = extractMetrics(combinedText);
  const priority = extractPriority(combinedText);
  
  // 返回提取的目标数据
  return {
    title,
    description,
    level,
    status: "ACTIVE" as GoalStatus, // 默认为活动状态
    startDate,
    endDate,
    metrics,
    resources: [],
    priority,
    weight: 1.0,
  };
}

/**
 * 从文本中提取目标标题
 */
function extractTitle(text: string): string | null {
  // 尝试使用常见的标题模式进行匹配
  const titlePatterns = [
    /目标[:：]?\s*["']?([^"'\n.。]+)["']?/i,
    /标题[:：]?\s*["']?([^"'\n.。]+)["']?/i,
    /我想要[:：]?\s*["']?([^"'\n.。]+)["']?/i,
    /我的目标是[:：]?\s*["']?([^"'\n.。]+)["']?/i,
    /计划[:：]?\s*["']?([^"'\n.。]+)["']?/i,
  ];
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // 如果没有找到明确的标题模式，尝试提取第一个完整的句子作为标题
  const sentenceMatch = text.match(/^([^.。!！?？\n]{5,50})[.。!！?？]/);
  if (sentenceMatch && sentenceMatch[1]) {
    return sentenceMatch[1].trim();
  }
  
  return null;
}

/**
 * 从文本中提取目标描述
 */
function extractDescription(text: string): string | null {
  // 尝试使用常见的描述模式进行匹配
  const descPatterns = [
    /描述[:：]?\s*["']?([^"'\n]{10,500})["']?/i,
    /详情[:：]?\s*["']?([^"'\n]{10,500})["']?/i,
    /具体内容[:：]?\s*["']?([^"'\n]{10,500})["']?/i,
  ];
  
  for (const pattern of descPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  // 如果没有找到明确的描述，尝试提取较长的段落
  const paragraphs = text.split(/\n+/);
  for (const para of paragraphs) {
    if (para.length > 30 && para.length < 500 && !para.includes('目标:') && !para.includes('标题:')) {
      return para.trim();
    }
  }
  
  return null;
}

/**
 * 从文本中提取目标级别
 */
function extractLevel(text: string): GoalLevel | null {
  const levelPatterns = [
    { pattern: /愿景|远景|长期|3-5年|3到5年|五年/i, level: "VISION" as GoalLevel },
    { pattern: /年度|一年|1年|今年|明年|年目标/i, level: "YEARLY" as GoalLevel },
    { pattern: /季度|三个月|3个月|一季度|本季度|下季度/i, level: "QUARTERLY" as GoalLevel },
    { pattern: /月度|一个月|1个月|本月|下月/i, level: "MONTHLY" as GoalLevel },
    { pattern: /周|一周|1周|本周|下周|七天|7天/i, level: "WEEKLY" as GoalLevel },
  ];
  
  for (const { pattern, level } of levelPatterns) {
    if (pattern.test(text)) {
      return level;
    }
  }
  
  // 默认为月度目标
  return "MONTHLY" as GoalLevel;
}

/**
 * 从文本中提取开始和结束日期
 */
function extractDates(text: string): { startDate: string | null; endDate: string | null } {
  // 尝试匹配常见的日期格式
  const datePattern = /(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?)/g;
  const dates = text.match(datePattern);
  
  // 尝试匹配开始日期和结束日期的模式
  const startDatePattern = /开始[时日期]间[:：]?\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?)/;
  const endDatePattern = /结束[时日期]间[:：]?\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?)/;
  const deadlinePattern = /截止[时日期]间[:：]?\s*(\d{4}[-/年]\d{1,2}[-/月]\d{1,2}[日]?)/;
  
  let startDate = null;
  let endDate = null;
  
  // 尝试从明确的模式中提取
  const startMatch = text.match(startDatePattern);
  if (startMatch && startMatch[1]) {
    startDate = normalizeDate(startMatch[1]);
  }
  
  const endMatch = text.match(endDatePattern) || text.match(deadlinePattern);
  if (endMatch && endMatch[1]) {
    endDate = normalizeDate(endMatch[1]);
  }
  
  // 如果没有找到明确的开始/结束日期，但找到了日期列表
  if ((!startDate || !endDate) && dates && dates.length > 0) {
    // 如果只有一个日期，假设它是截止日期
    if (dates.length === 1) {
      endDate = normalizeDate(dates[0]);
    } 
    // 如果有多个日期，假设第一个是开始日期，最后一个是结束日期
    else if (dates.length >= 2) {
      startDate = normalizeDate(dates[0]);
      endDate = normalizeDate(dates[dates.length - 1]);
    }
  }
  
  // 如果仍然没有日期，根据提取的目标级别设置默认日期
  if (!startDate && !endDate) {
    const level = extractLevel(text);
    startDate = getCurrentDateISOString();
    
    switch (level) {
      case "VISION":
        endDate = getFutureDateISOString(365 * 5); // 5年
        break;
      case "YEARLY":
        endDate = getFutureDateISOString(365); // 1年
        break;
      case "QUARTERLY":
        endDate = getFutureDateISOString(90); // 3个月
        break;
      case "MONTHLY":
        endDate = getFutureDateISOString(30); // 1个月
        break;
      case "WEEKLY":
        endDate = getFutureDateISOString(7); // 1周
        break;
      default:
        endDate = getFutureDateISOString(30); // 默认1个月
    }
  } else if (startDate && !endDate) {
    // 如果只有开始日期，根据目标级别设置结束日期
    const level = extractLevel(text);
    const startDateObj = new Date(startDate);
    
    switch (level) {
      case "VISION":
        startDateObj.setFullYear(startDateObj.getFullYear() + 5);
        break;
      case "YEARLY":
        startDateObj.setFullYear(startDateObj.getFullYear() + 1);
        break;
      case "QUARTERLY":
        startDateObj.setMonth(startDateObj.getMonth() + 3);
        break;
      case "MONTHLY":
        startDateObj.setMonth(startDateObj.getMonth() + 1);
        break;
      case "WEEKLY":
        startDateObj.setDate(startDateObj.getDate() + 7);
        break;
      default:
        startDateObj.setMonth(startDateObj.getMonth() + 1);
    }
    
    endDate = startDateObj.toISOString();
  } else if (!startDate && endDate) {
    // 如果只有结束日期，设置开始日期为当前日期
    startDate = getCurrentDateISOString();
  }
  
  return { startDate, endDate };
}

/**
 * 标准化日期格式
 */
function normalizeDate(dateStr: string): string {
  // 将中文日期格式转换为标准格式
  const normalized = dateStr
    .replace(/年/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')
    .replace(/\//g, '-');
  
  // 确保格式为 YYYY-MM-DD
  const parts = normalized.split('-');
  if (parts.length === 3) {
    const year = parts[0].padStart(4, '20'); // 假设年份是四位数，如果不是则补全
    const month = parts[1].padStart(2, '0');
    const day = parts[2].padStart(2, '0');
    return `${year}-${month}-${day}T00:00:00.000Z`;
  }
  
  // 如果无法解析，返回原始字符串
  return dateStr;
}

/**
 * 从文本中提取衡量指标
 */
function extractMetrics(text: string): any[] {
  const metrics = [];
  
  // 尝试匹配衡量指标的模式
  const metricPatterns = [
    /指标[:：]?\s*["']?([^"'\n.。]+)["']?/i,
    /衡量标准[:：]?\s*["']?([^"'\n.。]+)["']?/i,
    /成功标准[:：]?\s*["']?([^"'\n.。]+)["']?/i,
  ];
  
  for (const pattern of metricPatterns) {
    const matches = text.matchAll(new RegExp(pattern, 'gi'));
    for (const match of matches) {
      if (match && match[1]) {
        metrics.push({
          description: match[1].trim(),
          target: null,
          unit: null
        });
      }
    }
  }
  
  // 尝试从列表中提取指标
  const listItemPattern = /[•·\-*]\s*([^•·\-*\n]{5,100})/g;
  const listItems = text.matchAll(listItemPattern);
  
  for (const item of listItems) {
    if (item && item[1] && (
      item[1].includes('指标') || 
      item[1].includes('衡量') || 
      item[1].includes('标准') ||
      item[1].includes('达到') ||
      item[1].includes('完成')
    )) {
      metrics.push({
        description: item[1].trim(),
        target: null,
        unit: null
      });
    }
  }
  
  return metrics;
}

/**
 * 从文本中提取优先级
 */
function extractPriority(text: string): number {
  // 尝试匹配优先级的模式
  const priorityPatterns = [
    /优先级[:：]?\s*(\d+)/i,
    /优先级[:：]?\s*(高|中|低)/i,
    /重要[性度][:：]?\s*(\d+)/i,
    /重要[性度][:：]?\s*(高|中|低)/i,
  ];
  
  for (const pattern of priorityPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const value = match[1].trim();
      
      // 如果是数字
      if (/^\d+$/.test(value)) {
        const num = parseInt(value, 10);
        // 确保优先级在1-10之间
        return Math.min(Math.max(num, 1), 10);
      }
      
      // 如果是文字描述
      if (value === '高') return 8;
      if (value === '中') return 5;
      if (value === '低') return 2;
    }
  }
  
  // 默认优先级为中等(5)
  return 5;
}
