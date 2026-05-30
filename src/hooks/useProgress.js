import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'fsa_progress_v1';

const defaultProgress = {
  completedDays: [],       // [1, 2, 3]
  quizScores: {},          // { 1: 3, 2: 4 }  day → score
  challengesDone: [],      // [1, 3]
  streak: 0,
  lastActiveDate: null,
  xp: 0,
  startedAt: null,
};

function calcStreak(progress) {
  const today = new Date().toDateString();
  const last  = progress.lastActiveDate;
  if (!last) return 1;
  const dayDiff = Math.floor(
    (new Date(today) - new Date(last)) / (1000 * 60 * 60 * 24)
  );
  if (dayDiff === 0) return progress.streak;
  if (dayDiff === 1) return progress.streak + 1;
  return 1; // streak broken
}

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultProgress, ...JSON.parse(stored) } : defaultProgress;
    } catch {
      return defaultProgress;
    }
  });

  const save = useCallback((next) => {
    setProgress(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const markDayComplete = useCallback((day) => {
    setProgress(prev => {
      const already = prev.completedDays.includes(day);
      const today   = new Date().toDateString();
      const streak  = calcStreak(prev);
      const next = {
        ...prev,
        completedDays: already ? prev.completedDays : [...prev.completedDays, day],
        lastActiveDate: today,
        streak,
        xp: already ? prev.xp : prev.xp + 100,
        startedAt: prev.startedAt || today,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const saveQuizScore = useCallback((day, score, total) => {
    setProgress(prev => {
      const prevBest = prev.quizScores[day] || 0;
      const xpGain   = score > prevBest ? (score * 25) : 0;
      const next = {
        ...prev,
        quizScores: { ...prev.quizScores, [day]: Math.max(prevBest, score) },
        xp: prev.xp + xpGain,
        lastActiveDate: new Date().toDateString(),
        streak: calcStreak(prev),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const markChallengeComplete = useCallback((day) => {
    setProgress(prev => {
      const already = prev.challengesDone.includes(day);
      const next = {
        ...prev,
        challengesDone: already ? prev.challengesDone : [...prev.challengesDone, day],
        xp: already ? prev.xp : prev.xp + 200,
        lastActiveDate: new Date().toDateString(),
        streak: calcStreak(prev),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetProgress = useCallback(() => {
    const fresh = { ...defaultProgress, startedAt: new Date().toDateString() };
    save(fresh);
  }, [save]);

  const getDayStatus = useCallback((day) => {
    const completed  = progress.completedDays.includes(day);
    const quizScore  = progress.quizScores[day];
    const challenged = progress.challengesDone.includes(day);
    return { completed, quizScore, challenged };
  }, [progress]);

  const totalXP      = progress.xp;
  const level        = Math.floor(totalXP / 500) + 1;
  const xpToNext     = 500 - (totalXP % 500);
  const progressPct  = Math.round((progress.completedDays.length / 10) * 100);
  const certified    = progress.completedDays.length === 10 &&
                       progress.challengesDone.length >= 8;

  return {
    progress,
    markDayComplete,
    saveQuizScore,
    markChallengeComplete,
    resetProgress,
    getDayStatus,
    totalXP,
    level,
    xpToNext,
    progressPct,
    certified,
  };
}
