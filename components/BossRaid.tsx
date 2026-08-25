"use client";

import React, { useState, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { PlayerProfile, QuestionFact } from "@/lib/types";
import { generateQuestion } from "@/lib/curriculum";
import { sound } from "@/lib/audio";
import { recordFactAttempt, addXpAndCoins } from "@/lib/storage";
import Keypad from "./Keypad";
import AvatarView from "./AvatarView";
import { ArrowLeft, Heart, Zap, Sparkles, Trophy } from "lucide-react";

interface BossRaidProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onExit: () => void;
  onOpenShop: () => void;
}

interface BossData {
  id: string;
  name: string;
  title: string;
  icon: string;
  maxHp: number;
  tables: number[];
  color: string;
  bgGrad: string;
  dropCoins: number;
  dropGems: number;
  quote: string;
}

const BOSSES: BossData[] = [
  {
    id: "boss_gargoyle",
    name: "Ignis the Stone Gargoyle",
    title: "Guardian of the 6s & 7s",
    icon: "🗿🔥",
    maxHp: 80,
    tables: [6, 7],
    color: "#f97316",
    bgGrad: "from-orange-950 via-slate-900 to-slate-950",
    dropCoins: 250,
    dropGems: 8,
    quote: "None shall pass without reciting the sacred 7 times table!",
  },
  {
    id: "boss_hydra",
    name: "Venomous 8-Headed Hydra",
    title: "Scourge of the 8s & 9s",
    icon: "🐍⚡",
    maxHp: 120,
    tables: [8, 9],
    color: "#10b981",
    bgGrad: "from-emerald-950 via-slate-900 to-slate-950",
    dropCoins: 450,
    dropGems: 15,
    quote: "Cut down one fact and two harder equations shall take its place!",
  },
  {
    id: "boss_cyber_dragon",
    name: "Quantum Obsidian Dragon",
    title: "Lord of the 12x12 Matrix",
    icon: "🐉💎",
    maxHp: 180,
    tables: [6, 7, 8, 9, 11, 12],
    color: "#a855f7",
    bgGrad: "from-purple-950 via-slate-900 to-slate-950",
    dropCoins: 800,
    dropGems: 25,
    quote: "My calculations are absolute! Can your human brain compute fast enough?",
  },
];

export default function BossRaid({
  profile,
  onUpdateProfile,
  onExit,
  onOpenShop,
}: BossRaidProps) {
  const [selectedBossIndex, setSelectedBossIndex] = useState<number>(0);
  const [bossHp, setBossHp] = useState<number>(BOSSES[0].maxHp);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [inBattle, setInBattle] = useState<boolean>(false);
  const [battleWon, setBattleWon] = useState<boolean>(false);
  const [battleLost, setBattleLost] = useState<boolean>(false);

  const [question, setQuestion] = useState<QuestionFact | null>(null);
  const [answerInput, setAnswerInput] = useState<string>("");
  const [combo, setCombo] = useState<number>(0);
  const [lastDamage, setLastDamage] = useState<{ amount: number; isCrit: boolean } | null>(null);
  const [bossAttackAnim, setBossAttackAnim] = useState<boolean>(false);

  const currentBoss = BOSSES[selectedBossIndex];
  const questionStartTimeRef = useRef<number>(0);

  const spawnNextQuestion = useCallback(() => {
    const q = generateQuestion("all", currentBoss.tables, false);
    setQuestion(q);
    setAnswerInput("");
    questionStartTimeRef.current = Date.now();
  }, [currentBoss.tables]);

  const startBossFight = (bossIdx: number) => {
    setSelectedBossIndex(bossIdx);
    setBossHp(BOSSES[bossIdx].maxHp);
    setPlayerHp(100);
    setCombo(0);
    setBattleWon(false);
    setBattleLost(false);
    setInBattle(true);
    const q = generateQuestion("all", BOSSES[bossIdx].tables, false);
    setQuestion(q);
    setAnswerInput("");
    questionStartTimeRef.current = Date.now();
  };

  const handleAttack = useCallback((overrideAnswer?: string) => {
    if (!question || !inBattle || battleWon || battleLost) return;

    const val = overrideAnswer !== undefined ? overrideAnswer : answerInput;
    const parsed = parseInt(val, 10);
    const timeTaken = Date.now() - questionStartTimeRef.current;
    const isCorrect = parsed === question.answer;

    const factKey = `${question.num1}x${question.num2}`;
    const updatedProf = recordFactAttempt(profile, factKey, isCorrect, timeTaken);
    onUpdateProfile(updatedProf);

    if (isCorrect) {
      sound.playBossHit();
      const newCombo = combo + 1;
      setCombo(newCombo);

      // Fast response (<1.8s) deals critical damage!
      const isCrit = timeTaken < 1800;
      const baseDmg = 15;
      const critMultiplier = isCrit ? 1.8 : 1.0;
      const comboBonus = Math.min(15, newCombo * 3);
      const totalDamage = Math.round((baseDmg + comboBonus) * critMultiplier);

      setLastDamage({ amount: totalDamage, isCrit });
      setTimeout(() => setLastDamage(null), 800);

      const nextHp = Math.max(0, bossHp - totalDamage);
      setBossHp(nextHp);

      if (nextHp <= 0) {
        // Boss Defeated!
        setInBattle(false);
        setBattleWon(true);
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
        sound.playLevelUp();

        const { updatedProfile } = addXpAndCoins(
          profile,
          currentBoss.dropCoins * 1.5,
          currentBoss.dropCoins,
          currentBoss.dropGems
        );
        onUpdateProfile(updatedProfile);
      } else {
        spawnNextQuestion();
      }
    } else {
      // Wrong answer -> Boss strikes back!
      sound.playWrong();
      setCombo(0);
      setBossAttackAnim(true);
      setTimeout(() => setBossAttackAnim(false), 500);

      const bossDmg = 20;
      const nextPlayerHp = Math.max(0, playerHp - bossDmg);
      setPlayerHp(nextPlayerHp);

      if (nextPlayerHp <= 0) {
        setInBattle(false);
        setBattleLost(true);
      } else {
        spawnNextQuestion();
      }
    }
  }, [question, inBattle, battleWon, battleLost, answerInput, profile, onUpdateProfile, combo, bossHp, playerHp, currentBoss, spawnNextQuestion]);

  const handleInputChange = (val: string) => {
    setAnswerInput(val);
    if (question && val === question.answer.toString()) {
      setTimeout(() => {
        handleAttack(val);
      }, 50);
    }
  };

  // 1. BOSS SELECT / VICTORY / DEFEAT SCREEN
  if (!inBattle) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 my-4">
        {/* If just won */}
        {battleWon && (
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-purple-950 border-2 border-amber-500/80 rounded-3xl p-6 sm:p-8 text-white shadow-2xl text-center mb-8 animate-bounce-subtle">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2" />
            <h2 className="text-3xl sm:text-4xl font-black text-amber-300">
              VICTORY! {currentBoss.name.toUpperCase()} DEFEATED!
            </h2>
            <p className="text-slate-300 text-sm mt-1 mb-6">
              You channeled rapid mathematical power and banished the beast!
            </p>

            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2 bg-yellow-950/80 border border-yellow-700 px-4 py-2 rounded-2xl">
                <span className="text-2xl">🪙</span>
                <span className="text-xl font-black text-yellow-300">+{currentBoss.dropCoins} Coins</span>
              </div>
              <div className="flex items-center gap-2 bg-cyan-950/80 border border-cyan-700 px-4 py-2 rounded-2xl">
                <span className="text-2xl">💎</span>
                <span className="text-xl font-black text-cyan-300">+{currentBoss.dropGems} Gems</span>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button
                onClick={onOpenShop}
                className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                OPEN LOOT CHEST 📦
              </button>
              <button
                onClick={() => setBattleWon(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3.5 px-6 rounded-2xl border border-slate-700 cursor-pointer"
              >
                Select Another Boss
              </button>
            </div>
          </div>
        )}

        {/* If lost */}
        {battleLost && (
          <div className="bg-rose-950/80 border-2 border-rose-600 rounded-3xl p-6 sm:p-8 text-white shadow-2xl text-center mb-8">
            <h2 className="text-3xl font-black text-rose-300 mb-2">FALLEN IN BATTLE!</h2>
            <p className="text-slate-300 text-sm mb-6">
              The boss overpowered your shields. Train your times tables in the Dojo and try again!
            </p>
            <button
              onClick={() => startBossFight(selectedBossIndex)}
              className="bg-rose-600 hover:bg-rose-500 text-white font-black py-3.5 px-8 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              RETRY BATTLE ⚔️
            </button>
          </div>
        )}

        {/* Boss Selection Grid */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <span>🐉</span>
              <span>Dungeon Boss Raids</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Cast rapid times table spells to break boss shields and win exclusive loot!
            </p>
          </div>
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Hub</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BOSSES.map((boss, idx) => (
            <div
              key={boss.id}
              className={`bg-gradient-to-b ${boss.bgGrad} border-2 border-slate-800 hover:border-slate-600 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between transition-all hover:-translate-y-1`}
            >
              <div>
                <div className="text-6xl text-center my-3 animate-bounce-subtle">{boss.icon}</div>
                <div className="text-xs uppercase font-bold tracking-wider text-amber-400 mb-1">
                  {boss.title}
                </div>
                <h3 className="text-xl font-black mb-2">{boss.name}</h3>
                <p className="text-slate-400 text-xs italic mb-4">&ldquo;{boss.quote}&rdquo;</p>

                <div className="space-y-2 mb-6 text-xs">
                  <div className="flex justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Times Tables Tested:</span>
                    <span className="font-bold text-amber-300">{boss.tables.join(", ")}s</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Boss HP:</span>
                    <span className="font-bold text-rose-400">{boss.maxHp} HP</span>
                  </div>
                  <div className="flex justify-between bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                    <span className="text-slate-400">Loot Drop:</span>
                    <span className="font-bold text-yellow-300">🪙 {boss.dropCoins} | 💎 {boss.dropGems}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => startBossFight(idx)}
                className="w-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                RAID BOSS ⚔️
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. ACTIVE BOSS FIGHT SCREEN
  const bossHpPercent = Math.max(0, (bossHp / currentBoss.maxHp) * 100);

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col items-center">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={() => setInBattle(false)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Flee Dungeon</span>
        </button>

        {combo >= 2 && (
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-950/80 border border-amber-700/80 rounded-xl text-amber-300 font-black text-xs animate-wiggle">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{combo}x Spell Multiplier</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-800/60 px-3 py-1.5 rounded-xl">
          <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
          <span>Player HP: {playerHp}/100</span>
        </div>
      </div>

      {/* Duel Arena Visuals */}
      <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden mb-4">
        {/* Boss Header & HP Bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-left">
            <span className="text-xs text-amber-400 font-bold uppercase">{currentBoss.title}</span>
            <h3 className="text-xl font-black text-white">{currentBoss.name}</h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            {bossHp} / {currentBoss.maxHp} HP
          </span>
        </div>

        {/* Boss HP Bar */}
        <div className="w-full bg-slate-950 h-4 rounded-full overflow-hidden border border-slate-800 mb-6">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
            style={{ width: `${bossHpPercent}%` }}
          />
        </div>

        {/* Characters Arena Clash */}
        <div className="flex items-center justify-around py-4">
          {/* Player Hero */}
          <div className="flex flex-col items-center">
            <AvatarView avatar={profile.avatar} size="md" />
            <span className="text-xs font-bold text-slate-300 mt-2">{profile.name}</span>
          </div>

          {/* Spell Clash / Damage Indicator */}
          <div className="flex flex-col items-center">
            <div className="text-2xl font-black text-indigo-400">VS</div>
            {lastDamage && (
              <div
                className={`text-2xl font-black animate-bounce ${
                  lastDamage.isCrit ? "text-amber-400 drop-shadow-[0_0_8px_#f59e0b]" : "text-rose-400"
                }`}
              >
                -{lastDamage.amount} {lastDamage.isCrit ? "CRIT!" : ""}
              </div>
            )}
          </div>

          {/* Boss Creature */}
          <div className={`flex flex-col items-center ${bossAttackAnim ? "animate-shake" : "animate-float"}`}>
            <div className="text-6xl sm:text-7xl drop-shadow-lg">{currentBoss.icon}</div>
            <span className="text-xs font-bold text-amber-400 mt-2">{currentBoss.name.split(" ")[0]}</span>
          </div>
        </div>

        {/* Math Question Flashcard */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col items-center mt-2">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cast Spell to Strike</span>
          </div>
          <div className="text-4xl sm:text-5xl font-black text-white select-none my-1 flex items-center gap-2">
            <span>{question?.formattedText}</span>
            <span className="text-amber-400">?</span>
          </div>
          <div className="min-w-[120px] h-14 bg-slate-900 border border-indigo-500/40 rounded-xl flex items-center justify-center text-3xl font-mono font-black text-emerald-400 px-4 mt-2">
            {answerInput || <span className="text-slate-700 animate-pulse">_</span>}
          </div>
        </div>
      </div>

      {/* Keypad */}
      <Keypad
        value={answerInput}
        onChange={handleInputChange}
        onSubmit={() => handleAttack()}
      />
    </div>
  );
}
