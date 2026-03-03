import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { predictOver25, predictBTTS, predictResult } from "../js/predictions.js";

function makeStats({ goalsForAvg, goalsAgainstAvg, goalsForTotal, gamesPlayed, winsHome, winsAway, draws, loses } = {}) {
  return {
    goals: {
      for:     { average: { total: String(goalsForAvg ?? 1.5) }, total: { total: goalsForTotal ?? 15 } },
      against: { average: { total: String(goalsAgainstAvg ?? 1.2) } },
    },
    fixtures: {
      played: { total: gamesPlayed ?? 10 },
      wins:   { home: winsHome ?? 4, away: winsAway ?? 3 },
      draws:  { home: draws ?? 2,    away: draws ?? 2 },
      loses:  { home: loses ?? 4,    away: loses ?? 5 },
    },
  };
}

const CONFIDENCE_LEVELS = ["alta", "media", "baja"];

describe("predictOver25", () => {
  it("returns probability between 0 and 100", () => {
    const r = predictOver25(makeStats(), makeStats());
    assert.ok(r.probability >= 0 && r.probability <= 100);
  });

  it("probability is never NaN", () => {
    const r = predictOver25(makeStats(), makeStats());
    assert.ok(!isNaN(r.probability));
  });

  it("returns a valid confidence level", () => {
    const r = predictOver25(makeStats(), makeStats());
    assert.ok(CONFIDENCE_LEVELS.includes(r.confidence));
  });

  it("predicts Over 2.5 when expected goals are high", () => {
    const high = makeStats({ goalsForAvg: 2.5, goalsAgainstAvg: 1.8 });
    const r = predictOver25(high, high);
    assert.equal(r.prediction, "Over 2.5");
  });

  it("predicts Under 2.5 when expected goals are low", () => {
    const low = makeStats({ goalsForAvg: 0.5, goalsAgainstAvg: 0.4 });
    const r = predictOver25(low, low);
    assert.equal(r.prediction, "Under 2.5");
  });

  it("handles null stats without throwing", () => {
    assert.doesNotThrow(() => predictOver25(null, null));
  });

  it("handles undefined stats without throwing", () => {
    assert.doesNotThrow(() => predictOver25(undefined, undefined));
  });

  it("detail string contains expected goals", () => {
    const r = predictOver25(makeStats(), makeStats());
    assert.ok(r.detail.includes("Goles esperados"));
  });

  it("high-scoring teams produce alta confidence", () => {
    const high = makeStats({ goalsForAvg: 3.0, goalsAgainstAvg: 2.5 });
    const r = predictOver25(high, high);
    assert.equal(r.confidence, "alta");
  });
});

describe("predictBTTS", () => {
  it("returns probability between 0 and 100", () => {
    const r = predictBTTS(makeStats(), makeStats());
    assert.ok(r.probability >= 0 && r.probability <= 100);
  });

  it("probability is never NaN", () => {
    const r = predictBTTS(makeStats(), makeStats());
    assert.ok(!isNaN(r.probability));
  });

  it("returns a valid confidence level", () => {
    const r = predictBTTS(makeStats(), makeStats());
    assert.ok(CONFIDENCE_LEVELS.includes(r.confidence));
  });

  it("predicts BTTS Si when both teams score frequently", () => {
    const active = makeStats({ goalsForTotal: 10, gamesPlayed: 10 });
    const r = predictBTTS(active, active);
    assert.equal(r.prediction, "Ambos Anotan: Sí");
  });

  it("predicts BTTS No when teams rarely score", () => {
    const passive = makeStats({ goalsForTotal: 1, gamesPlayed: 10 });
    const r = predictBTTS(passive, passive);
    assert.equal(r.prediction, "Ambos Anotan: No");
  });

  it("handles null stats without throwing", () => {
    assert.doesNotThrow(() => predictBTTS(null, null));
  });

  it("detail string contains local and visitante rates", () => {
    const r = predictBTTS(makeStats(), makeStats());
    assert.ok(r.detail.includes("Local") && r.detail.includes("Visitante"));
  });
});

describe("predictResult", () => {
  it("returns probability between 0 and 100", () => {
    const r = predictResult(makeStats(), makeStats());
    assert.ok(r.probability >= 0 && r.probability <= 100);
  });

  it("probability is never NaN", () => {
    const r = predictResult(makeStats(), makeStats());
    assert.ok(!isNaN(r.probability));
  });

  it("returns a valid confidence level", () => {
    const r = predictResult(makeStats(), makeStats());
    assert.ok(CONFIDENCE_LEVELS.includes(r.confidence));
  });

  it("breakdown home + draw + away sums to 100", () => {
    const r = predictResult(makeStats(), makeStats());
    const sum = r.breakdown.home + r.breakdown.draw + r.breakdown.away;
    assert.ok(Math.abs(sum - 100) <= 1);
  });

  it("favors local when home team has dominant record", () => {
    const strong = makeStats({ winsHome: 9, draws: 1, loses: 0 });
    const weak   = makeStats({ winsAway: 1, draws: 1, loses: 8 });
    const r = predictResult(strong, weak);
    assert.equal(r.prediction, "1 (Local)");
  });

  it("favors visitor when away team has dominant record", () => {
    const weak   = makeStats({ winsHome: 1, draws: 1, loses: 8 });
    const strong = makeStats({ winsAway: 9, draws: 1, loses: 0 });
    const r = predictResult(weak, strong);
    assert.equal(r.prediction, "2 (Visitante)");
  });

  it("prediction is one of 1 / X / 2", () => {
    const r = predictResult(makeStats(), makeStats());
    assert.ok(["1 (Local)", "X (Empate)", "2 (Visitante)"].includes(r.prediction));
  });

  it("handles null stats without throwing", () => {
    assert.doesNotThrow(() => predictResult(null, null));
  });

  it("detail string contains 1, X and 2 percentages", () => {
    const r = predictResult(makeStats(), makeStats());
    assert.ok(r.detail.includes("1:") && r.detail.includes("X:") && r.detail.includes("2:"));
  });
});
