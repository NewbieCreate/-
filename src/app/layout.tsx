import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WhiteboardProvider } from "@/components/providers/WhiteboardProvider";
import { CollaborationProvider } from "@/components/providers/CollaborationProvider";
import { WebRTCProvider } from "@/components/providers/WebRTCProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FigJam Clone - Collaborative Whiteboard",
  description: "A collaborative whiteboard application built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <WhiteboardProvider>
          <CollaborationProvider
            roomName="main-room"
            userId={`user-${Date.now()}`}
            userName="사용자"
            serverUrl="ws://localhost:1234"
          >
            <WebRTCProvider>{children}</WebRTCProvider>
          </CollaborationProvider>
        </WhiteboardProvider>
      </body>
    </html>
  );
}
