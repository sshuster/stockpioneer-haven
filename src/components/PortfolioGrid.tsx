
import React, { useCallback, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

interface PortfolioItem {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

interface PortfolioGridProps {
  data: PortfolioItem[];
}

const PortfolioGrid: React.FC<PortfolioGridProps> = ({ data }) => {
  const [gridApi, setGridApi] = useState<any>(null);
  
  // Calculate values for derived columns
  const processedData = data.map(item => ({
    ...item,
    marketValue: item.shares * item.currentPrice,
    gain: item.currentPrice - item.avgPrice,
    gainPercent: ((item.currentPrice - item.avgPrice) / item.avgPrice) * 100,
    totalGain: (item.currentPrice - item.avgPrice) * item.shares
  }));
  
  // Column definitions
  const columnDefs: any[] = [
    { 
      headerName: 'Symbol', 
      field: 'symbol', 
      sortable: true, 
      filter: true,
      width: 120,
      cellClass: 'font-medium'
    },
    { 
      headerName: 'Name', 
      field: 'name', 
      sortable: true, 
      filter: true,
      flex: 1
    },
    { 
      headerName: 'Shares', 
      field: 'shares', 
      sortable: true, 
      width: 120,
      cellStyle: { justifyContent: 'flex-end' },
    },
    { 
      headerName: 'Avg Price', 
      field: 'avgPrice', 
      sortable: true, 
      width: 130,
      cellRenderer: (params: any) => `$${params.value.toFixed(2)}`,
      cellStyle: { justifyContent: 'flex-end' },
    },
    { 
      headerName: 'Current Price', 
      field: 'currentPrice', 
      sortable: true, 
      width: 140,
      cellRenderer: (params: any) => `$${params.value.toFixed(2)}`,
      cellStyle: { justifyContent: 'flex-end' },
    },
    { 
      headerName: 'Market Value', 
      field: 'marketValue', 
      sortable: true, 
      width: 140,
      cellRenderer: (params: any) => `$${params.value.toFixed(2)}`,
      cellStyle: { justifyContent: 'flex-end' },
    },
    { 
      headerName: 'Gain/Loss (%)', 
      field: 'gainPercent', 
      sortable: true, 
      width: 140,
      cellRenderer: (params: any) => {
        const value = params.value;
        const displayValue = `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
        const colorClass = value >= 0 ? 'text-green-600' : 'text-red-600';
        return `<span class="${colorClass}">${displayValue}</span>`;
      },
      cellStyle: { justifyContent: 'flex-end' },
    },
    { 
      headerName: 'Total Gain/Loss', 
      field: 'totalGain', 
      sortable: true, 
      width: 140,
      cellRenderer: (params: any) => {
        const value = params.value;
        const displayValue = `${value >= 0 ? '+' : ''}$${Math.abs(value).toFixed(2)}`;
        const colorClass = value >= 0 ? 'text-green-600' : 'text-red-600';
        return `<span class="${colorClass}">${displayValue}</span>`;
      },
      cellStyle: { justifyContent: 'flex-end' },
    },
  ];
  
  const defaultColDef = {
    flex: 0,
    minWidth: 100,
    resizable: true,
  };
  
  const onGridReady = useCallback((params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  }, []);
  
  return (
    <div className="w-full h-[500px]">
      <div 
        className="ag-theme-alpine w-full h-full rounded-lg overflow-hidden glass"
        style={{ height: '100%', width: '100%' }}
      >
        <AgGridReact
          rowData={processedData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onGridReady={onGridReady}
          animateRows={true}
          rowHeight={48}
          headerHeight={48}
          suppressCellFocus={true}
          suppressMovableColumns={true}
        />
      </div>
    </div>
  );
};

export default PortfolioGrid;
