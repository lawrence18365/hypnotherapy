import React from 'react';
import { Users, Star } from 'lucide-react';

const DealStats = ({ stats, className = "" }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
        <Users className="w-4 h-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-900">{stats.users}</span>
      </div>
      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-500 fill-current" />
        <span className="text-sm font-medium text-gray-900">{stats.rating}</span>
      </div>
    </div>
  );
};

export default DealStats;
