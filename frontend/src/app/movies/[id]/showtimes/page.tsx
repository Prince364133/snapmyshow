import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ShowtimesClient from "./ShowtimesClient";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6005";

async function getMovieShowtimes(id: string) {
  try {
    const res = await fetch(`${API}/api/showtimes/movie/${id}`, {
      next: { revalidate: 300 }, // 5 min cache
    });
    const data = await res.json();
    return data.data ?? [];
  } catch (err) {
    console.error("Failed to fetch showtimes", err);
    return [];
  }
}

async function getMovie(id: string) {
  try {
    const res = await fetch(`${API}/api/movies/${id}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data ?? null;
  } catch (err) {
    console.error("Failed to fetch movie", err);
    return null;
  }
}

// Next.js 15+: params is a Promise — must be awaited
export default async function ShowtimesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [movie, showtimes] = await Promise.all([
    getMovie(id),
    getMovieShowtimes(id),
  ]);

  if (!movie)
    return (
      <div className="py-20 text-center text-gray-500">Movie not found</div>
    );

  return (
    <Suspense
      fallback={
        <div className="container py-20">
          <Skeleton className="h-[600px] w-full" />
        </div>
      }
    >
      <ShowtimesClient movie={movie} initialShowtimes={showtimes} />
    </Suspense>
  );
}
