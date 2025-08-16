"use client";

import { useLoading } from '@/components/providers/loading-provider';
import { useRouter } from 'next/navigation';

/**
 * Premium navigation hook with sophisticated loading states
 * Provides Apple-like smooth transitions between pages
 */
export function useNavigationWithLoader() {
  const { setLoading, triggerPreloader } = useLoading();
  const router = useRouter();

  const navigateWithLoader = (href: string, showLoader = true) => {
    if (showLoader) {
      setLoading(true);
      
      // Elegant delay for smooth UX, then navigate
      setTimeout(() => {
        router.push(href);
        // Loading will be handled by the new page load
      }, 400);
    } else {
      router.push(href);
    }
  };

  const refreshWithLoader = () => {
    triggerPreloader();
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return {
    navigateWithLoader,
    refreshWithLoader,
    triggerPreloader,
    setLoading,
  };
}

/**
 * Premium form submission hook with loading states
 */
export function useFormWithLoader() {
  const { setLoading } = useLoading();

  const submitWithLoader = async (
    submitFunction: () => Promise<any>,
    minLoadingTime = 1200
  ) => {
    setLoading(true);
    
    try {
      const [result] = await Promise.all([
        submitFunction(),
        new Promise(resolve => setTimeout(resolve, minLoadingTime))
      ]);
      
      return result;
    } finally {
      setLoading(false);
    }
  };

  return { submitWithLoader };
}

/**
 * Premium API calls with sophisticated loading states
 */
export function useApiWithLoader() {
  const { setLoading } = useLoading();

  const callWithLoader = async <T>(
    apiFunction: () => Promise<T>,
    showLoader = true,
    minLoadingTime = 1000
  ): Promise<T> => {
    if (showLoader) {
      setLoading(true);
    }
    
    try {
      const [result] = await Promise.all([
        apiFunction(),
        showLoader ? new Promise(resolve => setTimeout(resolve, minLoadingTime)) : Promise.resolve()
      ]);
      
      return result;
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  return { callWithLoader };
}