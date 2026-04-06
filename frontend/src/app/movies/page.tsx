import { Suspense } from "react";
import { Metadata } from "next";
import MoviesClient from "./MoviesClient";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Movies In Nepal | SnapMyShow",
  description: "Browse and book tickets for the latest movies showing in theaters near you. Filter by language, genre, and format.",
};

function MoviesLoading() {
  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 max-w-7xl py-6">
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-7xl py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full rounded-lg bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<MoviesLoading />}>
      <MoviesClient />
    </Suspense>
  );
}
