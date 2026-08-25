"use client";

import React from "react";
import { PlayerProfile, GameMode, UkCurriculumYear } from "@/lib/types";
import { getSpeedRankTitle } from "@/lib/curriculum";
import { savePlayerProfile } from "@/lib/storage";
import AvatarView from "./AvatarView";
import { Swords, Shield, Award, Shirt, ShoppingBag, Sparkles, ChevronRight, Compass } from "lucide-react";

interface DashboardProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onNavigate: (mode: GameMode) => void;
  onOpenQuests: () => void;
}

export default function Dashboard({
  profile,
  onUpdateProfile,
  onNavigate,
  onOpenQuests,
}: DashboardProps) {
  const speedRank = getSpeedRankTitle(profile.bestSpeedAvgMs);

  const handleYearChange = (year: UkCurriculumYear) => {
    const updated: PlayerProfile = {
      ...profile,
      yearGroup: year,
    };
    savePlayerProfile(updated);
    onUpdateProfile(updated);
  };

  // Count how many facts have been practiced and mastered (<2s)
  const factsList = Object.values(profile.factMastery);
  const masteredFactsCount = factsList.filter(
    (f) => f.attempts >= 3 && f.correct / f.attempts >= 0.8 && f.totalTimeMs / f.attempts < 2000
  ).length;

  const unclaimedQuests = profile.activeQuests.filter((q) => q.completed && !q.claimed).length;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* 1. HERO HEROIC PROFILE BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden">
        {/* Ambient background runes */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Avatar & Player Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative">
              <AvatarView avatar={profile.avatar} size="lg" />
              <button
                onClick={() => onNavigate("wardrobe")}
                className="absolute -bottom-2 right-2 bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-xl shadow-lg border border-violet-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
                title="Customize Avatar"
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Style</span>
              </button>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-white">{profile.name}</h1>
                <span className="text-xs uppercase font-extrabold px-2.5 py-0.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full">
                  Level {profile.level}
                </span>
              </div>

              <div className="text-sm font-bold text-amber-400 mb-3">
                👑 {profile.title}
              </div>

              {/* Curriculum Selector Dropdown */}
              <div className="inline-flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-1.5 rounded-2xl text-xs">
                <span className="text-slate-400 font-semibold px-2">Stage:</span>
                <select
                  value={profile.yearGroup}
                  onChange={(e) => handleYearChange(e.target.value as UkCurriculumYear)}
                  className="bg-slate-800 text-white font-bold px-3 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer text-xs"
                >
                  <option value="eyfs-nursery">Nursery (Subitising 1-5)</option>
                  <option value="eyfs-reception">Reception (Ten-Frames & Bonds)</option>
                  <option value="ks1-y1">Year 1 (Bonds to 20 & 2s/5s/10s)</option>
                  <option value="ks1-y2">Year 2 (2, 5, 10 Tables)</option>
                  <option value="ks2-y3">Year 3 (3, 4, 8 Tables)</option>
                  <option value="ks2-y4">Year 4 (MTC 12×12 Check)</option>
                  <option value="ks2-y5">Year 5 (Square/Cube & Multi-Digit)</option>
                  <option value="ks2-y6">Year 6 (SATs Paper 1 Arithmetic)</option>
                  <option value="all">All Tables (1 to 12 Master)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Speed Rank & Mastery Badges */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto justify-center">
            {/* Speed Rank Card */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center min-w-[140px] flex-1 sm:flex-initial">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                Recall Speed
              </div>
              <div className="text-lg font-black text-white">
                {speedRank.badge} {speedRank.title}
              </div>
              <div className="text-xs font-mono text-cyan-400 font-bold mt-0.5">
                {profile.bestSpeedAvgMs > 0 ? `${(profile.bestSpeedAvgMs / 1000).toFixed(2)}s avg` : "Untimed"}
              </div>
            </div>

            {/* Facts Mastered Card */}
            <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-center min-w-[140px] flex-1 sm:flex-initial">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-1">
                12×12 Matrix
              </div>
              <div className="text-2xl font-black text-emerald-400">
                {masteredFactsCount} <span className="text-xs text-slate-500 font-normal">/ 144</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                Instant Mastery
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN GAME MODES GRID */}
      <div>
        <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          <span>Select Game Realm</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* EARLY YEARS NUMBER GARDEN */}
          <div
            onClick={() => onNavigate("eyfs-garden")}
            className="group bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-2 border-emerald-700/60 hover:border-emerald-400 rounded-3xl p-6 text-white shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <span>🌱</span>
                </div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                  Nursery - Y1
                </span>
              </div>

              <h3 className="text-xl font-black mb-1 group-hover:text-emerald-300 transition-colors">
                Early Years Garden
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Subitising dots, ten-frames, number bonds bubbles, and friendly visual math to grow your magical garden!
              </p>
            </div>

            <div className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-3 rounded-2xl text-center text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2">
              <span>EXPLORE GARDEN</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* SPEED ARENA (60s) */}
          <div
            onClick={() => onNavigate("arena")}
            className="group bg-gradient-to-br from-rose-950/60 via-slate-900 to-slate-900 border-2 border-rose-800/60 hover:border-rose-500 rounded-3xl p-6 text-white shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-600/30 border border-rose-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <Swords className="w-6 h-6 text-rose-400" />
                </div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded-full">
                  60s Speed
                </span>
              </div>

              <h3 className="text-xl font-black mb-1 group-hover:text-rose-300 transition-colors">
                Speed Arena
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Hit rapid times table combos, trigger fire multipliers (up to 4x), and climb the speed hierarchy!
              </p>
            </div>

            <div className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3 rounded-2xl text-center text-sm shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2">
              <span>PLAY ARENA</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* MTC NATIONAL CHECK */}
          <div
            onClick={() => onNavigate("mtc")}
            className="group bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border-2 border-amber-800/60 hover:border-amber-500 rounded-3xl p-6 text-white shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-600/30 border border-amber-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-amber-950 text-amber-300 border border-amber-800 rounded-full">
                  Year 4 Check
                </span>
              </div>

              <h3 className="text-xl font-black mb-1 group-hover:text-amber-300 transition-colors">
                MTC National Simulator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                25 weighted questions, 6 seconds each. Authentic simulation of the UK Statutory check with report card!
              </p>
            </div>

            <div className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl text-center text-sm shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2">
              <span>START MTC TEST</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* KS2 YEAR 6 SATS ARITHMETIC ARENA */}
          <div
            onClick={() => onNavigate("sats-arena")}
            className="group bg-gradient-to-br from-red-950/60 via-slate-900 to-slate-900 border-2 border-red-800/60 hover:border-red-500 rounded-3xl p-6 text-white shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <span>👑</span>
                </div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-red-950 text-red-300 border border-red-800 rounded-full">
                  Year 6 SATs
                </span>
              </div>

              <h3 className="text-xl font-black mb-1 group-hover:text-red-300 transition-colors">
                SATs Arithmetic Arena
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                DfE Paper 1 mock challenges: BIDMAS, fractions of amounts, percentages & linear algebra with step hints!
              </p>
            </div>

            <div className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-3 rounded-2xl text-center text-sm shadow-lg shadow-red-950/50 flex items-center justify-center gap-2">
              <span>SATS ARENA</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* BOSS DUNGEON RAID */}
          <div
            onClick={() => onNavigate("boss")}
            className="group bg-gradient-to-br from-purple-950/60 via-slate-900 to-slate-900 border-2 border-purple-800/60 hover:border-purple-500 rounded-3xl p-6 text-white shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <span>🐉</span>
                </div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-purple-950 text-purple-300 border border-purple-800 rounded-full">
                  RPG Bosses
                </span>
              </div>

              <h3 className="text-xl font-black mb-1 group-hover:text-purple-300 transition-colors">
                Boss Dungeon Raids
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Cast arithmetic spells, break boss armor, and claim epic mystery chests and crystal shards!
              </p>
            </div>

            <div className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-2xl text-center text-sm shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2">
              <span>ENTER DUNGEON</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* GRAND PRIX CLASS RACE */}
          <div
            onClick={() => onNavigate("class-battle")}
            className="group bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-900 border-2 border-cyan-800/60 hover:border-cyan-500 rounded-3xl p-6 text-white shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-600/30 border border-cyan-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <span>🏎️</span>
                </div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded-full">
                  Multi-Racer
                </span>
              </div>

              <h3 className="text-xl font-black mb-1 group-hover:text-cyan-300 transition-colors">
                Grand Prix Sprint
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Race against speedster classmates across a 4-lane track. Answer fast to take 1st place!
              </p>
            </div>

            <div className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 rounded-2xl text-center text-sm shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2">
              <span>START RACE</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* TRAINING DOJO & 12x12 MATRIX */}
          <div
            onClick={() => onNavigate("dojo")}
            className="group bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-2 border-emerald-800/60 hover:border-emerald-500 rounded-3xl p-6 text-white shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-full">
                  Diagnostic
                </span>
              </div>

              <h3 className="text-xl font-black mb-1 group-hover:text-emerald-300 transition-colors">
                Training Dojo & Matrix
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Drill specific times tables (e.g. 7s or 8s), practice division inverses, and inspect the 144-fact heat map!
              </p>
            </div>

            <div className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 rounded-2xl text-center text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2">
              <span>OPEN DOJO</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* LOOT CHESTS & GEAR SHOP */}
          <div
            onClick={() => onNavigate("shop")}
            className="group bg-gradient-to-br from-yellow-950/60 via-slate-900 to-slate-900 border-2 border-yellow-800/60 hover:border-yellow-500 rounded-3xl p-6 text-white shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-yellow-600/30 border border-yellow-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-yellow-950 text-yellow-300 border border-yellow-800 rounded-full">
                  Rewards
                </span>
              </div>

              <h3 className="text-xl font-black mb-1 group-hover:text-yellow-300 transition-colors">
                Loot Chests & Shop
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Open Mystery Wood, Silver, Gold, and Diamond chests to find mythical guitars, suits, crowns, and pets!
              </p>
            </div>

            <div className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-3 rounded-2xl text-center text-sm shadow-lg shadow-yellow-950/50 flex items-center justify-center gap-2">
              <span>OPEN CHESTS</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          {/* TEACHER & PARENT ANALYTICS PORTAL */}
          <div
            onClick={() => onNavigate("teacher")}
            className="group bg-gradient-to-br from-indigo-950/60 via-slate-900 to-slate-900 border-2 border-indigo-700/60 hover:border-indigo-400 rounded-3xl p-6 text-white shadow-xl transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                  <span>🎓</span>
                </div>
                <span className="text-xs uppercase font-extrabold px-2.5 py-1 bg-indigo-950 text-indigo-300 border border-indigo-800 rounded-full">
                  Educator Hub
                </span>
              </div>

              <h3 className="text-xl font-black mb-1 group-hover:text-indigo-300 transition-colors">
                Teacher & Parent Portal
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Live class rosters, 12x12 diagnostic gap heat maps, printable test papers, homework tasks & award certs!
              </p>
            </div>

            <div className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-2xl text-center text-sm shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2">
              <span>TEACHER PORTAL</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. DAILY QUESTS PREVIEW BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
            <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h3 className="text-base font-bold text-white">Daily Math Quests</h3>
              {unclaimedQuests > 0 && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-rose-500 text-white rounded-full">
                  {unclaimedQuests} Ready to Claim!
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Claim your daily training stipend and complete rapid challenges for bonus loot.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenQuests}
          className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-5 py-2.5 rounded-2xl border border-slate-700 text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <span>View Quests</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
