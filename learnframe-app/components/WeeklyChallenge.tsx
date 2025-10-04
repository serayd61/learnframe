'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function WeeklyChallenge() {
  const [timeLeft, setTimeLeft] = useState({
    days: 6,
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/20">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 animate-pulse"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <span className="text-3xl">🎯</span> Weekly Challenge
            </h3>
            <p className="text-gray-300">Base & Crypto Mastery Quiz</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              1M LEARN
            </div>
            <div className="text-sm text-gray-400">Prize Pool</div>
          </div>
        </div>
        
        {/* Timer */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-black/30 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</div>
            <div className="text-xs text-gray-400 uppercase">Days</div>
          </div>
          <div className="bg-black/30 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="text-xs text-gray-400 uppercase">Hours</div>
          </div>
          <div className="bg-black/30 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="text-xs text-gray-400 uppercase">Mins</div>
          </div>
          <div className="bg-black/30 backdrop-blur rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="text-xs text-gray-400 uppercase">Secs</div>
          </div>
        </div>
        
        {/* Challenge Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <span className="text-green-400">✓</span> 10 Questions
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-400">✓</span> All Correct to Win
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-400">✓</span> 342 Participants
            </span>
          </div>
        </div>
        
        {/* CTA Button */}
        <Link 
          href="/weekly-challenge"
          className="block w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl font-bold text-center text-white transition-all hover:scale-105 transform"
        >
          Enter Challenge →
        </Link>
      </div>
    </div>
  );
}
