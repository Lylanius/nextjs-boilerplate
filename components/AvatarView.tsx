"use client";

import React from "react";
import { PlayerAvatar } from "@/lib/types";

interface AvatarViewProps {
  avatar: PlayerAvatar;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  className?: string;
}

export default function AvatarView({
  avatar,
  size = "md",
  animated = true,
  className = "",
}: AvatarViewProps) {
  // Dimensional scaling
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-28 h-28",
    lg: "w-44 h-44",
    xl: "w-64 h-64",
  };

  const skin = avatar.skinTone || "#fcd34d";
  const hairColor = avatar.hairColor || "#334155";

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeClasses[size]} ${className}`}
    >
      <svg
        viewBox="0 0 200 200"
        className={`w-full h-full drop-shadow-md ${animated ? "animate-pulse-subtle" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="cyberAura" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
          <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fef08a" />
          </linearGradient>
          <linearGradient id="neonSuit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. AURA LAYER */}
        {avatar.equippedAura === "aura_lightning" && (
          <g className="animate-spin-slow origin-center" opacity="0.85">
            <circle cx="100" cy="100" r="88" fill="none" stroke="#facc15" strokeWidth="3" strokeDasharray="12 18" filter="url(#glow)" />
            <polygon points="40,30 50,55 35,55 55,85 45,60 60,60" fill="#fde047" />
            <polygon points="160,130 170,155 155,155 175,185 165,160 180,160" fill="#fde047" />
          </g>
        )}
        {avatar.equippedAura === "aura_rainbow_stars" && (
          <g opacity="0.9">
            <circle cx="100" cy="100" r="92" fill="none" stroke="url(#neonSuit)" strokeWidth="4" strokeDasharray="8 12" />
            <polygon points="30,80 34,92 46,92 36,100 40,112 30,104 20,112 24,100 14,92 26,92" fill="#ec4899" />
            <polygon points="170,60 173,70 183,70 175,76 178,86 170,80 162,86 165,76 157,70 167,70" fill="#06b6d4" />
          </g>
        )}
        {avatar.equippedAura === "aura_math_runes" && (
          <g opacity="0.8" className="animate-spin-slow origin-center">
            <circle cx="100" cy="100" r="94" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 16" />
            <text x="35" y="45" fill="#38bdf8" fontSize="16" fontWeight="bold" filter="url(#glow)">×</text>
            <text x="160" y="45" fill="#38bdf8" fontSize="16" fontWeight="bold" filter="url(#glow)">÷</text>
            <text x="165" y="165" fill="#38bdf8" fontSize="16" fontWeight="bold" filter="url(#glow)">=</text>
            <text x="30" y="165" fill="#38bdf8" fontSize="16" fontWeight="bold" filter="url(#glow)">+</text>
          </g>
        )}

        {/* 2. BASE BODY & TORSO */}
        <g id="body-base">
          {/* Shadow */}
          <ellipse cx="100" cy="188" rx="55" ry="8" fill="#cbd5e1" opacity="0.7" />

          {/* Torso / Clothing */}
          {avatar.equippedOutfit === "outfit_rock_leather" ? (
            <g id="outfit-rock">
              <path d="M 60 140 L 70 180 L 130 180 L 140 140 Z" fill="#1e293b" />
              <path d="M 70 140 L 100 170 L 130 140 Z" fill="#e11d48" />
              {/* Studs */}
              <circle cx="75" cy="155" r="2.5" fill="#e2e8f0" />
              <circle cx="85" cy="165" r="2.5" fill="#e2e8f0" />
              <circle cx="115" cy="165" r="2.5" fill="#e2e8f0" />
              <circle cx="125" cy="155" r="2.5" fill="#e2e8f0" />
            </g>
          ) : avatar.equippedOutfit === "outfit_paladin_armor" ? (
            <g id="outfit-paladin">
              <path d="M 60 140 L 68 180 L 132 180 L 140 140 Z" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="2" />
              <polygon points="100,145 112,165 88,165" fill="#3b82f6" />
              <line x1="100" y1="145" x2="100" y2="180" stroke="#b45309" strokeWidth="2" />
            </g>
          ) : avatar.equippedOutfit === "outfit_cyber_suit" ? (
            <g id="outfit-cyber">
              <path d="M 60 140 L 68 180 L 132 180 L 140 140 Z" fill="#0f172a" />
              <path d="M 75 140 L 100 175 L 125 140 Z" fill="url(#neonSuit)" opacity="0.9" filter="url(#glow)" />
            </g>
          ) : (
            // Default Scholar Tunic
            <g id="outfit-novice">
              <path d="M 60 140 L 68 180 L 132 180 L 140 140 Z" fill="#4f46e5" />
              <path d="M 85 140 L 100 160 L 115 140 Z" fill="#fbbf24" />
            </g>
          )}

          {/* Neck */}
          <rect x="90" y="125" width="20" height="20" rx="5" fill={skin} />

          {/* Head base */}
          <circle cx="100" cy="95" r="42" fill={skin} stroke="#000000" strokeOpacity="0.08" strokeWidth="2" />

          {/* Ears */}
          <circle cx="58" cy="98" r="8" fill={skin} />
          <circle cx="142" cy="98" r="8" fill={skin} />
        </g>

        {/* 3. HAIR (Under hats) */}
        {avatar.hairStyle === "spiky" && (
          <g id="hair-spiky">
            <path d="M 58 85 Q 65 45 80 48 Q 95 35 105 45 Q 125 35 135 50 Q 145 60 142 85 Q 125 60 100 60 Q 75 60 58 85 Z" fill={hairColor} />
          </g>
        )}
        {avatar.hairStyle === "curls" && (
          <g id="hair-curls">
            <circle cx="70" cy="65" r="18" fill={hairColor} />
            <circle cx="95" cy="55" r="20" fill={hairColor} />
            <circle cx="125" cy="62" r="18" fill={hairColor} />
            <circle cx="60" cy="82" r="15" fill={hairColor} />
            <circle cx="140" cy="82" r="15" fill={hairColor} />
          </g>
        )}
        {avatar.hairStyle === "rocker" && (
          <g id="hair-rocker">
            <path d="M 55 95 L 45 60 L 70 50 L 85 30 L 105 25 L 125 35 L 145 55 L 155 95 L 142 80 L 100 55 L 58 80 Z" fill={hairColor} />
          </g>
        )}

        {/* 4. FACE EXPRESSIONS */}
        <g id="face-features">
          {/* Eyebrows */}
          {avatar.expression === "fierce" ? (
            <>
              <line x1="75" y1="78" x2="92" y2="84" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
              <line x1="125" y1="78" x2="108" y2="84" stroke="#1e293b" strokeWidth="4" strokeLinecap="round" />
            </>
          ) : (
            <>
              <line x1="75" y1="80" x2="92" y2="78" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
              <line x1="108" y1="78" x2="125" y2="80" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
            </>
          )}

          {/* Eyes / Face item */}
          {avatar.equippedFace === "face_neon_shades" ? (
            <g id="neon-shades">
              <rect x="65" y="82" width="30" height="16" rx="4" fill="#ec4899" filter="url(#glow)" />
              <rect x="105" y="82" width="30" height="16" rx="4" fill="#ec4899" filter="url(#glow)" />
              <line x1="95" y1="88" x2="105" y2="88" stroke="#ec4899" strokeWidth="3" />
              <line x1="68" y1="86" x2="80" y2="86" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
              <line x1="108" y1="86" x2="120" y2="86" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : avatar.equippedFace === "face_monocle_gold" ? (
            <g id="monocle">
              {/* Left normal eye */}
              <circle cx="82" cy="90" r="5" fill="#1e293b" />
              <circle cx="84" cy="88" r="2" fill="#ffffff" />
              {/* Right monocle */}
              <circle cx="118" cy="90" r="10" fill="none" stroke="#eab308" strokeWidth="3" />
              <circle cx="118" cy="90" r="5" fill="#1e293b" />
              <path d="M 128 92 Q 135 110 138 135" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 2" />
            </g>
          ) : avatar.equippedFace === "face_flame_eyes" ? (
            <g id="flame-eyes" filter="url(#glow)">
              <polygon points="76,96 82,82 88,96 82,92" fill="url(#flameGrad)" />
              <polygon points="112,96 118,82 124,96 118,92" fill="url(#flameGrad)" />
            </g>
          ) : (
            // Default friendly sparkling eyes
            <g id="default-eyes">
              <circle cx="82" cy="90" r="5.5" fill="#1e293b" />
              <circle cx="84" cy="88" r="2" fill="#ffffff" />
              <circle cx="118" cy="90" r="5.5" fill="#1e293b" />
              <circle cx="120" cy="88" r="2" fill="#ffffff" />
            </g>
          )}

          {/* Cheeks */}
          <ellipse cx="73" cy="98" rx="5" ry="3" fill="#f43f5e" opacity="0.35" />
          <ellipse cx="127" cy="98" rx="5" ry="3" fill="#f43f5e" opacity="0.35" />

          {/* Smile / Mouth */}
          <path d="M 90 108 Q 100 118 110 108" fill="none" stroke="#1e293b" strokeWidth="3.5" strokeLinecap="round" />
        </g>

        {/* 5. EQUIPPED HEADWEAR */}
        {avatar.equippedHead === "hat_crown_gold" && (
          <g id="crown">
            <polygon points="65,65 72,32 86,52 100,28 114,52 128,32 135,65" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="2" />
            <circle cx="100" cy="45" r="4" fill="#ef4444" />
            <circle cx="80" cy="55" r="3" fill="#3b82f6" />
            <circle cx="120" cy="55" r="3" fill="#10b981" />
          </g>
        )}
        {avatar.equippedHead === "hat_rock_bandana" && (
          <g id="bandana">
            <path d="M 56 70 Q 100 62 144 70 L 142 82 Q 100 74 58 82 Z" fill="#e11d48" />
            <circle cx="80" cy="74" r="2" fill="#ffffff" />
            <circle cx="100" cy="72" r="2" fill="#ffffff" />
            <circle cx="120" cy="74" r="2" fill="#ffffff" />
          </g>
        )}
        {avatar.equippedHead === "hat_cyber_helm" && (
          <g id="cyber-helm" filter="url(#glow)">
            <path d="M 52 75 Q 100 40 148 75 L 145 92 Q 100 80 55 92 Z" fill="#0f172a" stroke="#06b6d4" strokeWidth="2" />
            <line x1="62" y1="84" x2="138" y2="84" stroke="#06b6d4" strokeWidth="4" />
            <circle cx="100" cy="84" r="3" fill="#ffffff" />
          </g>
        )}
        {avatar.equippedHead === "hat_wizard_hat" && (
          <g id="wizard-hat">
            <ellipse cx="100" cy="66" rx="46" ry="10" fill="#6d28d9" stroke="#4c1d95" strokeWidth="2" />
            <polygon points="70,64 100,12 130,64" fill="#7c3aed" />
            <polygon points="98,34 102,44 112,44 104,50 107,60 100,54 93,60 96,50 88,44 98,44" fill="#fbbf24" />
          </g>
        )}
        {avatar.equippedHead === "hat_knight_helm" && (
          <g id="knight-helm">
            <path d="M 56 68 Q 100 45 144 68 L 140 92 L 60 92 Z" fill="#94a3b8" stroke="#475569" strokeWidth="2" />
            <line x1="70" y1="82" x2="130" y2="82" stroke="#1e293b" strokeWidth="3" />
            <polygon points="95,45 100,30 105,45" fill="#ef4444" />
          </g>
        )}

        {/* 6. WEAPON / INSTRUMENT (Right Hand) */}
        {avatar.equippedWeapon === "weapon_thunder_guitar" && (
          <g id="thunder-guitar" className="animate-wiggle origin-bottom-right">
            <polygon points="145,110 185,80 175,135 155,145" fill="#e11d48" stroke="#be123c" strokeWidth="2" />
            <rect x="135" y="115" width="45" height="6" transform="rotate(-40 135 115)" fill="#1e293b" />
            <circle cx="165" cy="115" r="7" fill="#ffffff" />
            <line x1="140" y1="120" x2="175" y2="95" stroke="#facc15" strokeWidth="2" />
          </g>
        )}
        {avatar.equippedWeapon === "weapon_excalibur_compass" && (
          <g id="compass" filter="url(#glow)">
            <polygon points="148,105 185,75 188,80 152,112" fill="#38bdf8" />
            <polygon points="152,112 188,80 180,140" fill="#0284c7" />
            <circle cx="152" cy="110" r="5" fill="#facc15" />
          </g>
        )}
        {avatar.equippedWeapon === "weapon_flaming_wand" && (
          <g id="fire-wand">
            <line x1="145" y1="140" x2="178" y2="90" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
            <polygon points="175,90 185,70 195,85 188,98 178,92" fill="url(#flameGrad)" filter="url(#glow)" />
          </g>
        )}
        {avatar.equippedWeapon === "weapon_cosmic_abacus" && (
          <g id="cosmic-abacus" filter="url(#glow)">
            <rect x="145" y="90" width="36" height="46" rx="4" fill="#581c87" stroke="#a855f7" strokeWidth="2" />
            <line x1="150" y1="102" x2="176" y2="102" stroke="#c084fc" strokeWidth="2" />
            <line x1="150" y1="114" x2="176" y2="114" stroke="#c084fc" strokeWidth="2" />
            <line x1="150" y1="126" x2="176" y2="126" stroke="#c084fc" strokeWidth="2" />
            {/* Glowing beads */}
            <circle cx="156" cy="102" r="3.5" fill="#f43f5e" />
            <circle cx="168" cy="114" r="3.5" fill="#38bdf8" />
            <circle cx="160" cy="126" r="3.5" fill="#facc15" />
          </g>
        )}
        {avatar.equippedWeapon === "weapon_wooden_ruler" && (
          <g id="wooden-ruler">
            <rect x="145" y="105" width="10" height="55" transform="rotate(-30 145 105)" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" rx="2" />
            <line x1="148" y1="110" x2="152" y2="110" stroke="#78350f" strokeWidth="1" />
            <line x1="148" y1="118" x2="154" y2="118" stroke="#78350f" strokeWidth="1" />
            <line x1="148" y1="126" x2="152" y2="126" stroke="#78350f" strokeWidth="1" />
          </g>
        )}

        {/* 7. SHIELD (Left Hand) */}
        {avatar.equippedShield === "shield_knight" && (
          <g id="shield-knight">
            <path d="M 25 105 L 55 105 Q 55 145 40 160 Q 25 145 25 105 Z" fill="#2563eb" stroke="#1e40af" strokeWidth="2" />
            <text x="32" y="132" fill="#ffffff" fontSize="11" fontWeight="bold">7×8</text>
          </g>
        )}
        {avatar.equippedShield === "shield_golden_aegis" && (
          <g id="shield-aegis" filter="url(#glow)">
            <circle cx="40" cy="125" r="22" fill="url(#goldGrad)" stroke="#b45309" strokeWidth="3" />
            <circle cx="40" cy="125" r="14" fill="#1e293b" />
            <text x="33" y="130" fill="#facc15" fontSize="13" fontWeight="bold">12</text>
          </g>
        )}

        {/* 8. PET / FAMILIAR (Side Companion) */}
        {avatar.equippedPet === "pet_owl" && (
          <g id="pet-owl" className="animate-bounce-subtle origin-bottom">
            <circle cx="28" cy="72" r="16" fill="#78350f" />
            <circle cx="23" cy="70" r="5" fill="#fef08a" />
            <circle cx="33" cy="70" r="5" fill="#fef08a" />
            <circle cx="23" cy="70" r="2.5" fill="#000000" />
            <circle cx="33" cy="70" r="2.5" fill="#000000" />
            <polygon points="28,73 26,78 30,78" fill="#f97316" />
            {/* Tiny mortarboard */}
            <polygon points="20,56 28,50 36,56 28,60" fill="#1e293b" />
          </g>
        )}
        {avatar.equippedPet === "pet_dragon" && (
          <g id="pet-dragon" filter="url(#glow)">
            <ellipse cx="172" cy="70" rx="14" ry="12" fill="#10b981" />
            <polygon points="182,62 192,55 186,68" fill="#059669" />
            <circle cx="168" cy="68" r="3.5" fill="#facc15" />
            <circle cx="168" cy="68" r="1.5" fill="#000000" />
            {/* Sparkle fire breath */}
            <circle cx="156" cy="72" r="2" fill="#ef4444" />
            <circle cx="152" cy="70" r="1.5" fill="#f97316" />
          </g>
        )}
        {avatar.equippedPet === "pet_griffin" && (
          <g id="pet-griffin" filter="url(#glow)">
            <circle cx="174" cy="65" r="14" fill="#f59e0b" />
            <polygon points="160,65 152,68 160,72" fill="#d97706" />
            <circle cx="170" cy="62" r="3" fill="#ffffff" />
            <circle cx="170" cy="62" r="1.5" fill="#000000" />
            <path d="M 180 58 Q 192 48 186 66" fill="#fbbf24" stroke="#d97706" />
          </g>
        )}
      </svg>
    </div>
  );
}
