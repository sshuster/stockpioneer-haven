
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddStockFormProps {
  onSuccess: () => void;
}

const AddStockForm: React.FC<AddStockFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [shares, setShares] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add stocks.",
        variant: "destructive"
      });
      return;
    }
    
    if (!symbol || !name || !shares || !avgPrice) {
      toast({
        title: "Error",
        description: "All fields are required.",
        variant: "destructive"
      });
      return;
    }
    
    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(avgPrice);
    
    if (isNaN(sharesNum) || sharesNum <= 0) {
      toast({
        title: "Error",
        description: "Shares must be a positive number.",
        variant: "destructive"
      });
      return;
    }
    
    if (isNaN(priceNum) || priceNum <= 0) {
      toast({
        title: "Error",
        description: "Average price must be a positive number.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      await api.addStock(user.id, {
        symbol: symbol.toUpperCase(),
        name,
        shares: sharesNum,
        avgPrice: priceNum
      });
      
      toast({
        title: "Success",
        description: "Stock added successfully!"
      });
      
      // Reset form
      setSymbol('');
      setName('');
      setShares('');
      setAvgPrice('');
      
      // Refresh portfolio
      onSuccess();
      
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        title: "Error",
        description: "Failed to add stock. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 glass rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Add Stock</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol</Label>
          <Input
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g. AAPL"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="name">Company Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Apple Inc."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="shares">Number of Shares</Label>
          <Input
            id="shares"
            type="number"
            step="0.01"
            min="0.01"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="e.g. 10"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="avgPrice">Average Price per Share ($)</Label>
          <Input
            id="avgPrice"
            type="number"
            step="0.01"
            min="0.01"
            value={avgPrice}
            onChange={(e) => setAvgPrice(e.target.value)}
            placeholder="e.g. 150.00"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Adding...' : 'Add Stock'}
      </Button>
    </form>
  );
};

export default AddStockForm;
