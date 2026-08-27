import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { SwRegister } from "@/components/sw-register";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
});

const archivoBody = Archivo({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Better Planner",
  description: "One place for tasks, routines, projects, and everything else you're keeping track of.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Better Planner",
  },
};

export const viewport: Viewport = {
  themeColor: "#e5e2db",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${archivoBody.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SwRegister />
        {children}
        <Toaster
          position="bottom-center"
          gap={8}
          toastOptions={{
            unstyled: true,
            classNames: {
              toast:
                "card flex w-[min(22rem,calc(100vw-2rem))] items-center justify-between gap-3 border-ink px-4 py-3 text-sm text-ink",
              actionButton: "btn shrink-0 px-3 py-1.5 text-xs",
              error: "border-vermillion",
            },
          }}
        />
      </body>
    </html>
  );
}
