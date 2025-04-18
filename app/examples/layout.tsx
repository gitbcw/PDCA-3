export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto">
      <div className="py-4">
        <h1 className="text-3xl font-bold">示例</h1>
        <p className="text-gray-500 mt-2">
          这里展示了PDCA个人助手系统的各种功能示例
        </p>
      </div>
      {children}
    </div>
  );
}
