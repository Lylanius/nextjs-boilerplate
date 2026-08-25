"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { PlayerProfile, QuestionFact } from "@/lib/types";
import { generateMtcQuestions } from "@/lib/curriculum";
import { sound } from "@/lib/audio";
import { recordFactAttempt, addXpAndCoins } from "@/lib/storage";
import Keypad from "./Keypad";
import { ArrowLeft, CheckCircle2, XCircle, Clock, ShieldCheck, RotateCcw, Award } from "lucide-react";

interface MtcSimulatorProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onExit: () => void;
}

interface MtcResultItem {
  question: QuestionFact;
  userAnswer: number | null;
  isCorrect: boolean;
  timeMs: number;
}

export default function MtcSimulator({
  profile,
  onUpdateProfile,
  onExit,
}: MtcSimulatorProps) {
  const [stage, setStage] = useState<"intro" | "testing" | "pause" | "complete">("intro");
  const [questions, setQuestions] = useState<QuestionFact[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answerInput, setAnswerInput] = useState<string>("");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(6.0);
  const [results, setResults] = useState<MtcResultItem[]>([]);
  const [pauseSeconds, setPauseSeconds] = useState<number>(3);

  const questionStartTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTest = () => {
    const generated = generateMtcQuestions();
    setQuestions(generated);
    setResults([]);
    setCurrentIndex(0);
    setAnswerInput("");
    setSecondsRemaining(6.0);
    questionStartTimeRef.current = Date.now();
    setStage("testing");
  };

  const currentQ = questions[currentIndex];

  const handleNextOrFinish = useCallback((finalResults: MtcResultItem[]) => {
    if (currentIndex + 1 < 25) {
      setStage("pause");
      setPauseSeconds(3);
      const pauseTimer = setInterval(() => {
        setPauseSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(pauseTimer);
            setCurrentIndex((idx) => idx + 1);
            setAnswerInput("");
            setSecondsRemaining(6.0);
            setStage("testing");
            questionStartTimeRef.current = Date.now();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Completed all 25 questions
      setStage("complete");
      const correctCount = finalResults.filter((r) => r.isCorrect).length;
      if (correctCount >= 22) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
      sound.playLevelUp();

      // Award XP and Coins
      const coinsEarned = correctCount * 12 + (correctCount === 25 ? 150 : 50);
      const xpEarned = correctCount * 15 + 100;
      const gemsEarned = correctCount === 25 ? 10 : correctCount >= 20 ? 5 : 2;

      const { updatedProfile } = addXpAndCoins(profile, xpEarned, coinsEarned, gemsEarned);
      onUpdateProfile(updatedProfile);
    }
  }, [currentIndex, profile, onUpdateProfile]);

  const submitQuestionAnswer = useCallback((isTimeOut = false) => {
    if (!currentQ || stage !== "testing") return;
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTaken = Date.now() - questionStartTimeRef.current;
    const parsed = parseInt(answerInput, 10);
    const isCorrect = !isTimeOut && parsed === currentQ.answer;

    if (isCorrect) {
      sound.playCorrect();
    } else {
      sound.playWrong();
    }

    const factKey = `${currentQ.num1}x${currentQ.num2}`;
    const updatedProf = recordFactAttempt(profile, factKey, isCorrect, timeTaken);
    onUpdateProfile(updatedProf);

    const resultItem: MtcResultItem = {
      question: currentQ,
      userAnswer: isTimeOut || isNaN(parsed) ? null : parsed,
      isCorrect,
      timeMs: timeTaken,
    };

    const newResults = [...results, resultItem];
    setResults(newResults);

    handleNextOrFinish(newResults);
  }, [currentQ, stage, answerInput, profile, onUpdateProfile, results, handleNextOrFinish]);

  // 6.0s Question Countdown
  useEffect(() => {
    if (stage === "testing") {
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - questionStartTimeRef.current) / 1000;
        const remaining = Math.max(0, 6.0 - elapsed);
        setSecondsRemaining(remaining);

        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          submitQuestionAnswer(true);
        }
      }, 50);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [stage, currentIndex, submitQuestionAnswer]);

  const handleInputChange = (val: string) => {
    setAnswerInput(val);
    if (currentQ && val === currentQ.answer.toString()) {
      setTimeout(() => {
        submitQuestionAnswer(false);
      }, 50);
    }
  };

  // 1. INTRO SCREEN
  if (stage === "intro") {
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 my-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 text-white shadow-2xl text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-950/80 border border-amber-800/80 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Official UK DfE Standard Simulation
          </div>

          <h1 className="text-3xl sm:text-4xl font-black mb-3 bg-gradient-to-r from-amber-300 via-yellow-200 to-indigo-200 bg-clip-text text-transparent">
            Year 4 Multiplication Tables Check (MTC)
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-lg mx-auto mb-6 leading-relaxed">
            The national statutory check tests rapid recall of multiplication tables up to 12×12.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 text-left">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-amber-400 font-bold text-lg mb-1">25 Questions</div>
              <div className="text-xs text-slate-400">Strict weighted tables (focus on 6, 7, 8, 9, 12).</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-cyan-400 font-bold text-lg mb-1">6 Seconds</div>
              <div className="text-xs text-slate-400">Time allowed per question before auto-advancing.</div>
            </div>
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="text-emerald-400 font-bold text-lg mb-1">3s Pause</div>
              <div className="text-xs text-slate-400">Rest period between each question.</div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={startTest}
              className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-black text-lg py-4 px-8 rounded-2xl shadow-xl shadow-amber-950/50 transition-all active:scale-95 cursor-pointer"
            >
              START MTC CHECK ⚔️
            </button>
            <button
              onClick={onExit}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-4 px-6 rounded-2xl border border-slate-700 transition-all cursor-pointer"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. PAUSE SCREEN (3s between questions)
  if (stage === "pause") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Next Question in...</div>
          <div className="text-6xl font-black text-amber-400 my-4 font-mono animate-pulse">
            {pauseSeconds}
          </div>
          <div className="text-xs text-indigo-400 font-semibold">
            Question {currentIndex + 2} of 25
          </div>
        </div>
      </div>
    );
  }

  // 3. COMPLETE SCREEN (Detailed Report Card)
  if (stage === "complete") {
    const score = results.filter((r) => r.isCorrect).length;
    const avgMs = results.length > 0
      ? Math.round(results.reduce((acc, r) => acc + r.timeMs, 0) / results.length)
      : 0;

    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 my-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-950 border border-amber-700 rounded-full text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Award className="w-4 h-4 text-amber-400" />
              MTC Diagnostic Report
            </div>

            <h2 className="text-4xl font-black bg-gradient-to-r from-amber-300 via-yellow-200 to-indigo-300 bg-clip-text text-transparent">
              {score} / 25
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {score === 25
                ? "🌟 PERFECT SCORE! Full MTC Mastery achieved!"
                : score >= 20
                ? "🎉 Fantastic result! Well on track for Year 4 expectations."
                : "👍 Good effort! Practice the questions you missed below."}
            </p>
            <div className="text-xs font-mono text-cyan-400 mt-1">
              Average response time: {(avgMs / 1000).toFixed(2)}s per question
            </div>
          </div>

          {/* Detailed Question breakdown list */}
          <div className="max-h-72 overflow-y-auto pr-1 space-y-2 mb-6 scrollbar-thin">
            {results.map((res, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border flex items-center justify-between text-sm ${
                  res.isCorrect
                    ? "bg-slate-950/60 border-emerald-900/60 text-slate-200"
                    : "bg-rose-950/30 border-rose-900/60 text-rose-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-slate-500 w-6">#{i + 1}</span>
                  <span className="font-bold text-base">{res.question.formattedText}</span>
                  <span className="font-mono font-bold text-emerald-400">{res.question.answer}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono">{(res.timeMs / 1000).toFixed(2)}s</span>
                    {!res.isCorrect && (
                      <div className="text-xs text-rose-400">
                        You: {res.userAnswer !== null ? res.userAnswer : "Time out"}
                      </div>
                    )}
                  </div>
                  {res.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={startTest}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 px-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              <span>RETAKE MTC TEST</span>
            </button>
            <button
              onClick={onExit}
              className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl border border-slate-700 transition-all cursor-pointer"
            >
              Back to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. ACTIVE TEST VIEW
  const timePercent = Math.max(0, (secondsRemaining / 6.0) * 100);

  return (
    <div className="max-w-2xl mx-auto p-4 flex flex-col items-center">
      {/* Header controls */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Test</span>
        </button>

        <div className="text-sm font-bold text-slate-300">
          Question <strong className="text-amber-400">{currentIndex + 1}</strong> of 25
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
          <Clock className="w-4 h-4" />
          <span>{secondsRemaining.toFixed(1)}s</span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 mb-4">
        <div
          className={`h-full transition-all duration-100 ${
            secondsRemaining < 2 ? "bg-rose-500" : secondsRemaining < 4 ? "bg-amber-400" : "bg-emerald-400"
          }`}
          style={{ width: `${timePercent}%` }}
        />
      </div>

      {/* Main Flashcard */}
      <div className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center relative mb-4">
        <div className="text-5xl sm:text-7xl font-black tracking-tight text-white my-4 select-none flex items-center gap-3">
          <span>{currentQ?.formattedText}</span>
          <span className="text-amber-400 font-mono">?</span>
        </div>

        <div className="min-w-[140px] h-16 bg-slate-950 border-2 border-amber-500/50 rounded-2xl flex items-center justify-center text-4xl sm:text-5xl font-mono font-black text-amber-300 px-4 shadow-inner mb-2">
          {answerInput || <span className="text-slate-700 animate-pulse">_</span>}
        </div>
      </div>

      {/* Keypad */}
      <Keypad
        value={answerInput}
        onChange={handleInputChange}
        onSubmit={() => submitQuestionAnswer(false)}
      />
    </div>
  );
}
