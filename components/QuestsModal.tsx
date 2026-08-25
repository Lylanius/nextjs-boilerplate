"use client";

import React from "react";
import confetti from "canvas-confetti";
import { PlayerProfile, Quest } from "@/lib/types";
import { sound } from "@/lib/audio";
import { savePlayerProfile } from "@/lib/storage";
import { X, Sparkles, Check } from "lucide-react";

interface QuestsModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onClose: () => void;
}

export default function QuestsModal({
  profile,
  onUpdateProfile,
  onClose,
}: QuestsModalProps) {
  const claimQuest = (quest: Quest) => {
    if (!quest.completed || quest.claimed) return;

    sound.playCoin();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });

    const updatedQuests = profile.activeQuests.map((q) =>
      q.id === quest.id ? { ...q, claimed: true } : q
    );

    const updated: PlayerProfile = {
      ...profile,
      coins: profile.coins + quest.rewardCoins,
      gems: profile.gems + quest.rewardGems,
      activeQuests: updatedQuests,
    };

    savePlayerProfile(updated);
    onUpdateProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <h3 className="text-xl font-black text-white">Daily Math Quests</h3>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Complete daily arithmetic challenges to earn coins, gems, and rare gear!
        </p>

        <div className="space-y-3 mb-6">
          {profile.activeQuests.map((quest) => {
            const progPercent = Math.min(100, Math.round((quest.current / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{quest.icon}</div>
                  <div>
                    <h4 className="font-bold text-sm text-white">{quest.title}</h4>
                    <p className="text-xs text-slate-400 mb-1">{quest.desc}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-400 h-full"
                          style={{ width: `${progPercent}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {quest.current}/{quest.target}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0">
                  {quest.claimed ? (
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Claimed</span>
                    </span>
                  ) : quest.completed ? (
                    <button
                      onClick={() => claimQuest(quest)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3.5 py-2 rounded-xl shadow-md animate-pulse cursor-pointer"
                    >
                      CLAIM +{quest.rewardCoins}🪙
                    </button>
                  ) : (
                    <div className="text-right text-xs font-bold text-yellow-400">
                      <div>+{quest.rewardCoins} 🪙</div>
                      <div className="text-cyan-400">+{quest.rewardGems} 💎</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl cursor-pointer text-sm"
        >
          Close Quests
        </button>
      </div>
    </div>
  );
}
