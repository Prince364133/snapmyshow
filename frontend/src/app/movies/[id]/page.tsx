import { Metadata } from "next";
import { notFound } from "next/navigation";
import MovieDetailClient from "./MovieDetailClient";
import api from "@/lib/api";

export const revalidate = 3600; // 1 hour ISR

/**
 * Pre-render top movies at build time
 */
export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6005'}/api/movies?limit=100`, {
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return (data.data || []).map((movie: any) => ({
      id: movie._id,
    }));
  } catch (e) {
    return []; // Return empty — pages will be rendered on-demand
  }
}

/**
 * Dynamic Metadata for SEO
 */
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6005'}/api/movies/${id}`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    const movie = data.data;

    if (!movie) return { title: 'Movie Not Found' };

    return {
      title: `${movie.title} — Book Tickets Online`,
      description: movie.description.slice(0, 160),
      openGraph: {
        title: movie.title,
        description: movie.description.slice(0, 160),
        images: [{ url: movie.posterUrl, width: 800, height: 1200, alt: movie.title }],
        type: 'video.movie',
      },
      twitter: {
        card: 'summary_large_image',
        title: movie.title,
        description: movie.description.slice(0, 160),
        images: [movie.posterUrl]
      }
    };
  } catch (e) {
    return { title: 'ShowBook' };
  }
}

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  let movie;
  let showtimes = [];
  let similarMovies: any[] = [];
  try {
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6005';
    const movieRes = await fetch(`${API}/api/movies/${id}`, { signal: AbortSignal.timeout(8000), next: { revalidate: 3600 } });
    const movieData = await movieRes.json();
    movie = movieData.data;

    const showsRes = await fetch(`${API}/api/showtimes?movieId=${id}`, { signal: AbortSignal.timeout(8000), next: { revalidate: 1800 } });
    const showsData = await showsRes.json();
    showtimes = showsData.data || [];

    // Fetch similar movies by the first genre of this movie
    if (movie && movie.genre?.length > 0) {
      const genre = encodeURIComponent(movie.genre[0]);
      const simRes = await fetch(
        `${API}/api/movies?genre=${genre}`,
        { signal: AbortSignal.timeout(5000), next: { revalidate: 3600 } }
      );
      const simData = await simRes.json();
      // Exclude the current movie
      similarMovies = (simData.data || []).filter((m: any) => m._id !== id).slice(0, 8);
    }
  } catch (e) {
    return notFound();
  }

  if (!movie) return notFound();

  // Structured Data (JSON-LD)
  const movieJsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "description": movie.description,
    "image": movie.posterUrl,
    "dateCreated": movie.releaseDate,
    "genre": movie.genre,
    "duration": `PT${movie.duration}M`,
    "actor": movie.cast.map((name: string) => ({ "@type": "Person", "name": name }))
  };

  // Event Schemas for Showtimes
  const eventJsonLds = showtimes.map((show: any) => ({
    "@context": "https://schema.org",
    "@type": "Event",
    "name": movie.title,
    "startDate": `${show.date.split('T')[0]}T${show.startTime}:00`,
    "location": {
      "@type": "Place",
      "name": show.theaterId.name,
      "address": show.theaterId.address
    },
    "offers": {
      "@type": "Offer",
      "price": 250, // Should be min price from seats ideally
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": `https://showbook.com/booking/${show._id}`
    }
  }));

  return (
    <>
      <link rel="canonical" href={`https://showbook.com/movies/${id}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(movieJsonLd) }}
      />
      {eventJsonLds.map((evt: any, i: number) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(evt) }}
        />
      ))}
      <MovieDetailClient movie={movie} similarMovies={similarMovies} />
    </>
  );
}
