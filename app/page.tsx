"use client";

import React, { useState } from "react";
import { GameMode, PlayerProfile } from "@/lib/types";
import { loadPlayerProfile, savePlayerProfile, DEFAULT_PROFILE } from "@/lib/storage";
import HeaderBar from "@/components/HeaderBar";
import Dashboard from "@/components/Dashboard";
import GameArena from "@/components/GameArena";
import MtcSimulator from "@/components/MtcSimulator";
import BossRaid from "@/components/BossRaid";
import ClassBattle from "@/components/ClassBattle";
import TrainingDojo from "@/components/TrainingDojo";
import AvatarCustomizer from "@/components/AvatarCustomizer";
import LootShop from "@/components/LootShop";
import QuestsModal from "@/components/QuestsModal";
import EarlyYearsGarden from "@/components/EarlyYearsGarden";
import SatsArena from "@/components/SatsArena";
import TeacherHub from "@/components/TeacherHub";

export default function GridGuardiansApp() {
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    if (typeof window !== "undefined") {
      return loadPlayerProfile();
    }
    return DEFAULT_PROFILE;
  });
  const [currentMode, setCurrentMode] = useState<GameMode>("dashboard");
  const [questsOpen, setQuestsOpen] = useState<boolean>(false);

  const handleUpdateProfile = (updated: PlayerProfile) => {
    setProfile(updated);
    savePlayerProfile(updated);
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="text-4xl animate-bounce">⚔️</div>
          <div className="text-sm font-bold text-slate-400">Loading Number Knights...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Universal Header */}
      <HeaderBar
        profile={profile}
        currentMode={currentMode}
        onNavigate={setCurrentMode}
        onOpenQuests={() => setQuestsOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-12">
        {currentMode === "dashboard" && (
          <Dashboard
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={setCurrentMode}
            onOpenQuests={() => setQuestsOpen(true)}
          />
        )}

        {currentMode === "arena" && (
          <GameArena
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onExit={() => setCurrentMode("dashboard")}
          />
        )}

        {currentMode === "mtc" && (
          <MtcSimulator
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onExit={() => setCurrentMode("dashboard")}
          />
        )}

        {currentMode === "boss" && (
          <BossRaid
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onExit={() => setCurrentMode("dashboard")}
            onOpenShop={() => setCurrentMode("shop")}
          />
        )}

        {currentMode === "class-battle" && (
          <ClassBattle
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onExit={() => setCurrentMode("dashboard")}
          />
        )}

        {currentMode === "dojo" && (
          <TrainingDojo
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onExit={() => setCurrentMode("dashboard")}
          />
        )}

        {currentMode === "eyfs-garden" && (
          <EarlyYearsGarden
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setCurrentMode("dashboard")}
          />
        )}

        {currentMode === "sats-arena" && (
          <SatsArena
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onBack={() => setCurrentMode("dashboard")}
          />
        )}

        {currentMode === "teacher" && (
          <TeacherHub
            onBack={() => setCurrentMode("dashboard")}
          />
        )}

        {currentMode === "wardrobe" && (
          <AvatarCustomizer
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onExit={() => setCurrentMode("dashboard")}
            onOpenShop={() => setCurrentMode("shop")}
          />
        )}

        {currentMode === "shop" && (
          <LootShop
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onExit={() => setCurrentMode("dashboard")}
            onOpenWardrobe={() => setCurrentMode("wardrobe")}
          />
        )}
      </main>

      {/* Daily Quests Modal */}
      {questsOpen && (
        <QuestsModal
          profile={profile}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setQuestsOpen(false)}
        />
      )}
    </div>
  );
}
