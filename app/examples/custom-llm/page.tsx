"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export default function CustomLLMExample() {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [model, setModel] = useState("");
  const [temperature, setTemperature] = useState("0.7");
  const [prompt, setPrompt] = useState("请介绍一下PDCA循环");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("/api/examples/custom-llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          apiKey,
          baseUrl,
          model,
          temperature: parseFloat(temperature),
          prompt,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "请求失败");
      }

      // 处理流式响应
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let responseText = "";

      while (!done && reader) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        responseText += chunkValue;
        setResponse(responseText);
      }
    } catch (error: any) {
      setResponse(`错误: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">自定义LLM API示例</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>LLM配置</CardTitle>
            <CardDescription>
              配置您想使用的LLM提供商和参数
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Tabs defaultValue="openai" value={provider} onValueChange={setProvider}>
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="openai">OpenAI</TabsTrigger>
                  <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
                  <TabsTrigger value="custom">自定义</TabsTrigger>
                </TabsList>
                
                <TabsContent value="openai">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="openai-api-key">API密钥</Label>
                      <Input
                        id="openai-api-key"
                        placeholder="sk-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="openai-model">模型</Label>
                      <Input
                        id="openai-model"
                        placeholder="gpt-4o-mini"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="anthropic">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="anthropic-api-key">API密钥</Label>
                      <Input
                        id="anthropic-api-key"
                        placeholder="sk-ant-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="anthropic-model">模型</Label>
                      <Input
                        id="anthropic-model"
                        placeholder="claude-3-haiku-20240307"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="custom">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="custom-api-key">API密钥</Label>
                      <Input
                        id="custom-api-key"
                        placeholder="您的API密钥"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-base-url">基础URL</Label>
                      <Input
                        id="custom-base-url"
                        placeholder="https://your-custom-llm-api.com/v1"
                        value={baseUrl}
                        onChange={(e) => setBaseUrl(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="custom-model">模型名称</Label>
                      <Input
                        id="custom-model"
                        placeholder="您的模型名称"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="mt-4">
                <Label htmlFor="temperature">温度</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  placeholder="0.7"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                />
              </div>
              
              <div className="mt-4">
                <Label htmlFor="prompt">提示词</Label>
                <textarea
                  id="prompt"
                  className="w-full min-h-[100px] p-2 border rounded-md"
                  placeholder="输入您的提示词..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="mt-4 w-full" disabled={loading}>
                {loading ? "生成中..." : "生成"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>响应</CardTitle>
            <CardDescription>
              LLM生成的响应将显示在这里
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-md min-h-[300px] whitespace-pre-wrap">
              {response || "等待生成..."}
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-gray-500">
              提供商: {provider} {model ? `| 模型: ${model}` : ""}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
