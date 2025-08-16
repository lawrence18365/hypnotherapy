import React from 'react';

const PricingDisplay = ({ pricing, size = 'large', className = "" }) => {
  const isLarge = size === 'large';
  
  return (
    <div className={className}>
      <div className="flex items-baseline gap-3 mb-2">
        <span className={`font-bold text-gray-900 ${isLarge ? 'text-4xl' : 'text-2xl'}`}>
          ${pricing.current}
        </span>
        <span className={`text-gray-400 line-through ${isLarge ? 'text-xl' : 'text-lg'}`}>
          ${pricing.original}
        </span>
        <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          {pricing.discount}% OFF
        </span>
      </div>
      <p className="text-sm text-gray-500 font-medium">
        Lifetime access • Limited time offer
      </p>
    </div>
  );
};

export default PricingDisplay;