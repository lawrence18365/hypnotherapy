"use client";

import React, { useEffect, useState } from 'react';
import { Zap, TrendingUp } from 'lucide-react';
import Image from 'next/image';

interface PreloaderProps {
  isLoading: boolean;
  onComplete?: () => void;
}

export function Preloader({ isLoading, onComplete }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'loading' | 'completing' | 'hiding'>('loading');

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 8 + 4;
        
        if (next >= 100) {
          clearInterval(interval);
          setStage('completing');
          setTimeout(() => {
            setStage('hiding');
            setTimeout(() => {
              onComplete?.();
            }, 800);
          }, 600);
          return 100;
        }
        
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isLoading, onComplete]);

  if (stage === 'hiding' && progress >= 100) {
    return (
      <div 
        className="fixed inset-0 z-[9999] transition-opacity duration-800 ease-out opacity-0 pointer-events-none"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: '#fffd63'
        }}
      />
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-800 ease-out ${
        stage === 'hiding' ? 'opacity-0' : 'opacity-100'
      }`}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#fffd63'
      }}
    >
      <div className="flex flex-col items-center space-y-8 max-w-md mx-auto px-6">
        
        {/* LaunchBoost Brand Logo */}
        <div className="relative mb-4">
          {/* Elegant glow effect */}
          <div className={`absolute inset-0 bg-black/10 rounded-2xl blur-xl transition-all duration-1000 ${
            stage === 'completing' ? 'scale-110 opacity-80' : 'scale-100 opacity-100'
          }`} />
          
          {/* Logo Container */}
          <div className="relative flex items-center justify-center w-24 h-24 bg-white rounded-2xl border-2 border-black shadow-2xl overflow-hidden p-2">
            <Image
              src="/logo.svg"
              alt="LaunchBoost Logo"
              width={80}
              height={80}
              priority
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* LaunchBoost Brand Name - BirdDog Typography */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight leading-tight">
            LaunchBoost
          </h1>
          <p className="text-lg text-black/80 font-medium">
            {stage === 'loading' && 'Finding Exclusive Deals...'}
            {stage === 'completing' && 'Ready to Launch!'}
          </p>
        </div>

        {/* Progress Indicator - BirdDog Clean Style */}
        <div className="w-full max-w-sm space-y-4">
          {/* Progress Track */}
          <div className="h-3 bg-black/20 rounded-full overflow-hidden border border-black/30">
            <div 
              className={`h-full bg-black rounded-full transition-all duration-300 ease-out ${
                stage === 'completing' ? 'shadow-lg' : ''
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          
          {/* Progress Percentage */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-black/70 font-medium">Loading deals</span>
            <span className="text-sm text-black font-bold font-mono">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Loading Animation - BirdDog Icons */}
        <div className="flex items-center space-x-3">
          {stage === 'loading' && (
            <>
              <TrendingUp className="w-5 h-5 text-black animate-pulse" style={{ animationDelay: '0s' }} />
              <Zap className="w-5 h-5 text-black animate-pulse" style={{ animationDelay: '0.3s' }} />
              <TrendingUp className="w-5 h-5 text-black animate-pulse" style={{ animationDelay: '0.6s' }} />
            </>
          )}
          {stage === 'completing' && (
            <div className="flex items-center space-x-2">
              <Zap className="w-6 h-6 text-black" />
              <span className="text-lg font-bold text-black">Ready!</span>
            </div>
          )}
        </div>

        {/* BirdDog-style subtitle */}
        <div className="text-center mt-6">
          <p className="text-sm text-black/60 font-medium">
            The Only Place For Finding Exclusive Indie Deals
          </p>
        </div>
      </div>
    </div>
  );
}