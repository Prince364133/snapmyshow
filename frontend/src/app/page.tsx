import { Metadata } from "next";
import HomeClient from "./HomeClient";

export const revalidate = 1800; // 30 mins ISR

export const metadata: Metadata = {
  title: 'SnapMyShow — Book Movie Tickets Online',
  description: 'Book movie tickets online with SnapMyShow. Choose your seats, get your QR ticket, and enjoy the show.',
};

export default async function HomePage() {
  let movies = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:6005"}/api/movies`, { next: { revalidate: 1800 } });
    const data = await res.json();
    movies = data.data || [];
  } catch (e) {
    console.error("Home data fetch failed", e);
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
