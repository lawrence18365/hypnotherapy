import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog'

export const revalidate = 3600 // regenerate sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://indiesaasdeals.com'

  // Static routes to always include
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/deals',
    '/categories',
    '/advertise',
    '/advertise/purchase',
    '/about',
    '/contact',
    '/feedback',
    '/terms',
    '/privacy',
    '/blog',
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : 0.6,
  }))

  // Blog posts from Supabase
  const posts = await getPublishedPosts()
  const blogRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }))

  return [...staticRoutes, ...blogRoutes]
}

