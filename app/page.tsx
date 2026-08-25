"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Connect to the database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function GridGuardians() {
  // These act like light switches to change what is on the screen
  const [currentScreen, setCurrentScreen] = useState("dashboard"); 
  const [coins, setCoins] = useState(150);

  // Math Game Variables
  const [timeLeft, setTimeLeft] = useState(6.0);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [playerAnswer, setPlayerAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  
  const timeLeftRef = useRef(6.0);
  const isPlayingRef = useRef(false);
  const timerId = useRef<NodeJS.Timeout | null>(null);

  const saveScore = useCallback(async (n1: number, n2: number, correct: boolean, timeMs: number) => {
    try {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        await supabase.from("answer_logs").insert([
          { player_name: "Noah", question: `${n1} x ${n2}`, is_correct: correct, response_time_ms: timeMs }
        ]);
      }
    } catch (err) {
      console.warn("Unable to save score:", err);
    }
  }, []);

  const nextQuestionRef = useRef<() => void>(() => {});

  const nextQuestion = useCallback(() => {
    const n1 = Math.floor(Math.random() * 7) + 6;
    const n2 = Math.floor(Math.random() * 7) + 6;
    setNum1(n1);
    setNum2(n2);
    setPlayerAnswer("");
    setMessage("");
    timeLeftRef.current = 6.0;
    setTimeLeft(6.0);
    isPlayingRef.current = true;
    setIsPlaying(true);
    
    if (timerId.current) clearInterval(timerId.current);
    
    timerId.current = setInterval(() => {
      if (!isPlayingRef.current) return;
      timeLeftRef.current -= 0.1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        if (timerId.current) clearInterval(timerId.current);
        isPlayingRef.current = false;
        setIsPlaying(false);
        setTimeLeft(0);
        setMessage(`Too slow! The answer was ${n1 * n2}`);
        saveScore(n1, n2, false, 6000);
        setTimeout(() => nextQuestionRef.current(), 2000);
      }
    }, 100);
  }, [saveScore]);

  useEffect(() => {
    nextQuestionRef.current = nextQuestion;
  }, [nextQuestion]);

  // --- THE MATH GAME LOGIC ---
  const startGame = () => {
    setCurrentScreen("game");
    nextQuestion();
  };
  
  const checkAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlayerAnswer(value);
    if (!isPlayingRef.current) return;
    
    if (parseInt(value) === num1 * num2) {
      if (timerId.current) clearInterval(timerId.current);
      isPlayingRef.current = false;
      setIsPlaying(false);
      setMessage("Correct! +10 Coins!");
      setCoins(prev => prev + 10); // Reward the player!
      
      const timeTaken = Math.round((6.0 - timeLeftRef.current) * 1000);
      saveScore(num1, num2, true, timeTaken);
      setTimeout(() => nextQuestionRef.current(), 1500);
    }
  };

  const quitGame = () => {
    if (timerId.current) clearInterval(timerId.current);
    setCurrentScreen("dashboard");
  };

  // --- WHAT YOU ACTUALLY SEE ON SCREEN ---
  return (
    <div className="min-h-screen bg-indigo-50 font-sans text-gray-800 p-4 sm:p-8">
      
      {/* 1. THE STUDENT DASHBOARD VIEW */}
      {currentScreen === "dashboard" && (
        <div className="max-w-3xl mx-auto">
          {/* Top Profile Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full border-4 border-blue-200"></div>
              <div>
                <h2 className="text-2xl font-bold">Explorer Noah</h2>
                <p className="text-gray-500">Level 4</p>
              </div>
            </div>
            <div className="bg-yellow-100 px-6 py-3 rounded-xl border-2 border-yellow-300">
              <span className="text-2xl font-black text-yellow-600">🪙 {coins}</span>
            </div>
          </div>

          {/* Daily Quests */}
          <h3 className="text-xl font-bold mb-4 text-indigo-900">Today&apos;s Quests</h3>
          <div className="grid gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-8 border-green-400 flex justify-between items-center">
              <span className="font-bold text-lg">Log in today</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Done!</span>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border-l-8 border-blue-400 flex justify-between items-center">
              <span className="font-bold text-lg">Play 1 round of Boss Mode</span>
              <span className="text-gray-400 font-bold">Reward: 50 🪙</span>
            </div>
          </div>

          {/* Play Button */}
          <button 
            onClick={startGame}
            className="w-full bg-indigo-600 text-white py-6 rounded-2xl text-3xl font-black shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
          >
            ENTER BOSS MODE ⚔️
          </button>
        </div>
      )}

      {/* 2. THE GAME VIEW */}
      {currentScreen === "game" && (
        <div className="max-w-md mx-auto pt-10 flex flex-col items-center">
          <div className="w-full flex justify-between mb-8">
            <button onClick={quitGame} className="font-bold text-indigo-400">← Back to Hub</button>
            <span className="font-bold text-yellow-600">🪙 {coins}</span>
          </div>
          
          <div className="bg-white p-10 rounded-3xl shadow-xl flex flex-col items-center w-full border-4 border-gray-100">
            <div className={`text-6xl font-black mb-6 ${timeLeft < 2 ? 'text-red-500' : 'text-gray-800'}`}>
              {Math.max(0, timeLeft).toFixed(1)}
            </div>
            <div className="text-5xl mb-6 font-bold text-gray-700">
              {num1} x {num2} =
            </div>
            <input
              type="number"
              autoFocus
              value={playerAnswer}
              onChange={checkAnswer}
              disabled={!isPlaying}
              className="w-48 text-center text-4xl border-4 border-gray-200 rounded-xl p-4 mb-4"
            />
            <div className={`text-xl font-bold h-8 ${message.includes('slow') ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}