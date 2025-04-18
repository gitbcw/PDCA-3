"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ExamplesPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">示例</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/examples/custom-llm">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>自定义LLM API</CardTitle>
              <CardDescription>
                展示如何使用自定义LLM API，包括OpenAI、Anthropic和其他兼容的LLM服务
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                这个示例展示了如何配置和使用不同的LLM提供商，包括自定义LLM API。
                您可以测试不同的提供商、模型和参数设置。
              </p>
            </CardContent>
          </Card>
        </Link>
        
        {/* 可以添加更多示例卡片 */}
      </div>
    </div>
  );
}
