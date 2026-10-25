import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlockLearn Explorer",
  description: "Educational Blockchain Explorer & Transaction Simulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <div className="flex min-h-screen flex-col md:flex-row">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header />
            <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
