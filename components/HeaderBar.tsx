"use client";

import React, { useState } from "react";
import { GameMode, PlayerProfile } from "@/lib/types";
import { sound } from "@/lib/audio";
import { Volume2, VolumeX, Flame, Shield, Sparkles, ShoppingBag, Shirt, Swords, Award, Compass } from "lucide-react";

interface HeaderBarProps {
  profile: PlayerProfile;
  currentMode: GameMode;
  onNavigate: (mode: GameMode) => void;
  onOpenQuests: () => void;
  onYearChange?: (year: PlayerProfile["yearGroup"]) => void;
}

export default function HeaderBar({
  profile,
  currentMode,
  onNavigate,
  onOpenQuests,
}: HeaderBarProps) {
  const [muted, setMuted] = useState(sound.isMuted());

  const handleToggleMute = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
  };

  const xpPercent = Math.min(100, Math.round((profile.xp / profile.xpToNextLevel) * 100));

  const unclaimedQuests = profile.activeQuests.filter((q) => q.completed && !q.claimed).length;

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Hero Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("dashboard")}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-md group-hover:scale-105 transition-transform">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-lg sm:text-xl bg-gradient-to-r from-amber-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                  NUMBER KNIGHTS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-700/60 rounded-full">
                  UK Curriculum
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
                {profile.name} • <span className="text-amber-400 font-semibold">{profile.title}</span>
              </p>
            </div>
          </button>
        </div>

        {/* Level & XP bar (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-3 bg-slate-800/80 px-3.5 py-1.5 rounded-xl border border-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-indigo-400 uppercase">LVL</span>
            <span className="font-black text-amber-400 text-lg leading-none">{profile.level}</span>
          </div>
          <div className="w-28 flex flex-col gap-1">
            <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono leading-none">
              <span>{profile.xp} XP</span>
              <span>{profile.xpToNextLevel}</span>
            </div>
          </div>
        </div>

        {/* Currencies & Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* Daily Streak */}
          <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-800/60 px-2.5 py-1.5 rounded-xl text-amber-300 text-xs sm:text-sm font-bold">
            <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>{profile.streakDays}d</span>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-1.5 bg-yellow-950/50 border border-yellow-700/60 px-3 py-1.5 rounded-xl text-yellow-300 font-black text-xs sm:text-sm shadow-sm">
            <span>🪙</span>
            <span>{profile.coins.toLocaleString()}</span>
          </div>

          {/* Gems */}
          <div className="flex items-center gap-1.5 bg-cyan-950/50 border border-cyan-700/60 px-3 py-1.5 rounded-xl text-cyan-300 font-black text-xs sm:text-sm shadow-sm">
            <span>💎</span>
            <span>{profile.gems}</span>
          </div>

          {/* Quests Button */}
          <button
            onClick={onOpenQuests}
            className="relative p-2 bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Daily Quests"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            {unclaimedQuests > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unclaimedQuests}
              </span>
            )}
          </button>

          {/* Audio toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={muted ? "Unmute Sound" : "Mute Sound"}
          >
            {muted ? <VolumeX className="w-5 h-5 text-slate-500" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Nav pill bar */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 px-4 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 sm:gap-2 min-w-max">
          <button
            onClick={() => onNavigate("dashboard")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "dashboard"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Kingdom Hub</span>
          </button>

          <button
            onClick={() => onNavigate("eyfs-garden")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "eyfs-garden"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <span>🌱</span>
            <span>Early Years</span>
          </button>

          <button
            onClick={() => onNavigate("arena")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "arena"
                ? "bg-rose-600 text-white shadow-md shadow-rose-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Swords className="w-4 h-4 text-rose-400" />
            <span>Speed Arena (60s)</span>
          </button>

          <button
            onClick={() => onNavigate("mtc")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "mtc"
                ? "bg-amber-600 text-white shadow-md shadow-amber-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span>Year 4 MTC Check</span>
          </button>

          <button
            onClick={() => onNavigate("sats-arena")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "sats-arena"
                ? "bg-red-600 text-white shadow-md shadow-red-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <span>👑</span>
            <span>SATs Arena</span>
          </button>

          <button
            onClick={() => onNavigate("boss")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "boss"
                ? "bg-purple-600 text-white shadow-md shadow-purple-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <span>🐉</span>
            <span>Boss Dungeon</span>
          </button>

          <button
            onClick={() => onNavigate("class-battle")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "class-battle"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <span>🏎️</span>
            <span>Grand Prix Race</span>
          </button>

          <button
            onClick={() => onNavigate("dojo")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "dojo"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Training Dojo & Matrix</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          <button
            onClick={() => onNavigate("wardrobe")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "wardrobe"
                ? "bg-violet-600 text-white shadow-md shadow-violet-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Shirt className="w-4 h-4 text-violet-400" />
            <span>Wardrobe</span>
          </button>

          <button
            onClick={() => onNavigate("shop")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "shop"
                ? "bg-yellow-600 text-white shadow-md shadow-yellow-900/50"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-yellow-400" />
            <span>Loot Shop</span>
          </button>

          <button
            onClick={() => onNavigate("teacher")}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              currentMode === "teacher"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50"
                : "text-indigo-400 hover:text-indigo-200 hover:bg-indigo-950/60 border border-indigo-800/60"
            }`}
          >
            <span>🎓</span>
            <span>Teacher Hub</span>
          </button>
        </div>
      </div>
    </header>
  );
}
