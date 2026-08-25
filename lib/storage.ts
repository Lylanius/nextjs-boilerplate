import { PlayerProfile } from "./types";
import { INITIAL_QUESTS } from "./lootData";

const STORAGE_KEY = "number_knights_player_profile_v2";

export const DEFAULT_PROFILE: PlayerProfile = {
  name: "Math Hero",
  title: "Times Table Apprentice",
  yearGroup: "ks2-y4",
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  coins: 250,
  gems: 15,
  totalQuestionsAnswered: 0,
  totalCorrect: 0,
  bestSpeedAvgMs: 0,
  streakDays: 1,
  lastPlayedDate: new Date().toISOString().split("T")[0],
  inventory: [
    "outfit_tunic_novice",
    "weapon_wooden_ruler",
  ],
  avatar: {
    skinTone: "#fcd34d", // warm golden tone
    hairStyle: "spiky",
    hairColor: "#475569",
    expression: "confident",
    equippedHead: null,
    equippedFace: null,
    equippedOutfit: "outfit_tunic_novice",
    equippedWeapon: "weapon_wooden_ruler",
    equippedShield: null,
    equippedAura: null,
    equippedPet: null,
    equippedTitle: "Times Table Apprentice",
  },
  factMastery: {},
  unlockedChests: 0,
  activeQuests: INITIAL_QUESTS,
  highScores: {
    arenaScore: 0,
    mtcScore: 0,
    bossesDefeated: 0,
    speedRank: "Novice Explorer",
  },
};

export function loadPlayerProfile(): PlayerProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      avatar: { ...DEFAULT_PROFILE.avatar, ...(parsed.avatar || {}) },
      highScores: { ...DEFAULT_PROFILE.highScores, ...(parsed.highScores || {}) },
      activeQuests: parsed.activeQuests?.length ? parsed.activeQuests : INITIAL_QUESTS,
      inventory: Array.from(new Set([...(parsed.inventory || []), "outfit_tunic_novice", "weapon_wooden_ruler"])),
    };
  } catch (e) {
    console.error("Failed to load player profile:", e);
    return DEFAULT_PROFILE;
  }
}

export function savePlayerProfile(profile: PlayerProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save player profile:", e);
  }
}

export function addXpAndCoins(
  profile: PlayerProfile,
  xpEarned: number,
  coinsEarned: number,
  gemsEarned: number = 0
): { updatedProfile: PlayerProfile; leveledUp: boolean } {
  let newXp = profile.xp + xpEarned;
  let newLevel = profile.level;
  let xpReq = profile.xpToNextLevel;
  let leveledUp = false;

  while (newXp >= xpReq) {
    newXp -= xpReq;
    newLevel += 1;
    xpReq = Math.floor(xpReq * 1.35);
    leveledUp = true;
  }

  const updatedProfile: PlayerProfile = {
    ...profile,
    level: newLevel,
    xp: newXp,
    xpToNextLevel: xpReq,
    coins: profile.coins + coinsEarned,
    gems: profile.gems + gemsEarned,
  };

  savePlayerProfile(updatedProfile);
  return { updatedProfile, leveledUp };
}

export function recordFactAttempt(
  profile: PlayerProfile,
  key: string, // e.g. "7x8"
  correct: boolean,
  timeMs: number
): PlayerProfile {
  const current = profile.factMastery[key] || {
    attempts: 0,
    correct: 0,
    totalTimeMs: 0,
    bestTimeMs: 99999,
    lastTested: Date.now(),
  };

  const updatedFact = {
    attempts: current.attempts + 1,
    correct: current.correct + (correct ? 1 : 0),
    totalTimeMs: current.totalTimeMs + timeMs,
    bestTimeMs: correct ? Math.min(current.bestTimeMs, timeMs) : current.bestTimeMs,
    lastTested: Date.now(),
  };

  const updatedMastery = {
    ...profile.factMastery,
    [key]: updatedFact,
  };

  // Calculate overall average recall speed
  let totalTime = 0;
  let totalAttempts = 0;
  Object.values(updatedMastery).forEach((f) => {
    totalTime += f.totalTimeMs;
    totalAttempts += f.attempts;
  });

  const avgSpeed = totalAttempts > 0 ? Math.round(totalTime / totalAttempts) : 0;

  const updated: PlayerProfile = {
    ...profile,
    factMastery: updatedMastery,
    totalQuestionsAnswered: profile.totalQuestionsAnswered + 1,
    totalCorrect: profile.totalCorrect + (correct ? 1 : 0),
    bestSpeedAvgMs: avgSpeed,
  };

  savePlayerProfile(updated);
  return updated;
}
