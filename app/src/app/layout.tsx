import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WonderQuest Learning",
  description: "Local prototype foundation for WonderQuest Learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
