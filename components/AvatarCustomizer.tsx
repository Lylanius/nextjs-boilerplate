"use client";

import React, { useState } from "react";
import { PlayerProfile, ItemCategory, LootItem } from "@/lib/types";
import { ALL_LOOT_ITEMS } from "@/lib/lootData";
import { savePlayerProfile } from "@/lib/storage";
import AvatarView from "./AvatarView";
import { ArrowLeft, Check, Sparkles, Shirt, Crown, Wand2, Zap, HeartHandshake } from "lucide-react";

interface AvatarCustomizerProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onExit: () => void;
  onOpenShop: () => void;
}

const SKIN_TONES = ["#fcd34d", "#fde047", "#fed7aa", "#fdba74", "#d97706", "#78350f"];
const HAIR_COLORS = ["#334155", "#e2e8f0", "#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"];

export default function AvatarCustomizer({
  profile,
  onUpdateProfile,
  onExit,
  onOpenShop,
}: AvatarCustomizerProps) {
  const [activeTab, setActiveTab] = useState<ItemCategory | "base">("base");

  const avatar = profile.avatar;

  const updateAvatarField = (field: string, val: string | null) => {
    const updatedProf: PlayerProfile = {
      ...profile,
      avatar: {
        ...profile.avatar,
        [field]: val,
      },
    };
    savePlayerProfile(updatedProf);
    onUpdateProfile(updatedProf);
  };

  // Get items owned in inventory for category
  const getOwnedItemsForCategory = (category: ItemCategory): LootItem[] => {
    return ALL_LOOT_ITEMS.filter(
      (item) => item.category === category && profile.inventory.includes(item.id)
    );
  };

  const getEquippedIdForCategory = (category: ItemCategory): string | null => {
    switch (category) {
      case "head": return avatar.equippedHead;
      case "face": return avatar.equippedFace;
      case "outfit": return avatar.equippedOutfit;
      case "weapon": return avatar.equippedWeapon;
      case "shield": return avatar.equippedShield;
      case "aura": return avatar.equippedAura;
      case "pet": return avatar.equippedPet;
      case "title": return avatar.equippedTitle;
    }
  };

  const equipItem = (item: LootItem) => {
    const fieldMap: Record<ItemCategory, string> = {
      head: "equippedHead",
      face: "equippedFace",
      outfit: "equippedOutfit",
      weapon: "equippedWeapon",
      shield: "equippedShield",
      aura: "equippedAura",
      pet: "equippedPet",
      title: "equippedTitle",
    };

    const field = fieldMap[item.category];
    const currentVal = getEquippedIdForCategory(item.category);

    // Toggle off if clicking already equipped (unless outfit or weapon where default is kept)
    if (currentVal === item.id && item.category !== "outfit" && item.category !== "weapon") {
      updateAvatarField(field, null);
    } else {
      updateAvatarField(field, item.id);
      if (item.category === "title") {
        const updatedProf: PlayerProfile = {
          ...profile,
          title: item.name,
          avatar: { ...profile.avatar, equippedTitle: item.name },
        };
        savePlayerProfile(updatedProf);
        onUpdateProfile(updatedProf);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 my-4">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Shirt className="w-7 h-7 text-violet-400" />
            <span>Wardrobe & Hero Dressing Room</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Customize your champion&apos;s style, equip rare loot, instruments, and loyal pets!
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

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Avatar Live Preview Card */}
        <div className="md:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-3 left-3 bg-violet-950/80 border border-violet-700/80 px-3 py-1 rounded-full text-violet-300 text-xs font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Live Wardrobe</span>
          </div>

          <div className="my-6">
            <AvatarView avatar={avatar} size="xl" />
          </div>

          <h3 className="text-xl font-black text-white">{profile.name}</h3>
          <p className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-4">
            {profile.title}
          </p>

          <button
            onClick={onOpenShop}
            className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 text-slate-950 font-black py-3 rounded-2xl shadow-lg transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
          >
            GET MORE GEAR IN LOOT SHOP 📦
          </button>
        </div>

        {/* Right: Customizer Tabs & Selectors */}
        <div className="md:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            {/* Category Navigation Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-6">
              <button
                onClick={() => setActiveTab("base")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTab === "base"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <span>👤 Hero Face</span>
              </button>

              <button
                onClick={() => setActiveTab("head")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTab === "head"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Hats & Helmets</span>
              </button>

              <button
                onClick={() => setActiveTab("outfit")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTab === "outfit"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Outfits</span>
              </button>

              <button
                onClick={() => setActiveTab("weapon")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTab === "weapon"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Instruments & Weapons</span>
              </button>

              <button
                onClick={() => setActiveTab("pet")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTab === "pet"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5" />
                <span>Pets</span>
              </button>

              <button
                onClick={() => setActiveTab("aura")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  activeTab === "aura"
                    ? "bg-violet-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Auras</span>
              </button>
            </div>

            {/* TAB CONTENT: HERO BASE FEATURES */}
            {activeTab === "base" && (
              <div className="space-y-5">
                {/* Expressions */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Hero Expression:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "confident", label: "Confident 😊" },
                      { id: "fierce", label: "Fierce 😼" },
                      { id: "joyful", label: "Joyful 😃" },
                      { id: "cool", label: "Rockstar 😎" },
                    ].map((exp) => (
                      <button
                        key={exp.id}
                        onClick={() => updateAvatarField("expression", exp.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          avatar.expression === exp.id
                            ? "bg-violet-600/30 border-violet-500 text-white shadow"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {exp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair Style */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Hair Style:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "spiky", label: "⚡ Spiky" },
                      { id: "curls", label: "🌀 Curls" },
                      { id: "rocker", label: "🎸 Rockstar Wave" },
                    ].map((h) => (
                      <button
                        key={h.id}
                        onClick={() => updateAvatarField("hairStyle", h.id)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          avatar.hairStyle === h.id
                            ? "bg-violet-600/30 border-violet-500 text-white shadow"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Skin Tones */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Skin Tone:
                  </label>
                  <div className="flex gap-2">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone}
                        onClick={() => updateAvatarField("skinTone", tone)}
                        className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                          avatar.skinTone === tone ? "border-white scale-110 shadow-lg" : "border-slate-700"
                        }`}
                        style={{ backgroundColor: tone }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hair Colors */}
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Hair Color:
                  </label>
                  <div className="flex gap-2">
                    {HAIR_COLORS.map((col) => (
                      <button
                        key={col}
                        onClick={() => updateAvatarField("hairColor", col)}
                        className={`w-9 h-9 rounded-full border-2 transition-transform cursor-pointer ${
                          avatar.hairColor === col ? "border-white scale-110 shadow-lg" : "border-slate-700"
                        }`}
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: EQUIPPABLE ITEMS */}
            {activeTab !== "base" && (
              <div>
                <div className="text-xs text-slate-400 mb-3">
                  Click an owned item to equip or unequip it.
                </div>

                {getOwnedItemsForCategory(activeTab).length === 0 ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 text-center">
                    <p className="text-slate-400 text-sm mb-3">
                      You haven&apos;t unlocked any items in this category yet!
                    </p>
                    <button
                      onClick={onOpenShop}
                      className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                    >
                      Visit Loot Shop 📦
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
                    {getOwnedItemsForCategory(activeTab).map((item) => {
                      const isEquipped = getEquippedIdForCategory(activeTab) === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => equipItem(item)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                            isEquipped
                              ? "bg-violet-950/60 border-violet-500 shadow-md"
                              : "bg-slate-950 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{item.name}</span>
                              <span
                                className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                  item.rarity === "mythic"
                                    ? "bg-purple-950 text-purple-300 border border-purple-800"
                                    : item.rarity === "legendary"
                                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                                    : item.rarity === "epic"
                                    ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                                    : "bg-slate-800 text-slate-300"
                                }`}
                              >
                                {item.rarity}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                              {item.description}
                            </p>
                            {item.perk && (
                              <p className="text-[11px] font-bold text-amber-400 mt-0.5">
                                ⭐ {item.perk}
                              </p>
                            )}
                          </div>

                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center border shrink-0 ${
                              isEquipped
                                ? "bg-violet-600 border-violet-400 text-white"
                                : "border-slate-700 text-transparent"
                            }`}
                          >
                            <Check className="w-4 h-4" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
