import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "YOLO - 创意分享平台",
  description: "分享您的创意想法，发现更多精彩内容",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
