import CONFIG from "./config.js";

const CACHE_PREFIX = "apifootball_";

function cacheKey(path) {
  return CACHE_PREFIX + btoa(path);
}

async function apiFetch(endpoint) {
  const key = cacheKey(endpoint);
  const cached = sessionStorage.getItem(key);
  if (cached) return JSON.parse(cached);

  const res = await fetch(`${CONFIG.BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "x-rapidapi-key": CONFIG.API_KEY,
      "x-rapidapi-host": CONFIG.API_HOST,
    },
  });

  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`);
  const data = await res.json();
  if (data.errors && Object.keys(data.errors).length > 0) {
    const msg = Object.values(data.errors).join(", ");
    throw new Error(`API error: ${msg}`);
  }

  sessionStorage.setItem(key, JSON.stringify(data));
  return data;
}

export async function fetchFixtures(leagueId, season) {
  const data = await apiFetch(`/fixtures?league=${leagueId}&season=${season}&next=10`);
  return data.response || [];
}

export async function fetchTeamStats(teamId, leagueId, season) {
  const data = await apiFetch(`/teams/statistics?team=${teamId}&league=${leagueId}&season=${season}`);
  return data.response || null;
}
