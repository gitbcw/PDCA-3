export default function CustomLLMLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto">
      <div className="py-4">
        <h1 className="text-3xl font-bold">自定义LLM API示例</h1>
        <p className="text-gray-500 mt-2">
          这个示例展示了如何使用自定义LLM API，包括OpenAI、Anthropic和其他兼容的LLM服务。
        </p>
      </div>
      {children}
    </div>
  );
}
