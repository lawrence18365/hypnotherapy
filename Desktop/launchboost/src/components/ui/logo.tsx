import React from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  priority?: boolean;
}

export function Logo({ 
  className = '', 
  width = 32, 
  height = 32, 
  showText = true, 
  textSize = 'xl',
  priority = false 
}: LogoProps) {
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base', 
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Image
        src="/logo.svg"
        alt="IndieSaasDeals Logo"
        width={width}
        height={height}
        priority={priority}
        className="flex-shrink-0"
      />
      {showText && (
        <span className={`font-bold text-black ${textSizeClasses[textSize]}`}>
          IndieSaasDeals
        </span>
      )}
    </div>
  );
}