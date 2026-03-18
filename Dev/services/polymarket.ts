// Polymarket API service - zero auth required for read operations

const DATA_API = 'https://data-api.polymarket.com';
const GAMMA_API = 'https://gamma-api.polymarket.com';

// ---- Types ----

export interface Trade {
  id: string;
  proxyWallet: string;
  side: 'BUY' | 'SELL';
  asset: string;
  conditionId: string;
  size: string;
  price: string;
  timestamp: number;
  title: string;
  slug: string;
  outcome: string;
  outcomeIndex: number;
  transactionHash: string;
  name?: string;
  pseudonym?: string;
}

export interface Market {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  endDate: string;
  category: string;
  liquidity: string;
  volume: string;
  outcomes: string;
  outcomePrices: string;
  active: boolean;
  closed: boolean;
  image?: string;
}

export interface GammaEvent {
  id: string;
  title: string;
  slug: string;
  category: string;
  markets: Market[];
  volume: number;
  liquidity: number;
  startDate: string;
  endDate: string;
  image?: string;
}

// ---- Helpers ----

function tradeValue(trade: Trade): number {
  return parseFloat(trade.size) * parseFloat(trade.price);
}

export function formatUSD(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

export function formatAddress(addr: string): string {
  if (!addr) return 'Unknown';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function getWhaleTier(usdValue: number): { label: string; color: string } {
  if (usdValue >= 50000) return { label: 'Mega Whale', color: '#BC8CFF' };
  if (usdValue >= 10000) return { label: 'Whale', color: '#58A6FF' };
  if (usdValue >= 1000) return { label: 'Dolphin', color: '#3FB950' };
  return { label: 'Shrimp', color: '#9BA1A6' };
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() / 1000) - timestamp);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ---- API Calls ----

export async function fetchWhaleTrades(
  minAmount: number = 10000,
  limit: number = 50,
): Promise<(Trade & { usdValue: number })[]> {
  const url = `${DATA_API}/trades?filterType=CASH&filterAmount=${minAmount}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch trades: ${res.status}`);
  const trades: Trade[] = await res.json();
  return trades.map(t => ({ ...t, usdValue: tradeValue(t) }));
}

export async function fetchTradesByWallet(
  wallet: string,
  limit: number = 50,
): Promise<(Trade & { usdValue: number })[]> {
  const url = `${DATA_API}/trades?user=${wallet}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch wallet trades: ${res.status}`);
  const trades: Trade[] = await res.json();
  return trades.map(t => ({ ...t, usdValue: tradeValue(t) }));
}

export async function fetchTradesByMarket(
  conditionId: string,
  limit: number = 100,
): Promise<(Trade & { usdValue: number })[]> {
  const url = `${DATA_API}/trades?market=${conditionId}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch market trades: ${res.status}`);
  const trades: Trade[] = await res.json();
  return trades.map(t => ({ ...t, usdValue: tradeValue(t) }));
}

export async function fetchTopMarkets(limit: number = 20): Promise<Market[]> {
  const url = `${GAMMA_API}/markets?limit=${limit}&active=true&closed=false&order=volume&ascending=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch markets: ${res.status}`);
  return res.json();
}

export async function fetchEvents(limit: number = 20): Promise<GammaEvent[]> {
  const url = `${GAMMA_API}/events?limit=${limit}&active=true&closed=false&order=volume&ascending=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch events: ${res.status}`);
  return res.json();
}

export async function fetchMarketBySlug(slug: string): Promise<Market> {
  const url = `${GAMMA_API}/markets/slug/${slug}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch market: ${res.status}`);
  return res.json();
}
