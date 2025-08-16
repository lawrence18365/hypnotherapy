export interface DealPricing {
  current: number;
  original: number;
  discount: number;
}

export interface DealStats {
  users: string;
  rating: number;
}

export interface Deal {
  id: number;
  title: string;
  description: string;
  image: string; // URL to 1920x1080 screenshot
  pricing: DealPricing;
  timeLeft: string;
  category: string;
  badge: string;
  stats: DealStats;
  features: string[];
  isPremium: boolean;
  position?: number; // 1, 2, or 3 for premium spots
  emoji?: string;
}

export interface StatsData {
  monthlyVisits: number;
  totalDeals: number;
  totalSavings: number;
  activeMakers: number;
}

export interface DealSubmission {
  productName: string;
  productWebsite: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  originalPrice: number;
  dealPrice: number;
  totalCodes: number;
  expiresAt: string;
  pricingTier: 'free' | 'featured' | 'premium';
  tags?: string[];
  iconUrl?: string;
}