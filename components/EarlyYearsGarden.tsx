"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { PlayerProfile, QuestionFact } from "@/lib/types";
import { generateEyfsQuestion, CURRICULUM_STAGES } from "@/lib/curriculum";
import { sound } from "@/lib/audio";
import { addXpAndCoins } from "@/lib/storage";
import { ArrowLeft, Sparkles, Star, Heart, Volume2, RotateCcw, Award } from "lucide-react";

interface EarlyYearsGardenProps {
  profile: PlayerProfile;
  onUpdateProfile: (p: PlayerProfile) => void;
  onBack: () => void;
}

export default function EarlyYearsGarden({
  profile,
  onUpdateProfile,
  onBack,
}: EarlyYearsGardenProps) {
  const [stage, setStage] = useState<"eyfs-nursery" | "eyfs-reception" | "ks1-y1">("eyfs-reception");
  const [question, setQuestion] = useState<QuestionFact | null>(() => generateEyfsQuestion("eyfs-reception"));
  const [flowersGrown, setFlowersGrown] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const spawnNextQuestion = (currentStage = stage) => {
    const q = generateEyfsQuestion(currentStage);
    setQuestion(q);
    setSelectedOption(null);
    setFeedback(null);
  };

  const handleStageChange = (newStage: "eyfs-nursery" | "eyfs-reception" | "ks1-y1") => {
    setStage(newStage);
    setFlowersGrown(0);
    spawnNextQuestion(newStage);
  };

  const handleSelectOption = (opt: string) => {
    if (feedback !== null || !question) return;
    setSelectedOption(opt);

    const isCorrect = String(opt).trim() === String(question.answer).trim();

    if (isCorrect) {
      sound.playCorrect(streak);
      setFeedback("correct");
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setScore((s) => s + 1);
      setFlowersGrown((f) => f + 1);

      if ((flowersGrown + 1) % 5 === 0) {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        sound.playLevelUp();
      }

      // Add coins & XP
      const { updatedProfile } = addXpAndCoins(profile, 10, 5, 0);
      onUpdateProfile(updatedProfile);

      setTimeout(() => {
        if (flowersGrown + 1 >= 15) {
          setIsFinished(true);
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        } else {
          spawnNextQuestion();
        }
      }, 900);
    } else {
      sound.playWrong();
      setFeedback("wrong");
      setStreak(0);

      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
      }, 1200);
    }
  };

  const handleSpeakQuestion = () => {
    if (!question) return;
    sound.playTick();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(question.formattedText);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const restartGarden = () => {
    setFlowersGrown(0);
    setScore(0);
    setStreak(0);
    setIsFinished(false);
    spawnNextQuestion();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-emerald-900/40 border border-emerald-500/30 p-4 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 text-sm font-bold transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Hub
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <h1 className="text-xl font-black text-emerald-300">Early Years Number Garden</h1>
            </div>
            <p className="text-xs text-emerald-400/80">
              Interactive foundational math for Nursery, Reception & Year 1
            </p>
          </div>
        </div>

        {/* Stage Selector */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-emerald-500/30 gap-1 text-xs font-bold">
          {(["eyfs-nursery", "eyfs-reception", "ks1-y1"] as const).map((stg) => (
            <button
              key={stg}
              onClick={() => handleStageChange(stg)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                stage === stg
                  ? "bg-emerald-500 text-emerald-950 font-black shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {CURRICULUM_STAGES[stg].name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Play Area */}
      {!isFinished && question ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Garden Progress & Flower Bed */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Garden Growth
                </span>
                <span className="text-sm font-black text-emerald-300">
                  {flowersGrown} / 15 Flowers
                </span>
              </div>

              {/* Garden Visualizer Grid */}
              <div className="grid grid-cols-5 gap-3 p-4 bg-emerald-950/40 rounded-2xl border border-emerald-800/40 mb-6">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl flex items-center justify-center text-xl transition-all duration-500 ${
                      i < flowersGrown
                        ? "bg-emerald-500/20 border-2 border-emerald-400 scale-105"
                        : "bg-slate-800/50 border border-slate-700/50 opacity-40"
                    }`}
                  >
                    {i < flowersGrown ? (
                      ["🌸", "🌻", "🌷", "🌺", "🌼"][i % 5]
                    ) : (
                      "🌱"
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-400" />
                    Correct Stars:
                  </span>
                  <span className="font-bold text-amber-300">{score}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    Combo Streak:
                  </span>
                  <span className="font-bold text-rose-300">{streak} 🔥</span>
                </div>
              </div>
            </div>

            {/* Helper Hint */}
            {question.stepHint && (
              <div className="mt-4 p-3 bg-emerald-900/30 border border-emerald-700/40 rounded-xl text-xs text-emerald-200">
                <p className="font-bold mb-1 flex items-center gap-1">
                  💡 Hint for Explorer:
                </p>
                <p>{question.stepHint}</p>
              </div>
            )}
          </div>

          {/* Center Visual Question Canvas & Choices */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center justify-between shadow-2xl backdrop-blur-xl relative overflow-hidden">
            {/* Topic Badge */}
            <div className="w-full flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                {question.subtopic || "Early Years Math"}
              </span>

              <button
                onClick={handleSpeakQuestion}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-800/40 hover:bg-emerald-700/60 text-emerald-300 border border-emerald-600/40 text-xs font-bold transition-all"
                title="Read question aloud"
              >
                <Volume2 className="w-4 h-4" />
                Read Aloud
              </button>
            </div>

            {/* Question Text */}
            <h2 className="text-2xl sm:text-3xl font-black text-center text-white mb-6">
              {question.formattedText}
            </h2>

            {/* Visual Question Renderers */}
            <div className="w-full min-h-[160px] flex items-center justify-center p-6 bg-slate-950/60 border border-slate-800 rounded-2xl mb-8">
              {/* 1. Subitising Dots */}
              {question.visualType === "dots" && question.visualData && (
                <div className="w-36 h-36 bg-white rounded-2xl p-4 shadow-xl grid grid-cols-3 grid-rows-3 gap-2 items-center justify-items-center">
                  {renderSubitisingDots(question.visualData.count || 1)}
                </div>
              )}

              {/* 2. Ten-Frames */}
              {question.visualType === "tenframe" && question.visualData && (
                <div className="grid grid-cols-5 grid-rows-2 gap-2 bg-amber-950/60 p-3 rounded-2xl border-4 border-amber-800 shadow-xl max-w-sm w-full">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const isFilled = idx < (question.visualData?.filled || 0);
                    return (
                      <div
                        key={idx}
                        className={`aspect-square rounded-xl flex items-center justify-center text-2xl border-2 transition-all ${
                          isFilled
                            ? "bg-rose-500 border-rose-300 shadow-md scale-100"
                            : "bg-slate-900/60 border-amber-700/50"
                        }`}
                      >
                        {isFilled && "🔴"}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* 3. Countable Apples / Stars */}
              {question.visualType === "apples" && question.visualData && (
                <div className="flex flex-wrap items-center justify-center gap-4 max-w-md">
                  {Array.from({ length: question.visualData.count || 0 }).map((_, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 bg-emerald-500/20 border-2 border-emerald-400 rounded-2xl flex items-center justify-center text-3xl shadow-lg transform hover:scale-110 transition-transform animate-bounce"
                      style={{ animationDelay: `${i * 120}ms`, animationDuration: "1.8s" }}
                    >
                      ⭐
                    </div>
                  ))}
                </div>
              )}

              {/* 4. Number Bonds Part-Whole Bubbles */}
              {question.visualType === "bonds" && question.visualData && (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-18 h-18 bg-indigo-600 border-4 border-indigo-300 rounded-full flex items-center justify-center text-2xl font-black text-white shadow-xl">
                    {question.visualData.whole}
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-emerald-600 border-4 border-emerald-300 rounded-full flex items-center justify-center text-xl font-black text-white shadow-lg">
                      {question.visualData.part1}
                    </div>
                    <div className="w-16 h-16 bg-amber-600 border-4 border-dashed border-amber-300 rounded-full flex items-center justify-center text-2xl font-black text-amber-200 animate-pulse">
                      ?
                    </div>
                  </div>
                </div>
              )}

              {/* 5. Standard Large Arithmetic */}
              {(!question.visualType || question.visualType === "standard") && (
                <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-wider">
                  {question.formattedText.replace("=", "")}
                </div>
              )}
            </div>

            {/* Multiple Choice Option Buttons */}
            {question.options && question.options.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
                {question.options.map((opt, index) => {
                  let btnColor = "bg-slate-800 hover:bg-slate-700 border-slate-700 text-white";
                  if (selectedOption === opt) {
                    btnColor =
                      feedback === "correct"
                        ? "bg-emerald-600 border-emerald-300 text-white animate-pulse"
                        : "bg-rose-600 border-rose-300 text-white animate-shake";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleSelectOption(opt)}
                      disabled={feedback !== null}
                      className={`h-20 rounded-2xl border-2 text-2xl sm:text-3xl font-black transition-all shadow-lg active:scale-95 flex items-center justify-center ${btnColor}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              // If no options, provide a simple mini-keypad
              <div className="grid grid-cols-5 gap-2 w-full max-w-sm">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleSelectOption(String(num))}
                    className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-lg font-bold text-white transition-all active:scale-95"
                  >
                    {num}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Completed Celebration Screen
        <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-12 text-center max-w-2xl mx-auto shadow-2xl backdrop-blur-xl">
          <div className="text-6xl mb-4 animate-bounce">🏆🌺</div>
          <h2 className="text-3xl font-black text-emerald-300 mb-2">Garden Fully Bloomed!</h2>
          <p className="text-slate-300 mb-6">
            Spectacular math work! You grew 15 marvelous flowers in the Early Years Garden.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-sm">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="text-slate-400 block text-xs">Stars Earned</span>
              <span className="text-2xl font-black text-amber-300">⭐ {score}</span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="text-slate-400 block text-xs">Stage Completed</span>
              <span className="text-2xl font-black text-emerald-300">
                {CURRICULUM_STAGES[stage].code}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={restartGarden}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={onBack}
              className="px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black flex items-center gap-2 shadow-lg transition-all"
            >
              <Award className="w-4 h-4" />
              Return to Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Render subitising dot pattern on a 3x3 dice face
function renderSubitisingDots(count: number) {
  // Positions on 3x3 grid (0 to 8)
  const dotIndexes: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  const active = dotIndexes[Math.min(6, Math.max(1, count))] || [4];

  return Array.from({ length: 9 }).map((_, idx) => (
    <div key={idx} className="w-full h-full flex items-center justify-center">
      {active.includes(idx) && (
        <div className="w-5 h-5 bg-slate-900 rounded-full shadow-inner animate-scaleIn" />
      )}
    </div>
  ));
}
