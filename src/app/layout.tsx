import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Navbar from "@/components/layout/Navbar";
import BackgroundLayer from "@/components/layout/BackgroundLayer";
import { cn } from "@/lib/utils";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevLog — Developer Learning Journal",
  description: "Track your learning, projects, and resources as a developer",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-mono", jetbrainsMono.variable)} suppressHydrationWarning>
      <body className={cn(inter.className, jetbrainsMono.variable, "font-mono antialiased bg-background text-foreground transition-colors duration-300")} suppressHydrationWarning>
        <Providers>
          <BackgroundLayer />
          <div className="relative min-h-screen z-10">
            <Navbar />
            <main className="container mx-auto px-4 py-8 max-w-6xl animate-in fade-in-0 duration-300">
              {children}  
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}