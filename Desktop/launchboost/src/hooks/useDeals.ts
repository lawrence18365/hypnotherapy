import { useState, useEffect } from 'react';

interface Deal {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  slug: string;
  [key: string]: any;
}

interface UseDealsReturn {
  deals: Deal[];
  loading: boolean;
  error: string | null;
}

export const useDeals = (): UseDealsReturn => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async (): Promise<void> => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/deals/premium');
        if (!response.ok) throw new Error('Failed to fetch deals');
        
        const data: Deal[] = await response.json();
        setDeals(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  return { deals, loading, error };
};