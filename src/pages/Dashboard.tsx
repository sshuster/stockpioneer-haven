
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import PortfolioGrid from '../components/PortfolioGrid';
import StockCard from '../components/StockCard';
import { api } from '../api/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        const [portfolioData, marketInfo] = await Promise.all([
          api.getUserPortfolio(user.id),
          api.getMarketData()
        ]);
        
        setPortfolio(portfolioData);
        setMarketData(marketInfo);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.id]);
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Calculate portfolio statistics
  const totalInvestment = portfolio.reduce(
    (sum, stock) => sum + stock.shares * stock.avgPrice, 
    0
  );
  
  const currentValue = portfolio.reduce(
    (sum, stock) => sum + stock.shares * stock.currentPrice, 
    0
  );
  
  const totalGain = currentValue - totalInvestment;
  const totalGainPercent = totalInvestment > 0 
    ? (totalGain / totalInvestment) * 100 
    : 0;
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto animate-fade-in">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome, {user?.username}</h1>
            <p className="text-muted-foreground mt-2">
              Here's an overview of your portfolio and market performance
            </p>
          </div>
          
          {/* Portfolio Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="glass rounded-lg p-6">
              <h3 className="text-muted-foreground text-sm font-medium mb-2">Total Value</h3>
              <p className="text-3xl font-bold">${currentValue.toFixed(2)}</p>
            </div>
            
            <div className="glass rounded-lg p-6">
              <h3 className="text-muted-foreground text-sm font-medium mb-2">Investment</h3>
              <p className="text-3xl font-bold">${totalInvestment.toFixed(2)}</p>
            </div>
            
            <div className={`glass rounded-lg p-6 ${totalGain >= 0 ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
              <h3 className="text-muted-foreground text-sm font-medium mb-2">Total Gain/Loss</h3>
              <p className={`text-3xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGain >= 0 ? '+' : ''}${Math.abs(totalGain).toFixed(2)}
              </p>
            </div>
            
            <div className={`glass rounded-lg p-6 ${totalGain >= 0 ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
              <h3 className="text-muted-foreground text-sm font-medium mb-2">Return</h3>
              <p className={`text-3xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
              </p>
            </div>
          </div>
          
          {/* Main Content */}
          <Tabs defaultValue="portfolio" className="w-full">
            <TabsList className="mb-8">
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
            </TabsList>
            
            <TabsContent value="portfolio" className="animate-fade-in">
              {loading ? (
                <div className="text-center py-12">
                  <p>Loading portfolio data...</p>
                </div>
              ) : (
                <PortfolioGrid data={portfolio} />
              )}
            </TabsContent>
            
            <TabsContent value="market" className="animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {marketData.map((stock) => (
                  <StockCard
                    key={stock.symbol}
                    symbol={stock.symbol}
                    name={stock.name}
                    price={stock.price}
                    change={stock.change}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
