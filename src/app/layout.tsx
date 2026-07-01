import type { Metadata, Viewport } from "next";
import "./globals.css";
import { themeInitScript } from "@/components/theme-provider";
import { Providers } from "@/components/providers";
import { AppFrame } from "@/components/layout/app-frame";

export const metadata: Metadata = {
  title: "QuickServe — Admin Dashboard",
  description:
    "Enterprise admin dashboard for a multi-service marketplace platform.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <Providers>
          <AppFrame>{children}</AppFrame>
        </Providers>
      </body>
    </html>
  );
}
