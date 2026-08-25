"use client";

import { useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// 1. Connect to your Supabase filing cabinet
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BossMode() {
  const [timeLeft, setTimeLeft] = useState(6.0);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [playerAnswer, setPlayerAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  
  // We use refs to keep track of the ticking clock behind the scenes
  const timeLeftRef = useRef(6.0);
  const isPlayingRef = useRef(false);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  
  // 2. The brain that generates the question and starts the clock
  const nextQuestion = () => {
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
    
    // Tick down every tenth of a second
    timerId.current = setInterval(() => {
      if (!isPlayingRef.current) return;
      
      timeLeftRef.current -= 0.1;
      setTimeLeft(timeLeftRef.current);
      
      if (timeLeftRef.current <= 0) {
        handleTimeOut(n1, n2);
      }
    }, 100);
  };
  
  // 3. What happens if they run out of time
  const handleTimeOut = async (currentNum1: number, currentNum2: number) => {
    if (timerId.current) clearInterval(timerId.current);
    isPlayingRef.current = false;
    setIsPlaying(false);
    setTimeLeft(0);
    
    setMessage(`Too slow! The answer was ${currentNum1 * currentNum2}`);
    
    // Save a failed attempt to Supabase (took 6000 milliseconds)
    await saveScore(currentNum1, currentNum2, false, 6000);
    
    // Wait 2 seconds, then launch the next question
    setTimeout(nextQuestion, 2000);
  };
  
  // 4. The function that actually talks to Supabase
  const saveScore = async (n1: number, n2: number, correct: boolean, timeMs: number) => {
    await supabase.from("answer_logs").insert([
      {
        player_name: "Test Player",
        question: `${n1} x ${n2}`,
        is_correct: correct,
        response_time_ms: timeMs,
      }
    ]);
  };
  
  // 5. This checks their answer the exact moment they type a number
  const checkAnswer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPlayerAnswer(value);
    
    if (!isPlayingRef.current) return;
    
    const guess = parseInt(value);
    const correctAns = num1 * num2;
    
    if (guess === correctAns) {
      if (timerId.current) clearInterval(timerId.current);
      isPlayingRef.current = false;
      setIsPlaying(false);
      
      setMessage("Correct! Lightning fast! ⚡");
      
      // Calculate exactly how many milliseconds it took them
      const timeTaken = Math.round((6.0 - timeLeftRef.current) * 1000);
      saveScore(num1, num2, true, timeTaken);
      
      setTimeout(nextQuestion, 1500);
    }
  };

  // 6. The visual layout of the game
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center pt-32 font-sans text-black">
      <h1 className="text-4xl font-bold mb-8">Grid Guardians</h1>
      
      {num1 === 0 ? (
        <button 
          onClick={nextQuestion}
          className="bg-blue-600 text-white px-8 py-4 rounded-xl text-2xl font-bold shadow-lg active:bg-blue-800"
        >
          Start Boss Mode
        </button>
      ) : (
        <div className="bg-white p-12 rounded-3xl shadow-xl flex flex-col items-center w-full max-w-md border-4 border-gray-200">
          <div className={`text-7xl font-black mb-8 ${timeLeft < 2 ? 'text-red-600' : 'text-gray-800'}`}>
            {Math.max(0, timeLeft).toFixed(1)}
          </div>
          
          <div className="text-5xl mb-8 font-bold text-gray-700">
            {num1} x {num2} =
          </div>
          
          <input
            type="number"
            autoFocus
            value={playerAnswer}
            onChange={checkAnswer}
            disabled={!isPlaying}
            className="w-48 text-center text-4xl border-4 border-gray-300 rounded-xl p-4 mb-6"
          />
          
          <div className={`text-2xl font-bold h-8 ${message.includes('slow') ? 'text-red-500' : 'text-green-500'}`}>
            {message}
          </div>
        </div>
      )}
    </div>
  );
}