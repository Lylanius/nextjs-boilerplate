"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { PlayerProfile, QuestionFact } from "@/lib/types";
import { generateQuestion } from "@/lib/curriculum";
import { sound } from "@/lib/audio";
import { recordFactAttempt, addXpAndCoins } from "@/lib/storage";
import Keypad from "./Keypad";
import { ArrowLeft, Flag, Trophy, RotateCcw } from "lucide-react";

interface ClassBattleProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onExit: () => void;
}

interface Racer {
  id: string;
  name: string;
  avatarIcon: string;
  progress: number; // 0 to 100
  speedFactor: number; // speed at which bot answers
  color: string;
}

export default function ClassBattle({
  profile,
  onUpdateProfile,
  onExit,
}: ClassBattleProps) {
  const [gameState, setGameState] = useState<"countdown" | "racing" | "finished">("countdown");
  const [countdown, setCountdown] = useState<number>(3);
  const [playerProgress, setPlayerProgress] = useState<number>(0);
  const [racers, setRacers] = useState<Racer[]>([
    { id: "bot_1", name: "Flash Fiona", avatarIcon: "⚡👧", progress: 0, speedFactor: 2800, color: "bg-rose-500" },
    { id: "bot_2", name: "Turbo Toby", avatarIcon: "🚀👦", progress: 0, speedFactor: 3200, color: "bg-amber-500" },
    { id: "bot_3", name: "Speedy Sam", avatarIcon: "🐆🧒", progress: 0, speedFactor: 3600, color: "bg-emerald-500" },
  ]);

  const [question, setQuestion] = useState<QuestionFact | null>(null);
  const [answerInput, setAnswerInput] = useState<string>("");
  const [finalRank, setFinalRank] = useState<number>(1);

  const questionStartTimeRef = useRef<number>(0);
  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextQuestion = useCallback(() => {
    const q = generateQuestion(profile.yearGroup, undefined, true);
    setQuestion(q);
    setAnswerInput("");
    questionStartTimeRef.current = Date.now();
  }, [profile.yearGroup]);

  const handleFinishRace = useCallback((rank: number) => {
    if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    setFinalRank(rank);
    setGameState("finished");
    if (rank === 1) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
    sound.playLevelUp();

    const xpEarned = rank === 1 ? 150 : 60;
    const coinsEarned = rank === 1 ? 120 : 40;
    const gemsEarned = rank === 1 ? 4 : 1;

    const { updatedProfile } = addXpAndCoins(profile, xpEarned, coinsEarned, gemsEarned);
    onUpdateProfile(updatedProfile);
  }, [profile, onUpdateProfile]);

  // Countdown timer
  useEffect(() => {
    if (gameState === "countdown") {
      sound.playTick(false);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            sound.playTick(true);
            setGameState("racing");
            nextQuestion();
            return 0;
          }
          sound.playTick(false);
          return prev - 1;
        });
      }, 900);
      return () => clearInterval(timer);
    }
  }, [gameState, nextQuestion]);

  // Bots movement simulation loop
  useEffect(() => {
    if (gameState === "racing") {
      botIntervalRef.current = setInterval(() => {
        setRacers((prev) => {
          let hasBotWon = false;
          const updated = prev.map((racer) => {
            const shouldAdvance = Math.random() > 0.4;
            const increment = shouldAdvance ? Math.floor(Math.random() * 8) + 4 : 0;
            const newProg = Math.min(100, racer.progress + increment);
            if (newProg >= 100) hasBotWon = true;
            return { ...racer, progress: newProg };
          });

          if (hasBotWon) {
            handleFinishRace(2);
          }
          return updated;
        });
      }, 1000);

      return () => {
        if (botIntervalRef.current) clearInterval(botIntervalRef.current);
      };
    }
  }, [gameState, handleFinishRace]);

  const submitAnswer = useCallback(() => {
    if (!question || gameState !== "racing") return;

    const parsed = parseInt(answerInput, 10);
    const timeTaken = Date.now() - questionStartTimeRef.current;
    const isCorrect = parsed === question.answer;

    const factKey = `${question.num1}x${question.num2}`;
    const updated = recordFactAttempt(profile, factKey, isCorrect, timeTaken);
    onUpdateProfile(updated);

    if (isCorrect) {
      sound.playCorrect();
      setPlayerProgress((prev) => {
        const next = Math.min(100, prev + 10);
        if (next >= 100) {
          handleFinishRace(1);
        }
        return next;
      });
      nextQuestion();
    } else {
      sound.playWrong();
      setAnswerInput("");
      nextQuestion();
    }
  }, [question, gameState, answerInput, profile, onUpdateProfile, nextQuestion, handleFinishRace]);

  const handleInputChange = (val: string) => {
    setAnswerInput(val);
    if (question && val === question.answer.toString()) {
      setTimeout(() => {
        sound.playCorrect();
        setPlayerProgress((prev) => Math.min(100, prev + 10));
        nextQuestion();
      }, 50);
    }
  };

  const restartRace = () => {
    setPlayerProgress(0);
    setRacers((prev) => prev.map((r) => ({ ...r, progress: 0 })));
    setCountdown(3);
    setGameState("countdown");
  };

  // 1. COUNTDOWN
  if (gameState === "countdown") {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-md w-full flex flex-col items-center">
          <div className="text-4xl mb-2">🏎️🏁</div>
          <h2 className="text-2xl font-black text-white">GRAND PRIX SPRINT</h2>
          <p className="text-slate-400 text-xs mt-1">Race against classmates! Answer correctly to accelerate!</p>
          <div className="text-8xl font-black text-cyan-400 my-6 font-mono animate-ping">
            {countdown}
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Revving Engines...</div>
        </div>
      </div>
    );
  }

  // 2. FINISHED SUMMARY
  if (gameState === "finished") {
    return (
      <div className="max-w-md mx-auto p-4 sm:p-6 my-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl text-center">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2" />
          <h2 className="text-3xl font-black mb-1">
            {finalRank === 1 ? "🥇 1ST PLACE WINNER!" : "🥈 2ND PLACE PODIUM!"}
          </h2>
          <p className="text-slate-400 text-xs mb-6">
            {finalRank === 1 ? "Incredible speed! You crossed the finish line first!" : "Great race! Keep practicing for 1st place!"}
          </p>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 mb-6 text-left">
            <div className="flex items-center justify-between font-bold text-sm">
              <span className="text-amber-400">1st Place</span>
              <span>{finalRank === 1 ? `${profile.name} (YOU)` : racers.find((r) => r.progress >= 100)?.name}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>2nd Place</span>
              <span>{finalRank === 1 ? racers[0].name : `${profile.name} (YOU)`}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={restartRace}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>RACE AGAIN</span>
            </button>
            <button
              onClick={onExit}
              className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl border border-slate-700 cursor-pointer"
            >
              Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. ACTIVE RACE
  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col items-center">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Race</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          <Flag className="w-4 h-4" />
          <span>Sprint to 100%</span>
        </div>
      </div>

      {/* 4-Lane Animated Race Track */}
      <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3 mb-4">
        {/* Player Lane */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-bold text-indigo-300">
            <span className="flex items-center gap-1">
              <span>🌟</span>
              <span>{profile.name} (YOU)</span>
            </span>
            <span className="font-mono text-cyan-400">{playerProgress}%</span>
          </div>
          <div className="w-full bg-slate-950 h-7 rounded-xl overflow-hidden border border-indigo-500/40 relative flex items-center px-2">
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-600 via-cyan-500 to-amber-400 transition-all duration-300"
              style={{ width: `${playerProgress}%` }}
            />
            <div
              className="absolute transition-all duration-300 flex items-center"
              style={{ left: `calc(${Math.min(92, playerProgress)}% - 8px)` }}
            >
              <span className="text-xl">🏎️</span>
            </div>
          </div>
        </div>

        {/* AI Racers Lanes */}
        {racers.map((racer) => (
          <div key={racer.id} className="space-y-1 opacity-90">
            <div className="flex justify-between text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1">
                <span>{racer.avatarIcon}</span>
                <span>{racer.name}</span>
              </span>
              <span className="font-mono">{racer.progress}%</span>
            </div>
            <div className="w-full bg-slate-950 h-5 rounded-lg overflow-hidden border border-slate-800 relative flex items-center px-2">
              <div
                className={`absolute left-0 top-0 bottom-0 ${racer.color} opacity-60 transition-all duration-300`}
                style={{ width: `${racer.progress}%` }}
              />
              <div
                className="absolute transition-all duration-300"
                style={{ left: `calc(${Math.min(92, racer.progress)}% - 6px)` }}
              >
                <span className="text-sm">🚗</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Flashcard */}
      <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center mb-4">
        <div className="text-5xl sm:text-6xl font-black text-white select-none my-2 flex items-center gap-3">
          <span>{question?.formattedText}</span>
          <span className="text-cyan-400 font-mono">?</span>
        </div>

        <div className="min-w-[130px] h-14 bg-slate-950 border-2 border-cyan-500/50 rounded-2xl flex items-center justify-center text-4xl font-mono font-black text-cyan-300 px-4 shadow-inner mb-1">
          {answerInput || <span className="text-slate-700 animate-pulse">_</span>}
        </div>
      </div>

      {/* Keypad */}
      <Keypad
        value={answerInput}
        onChange={handleInputChange}
        onSubmit={submitAnswer}
      />
    </div>
  );
}
