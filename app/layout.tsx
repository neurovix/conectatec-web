import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ConectaTec - @Neurovix",
  description: "Created by Fernando Vazquez, CEO of Neurovix",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/tindertec_icon.png" type="image/png" />
      </head>
      <body
        className={`${geistSans.variable} font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
