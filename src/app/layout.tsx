import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Navbar from "@/components/navbar";

const roboto = Roboto({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Memoriva - AI-Powered Flashcard Learning Platform",
  description: "Master any subject with Memoriva's intelligent flashcard system. Create, study, and retain knowledge using spaced repetition and AI-generated content.",
  keywords: ["flashcards", "spaced repetition", "AI learning", "study app", "memory retention", "education", "learning platform"],
  authors: [{ name: "Yash Ramesh Kumar", url: "https://yashk.dev" }],
  creator: "Yash Ramesh Kumar (@devyk100)",
  publisher: "Yash Ramesh Kumar",
  metadataBase: new URL("https://memoriva.yashk.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Memoriva - AI-Powered Flashcard Learning Platform",
    description: "Master any subject with Memoriva's intelligent flashcard system. Create, study, and retain knowledge using spaced repetition and AI-generated content.",
    url: "https://memoriva.yashk.dev",
    siteName: "Memoriva",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Memoriva - AI-Powered Flashcard Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Memoriva - AI-Powered Flashcard Learning Platform",
    description: "Master any subject with Memoriva's intelligent flashcard system. Create, study, and retain knowledge using spaced repetition and AI-generated content.",
    creator: "@devyk100",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual verification code
  },
  category: "education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Memoriva",
    "description": "AI-Powered Flashcard Learning Platform with spaced repetition and intelligent scheduling",
    "url": "https://memoriva.yashk.dev",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web Browser",
    "author": {
      "@type": "Person",
      "name": "Yash Ramesh Kumar",
      "url": "https://yashk.dev",
      "sameAs": [
        "https://github.com/devyk100",
        "https://twitter.com/devyk100"
      ]
    },
    "creator": {
      "@type": "Person",
      "name": "Yash Ramesh Kumar",
      "url": "https://yashk.dev"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Spaced Repetition Algorithm",
      "AI-Generated Study Sessions",
      "Progress Tracking",
      "Custom Flashcard Creation",
      "RAG-Powered Content Generation"
    ]
  };

  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Memoriva" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={roboto.variable + " antialiased overflow-x-hidden"}>
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
