
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RemoveStockFormProps {
  portfolio: any[];
  onSuccess: () => void;
}

const RemoveStockForm: React.FC<RemoveStockFormProps> = ({ portfolio, onSuccess }) => {
  const { user } = useAuth();
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [loading, setLoading] = useState(false);
  
  const selectedStock = portfolio.find(stock => stock.symbol === symbol);
  const maxShares = selectedStock ? selectedStock.shares : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to remove stocks.",
        variant: "destructive"
      });
      return;
    }
    
    if (!symbol || !shares) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive"
      });
      return;
    }
    
    const sharesNum = parseFloat(shares);
    
    if (isNaN(sharesNum) || sharesNum <= 0) {
      toast({
        title: "Error",
        description: "Shares must be a positive number.",
        variant: "destructive"
      });
      return;
    }
    
    if (sharesNum > maxShares) {
      toast({
        title: "Error",
        description: `You only have ${maxShares} shares of ${symbol}.`,
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await api.removeStock(user.id, {
        symbol,
        shares: sharesNum
      });
      
      toast({
        title: "Success",
        description: "Stock removed successfully!"
      });
      
      // Reset form
      setSymbol('');
      setShares('');
      
      // Refresh portfolio
      onSuccess();
      
    } catch (error) {
      console.error('Error removing stock:', error);
      toast({
        title: "Error",
        description: "Failed to remove stock. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 glass rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Remove Stock</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stockSelect">Select Stock</Label>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a stock" />
            </SelectTrigger>
            <SelectContent>
              {portfolio.map((stock) => (
                <SelectItem key={stock.symbol} value={stock.symbol}>
                  {stock.symbol} - {stock.name} ({stock.shares} shares)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="shares">Number of Shares to Remove</Label>
          <Input
            id="shares"
            type="number"
            step="0.01"
            min="0.01"
            max={maxShares.toString()}
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder={`Max: ${maxShares}`}
            disabled={!symbol}
          />
          {selectedStock && (
            <p className="text-sm text-muted-foreground">
              You currently have {maxShares} shares of {symbol}.
            </p>
          )}
        </div>
      </div>
      
      <Button type="submit" variant="destructive" className="w-full" disabled={loading || !symbol}>
        {loading ? 'Removing...' : 'Remove Stock'}
      </Button>
    </form>
  );
};

export default RemoveStockForm;
