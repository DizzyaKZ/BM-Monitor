export type RawMaterialCategory = 'MILK' | 'MEAT' | 'FLOUR' | 'SPICE';
export type PriceTrend = 'UP' | 'DOWN' | 'STABLE';
export type FetchMethod = 'AUTO_CRAWL' | 'MANUAL_ENTRY' | 'INVOICE_SCAN';

export interface RawMaterialSourceDetail {
  source_id: string;
  price: number;
  url: string;
  fetched_at: string;
  method: FetchMethod;
  status: string;
  http_status?: number | null;
  response_time_ms?: number;
  notes?: string;
}

export interface RawMaterialItem {
  id: string;
  code: string;
  category: RawMaterialCategory;
  name: string;
  unit: string;
  current_cost_kzt: number;
  market_avg_kzt: number;
  market_min_kzt: number;
  market_max_kzt: number;
  trend: PriceTrend;
  trend_pct: number;
  delta_1d_pct: number;
  delta_30d_pct?: number;
  supplier: string;
  best_source: string;
  best_source_name?: string;
  source_url: string;
  last_updated: string;
  last_fetched_at?: string;
  fetch_method?: FetchMethod;
  recent_sources?: { [sourceId: string]: number };
  sources_detail?: { [sourceId: string]: RawMaterialSourceDetail | any };
  [key: string]: any;
}

export interface MarketSource {
  id: string;
  name: string;
  type: 'MARKET' | 'HYPERMARKET' | 'ONLINE' | 'SUPPLIER';
  base_url: string;
  description: string;
  [key: string]: any;
}

export interface PriceHistoryRecord {
  date: string;
  code: string;
  avg_price: number;
  min_price: number;
  max_price: number;
  best_source: string;
  sources?: { [sourceId: string]: number };
  [key: string]: any;
}

export interface AcquisitionLog {
  id: string;
  date: string;
  timestamp: string;
  code: string;
  item_name: string;
  unit: string;
  source_id: string;
  source_name: string;
  price_kzt: number;
  url: string;
  method: FetchMethod;
  http_status: number;
  response_time_ms: number;
  status: string;
  notes?: string;
  [key: string]: any;
}
