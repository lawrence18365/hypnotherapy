import React from 'react';

const DealBadge = ({ type, text, position, className = "" }) => {
  const getBadgeStyles = () => {
    switch (type) {
      case 'premium':
        return 'bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg';
      case 'hot':
        return 'bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium';
      case 'popular':
        return 'bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium';
      case 'new':
        return 'bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium';
      default:
        return 'bg-black/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium';
    }
  };

  return (
    <div className={`${getBadgeStyles()} ${className}`}>
      {type === 'premium' ? 'Premium' : text}
    </div>
  );
};

export default DealBadge;