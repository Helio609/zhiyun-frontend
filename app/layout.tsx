import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/hooks/useAuth";

export const metadata: Metadata = {
  title: "AI小智丨博智酝育",
  description:
    "提供孕产期个性化情绪管理指导，通过AI智能医疗问答，心理自助工具与私密社群服务，为每一位妈妈带来更多的呵护与温暖。 博众人之智，助千万华人妈妈身心健康。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <AuthProvider>
        <body className="h-full">{children}</body>
      </AuthProvider>
    </html>
  );
}
