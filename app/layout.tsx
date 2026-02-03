import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Böggur – Byggingar og fasteignaþróun",
  description:
    "Böggur sinnir þróun og uppbyggingu íbúðarverkefna ásamt verktakaþjónustu fyrir einstaklinga, húsfélög og fyrirtæki.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="main-container">
        <Header />
        <main className="page-container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
