import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Instagram Auto Poster",
  description: "Schedule and automatically post to Instagram",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        {children}
      </body>
    </html>
  );
}
