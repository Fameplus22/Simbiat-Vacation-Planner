import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Vacation Planner",
  description: "A secure starter workspace for planning draft vacations.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
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
