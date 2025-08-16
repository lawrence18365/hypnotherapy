import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj)
}

export function formatPercentage(value: number) {
  return `${value}%`
}

export function generateSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const categories = [
  'AI & Machine Learning',
  'Analytics & Data',
  'Business & Finance',
  'Communication & Collaboration',
  'Design & Creative',
  'Developer Tools',
  'E-commerce & Retail',
  'Education & Learning',
  'Healthcare & Wellness',
  'HR & Recruiting',
  'Marketing & Growth',
  'Productivity & Organization',
  'Sales & CRM',
  'Security & Privacy',
  'Social & Community'
] as const

export type Category = typeof categories[number]

export function getCategoryIcon(category: Category) {
  // Simple mapping for now - can be expanded later
  if (category.includes('AI') || category.includes('Machine Learning')) return 'brain'
  if (category.includes('Marketing')) return 'megaphone'  
  if (category.includes('Productivity')) return 'zap'
  if (category.includes('Developer')) return 'code'
  if (category.includes('Design')) return 'palette'
  if (category.includes('Analytics') || category.includes('Data')) return 'bar-chart'
  return 'tag'
}
