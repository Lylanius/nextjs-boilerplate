"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { PlayerProfile, LootItem, ItemCategory } from "@/lib/types";
import { CHESTS, ALL_LOOT_ITEMS, ChestType } from "@/lib/lootData";
import { sound } from "@/lib/audio";
import { savePlayerProfile } from "@/lib/storage";
import { ArrowLeft, ShoppingBag, Sparkles, Check, PackageOpen, Gift } from "lucide-react";

interface LootShopProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onExit: () => void;
  onOpenWardrobe: () => void;
}

// Helper to generate chest rewards
function rollChestRewards(chest: ChestType, inventory: string[]) {
  const coinsWon = Math.floor(Math.random() * (chest.maxCoins - chest.minCoins + 1)) + chest.minCoins;
  const gemsWon = Math.floor(Math.random() * (chest.maxGems - chest.minGems + 1)) + chest.minGems;

  let itemWon: LootItem | undefined = undefined;
  const unownedItems = ALL_LOOT_ITEMS.filter((i) => !inventory.includes(i.id));

  if (Math.random() <= chest.itemDropChance && unownedItems.length > 0) {
    let pool = unownedItems;
    if (chest.guaranteedRarity) {
      const rarityPool = unownedItems.filter((i) => i.rarity === chest.guaranteedRarity);
      if (rarityPool.length > 0) pool = rarityPool;
    }
    itemWon = pool[Math.floor(Math.random() * pool.length)];
  }

  return { coinsWon, gemsWon, itemWon };
}

export default function LootShop({
  profile,
  onUpdateProfile,
  onExit,
  onOpenWardrobe,
}: LootShopProps) {
  const [activeCategory, setActiveCategory] = useState<ItemCategory | "all">("all");
  const [openingChest, setOpeningChest] = useState<ChestType | null>(null);
  const [chestOpeningState, setChestOpeningState] = useState<"rumble" | "revealed" | null>(null);
  const [unlockedReward, setUnlockedReward] = useState<{
    coins: number;
    gems: number;
    item?: LootItem;
  } | null>(null);

  // Buy a specific catalog item
  const buyItem = (item: LootItem) => {
    if (profile.inventory.includes(item.id)) return;

    if (item.currency === "coins") {
      if (profile.coins < item.cost) {
        sound.playWrong();
        return;
      }
    } else {
      if (profile.gems < item.cost) {
        sound.playWrong();
        return;
      }
    }

    sound.playCoin();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });

    const newCoins = item.currency === "coins" ? profile.coins - item.cost : profile.coins;
    const newGems = item.currency === "gems" ? profile.gems - item.cost : profile.gems;

    const updated: PlayerProfile = {
      ...profile,
      coins: newCoins,
      gems: newGems,
      inventory: [...profile.inventory, item.id],
    };

    savePlayerProfile(updated);
    onUpdateProfile(updated);
  };

  // Open Mystery Chest
  const startOpenChest = (chest: ChestType) => {
    if (chest.currency === "coins" && profile.coins < chest.cost) {
      sound.playWrong();
      return;
    }
    if (chest.currency === "gems" && profile.gems < chest.cost) {
      sound.playWrong();
      return;
    }

    // Deduct cost
    const newCoins = chest.currency === "coins" ? profile.coins - chest.cost : profile.coins;
    const newGems = chest.currency === "gems" ? profile.gems - chest.cost : profile.gems;

    setOpeningChest(chest);
    setChestOpeningState("rumble");
    sound.playChestOpen();

    const { coinsWon, gemsWon, itemWon } = rollChestRewards(chest, profile.inventory);

    // Reveal after 1.2s rumble
    setTimeout(() => {
      setChestOpeningState("revealed");
      setUnlockedReward({ coins: coinsWon, gems: gemsWon, item: itemWon });
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      sound.playLevelUp();

      const updatedInventory = itemWon ? [...profile.inventory, itemWon.id] : profile.inventory;
      const updatedProf: PlayerProfile = {
        ...profile,
        coins: newCoins + coinsWon,
        gems: newGems + gemsWon,
        inventory: updatedInventory,
        unlockedChests: profile.unlockedChests + 1,
      };

      savePlayerProfile(updatedProf);
      onUpdateProfile(updatedProf);
    }, 1200);
  };

  const closeChestModal = () => {
    setOpeningChest(null);
    setChestOpeningState(null);
    setUnlockedReward(null);
  };

  const filteredItems = ALL_LOOT_ITEMS.filter(
    (item) => activeCategory === "all" || item.category === activeCategory
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 my-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-yellow-400" />
            <span>Royal Loot Chests & Shop</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Spend your earned times table coins on mystery chests, mythical gear, and pets!
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenWardrobe}
            className="flex items-center gap-1.5 text-xs font-bold text-violet-300 hover:text-white bg-violet-950/80 border border-violet-700/80 px-3.5 py-2 rounded-xl cursor-pointer"
          >
            <span>Wardrobe</span>
          </button>
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Hub</span>
          </button>
        </div>
      </div>

      {/* 1. MYSTERY CHESTS SECTION */}
      <div className="mb-8">
        <h3 className="text-lg font-black text-amber-300 mb-3 flex items-center gap-2">
          <Gift className="w-5 h-5" />
          <span>Mystery Loot Chests</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CHESTS.map((chest) => {
            const canAfford =
              chest.currency === "coins"
                ? profile.coins >= chest.cost
                : profile.gems >= chest.cost;

            return (
              <div
                key={chest.id}
                className={`bg-gradient-to-b ${chest.bgGradient} border-2 border-slate-700/80 rounded-3xl p-5 text-white shadow-xl flex flex-col justify-between transition-all hover:scale-102`}
              >
                <div>
                  <div className="text-5xl text-center my-3 animate-bounce-subtle">{chest.icon}</div>
                  <h4 className="text-lg font-black text-center mb-1">{chest.name}</h4>
                  <div className="bg-black/40 rounded-xl p-3 text-xs space-y-1 mb-4">
                    <div className="flex justify-between text-yellow-300 font-bold">
                      <span>Coins Drop:</span>
                      <span>{chest.minCoins}-{chest.maxCoins} 🪙</span>
                    </div>
                    <div className="flex justify-between text-cyan-300 font-bold">
                      <span>Gems Drop:</span>
                      <span>{chest.minGems}-{chest.maxGems} 💎</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Gear Chance:</span>
                      <span className="font-bold">{Math.round(chest.itemDropChance * 100)}%</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => startOpenChest(chest)}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer ${
                    canAfford
                      ? "bg-amber-400 hover:bg-amber-300 text-slate-950"
                      : "bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <PackageOpen className="w-4 h-4" />
                  <span>OPEN FOR {chest.cost} {chest.currency === "coins" ? "🪙" : "💎"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. DIRECT GEAR CATALOG */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Hero Gear & Artifacts</span>
          </h3>

          {/* Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "all", label: "All" },
              { id: "head", label: "Hats & Crowns" },
              { id: "outfit", label: "Outfits" },
              { id: "weapon", label: "Weapons" },
              { id: "pet", label: "Pets" },
              { id: "aura", label: "Auras" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as ItemCategory | "all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isOwned = profile.inventory.includes(item.id);
            const canAfford =
              item.currency === "coins"
                ? profile.coins >= item.cost
                : profile.gems >= item.cost;

            return (
              <div
                key={item.id}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-slate-700"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-sm text-white">{item.name}</h4>
                    <span
                      className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
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

                  <p className="text-xs text-slate-400 mb-3">{item.description}</p>
                  {item.perk && (
                    <div className="text-[11px] font-bold text-amber-400 mb-3">
                      ⭐ {item.perk}
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  {isOwned ? (
                    <div className="w-full bg-slate-900 border border-slate-800 py-2.5 rounded-xl text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" />
                      <span>OWNED</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => buyItem(item)}
                      disabled={!canAfford}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                        canAfford
                          ? "bg-yellow-500 hover:bg-yellow-400 text-slate-950"
                          : "bg-slate-800 text-slate-500 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <span>BUY FOR {item.cost} {item.currency === "coins" ? "🪙" : "💎"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. CHEST OPENING REVEAL MODAL */}
      {openingChest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/80 rounded-3xl p-8 max-w-sm w-full text-center text-white shadow-2xl animate-bounce-subtle">
            {chestOpeningState === "rumble" ? (
              <div className="py-8">
                <div className="text-7xl mb-4 animate-shake">{openingChest.icon}</div>
                <h3 className="text-2xl font-black text-amber-300">UNLOCKING CHEST...</h3>
                <p className="text-xs text-slate-400 mt-2 animate-pulse">Summoning arithmetic treasures!</p>
              </div>
            ) : (
              <div className="py-4">
                <div className="text-6xl mb-3">✨🎁✨</div>
                <h3 className="text-2xl font-black text-amber-300 mb-1">LOOT UNLOCKED!</h3>
                <p className="text-xs text-slate-400 mb-6">Added directly to your balance & inventory!</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between bg-yellow-950/60 border border-yellow-700/60 p-3 rounded-2xl">
                    <span className="text-sm font-bold text-yellow-200">Coins Found</span>
                    <span className="text-lg font-black text-yellow-400">+{unlockedReward?.coins} 🪙</span>
                  </div>

                  <div className="flex items-center justify-between bg-cyan-950/60 border border-cyan-700/60 p-3 rounded-2xl">
                    <span className="text-sm font-bold text-cyan-200">Gems Found</span>
                    <span className="text-lg font-black text-cyan-400">+{unlockedReward?.gems} 💎</span>
                  </div>

                  {unlockedReward?.item && (
                    <div className="bg-purple-950/60 border border-purple-600 p-3 rounded-2xl text-left">
                      <div className="text-[10px] uppercase font-bold text-purple-300">New Item Drop!</div>
                      <div className="font-bold text-base text-white">{unlockedReward.item.name}</div>
                      <div className="text-xs text-slate-300">{unlockedReward.item.description}</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={closeChestModal}
                    className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-3 rounded-xl transition-all cursor-pointer"
                  >
                    AWESOME!
                  </button>
                  <button
                    onClick={() => {
                      closeChestModal();
                      onOpenWardrobe();
                    }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-3 rounded-xl border border-slate-700 text-xs cursor-pointer"
                  >
                    Equip in Wardrobe
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
