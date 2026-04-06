import { Metadata } from "next";
import HomeClient from "./HomeClient";

// Force dynamic rendering - prevents build-time fetch timeout
// Data is fetched fresh on each request, not at build time
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'SnapMyShow — Book Movie Tickets Online',
  description: 'Book movie tickets online with SnapMyShow. Choose your seats, get your QR ticket, and enjoy the show.',
};

export default async function HomePage() {
  let movies = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6005";
    const res = await fetch(`${apiUrl}/api/movies`, {
      // 5-second timeout — avoids hanging on Vercel if backend is cold
      signal: AbortSignal.timeout(5000),
      next: { revalidate: 0 },
    });
    if (res.ok) {
      const data = await res.json();
      movies = data.data || [];
    }
  } catch (e) {
    // Backend unavailable during build — HomeClient will fetch client-side
    console.error("Home SSR data fetch skipped:", e instanceof Error ? e.message : e);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "SnapMyShow",
    "url": "https://snapmyshow.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://snapmyshow.com/movies?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient initialMovies={movies} />
    </>
  );
}
