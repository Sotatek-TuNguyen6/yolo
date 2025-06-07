export interface ProductReportSummary {
  totalProducts: number;
  totalActiveProducts: number;
  totalInactiveProducts: number;
  totalStock: number;
  averagePrice: number;
  highestPrice: number;
  lowestPrice: number;
}

export interface CategoryStats {
  [categoryName: string]: {
    count: number;
    averagePrice: number;
    totalStock: number;
  };
}

export interface PriceRangeStats {
  [range: string]: number; // e.g. "0-50": 10, "51-100": 20, etc.
}

export interface StockStats {
  inStock: number;
  lowStock: number; // Less than 10
  outOfStock: number;
}

export interface ProductReportResponse {
  summary: ProductReportSummary;
  categoryStats: CategoryStats;
  priceRangeStats: PriceRangeStats;
  stockStats: StockStats;
  topProducts?: any[]; // Optional top products by stock or price
}
