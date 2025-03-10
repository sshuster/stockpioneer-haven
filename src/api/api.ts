
// API client for connecting to Flask backend
import axios from 'axios';

// Create an axios instance with base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api', // This will be your Flask server URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// For development purposes, we'll use mock data until the Flask backend is implemented
const USE_MOCK_DATA = true;

// Mock user data
const MOCK_USERS = [
  { id: 1, username: 'demo', email: 'demo@example.com', password: 'password' },
  { id: 2, username: 'admin', email: 'admin@example.com', password: 'admin' }
];

// Mock portfolio data
const MOCK_PORTFOLIOS = {
  1: [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 10, avgPrice: 175.23, currentPrice: 182.63 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 5, avgPrice: 310.75, currentPrice: 325.42 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 3, avgPrice: 138.21, currentPrice: 142.65 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', shares: 8, avgPrice: 145.68, currentPrice: 152.33 },
    { symbol: 'TSLA', name: 'Tesla Inc.', shares: 15, avgPrice: 189.25, currentPrice: 174.50 },
  ],
  2: [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 20, avgPrice: 170.50, currentPrice: 182.63 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 10, avgPrice: 450.75, currentPrice: 475.38 },
    { symbol: 'TSLA', name: 'Tesla Inc.', shares: 25, avgPrice: 180.25, currentPrice: 174.50 },
    { symbol: 'META', name: 'Meta Platforms Inc.', shares: 12, avgPrice: 330.80, currentPrice: 347.22 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', shares: 15, avgPrice: 147.20, currentPrice: 152.33 },
  ]
};

// Mock market data
const MOCK_MARKET_DATA = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 182.63, change: 2.4 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 325.42, change: 1.2 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: 0.8 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 152.33, change: -0.5 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 174.50, change: -3.2 },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 347.22, change: 1.7 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 475.38, change: 5.2 },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', price: 408.15, change: 0.3 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', price: 183.27, change: -0.2 },
  { symbol: 'V', name: 'Visa Inc.', price: 235.45, change: 0.6 },
];

// Add delay to simulate network requests
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Authentication
  login: async (email: string, password: string) => {
    if (USE_MOCK_DATA) {
      await delay(800); // Simulate network delay
      
      const user = MOCK_USERS.find(u => 
        u.email === email && u.password === password
      );
      
      if (!user) {
        throw new Error('Invalid credentials');
      }
      
      // Strip password before returning
      const { password: _, ...userWithoutPassword } = user;
      
      return {
        token: 'mock-jwt-token',
        user: userWithoutPassword
      };
    } else {
      // Real API call to Flask backend
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    }
  },
  
  register: async (username: string, email: string, password: string) => {
    if (USE_MOCK_DATA) {
      await delay(800); // Simulate network delay
      
      // Check if user already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('User already exists');
      }
      
      // In a real implementation, this would create a user in your database
      const newUser = {
        id: MOCK_USERS.length + 1,
        username,
        email,
        password
      };
      
      MOCK_USERS.push(newUser);
      
      return { success: true };
    } else {
      // Real API call to Flask backend
      const response = await apiClient.post('/auth/register', { username, email, password });
      return response.data;
    }
  },
  
  // Portfolio
  getUserPortfolio: async (userId: number) => {
    if (USE_MOCK_DATA) {
      await delay(600);
      
      const portfolio = MOCK_PORTFOLIOS[userId as keyof typeof MOCK_PORTFOLIOS] || [];
      
      return portfolio;
    } else {
      // Real API call to Flask backend
      const response = await apiClient.get(`/portfolio/${userId}`);
      return response.data;
    }
  },
  
  addStock: async (userId: number, stockData: { symbol: string, name: string, shares: number, avgPrice: number }) => {
    if (USE_MOCK_DATA) {
      await delay(600);
      
      const portfolio = MOCK_PORTFOLIOS[userId as keyof typeof MOCK_PORTFOLIOS];
      
      if (!portfolio) {
        throw new Error('User portfolio not found');
      }
      
      // Check if stock already exists in portfolio
      const existingStockIndex = portfolio.findIndex(stock => stock.symbol === stockData.symbol);
      
      if (existingStockIndex !== -1) {
        // Update existing stock
        const existingStock = portfolio[existingStockIndex];
        const totalShares = existingStock.shares + stockData.shares;
        
        // Calculate new average price (weighted average)
        const existingValue = existingStock.shares * existingStock.avgPrice;
        const newValue = stockData.shares * stockData.avgPrice;
        const newAvgPrice = (existingValue + newValue) / totalShares;
        
        portfolio[existingStockIndex] = {
          ...existingStock,
          shares: totalShares,
          avgPrice: newAvgPrice
        };
      } else {
        // Add new stock
        const marketData = MOCK_MARKET_DATA.find(stock => stock.symbol === stockData.symbol);
        
        portfolio.push({
          ...stockData,
          currentPrice: marketData ? marketData.price : stockData.avgPrice
        });
      }
      
      return { success: true, message: 'Stock added successfully' };
    } else {
      // Real API call to Flask backend
      const response = await apiClient.post(`/portfolio/${userId}/add`, stockData);
      return response.data;
    }
  },
  
  removeStock: async (userId: number, stockData: { symbol: string, shares: number }) => {
    if (USE_MOCK_DATA) {
      await delay(600);
      
      const portfolio = MOCK_PORTFOLIOS[userId as keyof typeof MOCK_PORTFOLIOS];
      
      if (!portfolio) {
        throw new Error('User portfolio not found');
      }
      
      // Find the stock in the portfolio
      const stockIndex = portfolio.findIndex(stock => stock.symbol === stockData.symbol);
      
      if (stockIndex === -1) {
        throw new Error('Stock not found in portfolio');
      }
      
      const existingStock = portfolio[stockIndex];
      
      if (stockData.shares >= existingStock.shares) {
        // Remove the stock entirely
        portfolio.splice(stockIndex, 1);
      } else {
        // Update the shares
        portfolio[stockIndex] = {
          ...existingStock,
          shares: existingStock.shares - stockData.shares
        };
      }
      
      return { success: true, message: 'Stock removed successfully' };
    } else {
      // Real API call to Flask backend
      const response = await apiClient.post(`/portfolio/${userId}/remove`, stockData);
      return response.data;
    }
  },
  
  // Market data
  getMarketData: async () => {
    if (USE_MOCK_DATA) {
      await delay(500);
      return MOCK_MARKET_DATA;
    } else {
      // Real API call to Flask backend
      const response = await apiClient.get('/market/data');
      return response.data;
    }
  }
};
