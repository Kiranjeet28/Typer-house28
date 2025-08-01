import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers"; // ✅ import client-side wrapper
import { NavbarMain } from "@/components/Dashboard/navbar";
import Footer from "@/components/Footer/Footer";
import { RoomProvider } from "@/lib/context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Typerhouse",
  description: "Check Typo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <Providers>
          <RoomProvider >
          {/* <NavbarMain /> */}
          {children}
          {/* <Footer /> */}

          </RoomProvider>
        </Providers>
      </body>
    </html>
  );
}
