import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafetyNet — Smart Fire Detection & Emergency Evacuation",
  description:
    "SafetyNet is a smart fire detection and emergency evacuation system that monitors factory areas for smoke and fire, providing real-time alerts and safe evacuation routes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
