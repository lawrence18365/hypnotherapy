import React from 'react';
import { Clock, Star, Users } from 'lucide-react';
import DealBadge from './DealBadge';
import PricingDisplay from './PricingDisplay';
import DealStats from './DealStats';

const AdvertiserSlot = ({ deal, size = "large", className = "" }) => {
  const isLarge = size === "large";
  
  return (
    <div className={`group relative overflow-hidden rounded-3xl bg-white border border-gray-200/50 hover:border-gray-300/50 transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 ${isLarge ? 'col-span-2 row-span-2' : ''} ${className}`}>
      {/* Premium Badge */}
      <DealBadge 
        type="premium" 
        position="top-left"
        className="absolute top-6 left-6 z-20"
      />
      
      {/* Deal Badge */}
      <DealBadge 
        type="custom" 
        text={deal.badge}
        position="top-right"
        className="absolute top-6 right-6 z-20"
      />
      
      {/* Hero Image */}
      <div className={`relative overflow-hidden ${isLarge ? 'h-80' : 'h-48'}`}>
        <img 
          src={deal.image} 
          alt={deal.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
        
        {/* Floating Stats */}
        <DealStats 
          stats={deal.stats}
          className="absolute bottom-4 left-4"
        />
      </div>
      
      {/* Content */}
      <div className={`p-8 ${isLarge ? 'pb-12' : 'pb-8'}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            {deal.category}
          </span>
          <div className="flex items-center gap-1 text-orange-500">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{deal.timeLeft} left</span>
          </div>
        </div>
        
        <h3 className={`font-bold text-gray-900 mb-3 ${isLarge ? 'text-3xl' : 'text-xl'}`}>
          {deal.title}
        </h3>
        
        <p className={`text-gray-600 mb-6 leading-relaxed ${isLarge ? 'text-lg' : 'text-sm'}`}>
          {deal.description}
        </p>
        
        {/* Features */}
        {isLarge && deal.features && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {deal.features.map((feature, index) => (
                <span 
                  key={index}
                  className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Pricing */}
        <PricingDisplay 
          pricing={deal.pricing}
          size={isLarge ? 'large' : 'small'}
          className="mb-6"
        />
        
        {/* CTA Button */}
        <button className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 text-white font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl shadow-lg">
          Claim This Deal
        </button>
      </div>
    </div>
  );
};

export default AdvertiserSlot;
