"use client";

import React, { useState } from "react";
import { PlayerProfile, QuestionFact } from "@/lib/types";
import { generateQuestion } from "@/lib/curriculum";
import { sound } from "@/lib/audio";
import { recordFactAttempt, addXpAndCoins } from "@/lib/storage";
import Keypad from "./Keypad";
import { ArrowLeft, Play, CheckCircle2, Target } from "lucide-react";

interface TrainingDojoProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onExit: () => void;
}

export default function TrainingDojo({
  profile,
  onUpdateProfile,
  onExit,
}: TrainingDojoProps) {
  const [selectedTables, setSelectedTables] = useState<number[]>([7, 8]);
  const [practiceType, setPracticeType] = useState<"multiply" | "divide" | "missing">("multiply");
  const [isPracticing, setIsPracticing] = useState<boolean>(false);
  const [currentQ, setCurrentQ] = useState<QuestionFact | null>(null);
  const [answerInput, setAnswerInput] = useState<string>("");
  const [sessionCorrect, setSessionCorrect] = useState<number>(0);
  const [sessionTotal, setSessionTotal] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const toggleTable = (num: number) => {
    if (selectedTables.includes(num)) {
      if (selectedTables.length > 1) {
        setSelectedTables(selectedTables.filter((t) => t !== num));
      }
    } else {
      setSelectedTables([...selectedTables, num].sort((a, b) => a - b));
    }
  };

  const selectAll = () => {
    setSelectedTables([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  };

  const startPractice = (customTable?: number) => {
    const tables = customTable ? [customTable] : selectedTables;
    if (customTable) setSelectedTables([customTable]);
    setIsPracticing(true);
    setSessionCorrect(0);
    setSessionTotal(0);
    nextDojoQuestion(tables);
  };

  const nextDojoQuestion = (tables = selectedTables) => {
    const q = generateQuestion(
      "all",
      tables,
      practiceType === "divide",
      practiceType === "missing"
    );
    setCurrentQ(q);
    setAnswerInput("");
    setFeedback(null);
  };

  const handleAnswerSubmit = () => {
    if (!currentQ || !isPracticing) return;
    const parsed = parseInt(answerInput, 10);
    const isCorrect = parsed === currentQ.answer;

    setSessionTotal((prev) => prev + 1);

    const factKey = `${currentQ.num1}x${currentQ.num2}`;
    const updated = recordFactAttempt(profile, factKey, isCorrect, 2000);
    onUpdateProfile(updated);

    if (isCorrect) {
      sound.playCorrect();
      setSessionCorrect((prev) => prev + 1);
      setFeedback("✅ Correct!");
      // Add XP
      const { updatedProfile } = addXpAndCoins(profile, 5, 2, 0);
      onUpdateProfile(updatedProfile);

      setTimeout(() => {
        nextDojoQuestion();
      }, 500);
    } else {
      sound.playWrong();
      setFeedback(`❌ The answer is ${currentQ.answer}`);
      setTimeout(() => {
        nextDojoQuestion();
      }, 1500);
    }
  };

  const handleInputChange = (val: string) => {
    setAnswerInput(val);
    if (currentQ && val === currentQ.answer.toString()) {
      setTimeout(() => {
        handleAnswerSubmit();
      }, 50);
    }
  };

  // Helper to get heat color for a 1x1 to 12x12 cell
  const getCellColor = (r: number, c: number) => {
    const key1 = `${r}x${c}`;
    const key2 = `${c}x${r}`;
    const fact = profile.factMastery[key1] || profile.factMastery[key2];

    if (!fact || fact.attempts === 0) {
      return "bg-slate-800 text-slate-500 border-slate-700";
    }

    const accuracy = fact.correct / fact.attempts;
    const avgTime = fact.totalTimeMs / fact.attempts;

    if (accuracy < 0.6) {
      return "bg-rose-900/80 text-rose-200 border-rose-600";
    }
    if (avgTime > 4500) {
      return "bg-amber-900/80 text-amber-200 border-amber-600";
    }
    if (avgTime > 2500) {
      return "bg-yellow-900/70 text-yellow-200 border-yellow-500";
    }
    if (avgTime < 1500) {
      return "bg-emerald-600 text-white border-emerald-400 font-black";
    }
    return "bg-emerald-800/80 text-emerald-200 border-emerald-600";
  };

  // 1. ACTIVE PRACTICE FLASHCARD VIEW
  if (isPracticing) {
    return (
      <div className="max-w-2xl mx-auto p-4 flex flex-col items-center">
        <div className="w-full flex items-center justify-between mb-4">
          <button
            onClick={() => setIsPracticing(false)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Finish Training</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Score: {sessionCorrect} / {sessionTotal}</span>
          </div>
        </div>

        {/* Flashcard */}
        <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center mb-4">
          <div className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-2 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            <span>Target Table: {currentQ?.table}s</span>
          </div>

          <div className="text-5xl sm:text-7xl font-black text-white select-none my-4 flex items-center gap-3">
            <span>{currentQ?.formattedText}</span>
            <span className="text-emerald-400 font-mono">?</span>
          </div>

          <div className="min-w-[130px] h-14 bg-slate-950 border-2 border-emerald-500/50 rounded-2xl flex items-center justify-center text-4xl font-mono font-black text-emerald-400 px-4 shadow-inner mb-2">
            {answerInput || <span className="text-slate-700 animate-pulse">_</span>}
          </div>

          {feedback && (
            <div className="text-sm font-bold text-slate-200 mt-1">{feedback}</div>
          )}
        </div>

        {/* Keypad */}
        <Keypad
          value={answerInput}
          onChange={handleInputChange}
          onSubmit={handleAnswerSubmit}
        />
      </div>
    );
  }

  // 2. TRAINING SETUP & 12x12 HEATMAP MATRIX VIEW
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 my-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <Target className="w-7 h-7 text-emerald-400" />
            <span>Training Dojo & Fact Matrix</span>
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Focus on specific multiplication tables or inspect your full 12×12 recall heat map.
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

      {/* Target Table Picker */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h3 className="text-base font-bold text-white">Select Tables to Practice:</h3>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 px-3 py-1 rounded-lg cursor-pointer"
            >
              Select All (1-12)
            </button>
            <button
              onClick={() => setSelectedTables([7, 8])}
              className="text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-950/60 border border-amber-800/60 px-3 py-1 rounded-lg cursor-pointer"
            >
              Tricky 7s & 8s
            </button>
          </div>
        </div>

        {/* 1-12 Table Chips */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
            const isSelected = selectedTables.includes(num);
            return (
              <button
                key={num}
                onClick={() => toggleTable(num)}
                className={`py-3 rounded-2xl font-black text-base sm:text-lg border transition-all cursor-pointer select-none ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-950/50 scale-105"
                    : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700"
                }`}
              >
                {num}×
              </button>
            );
          })}
        </div>

        {/* Practice Mode Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <button
            onClick={() => setPracticeType("multiply")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              practiceType === "multiply"
                ? "bg-indigo-600/30 border-indigo-500 text-white"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <div className="font-bold text-sm">✖️ Multiplication</div>
            <div className="text-xs text-slate-400">Standard rapid recall (e.g. 7 × 8 = ?)</div>
          </button>

          <button
            onClick={() => setPracticeType("divide")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              practiceType === "divide"
                ? "bg-indigo-600/30 border-indigo-500 text-white"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <div className="font-bold text-sm">➗ Division Facts</div>
            <div className="text-xs text-slate-400">Inverse operations (e.g. 56 ÷ 7 = ?)</div>
          </button>

          <button
            onClick={() => setPracticeType("missing")}
            className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
              practiceType === "missing"
                ? "bg-indigo-600/30 border-indigo-500 text-white"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            <div className="font-bold text-sm">❓ Missing Factors</div>
            <div className="text-xs text-slate-400">Algebraic thinking (e.g. ? × 8 = 56)</div>
          </button>
        </div>

        {/* Start Button */}
        <button
          onClick={() => startPractice()}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 text-lg transition-all active:scale-95 cursor-pointer"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START DOJO PRACTICE</span>
        </button>
      </div>

      {/* 12x12 Heatmap Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-black text-white">12×12 Diagnostic Mastery Grid</h3>
            <p className="text-xs text-slate-400">
              Click any cell to drill into that exact times table fact!
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" /> &lt;1.5s</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-800 inline-block" /> 2-3s</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-900 inline-block" /> 3-4.5s</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-900 inline-block" /> Tricky</span>
          </div>
        </div>

        {/* Matrix Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[480px]">
            {/* Header row */}
            <div className="grid grid-cols-13 gap-1 mb-1 text-center text-xs font-bold text-slate-500">
              <div>×</div>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => (
                <div key={c}>{c}</div>
              ))}
            </div>

            {/* 12 Rows */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((r) => (
              <div key={r} className="grid grid-cols-13 gap-1 mb-1 text-center">
                <div className="flex items-center justify-center text-xs font-bold text-slate-500">
                  {r}
                </div>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((c) => {
                  const colorClass = getCellColor(r, c);
                  return (
                    <button
                      key={`${r}x${c}`}
                      onClick={() => startPractice(r)}
                      title={`${r} × ${c} = ${r * c} (Click to practice)`}
                      className={`h-7 sm:h-8 rounded-lg border text-[11px] font-mono flex items-center justify-center transition-all hover:scale-110 hover:z-10 cursor-pointer ${colorClass}`}
                    >
                      {r * c}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
