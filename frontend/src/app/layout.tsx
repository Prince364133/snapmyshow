import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster as HotToaster } from "react-hot-toast";
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics } from "@next/third-parties/google";

const inter = Inter({ 
  subsets: ["latin"], 
  display: "swap", 
  variable: "--font-inter",
  preload: true
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://snapmyshow.com'),
  title: {
    default: 'SnapMyShow — Instant Movie Ticket Booking',
    template: '%s | SnapMyShow'
  },
  description: 'The fastest way to book movie tickets in India. Choose your favorite seats, get an instant QR ticket, and pay at the theater.',
  keywords: ['movie tickets', 'book movie tickets', 'cinema showtimes', 'theater booking', 'MNR cinema', 'online ticket booking'],

  authors: [{ name: 'BookMyShow' }],
  creator: 'BookMyShow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://snapmyshow.com',
    siteName: 'SnapMyShow',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'SnapMyShow - Movie Booking' }]
  },

  twitter: {
    card: 'summary_large_image',
    site: '@showbook',
    creator: '@showbook'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' }
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE'
  },
  manifest: '/manifest.json',
  themeColor: '#E11D48',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SnapMyShow",
    "url": "https://showbook.com",
    "logo": "https://showbook.com/logo.png",
    "sameAs": ["https://twitter.com/showbook", "https://instagram.com/showbook"]
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href={process.env.NEXT_PUBLIC_SITE_URL || 'https://snapmyshow.com'} />
        <script

          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background`} suppressHydrationWarning>
        <AuthProvider>
          <a 
            href="#main-content" 
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-6 focus:py-3 focus:bg-primary focus:text-white focus:rounded-xl focus:font-black focus:shadow-2xl"
          >
            SKIP TO CONTENT
          </a>
          <Navbar />
          <main id="main-content" className="min-h-screen">
            {children}
          </main>
          <Footer />
          <HotToaster position="bottom-right" />
          <Toaster />
          <GoogleAnalytics gaId="G-XXXXXXXXXX" />
        </AuthProvider>
      </body>
    </html>
  );
}
