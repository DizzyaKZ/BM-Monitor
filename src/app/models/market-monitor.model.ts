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
  auto_monitor?: boolean;
  check_interval?: string;
  target_code?: string;
  target_name?: string;
  initial_price_kzt?: number;
  parser_type?: string;
  last_crawled_at?: string;
  last_crawled_price?: number;
  status?: 'ACTIVE' | 'PAUSED' | 'ERROR';
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
  old_price_kzt?: number;
  new_price_kzt?: number;
  delta_kzt?: number;
  delta_pct?: number;
  url: string;
  method: FetchMethod;
  http_status: number;
  response_time_ms: number;
  status: string;
  notes?: string;
  [key: string]: any;
}

export interface CrawlLogEntry {
  time: string;
  code: string;
  name: string;
  source: string;
  price: number;
  url: string;
  status: string;
  ms: number;
}

export interface CrawlSummary {
  total: number;
  sourcesCount: number;
  updatedLogsCount: number;
  avgBasketDelta: number;
  alerts: { code: string; name: string; oldPrice: number; newPrice: number; deltaPct: number }[];
  completedAt: string;
}

// ==========================================
// РЕЖИМЫ МОНИТОРИНГА
// 1. BEER_MONITOR: Выделенная пивная карта (крафт, разливное, кеги, COGS бокала)
// 2. FINISHED_PRODUCTS: Кухня бара, сыры, мясо, выпечка, соусы (B2C & HoReCa)
// 3. RAW_MATERIALS: Сырьё и ингредиенты (B2B поставки, опт)
// ==========================================

export type MonitorMode = 'BEER_MONITOR' | 'FINISHED_PRODUCTS' | 'RAW_MATERIALS';

export type FinishedProductBrand = 
  | 'ALL' 
  | 'BEERMOOD_PUB' 
  | 'CHEESY_MOOD' 
  | 'MEAT_BREAD' 
  | 'SPICY_MOOD';

export type FinishedProductCategory = 
  | 'ALL' 
  | 'BEER' 
  | 'PUB_FOOD' 
  | 'CHEESE' 
  | 'CHARCUTERIE' 
  | 'BAKERY' 
  | 'SAUCES';

export type ChannelType = 
  | 'ALL' 
  | 'BAR_PUB' 
  | 'CRAFT_SHOP' 
  | 'RETAIL_SUPERMARKET' 
  | 'ARTISAN_BOUTIQUE' 
  | 'DELIVERY_APP';

export interface FinishedProductItem {
  id: string;
  code: string;
  name: string;
  brand: FinishedProductBrand;
  category: FinishedProductCategory;
  channel_type: ChannelType;
  portion_size: string;
  unit: string;
  competitor_name: string;
  competitor_price_kzt: number;
  market_min_kzt: number;
  market_avg_kzt: number;
  market_max_kzt: number;
  target_beermood_price_kzt: number;
  estimated_cogs_kzt: number;
  margin_pct?: number;
  price_advantage_pct?: number;
  delta_1d_pct: number;
  delta_30d_pct: number;
  source_name: string;
  source_url: string;
  last_updated: string;
  last_fetched_at?: string;
  fetch_method?: FetchMethod;
  status: 'VERIFIED' | 'UPDATED' | 'ATTENTION';
  beer_style?: string; // Стиль пива: IPA, APA, Stout, Pilsner, Helles, Blanche, Sour, Cider
  [key: string]: any;
}

export interface CompetitorVenue {
  id: string;
  name: string;
  channel_type: ChannelType;
  address: string;
  menu_url: string;
  platform: string;
  notes?: string;
  auto_monitor?: boolean;
  check_interval?: string;
  target_code?: string;
  target_name?: string;
  initial_price_kzt?: number;
  parser_type?: string;
  last_crawled_at?: string;
  last_crawled_price?: number;
  status?: 'ACTIVE' | 'PAUSED' | 'ERROR';
  [key: string]: any;
}
