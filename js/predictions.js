function safeNum(val, fallback = 0) {
  const n = parseFloat(val);
  return isNaN(n) ? fallback : n;
}

function clamp(val, min = 0, max = 100) {
  return Math.min(max, Math.max(min, val));
}

function confidenceLabel(prob) {
  if (prob >= 65) return "alta";
  if (prob >= 45) return "media";
  return "baja";
}

export function predictOver25(homeStats, awayStats) {
  const homeAvg = safeNum(homeStats?.goals?.for?.average?.total);
  const awayAvg = safeNum(awayStats?.goals?.for?.average?.total);
  const homeAvgConceded = safeNum(homeStats?.goals?.against?.average?.total);
  const awayAvgConceded = safeNum(awayStats?.goals?.against?.average?.total);
  const totalExpected = (homeAvg + awayAvgConceded + awayAvg + homeAvgConceded) / 2;

  let probability;
  if (totalExpected >= 3.5) probability = clamp(70 + (totalExpected - 3.5) * 5);
  else if (totalExpected >= 2.5) probability = clamp(55 + (totalExpected - 2.5) * 15);
  else probability = clamp(30 + totalExpected * 10);

  return {
    prediction: totalExpected > 2.5 ? "Over 2.5" : "Under 2.5",
    probability: Math.round(probability),
    confidence: confidenceLabel(probability),
    detail: `Goles esperados: ${totalExpected.toFixed(2)}`,
  };
}

export function predictBTTS(homeStats, awayStats) {
  const homeGames = safeNum(homeStats?.fixtures?.played?.total, 1);
  const awayGames = safeNum(awayStats?.fixtures?.played?.total, 1);

  const homeScoredGames = safeNum(homeStats?.goals?.for?.total?.total);
  const awayScoredGames = safeNum(awayStats?.goals?.for?.total?.total);

  const homeScoredRate = clamp((homeScoredGames / homeGames) * 100);
  const awayScoredRate = clamp((awayScoredGames / awayGames) * 100);

  const probability = clamp((homeScoredRate / 100) * (awayScoredRate / 100) * 100);

  return {
    prediction: probability >= 50 ? "Ambos Anotan: Sí" : "Ambos Anotan: No",
    probability: Math.round(probability),
    confidence: confidenceLabel(probability),
    detail: `Local anota: ${Math.round(homeScoredRate)}% | Visitante anota: ${Math.round(awayScoredRate)}%`,
  };
}

export function predictResult(homeStats, awayStats) {
  const homeWins = safeNum(homeStats?.fixtures?.wins?.home);
  const homeDraws = safeNum(homeStats?.fixtures?.draws?.home);
  const homeLosses = safeNum(homeStats?.fixtures?.loses?.home);
  const homeTotal = homeWins + homeDraws + homeLosses || 1;

  const awayWins = safeNum(awayStats?.fixtures?.wins?.away);
  const awayDraws = safeNum(awayStats?.fixtures?.draws?.away);
  const awayLosses = safeNum(awayStats?.fixtures?.loses?.away);
  const awayTotal = awayWins + awayDraws + awayLosses || 1;

  const homeWinRate = (homeWins / homeTotal) * 100;
  const awayWinRate = (awayWins / awayTotal) * 100;
  const homeDrawRate = (homeDraws / homeTotal) * 100;
  const awayDrawRate = (awayDraws / awayTotal) * 100;

  const p1 = clamp(homeWinRate * 1.1);
  const pX = clamp((homeDrawRate + awayDrawRate) / 2);
  const p2 = clamp(awayWinRate * 0.9);

  const total = p1 + pX + p2 || 1;
  const norm1 = Math.round((p1 / total) * 100);
  const normX = Math.round((pX / total) * 100);
  const norm2 = 100 - norm1 - normX;

  const best = Math.max(norm1, normX, norm2);
  let prediction, probability;
  if (best === norm1) { prediction = "1 (Local)";   probability = norm1; }
  else if (best === normX) { prediction = "X (Empate)"; probability = normX; }
  else { prediction = "2 (Visitante)"; probability = norm2; }

  return {
    prediction,
    probability: clamp(probability),
    confidence: confidenceLabel(probability),
    detail: `1: ${norm1}% | X: ${normX}% | 2: ${norm2}%`,
    breakdown: { home: norm1, draw: normX, away: norm2 },
  };
}
