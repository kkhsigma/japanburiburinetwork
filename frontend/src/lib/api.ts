import apiClient from './api-client';
import type {
  Alert,
  AlertFilters,
  Compound,
  CompoundDetailResponse,
  HybridSearchResult,
  PaginatedResponse,
  DetailResponse,
  WatchlistEntry,
  WatchlistHighlight,
  UpdateCard,
  UserSettings,
} from '@/types';

// --- Alerts ---
export async function fetchAlerts(filters: AlertFilters = {}): Promise<PaginatedResponse<Alert>> {
  const params = new URLSearchParams();
  if (filters.severity) params.set('severity', filters.severity);
  if (filters.category) params.set('category', filters.category);
  if (filters.compound) params.set('compound', filters.compound);
  if (filters.status) params.set('status', filters.status);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const { data } = await apiClient.get<PaginatedResponse<Alert>>(`/alerts?${params}`);
  return data;
}

export async function fetchAlert(id: string): Promise<DetailResponse<Alert>> {
  const { data } = await apiClient.get<DetailResponse<Alert>>(`/alerts/${id}`);
  return data;
}

export async function fetchCriticalAlerts(): Promise<DetailResponse<Alert[]>> {
  const { data } = await apiClient.get<DetailResponse<Alert[]>>('/alerts/critical');
  return data;
}

export async function fetchUpcomingAlerts(): Promise<DetailResponse<Alert[]>> {
  const { data } = await apiClient.get<DetailResponse<Alert[]>>('/alerts/upcoming');
  return data;
}

// --- Compounds ---
export async function fetchCompounds(): Promise<DetailResponse<Compound[]>> {
  const { data } = await apiClient.get<DetailResponse<Compound[]>>('/compounds');
  return data;
}

export async function fetchCompound(id: string): Promise<CompoundDetailResponse> {
  const { data } = await apiClient.get<CompoundDetailResponse>(`/compounds/${id}`);
  return data;
}

// --- Watchlist ---
export async function fetchWatchlist(): Promise<DetailResponse<WatchlistEntry[]>> {
  const { data } = await apiClient.get<DetailResponse<WatchlistEntry[]>>('/watchlist');
  return data;
}

export async function addToWatchlist(entry: {
  entity_type: string;
  entity_id: string;
  entity_name: string;
  notification_enabled?: boolean;
}): Promise<DetailResponse<WatchlistEntry>> {
  const { data } = await apiClient.post<DetailResponse<WatchlistEntry>>('/watchlist', entry);
  return data;
}

export async function removeFromWatchlist(id: string): Promise<void> {
  await apiClient.delete(`/watchlist/${id}`);
}

export async function fetchWatchlistHighlights(): Promise<DetailResponse<WatchlistHighlight[]>> {
  const { data } = await apiClient.get<DetailResponse<WatchlistHighlight[]>>('/watchlist/highlights');
  return data;
}

// --- Search ---
export async function fetchSearch(query: string, limit?: number): Promise<{ data: HybridSearchResult }> {
  const params = new URLSearchParams({ q: query });
  if (limit) params.set('limit', String(limit));
  const { data } = await apiClient.get(`/search?${params}`);
  return data;
}

export function getAskJbnStreamUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  return `${base}/ask-jbn`;
}

// --- Updates (Intro) ---
export async function fetchRecentUpdates(): Promise<DetailResponse<UpdateCard[]>> {
  const { data } = await apiClient.get<DetailResponse<UpdateCard[]>>('/updates/recent');
  return data;
}

// --- Settings ---
export async function fetchSettings(): Promise<DetailResponse<UserSettings>> {
  const { data } = await apiClient.get<DetailResponse<UserSettings>>('/settings');
  return data;
}

export async function updateSettings(settings: Partial<UserSettings>): Promise<DetailResponse<UserSettings>> {
  const { data } = await apiClient.put<DetailResponse<UserSettings>>('/settings', settings);
  return data;
}
