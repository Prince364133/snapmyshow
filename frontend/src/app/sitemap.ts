import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://snapmyshow.com'


  // Dynamic Movie Routes
  let movieEntries: any[] = []
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/movies`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000) // 5s timeout
    })
    const data = await res.json()

    movieEntries = (data.data || []).map((movie: any) => ({
      url: `${baseUrl}/movies/${movie._id}`,
      lastModified: new Date(movie.updatedAt || movie.releaseDate),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch (e) {
    console.error('Sitemap generation error:', e)
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms-of-service`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...movieEntries,
  ]
}
