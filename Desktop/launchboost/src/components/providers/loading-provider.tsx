"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Preloader } from '@/components/ui/preloader';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  triggerPreloader: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

interface LoadingProviderProps {
  children: React.ReactNode;
  showInitialLoader?: boolean;
  minLoadingTime?: number;
}

export function LoadingProvider({ 
  children, 
  showInitialLoader = true, 
  minLoadingTime = 2000 
}: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(showInitialLoader);
  const [contentVisible, setContentVisible] = useState(!showInitialLoader);

  useEffect(() => {
    if (showInitialLoader) {
      // Prevent body scroll during loading
      document.body.style.overflow = 'hidden';
      // Remove automatic timer - let preloader control when to finish
    }
  }, [showInitialLoader]);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setContentVisible(false);
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = loading ? 'hidden' : 'unset';
    }
  };

  const triggerPreloader = () => {
    setIsLoading(true);
    setContentVisible(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 1800);
  };

  // Sync content visibility to loader state
  useEffect(() => {
    if (!isLoading) {
      setContentVisible(true);
    } else {
      setContentVisible(false);
    }
    if (typeof document !== 'undefined') {
      document.body.style.overflow = isLoading ? 'hidden' : 'unset';
    }
  }, [isLoading]);

  const handlePreloaderComplete = () => {
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, triggerPreloader }}>
      <Preloader 
        isLoading={isLoading} 
        onComplete={handlePreloaderComplete}
      />
      
      <div 
        className={`transition-all duration-500 ease-out ${
          contentVisible 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-4'
        }`}
      >
        {children}
      </div>
    </LoadingContext.Provider>
  );
}
