import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DoubtSolver.ai — Ace Your Exams with AI",
  description:
    "AI-powered exam preparation platform for school students. Practice, test yourself, get scores and personalized recommendations. Like Duolingo, but for your school exams!",
  keywords: [
    "exam preparation",
    "AI tutor",
    "self assessment",
    "CBSE",
    "ICSE",
    "school exams",
    "study platform",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
