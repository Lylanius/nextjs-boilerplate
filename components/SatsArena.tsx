"use client";

import React, { useState, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { PlayerProfile, QuestionFact } from "@/lib/types";
import { generateSatsQuestion } from "@/lib/curriculum";
import { sound } from "@/lib/audio";
import { addXpAndCoins } from "@/lib/storage";
import Keypad from "./Keypad";
import { ArrowLeft, Sparkles, CheckCircle2, XCircle, Lightbulb, RotateCcw, Award, BookOpen } from "lucide-react";

interface SatsArenaProps {
  profile: PlayerProfile;
  onUpdateProfile: (p: PlayerProfile) => void;
  onBack: () => void;
}

interface SatsResultItem {
  question: QuestionFact;
  userAnswer: string;
  isCorrect: boolean;
  timeMs: number;
}

export default function SatsArena({ profile, onUpdateProfile, onBack }: SatsArenaProps) {
  const [testLength, setTestLength] = useState<10 | 25 | 36>(10);
  const [questions, setQuestions] = useState<QuestionFact[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answerInput, setAnswerInput] = useState<string>("");
  const [stage, setStage] = useState<"menu" | "testing" | "results">("menu");
  const [results, setResults] = useState<SatsResultItem[]>([]);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const questionStartTimeRef = useRef<number>(0);

  const startTest = useCallback((length: 10 | 25 | 36) => {
    setTestLength(length);
    const qs: QuestionFact[] = [];
    for (let i = 0; i < length; i++) {
      qs.push(generateSatsQuestion());
    }
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswerInput("");
    setResults([]);
    setShowHint(false);
    setFeedback(null);
    questionStartTimeRef.current = performance.now();
    setStage("testing");
  }, []);

  const currentQ = questions[currentIndex];

  const handleFinish = useCallback((finalResults: SatsResultItem[]) => {
    setStage("results");
    const correctCount = finalResults.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((correctCount / finalResults.length) * 100);

    if (accuracy >= 80) {
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      sound.playLevelUp();
    }

    const xpEarned = correctCount * 15;
    const coinsEarned = correctCount * 10;
    const gemsEarned = accuracy === 100 ? 5 : accuracy >= 80 ? 2 : 0;

    const { updatedProfile } = addXpAndCoins(profile, xpEarned, coinsEarned, gemsEarned);
    const updatedWithScore: PlayerProfile = {
      ...updatedProfile,
      highScores: {
        ...updatedProfile.highScores,
        satsScore: Math.max(updatedProfile.highScores.satsScore || 0, correctCount),
      },
    };
    onUpdateProfile(updatedWithScore);
  }, [profile, onUpdateProfile]);

  const submitAnswer = useCallback(() => {
    if (!currentQ || stage !== "testing") return;
    const elapsed = Math.round(performance.now() - (questionStartTimeRef.current || performance.now()));
    const cleanUser = answerInput.trim();
    const cleanCorrect = String(currentQ.answer).trim();

    const isCorrect = cleanUser === cleanCorrect;

    const resultItem: SatsResultItem = {
      question: currentQ,
      userAnswer: cleanUser || "—",
      isCorrect,
      timeMs: elapsed,
    };

    const nextResults = [...results, resultItem];
    setResults(nextResults);

    if (isCorrect) {
      sound.playCorrect();
      setFeedback("correct");
    } else {
      sound.playWrong();
      setFeedback("wrong");
    }

    setTimeout(() => {
      setFeedback(null);
      setAnswerInput("");
      setShowHint(false);

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        questionStartTimeRef.current = performance.now();
      } else {
        handleFinish(nextResults);
      }
    }, 450);
  }, [currentQ, stage, answerInput, results, currentIndex, questions.length, handleFinish]);

  const handleInputChange = (val: string) => {
    setAnswerInput(val);
    if (currentQ && val.trim() === String(currentQ.answer).trim()) {
      setTimeout(() => {
        submitAnswer();
      }, 50);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-rose-950/40 border border-rose-500/30 p-4 rounded-2xl backdrop-blur-md">
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
              <span className="text-2xl">👑</span>
              <h1 className="text-xl font-black text-rose-300">Year 6 KS2 SATs Arithmetic Arena</h1>
            </div>
            <p className="text-xs text-rose-400/80">
              DfE Paper 1 Standard: BIDMAS, Fractions, Decimals, Percentages & Algebra
            </p>
          </div>
        </div>

        {stage === "testing" && (
          <div className="px-4 py-2 bg-slate-900/90 rounded-xl border border-rose-500/40 text-rose-300 text-sm font-black">
            Question {currentIndex + 1} of {questions.length}
          </div>
        )}
      </div>

      {/* STAGE: MENU */}
      {stage === "menu" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
            <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-rose-400" />
              Choose Your SATs Challenge
            </h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Test your arithmetic power with questions directly modeled on the official England KS2 National Curriculum Paper 1 standard.
            </p>

            <div className="space-y-4 mb-8">
              {[
                {
                  length: 10 as const,
                  title: "10-Question Rapid Sprint",
                  desc: "Quick 3-minute diagnostic covering BIDMAS, fractions and percentages.",
                  icon: "⚡",
                  color: "border-sky-500/40 bg-sky-950/20 hover:border-sky-400",
                },
                {
                  length: 25 as const,
                  title: "25-Question Mastery Check",
                  desc: "Balanced SATs preparation with multi-digit operations and linear algebra.",
                  icon: "🛡️",
                  color: "border-indigo-500/40 bg-indigo-950/20 hover:border-indigo-400",
                },
                {
                  length: 36 as const,
                  title: "Official 36-Question Mock Paper",
                  desc: "Full mock simulation of the statutory Key Stage 2 Arithmetic Paper 1.",
                  icon: "👑",
                  color: "border-rose-500/40 bg-rose-950/20 hover:border-rose-400",
                },
              ].map((opt) => (
                <button
                  key={opt.length}
                  onClick={() => startTest(opt.length)}
                  className={`w-full p-4 rounded-2xl border flex items-center justify-between text-left transition-all ${opt.color} hover:scale-[1.01] shadow-lg`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{opt.icon}</span>
                    <div>
                      <h3 className="font-black text-white text-base">{opt.title}</h3>
                      <p className="text-slate-400 text-xs mt-0.5">{opt.desc}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-rose-500 text-rose-950 font-black text-xs">
                    Start
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Curriculum Info Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-xl">
            <div>
              <h3 className="text-sm font-black text-rose-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-rose-400" />
                Curriculum Blueprint
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>BIDMAS:</strong> Brackets, Indices, Division/Multiplication, Addition/Subtraction</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Fractions:</strong> Fractions of amounts, operations and equivalence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Percentages:</strong> 15%, 35%, 75% and 99% of quantities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span><strong>Linear Equations:</strong> Finding missing variables (e.g. 3x + 5 = 26)</span>
                </li>
              </ul>
            </div>

            <div className="p-3.5 bg-rose-950/40 border border-rose-800/40 rounded-2xl text-xs text-rose-200 mt-4">
              <span className="font-bold block mb-1">💡 Pro-Tip for SATs:</span>
              Always write out your BIDMAS steps and check whether operations need brackets first!
            </div>
          </div>
        </div>
      )}

      {/* STAGE: TESTING */}
      {stage === "testing" && currentQ && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Question Display */}
          <div className="md:col-span-2 bg-slate-900/90 border border-rose-500/30 rounded-3xl p-8 flex flex-col justify-between shadow-2xl backdrop-blur-xl">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black uppercase">
                  {currentQ.subtopic || "KS2 SATs Arithmetic"}
                </span>

                <button
                  onClick={() => setShowHint((h) => !h)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  {showHint ? "Hide Hint" : "Step Hint"}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
                <div
                  className="h-full bg-rose-500 transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>

              {/* Question Equation */}
              <div className="text-center py-8">
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-wider mb-6">
                  {currentQ.formattedText}
                </h2>

                {/* Input Preview Box */}
                <div
                  className={`inline-block min-w-[140px] px-6 py-3 rounded-2xl border-2 text-3xl font-mono font-black text-center transition-all ${
                    feedback === "correct"
                      ? "bg-emerald-950/80 border-emerald-400 text-emerald-300 animate-pulse"
                      : feedback === "wrong"
                      ? "bg-rose-950/80 border-rose-400 text-rose-300"
                      : "bg-slate-950 border-rose-500/50 text-white"
                  }`}
                >
                  {answerInput || <span className="opacity-30">?</span>}
                </div>
              </div>
            </div>

            {/* Hint Drawer */}
            {showHint && currentQ.stepHint && (
              <div className="p-4 bg-amber-950/40 border border-amber-700/50 rounded-2xl text-xs text-amber-200 animate-fadeIn">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Method / Step Hint:
                </p>
                <p>{currentQ.stepHint}</p>
              </div>
            )}
          </div>

          {/* Keypad */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center backdrop-blur-xl">
            <Keypad
              value={answerInput}
              onChange={handleInputChange}
              onSubmit={submitAnswer}
              allowDecimals={true}
              allowNegatives={true}
            />
          </div>
        </div>
      )}

      {/* STAGE: RESULTS */}
      {stage === "results" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-2">👑</div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">SATs Arithmetic Performance</h2>
            <p className="text-slate-400 text-sm">Key Stage 2 National Curriculum Diagnostic</p>
          </div>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-xs text-slate-400 block">Score</span>
              <span className="text-2xl font-black text-rose-300">
                {results.filter((r) => r.isCorrect).length} / {results.length}
              </span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-xs text-slate-400 block">Accuracy</span>
              <span className="text-2xl font-black text-emerald-400">
                {Math.round((results.filter((r) => r.isCorrect).length / results.length) * 100)}%
              </span>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center">
              <span className="text-xs text-slate-400 block">Avg Time</span>
              <span className="text-2xl font-black text-sky-400">
                {(
                  results.reduce((acc, cur) => acc + cur.timeMs, 0) /
                  (results.length * 1000)
                ).toFixed(1)}
                s
              </span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-2 max-h-72 overflow-y-auto p-2 bg-slate-950/60 rounded-2xl border border-slate-800">
            {results.map((r, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-mono ${
                  r.isCorrect
                    ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-200"
                    : "bg-rose-950/30 border-rose-800/40 text-rose-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {r.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <span className="font-bold text-white">{r.question.formattedText}</span>
                  <span className="text-slate-400">{r.question.subtopic}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Your Ans: {r.userAnswer}</span>
                  {!r.isCorrect && (
                    <span className="text-emerald-400 font-bold">
                      (Correct: {String(r.question.answer)})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => startTest(testLength)}
              className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={onBack}
              className="px-8 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-rose-950 font-black flex items-center gap-2 shadow-lg transition-all"
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
