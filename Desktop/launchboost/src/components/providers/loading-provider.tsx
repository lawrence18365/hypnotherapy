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
  minLoadingTime = 2800 
}: LoadingProviderProps) {
  const [isLoading, setIsLoading] = useState(showInitialLoader);
  const [contentVisible, setContentVisible] = useState(!showInitialLoader);

  useEffect(() => {
    if (showInitialLoader) {
      // Prevent body scroll during loading
      document.body.style.overflow = 'hidden';
      
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, minLoadingTime);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    }
  }, [showInitialLoader, minLoadingTime]);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
    if (loading) {
      setContentVisible(false);
      document.body.style.overflow = 'hidden';
    }
  };

  const triggerPreloader = () => {
    setIsLoading(true);
    setContentVisible(false);
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
      setIsLoading(false);
    }, 2500);
  };

  const handleComplete = () => {
    setIsLoading(false);
    // Smooth content reveal after preloader completes
    setTimeout(() => {
      setContentVisible(true);
      document.body.style.overflow = 'unset';
    }, 200);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, triggerPreloader }}>
      {isLoading && (
        <Preloader 
          isLoading={isLoading} 
          onComplete={handleComplete}
        />
      )}
      
      {/* Content with smooth reveal animation */}
      <div 
        className={`transition-all duration-700 ease-out ${
          contentVisible 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform translate-y-4'
        }`}
        style={{
          transitionDelay: contentVisible ? '0ms' : '0ms'
        }}
      >
        {children}
      </div>
    </LoadingContext.Provider>
  );
}