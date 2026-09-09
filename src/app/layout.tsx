import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Webchat Inbox",
  description: "A shared inbox for LINE Official Account conversations",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
