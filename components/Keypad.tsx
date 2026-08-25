"use client";

import React, { useEffect } from "react";
import { Delete, CornerDownLeft } from "lucide-react";
import { sound } from "@/lib/audio";

interface KeypadProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoSubmitLength?: number;
  allowDecimals?: boolean;
  allowNegatives?: boolean;
  allowSlash?: boolean;
}

export default function Keypad({
  value,
  onChange,
  onSubmit,
  disabled = false,
  allowDecimals = false,
  allowNegatives = false,
  allowSlash = false,
}: KeypadProps) {
  const handleDigit = React.useCallback((digit: string) => {
    if (disabled || value.length >= 10) return;
    sound.playTick(false);
    onChange(value + digit);
  }, [disabled, value, onChange]);

  const handleBackspace = React.useCallback(() => {
    if (disabled || value.length === 0) return;
    sound.playTick(false);
    onChange(value.slice(0, -1));
  }, [disabled, value, onChange]);

  const handleClear = React.useCallback(() => {
    if (disabled) return;
    sound.playTick(false);
    onChange("");
  }, [disabled, onChange]);

  const handleSpecialChar = React.useCallback((char: string) => {
    if (disabled || value.length >= 10) return;
    if (char === "." && value.includes(".")) return;
    if (char === "/" && value.includes("/")) return;
    if (char === "-" && (value.includes("-") || value.length > 0)) return;
    sound.playTick(false);
    onChange(value + char);
  }, [disabled, value, onChange]);

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      if (e.key >= "0" && e.key <= "9") {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === "." && allowDecimals) {
        e.preventDefault();
        handleSpecialChar(".");
      } else if (e.key === "/" && allowSlash) {
        e.preventDefault();
        handleSpecialChar("/");
      } else if (e.key === "-" && allowNegatives) {
        e.preventDefault();
        handleSpecialChar("-");
      } else if (e.key === "Backspace") {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onSubmit();
      } else if (e.key === "Escape" || e.key === "c" || e.key === "C") {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onSubmit, handleDigit, handleBackspace, handleClear, handleSpecialChar, allowDecimals, allowSlash, allowNegatives]);

  const showExtraButtons = allowDecimals || allowSlash || allowNegatives;

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-2 p-3 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => handleDigit(num.toString())}
            disabled={disabled}
            className="h-14 sm:h-16 bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-white font-black text-2xl sm:text-3xl rounded-xl border border-slate-700 shadow transition-all active:scale-95 disabled:opacity-50 select-none flex items-center justify-center cursor-pointer"
          >
            {num}
          </button>
        ))}

        {/* Bottom row: Backspace, 0, Enter */}
        <button
          type="button"
          onClick={handleBackspace}
          disabled={disabled || value.length === 0}
          className="h-14 sm:h-16 bg-rose-950/60 hover:bg-rose-900/80 active:bg-rose-700 text-rose-300 font-bold rounded-xl border border-rose-800/60 shadow transition-all active:scale-95 disabled:opacity-40 select-none flex items-center justify-center cursor-pointer"
          title="Backspace"
        >
          <Delete className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={() => handleDigit("0")}
          disabled={disabled}
          className="h-14 sm:h-16 bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-white font-black text-2xl sm:text-3xl rounded-xl border border-slate-700 shadow transition-all active:scale-95 disabled:opacity-50 select-none flex items-center justify-center cursor-pointer"
        >
          0
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={disabled || value.length === 0}
          className="h-14 sm:h-16 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-white font-black text-lg sm:text-xl rounded-xl border border-emerald-400 shadow-lg shadow-emerald-900/40 transition-all active:scale-95 disabled:opacity-40 select-none flex items-center justify-center gap-1 cursor-pointer"
          title="Submit (Enter)"
        >
          <span>GO</span>
          <CornerDownLeft className="w-5 h-5" />
        </button>
      </div>

      {showExtraButtons && (
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800">
          {allowDecimals && (
            <button
              type="button"
              onClick={() => handleSpecialChar(".")}
              disabled={disabled || value.includes(".")}
              className="h-10 bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xl rounded-lg border border-slate-700 disabled:opacity-30"
            >
              .
            </button>
          )}
          {allowSlash && (
            <button
              type="button"
              onClick={() => handleSpecialChar("/")}
              disabled={disabled || value.includes("/")}
              className="h-10 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-black text-xl rounded-lg border border-slate-700 disabled:opacity-30"
            >
              /
            </button>
          )}
          {allowNegatives && (
            <button
              type="button"
              onClick={() => handleSpecialChar("-")}
              disabled={disabled || value.length > 0}
              className="h-10 bg-slate-800 hover:bg-slate-700 text-purple-300 font-black text-xl rounded-lg border border-slate-700 disabled:opacity-30"
            >
              -
            </button>
          )}
        </div>
      )}
    </div>
  );
}
