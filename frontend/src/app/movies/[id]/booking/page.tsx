import { redirect } from "next/navigation";

export default async function BookingRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ showtimeId?: string }>;
}) {
  const { id } = await params;
  const { showtimeId } = await searchParams;

  if (showtimeId) {
    redirect(`/movies/${id}/booking/${showtimeId}`);
  }

  // If no showtimeId, go back to the showtimes list
  redirect(`/movies/${id}/showtimes`);
}
