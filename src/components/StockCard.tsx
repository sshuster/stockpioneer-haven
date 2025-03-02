
import React from 'react';
import { cn } from '@/lib/utils';

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  onClick?: () => void;
}

const StockCard: React.FC<StockCardProps> = ({ 
  symbol, 
  name, 
  price, 
  change, 
  onClick 
}) => {
  const isPositive = change >= 0;
  
  return (
    <div 
      className="glass rounded-lg p-5 transition-all duration-300 hover:shadow-md cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{symbol}</h3>
          <p className="text-muted-foreground text-sm truncate">{name}</p>
        </div>
        <div 
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            isPositive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          )}
        >
          {isPositive ? "+" : ""}{change}%
        </div>
      </div>
      
      <div className="mt-2">
        <p className="text-2xl font-semibold">${price.toFixed(2)}</p>
      </div>
      
      {/* Simple sparkline visualization (placeholder) */}
      <div className="h-10 mt-4 flex items-end space-x-1">
        {Array.from({ length: 10 }).map((_, i) => {
          const height = Math.random() * 100;
          return (
            <div 
              key={i}
              className={cn(
                "w-full rounded-sm transition-all",
                isPositive ? "bg-green-500/40" : "bg-red-500/40"
              )}
              style={{ height: `${20 + height * 0.4}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default StockCard;
