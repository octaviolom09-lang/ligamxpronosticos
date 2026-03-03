const CONFIG = {
  API_KEY: "SIMULATED_SECRET_KEY",
  API_HOST: "api-football-v1.p.rapidapi.com",
  BASE_URL: "https://api-football-v1.p.rapidapi.com/v3",
  SEASON: new Date().getFullYear(),
  LEAGUES: [
    { id: 262, name: "Liga MX",         flag: "🇲🇽" },
    { id: 39,  name: "Premier League",  flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { id: 140, name: "La Liga",         flag: "🇪🇸" },
    { id: 2,   name: "Champions League",flag: "🏆" },
  ],
};

export default CONFIG;
