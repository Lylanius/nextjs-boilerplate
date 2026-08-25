export type UkCurriculumYear = 
  | "eyfs-nursery"    // Nursery (Ages 3-4): Subitising 1-5, counting objects, 1 more/less
  | "eyfs-reception"  // Reception (Ages 4-5): Ten-frames, bonds to 5 & 10, doubles
  | "ks1-y1"          // Year 1 (Ages 5-6): Bonds to 20, count in 2/5/10s, +/- to 20
  | "ks1-y2"          // Year 2 (Ages 6-7): 2/5/10 tables, bonds to 100, fractions (1/2, 1/4)
  | "ks2-y3"          // Year 3 (Ages 7-8): 3/4/8 tables, mental +/- to 1000, unit fractions
  | "ks2-y4"          // Year 4 (Ages 8-9): Full 12x12 MTC check, decimals, roman numerals
  | "ks2-y5"          // Year 5 (Ages 9-10): Primes, squares/cubes, x10/100/1000, % basics
  | "ks2-y6"          // Year 6 (Ages 10-11): KS2 SATs Arithmetic, BIDMAS, fractions, algebra
  | "all";            // Comprehensive 1-12 mastery & all arithmetic

export type GameMode = 
  | "dashboard"
  | "eyfs-garden"  // Early Years (Nursery, Reception & Y1) visual garden
  | "arena"        // 60s Speed Challenge across selected curriculum
  | "mtc"          // UK Year 4 Multiplication Tables Check (25 Qs)
  | "sats-arena"   // UK Year 6 SATs Arithmetic & Reasoning Paper
  | "boss"         // RPG Dungeon Boss Battle
  | "dojo"         // Targeted table training & Heatmap
  | "class-battle" // Multi-racer speed sprint
  | "wardrobe"     // Avatar customization
  | "shop"         // Chests & Loot Shop
  | "teacher"      // Teacher & Parent Management Hub
  | "stats";       // Diagnostic 144-fact heat map & analytics

export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export type ItemCategory = 
  | "head" 
  | "face" 
  | "outfit" 
  | "weapon" 
  | "shield" 
  | "aura" 
  | "pet" 
  | "title";

export interface LootItem {
  id: string;
  name: string;
  category: ItemCategory;
  rarity: Rarity;
  cost: number;
  currency: "coins" | "gems";
  description: string;
  visualTag: string;
  glowColor?: string;
  perk?: string;
}

export interface PlayerAvatar {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  expression: "confident" | "fierce" | "joyful" | "cool" | "cyber";
  equippedHead: string | null;
  equippedFace: string | null;
  equippedOutfit: string;
  equippedWeapon: string;
  equippedShield: string | null;
  equippedAura: string | null;
  equippedPet: string | null;
  equippedTitle: string;
}

export type VisualQuestionType = 
  | "standard"
  | "dots"       // Subitising dot cards
  | "tenframe"   // 10-frame visual boxes
  | "apples"     // Countable fruit/objects
  | "bonds"      // Part-whole bubble model
  | "fraction"   // Fraction bar or circle
  | "algebra";   // Missing variable

export interface QuestionFact {
  num1: number;
  num2: number;
  operation: "multiply" | "divide" | "add" | "subtract" | "mixed" | "sats";
  answer: number | string;
  formattedText: string;
  table?: number;
  subtopic?: string;
  visualType?: VisualQuestionType;
  visualData?: {
    count?: number;
    filled?: number;
    total?: number;
    part1?: number;
    part2?: number;
    whole?: number;
    pattern?: string;
  };
  options?: string[]; // Multiple choice options for EYFS or fast selection
  stepHint?: string;  // Pedagogical step-by-step guidance
}

export interface FactHistory {
  attempts: number;
  correct: number;
  totalTimeMs: number;
  bestTimeMs: number;
  lastTested: number;
}

export interface Quest {
  id: string;
  title: string;
  desc: string;
  target: number;
  current: number;
  rewardCoins: number;
  rewardGems: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface PlayerProfile {
  name: string;
  title: string;
  yearGroup: UkCurriculumYear;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  gems: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  bestSpeedAvgMs: number;
  streakDays: number;
  lastPlayedDate: string;
  inventory: string[];
  avatar: PlayerAvatar;
  factMastery: Record<string, FactHistory>;
  unlockedChests: number;
  activeQuests: Quest[];
  highScores: {
    arenaScore: number;
    mtcScore: number;
    satsScore?: number;
    bossesDefeated: number;
    speedRank: string;
  };
  sendSettings?: {
    mtcTimeLimitSeconds: number; // default 6s, can be 8s, 10s, 15s or 0 for untimed
    readAloudEnabled: boolean;
    highContrast: boolean;
  };
}

export interface StudentRecord {
  id: string;
  name: string;
  yearGroup: UkCurriculumYear;
  avatarSeed: string;
  level: number;
  accuracyRate: number;
  avgRecallMs: number;
  totalAnswered: number;
  mtcScore: number; // out of 25
  satsScore: number; // out of 40
  masteryStatus: "Master" | "Fluent" | "Developing" | "Emerging";
  troubleSpots: string[];
  lastActive: string;
}

export interface TeacherAssignment {
  id: string;
  title: string;
  targetYear: UkCurriculumYear;
  topic: string;
  targetQuestions: number;
  minAccuracyPercent: number;
  dueDate: string;
  assignedToClass: string;
  completedCount: number;
  totalStudents: number;
}
