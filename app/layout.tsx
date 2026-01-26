import "../styles/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Boggur 2.0",
  description: "Modern Boggur construction and real estate website",
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
