import CONFIG from "./config.js";
import { fetchFixtures, fetchTeamStats } from "./api.js";
import { predictOver25, predictBTTS, predictResult } from "./predictions.js";

const $leagueTabs = document.getElementById("league-tabs");
const $cards = document.getElementById("cards");
const $spinner = document.getElementById("spinner");
const $error = document.getElementById("error-msg");

let activeLeagueId = CONFIG.LEAGUES[0].id;

function showSpinner(visible) {
  $spinner.style.display = visible ? "flex" : "none";
}

function showError(msg) {
  $error.textContent = msg;
  $error.style.display = msg ? "block" : "none";
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-MX", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

function badgeHTML(pred) {
  const cls = pred.confidence === "alta" ? "badge-green" : pred.confidence === "media" ? "badge-yellow" : "badge-red";
  return `<span class="badge ${cls}">${pred.prediction} <strong>${pred.probability}%</strong></span>`;
}

function renderMatchCard(fixture, over25, btts, result) {
  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const date = formatDate(fixture.fixture.date);
  const venue = fixture.fixture.venue?.name || "";

  return `
    <article class="card">
      <div class="card-header">
        <span class="date">${date}</span>
        ${venue ? `<span class="venue">${venue}</span>` : ""}
      </div>
      <div class="teams">
        <div class="team">
          <img src="${home.logo}" alt="${home.name}" loading="lazy" />
          <span>${home.name}</span>
        </div>
        <div class="vs">VS</div>
        <div class="team">
          <img src="${away.logo}" alt="${away.name}" loading="lazy" />
          <span>${away.name}</span>
        </div>
      </div>
      <div class="predictions">
        <div class="pred-row">
          <span class="pred-label">Over 2.5</span>
          ${badgeHTML(over25)}
          <span class="pred-detail">${over25.detail}</span>
        </div>
        <div class="pred-row">
          <span class="pred-label">BTTS</span>
          ${badgeHTML(btts)}
          <span class="pred-detail">${btts.detail}</span>
        </div>
        <div class="pred-row">
          <span class="pred-label">Resultado</span>
          ${badgeHTML(result)}
          <span class="pred-detail">${result.detail}</span>
        </div>
      </div>
    </article>`;
}

function renderEmpty() {
  $cards.innerHTML = `<p class="empty">No hay partidos próximos para esta liga.</p>`;
}

function renderSkeleton(count = 4) {
  $cards.innerHTML = Array(count).fill(`<article class="card skeleton"></article>`).join("");
}

async function loadLeague(leagueId) {
  showError("");
  renderSkeleton();
  showSpinner(true);

  const season = CONFIG.SEASON;

  try {
    const fixtures = await fetchFixtures(leagueId, season);

    if (!fixtures.length) {
      renderEmpty();
      return;
    }

    const html = await Promise.all(
      fixtures.map(async (fix) => {
        try {
          const [homeStats, awayStats] = await Promise.all([
            fetchTeamStats(fix.teams.home.id, leagueId, season),
            fetchTeamStats(fix.teams.away.id, leagueId, season),
          ]);
          const over25 = predictOver25(homeStats, awayStats);
          const btts = predictBTTS(homeStats, awayStats);
          const result = predictResult(homeStats, awayStats);
          return renderMatchCard(fix, over25, btts, result);
        } catch {
          return "";
        }
      })
    );

    const rendered = html.filter(Boolean).join("");
    if (rendered) { $cards.innerHTML = rendered; } else { renderEmpty(); }
  } catch (err) {
    showError(`Error al cargar datos: ${err.message}`);
    $cards.innerHTML = "";
  } finally {
    showSpinner(false);
  }
}

function buildTabs() {
  CONFIG.LEAGUES.forEach((league) => {
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (league.id === activeLeagueId ? " active" : "");
    btn.dataset.id = league.id;
    btn.innerHTML = `${league.flag} ${league.name}`;
    btn.addEventListener("click", () => {
      if (activeLeagueId === league.id) return;
      activeLeagueId = league.id;
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadLeague(league.id);
    });
    $leagueTabs.appendChild(btn);
  });
}

buildTabs();
loadLeague(activeLeagueId);
