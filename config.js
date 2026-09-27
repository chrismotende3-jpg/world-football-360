const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();

if (import.meta.env.PROD && !configuredApiBase) {
  throw new Error('VITE_API_BASE_URL is required for a production Football World 360 deployment.');
}

export const API_BASE = (configuredApiBase || 'http://localhost:8787/api').replace(/\/$/, '');
export const FOOTBALL_SEASON = Number(import.meta.env.VITE_FOOTBALL_SEASON || 2026);
export const LEAGUES = Object.freeze({EPL:39,KPL:276});
