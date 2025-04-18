import "./globals.css";
import { Public_Sans } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Sidebar } from "@/components/Sidebar";

const publicSans = Public_Sans({ subsets: ["latin"] });



export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>PDCA 个人助手</title>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <meta
          name="description"
          content="PDCA 个人助手 - 帮助您更好地规划、执行、检查和改进您的工作和生活"
        />
        <meta property="og:title" content="PDCA 个人助手" />
        <meta
          property="og:description"
          content="PDCA 个人助手 - 帮助您更好地规划、执行、检查和改进您的工作和生活"
        />
        <meta property="og:image" content="/images/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PDCA 个人助手" />
        <meta
          name="twitter:description"
          content="PDCA 个人助手 - 帮助您更好地规划、执行、检查和改进您的工作和生活"
        />
        <meta name="twitter:image" content="/images/og-image.png" />
      </head>
      <body className={publicSans.className}>
        <NuqsAdapter>
          <div className="flex h-[100dvh] overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:ml-64">
              {/* Header */}
              <header className="bg-secondary p-4 border-b">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold md:hidden">PDCA 助手</h1>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a
                        href="https://github.com/your-username/PDCA-3"
                        target="_blank"
                      >
                        <ExternalLink className="size-3 mr-1" />
                        <span>GitHub</span>
                      </a>
                    </Button>
                  </div>
                </div>
              </header>

              {/* Content */}
              <main className="flex-1 overflow-auto p-4">
                <div className="max-w-7xl mx-auto">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <Toaster />
        </NuqsAdapter>
      </body>
    </html>
  );
}
