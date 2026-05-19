import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI社工个案咨询辅助助手",
  description: "面向一线社工与社区服务人员的个案整理、服务建议、政策资源对接和文书辅助系统。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
