"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { PlayerProfile, QuestionFact } from "@/lib/types";
import { generateQuestion, getSpeedRankTitle } from "@/lib/curriculum";
import { sound } from "@/lib/audio";
import { recordFactAttempt, addXpAndCoins } from "@/lib/storage";
import Keypad from "./Keypad";
import AvatarView from "./AvatarView";
import { Flame, Clock, Zap, ArrowLeft, Trophy, RotateCcw } from "lucide-react";

interface GameArenaProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onExit: () => void;
}

export default function GameArena({
  profile,
  onUpdateProfile,
  onExit,
}: GameArenaProps) {
  const [gameState, setGameState] = useState<"countdown" | "playing" | "gameover">("countdown");
  const [countdownVal, setCountdownVal] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [question, setQuestion] = useState<QuestionFact | null>(null);
  const [answerInput, setAnswerInput] = useState<string>("");
  const [streak, setStreak] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  const questionStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const spawnQuestion = useCallback(() => {
    const q = generateQuestion(profile.yearGroup, undefined, true);
    setQuestion(q);
    setAnswerInput("");
    questionStartTimeRef.current = Date.now();
  }, [profile.yearGroup]);

  // 3-2-1 Countdown before start
  useEffect(() => {
    if (gameState === "countdown") {
      sound.playTick(false);
      const timer = setInterval(() => {
        setCountdownVal((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            sound.playTick(true);
            spawnQuestion();
            setGameState("playing");
            setTimeLeft(60);
            return 0;
          }
          sound.playTick(false);
          return prev - 1;
        });
      }, 900);
      return () => clearInterval(timer);
    }
  }, [gameState, spawnQuestion]);

  // Main 60s Game Timer
  useEffect(() => {
    if (gameState === "playing") {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setGameState("gameover");
            return 0;
          }
          if (prev <= 5) {
            sound.playTick(true);
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      };
    }
  }, [gameState]);

  // Handle Answer Verification
  const submitAnswer = useCallback(() => {
    if (!question || gameState !== "playing") return;

    const parsed = parseInt(answerInput, 10);
    const timeTaken = Date.now() - questionStartTimeRef.current;
    const isCorrect = parsed === question.answer;

    setTotalAttempts((prev) => prev + 1);

    const factKey = `${question.num1}x${question.num2}`;
    const updated = recordFactAttempt(profile, factKey, isCorrect, timeTaken);
    onUpdateProfile(updated);

    if (isCorrect) {
      sound.playCorrect(streak);
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((prev) => prev + 1);
      setResponseTimes((prev) => [...prev, timeTaken]);

      // Combo multiplier: x1 up to x4
      const multiplier = Math.min(4, Math.floor(newStreak / 5) + 1);
      const pointsEarned = 10 * multiplier;
      setScore((prev) => prev + pointsEarned);

      setFeedback({
        text: newStreak >= 5 ? `🔥 ${multiplier}x COMBO! +${pointsEarned}` : `+${pointsEarned}`,
        isCorrect: true,
      });

      spawnQuestion();
    } else {
      sound.playWrong();
      setStreak(0);
      setFeedback({
        text: `Answer: ${question.answer}`,
        isCorrect: false,
      });
      // Show correct answer briefly
      setTimeout(() => {
        setFeedback(null);
        spawnQuestion();
      }, 700);
    }
  }, [question, answerInput, streak, gameState, profile, onUpdateProfile, spawnQuestion]);

  // Auto-check if input matches answer length & value
  const handleInputChange = (val: string) => {
    setAnswerInput(val);
    if (!question) return;
    const targetStr = question.answer.toString();
    if (val === targetStr) {
      // Auto submit on correct full answer
      setTimeout(() => {
        const timeTaken = Date.now() - questionStartTimeRef.current;
        sound.playCorrect(streak);
        const newStreak = streak + 1;
        setStreak(newStreak);
        setCorrectCount((prev) => prev + 1);
        setTotalAttempts((prev) => prev + 1);
        setResponseTimes((prev) => [...prev, timeTaken]);

        const multiplier = Math.min(4, Math.floor(newStreak / 5) + 1);
        const pointsEarned = 10 * multiplier;
        setScore((prev) => prev + pointsEarned);

        const factKey = `${question.num1}x${question.num2}`;
        const updated = recordFactAttempt(profile, factKey, true, timeTaken);
        onUpdateProfile(updated);

        setFeedback({
          text: newStreak >= 5 ? `🔥 ${multiplier}x STREAK! +${pointsEarned}` : `+${pointsEarned}`,
          isCorrect: true,
        });

        spawnQuestion();
      }, 50);
    }
  };

  // On Game Over - Calculate Rewards and Confetti
  useEffect(() => {
    if (gameState === "gameover") {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      sound.playLevelUp();

      const earnedCoins = Math.floor(score * 0.8) + (correctCount * 3);
      const earnedXp = Math.floor(score * 1.2);
      const earnedGems = correctCount >= 20 ? 3 : 1;

      const { updatedProfile } = addXpAndCoins(profile, earnedXp, earnedCoins, earnedGems);
      onUpdateProfile(updatedProfile);
    }
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  const avgSpeed = responseTimes.length > 0
    ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
    : 0;

  const speedRank = getSpeedRankTitle(avgSpeed);

  // 1. COUNTDOWN VIEW
  if (gameState === "countdown") {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-2xl max-w-md w-full flex flex-col items-center animate-bounce-subtle">
          <AvatarView avatar={profile.avatar} size="lg" />
          <h2 className="text-2xl font-black text-white mt-4 tracking-tight">GET READY FOR SPEED ARENA!</h2>
          <p className="text-slate-400 text-sm mt-1">60 seconds on the clock. Hit max streaks for multipliers!</p>
          <div className="text-8xl font-black text-amber-400 my-8 animate-ping font-mono">
            {countdownVal}
          </div>
          <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">Press ready digits</div>
        </div>
      </div>
    );
  }

  // 2. GAME OVER SUMMARY VIEW
  if (gameState === "gameover") {
    const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    const earnedCoins = Math.floor(score * 0.8) + (correctCount * 3);
    const earnedXp = Math.floor(score * 1.2);

    return (
      <div className="max-w-xl mx-auto p-4 sm:p-6 my-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl text-center">
          <div className="flex justify-center mb-4">
            <AvatarView avatar={profile.avatar} size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-800/80 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Arena Complete
          </div>

          <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-300 via-rose-300 to-indigo-300 bg-clip-text text-transparent">
            {score} POINTS!
          </h2>

          {/* Speed Rank Badge */}
          <div className="my-4 p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="text-left">
              <div className="text-xs text-slate-400 font-bold uppercase">Speed Class</div>
              <div className={`text-lg font-black ${speedRank.color}`}>
                {speedRank.badge} {speedRank.title}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400 font-bold uppercase">Average Recall</div>
              <div className="text-lg font-mono font-black text-cyan-400">
                {(avgSpeed / 1000).toFixed(2)}s
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 my-6">
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Correct</div>
              <div className="text-2xl font-black text-emerald-400">{correctCount}</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Accuracy</div>
              <div className="text-2xl font-black text-indigo-400">{accuracy}%</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <div className="text-xs text-slate-400 font-semibold">Max Streak</div>
              <div className="text-2xl font-black text-rose-400">{streak} 🔥</div>
            </div>
          </div>

          {/* Rewards */}
          <div className="bg-gradient-to-r from-yellow-950/40 via-slate-900 to-purple-950/40 border border-yellow-800/40 rounded-2xl p-4 mb-6 flex items-center justify-around">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🪙</span>
              <div className="text-left">
                <div className="text-xs text-slate-400 font-bold">Coins Earned</div>
                <div className="text-lg font-black text-yellow-400">+{earnedCoins}</div>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div className="text-left">
                <div className="text-xs text-slate-400 font-bold">XP Earned</div>
                <div className="text-lg font-black text-purple-400">+{earnedXp} XP</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setGameState("countdown");
                setCountdownVal(3);
                setScore(0);
                setStreak(0);
                setCorrectCount(0);
                setTotalAttempts(0);
                setResponseTimes([]);
              }}
              className="flex-1 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>PLAY AGAIN</span>
            </button>
            <button
              onClick={onExit}
              className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl border border-slate-700 transition-all cursor-pointer"
            >
              Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. ACTIVE PLAYING VIEW
  const comboMultiplier = Math.min(4, Math.floor(streak / 5) + 1);

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col items-center">
      {/* Top Header Controls */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Arena</span>
        </button>

        {/* 60s Countdown clock */}
        <div
          className={`flex items-center gap-2 px-4 py-1.5 rounded-2xl font-mono font-black text-xl border transition-all ${
            timeLeft <= 10
              ? "bg-rose-950/80 border-rose-600 text-rose-300 animate-pulse"
              : "bg-slate-800/90 border-slate-700 text-slate-200"
          }`}
        >
          <Clock className="w-5 h-5 text-indigo-400" />
          <span>{timeLeft}s</span>
        </div>

        {/* Score & Streak */}
        <div className="flex items-center gap-2">
          {streak >= 3 && (
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-950/80 border border-orange-700/80 rounded-xl text-orange-300 font-black text-xs animate-wiggle">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>{comboMultiplier}x COMBO</span>
            </div>
          )}
          <div className="px-3.5 py-1 bg-slate-800 border border-slate-700 rounded-xl font-black text-amber-300 text-sm">
            {score} pts
          </div>
        </div>
      </div>

      {/* Main Flashcard Display */}
      <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center relative overflow-hidden mb-4">
        {/* Background glow when in high combo */}
        {streak >= 5 && (
          <div className="absolute inset-0 bg-gradient-to-t from-orange-600/10 via-transparent to-purple-600/10 pointer-events-none" />
        )}

        {/* Mini avatar cheering */}
        <div className="absolute top-4 left-4 opacity-75 hidden sm:block">
          <AvatarView avatar={profile.avatar} size="sm" />
        </div>

        {/* Streak Counter pill */}
        <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mb-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Streak: <strong className="text-white">{streak}</strong></span>
        </div>

        {/* The Equation */}
        <div className="text-5xl sm:text-7xl font-black tracking-tight text-white my-3 select-none flex items-center gap-3">
          <span>{question?.formattedText}</span>
          <span className="text-indigo-400 font-mono">?</span>
        </div>

        {/* Answer input display */}
        <div className="min-w-[140px] h-16 bg-slate-950 border-2 border-indigo-500/50 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-mono font-black text-emerald-400 px-4 shadow-inner mb-2">
          {answerInput || <span className="text-slate-700 animate-pulse">_</span>}
        </div>

        {/* Feedback flash */}
        <div className="h-6 flex items-center justify-center">
          {feedback && (
            <span
              className={`text-sm font-extrabold ${
                feedback.isCorrect ? "text-emerald-400 animate-bounce" : "text-rose-400 animate-shake"
              }`}
            >
              {feedback.text}
            </span>
          )}
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
