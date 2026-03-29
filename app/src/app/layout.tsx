import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WonderQuest Learning",
  description: "WonderQuest Learning — play-first, skill-building adventures for children ages 2 to 10.",
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
