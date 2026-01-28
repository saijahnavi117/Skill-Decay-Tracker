export function calculateDecayedScore(
  initialScore: number,
  decayRate: number,
  daysSinceLastPractice: number
): number {
  const decayedScore = initialScore * Math.exp(-decayRate * daysSinceLastPractice);
  return Math.max(0, Math.min(100, decayedScore));
}

export function getDaysSince(date: string): number {
  const past = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - past.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function getSkillFreshnessLevel(score: number): {
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  color: string;
  bgColor: string;
  label: string;
} {
  if (score >= 90) {
    return {
      level: 'excellent',
      color: 'text-green-700',
      bgColor: 'bg-green-50 border-green-200',
      label: 'Excellent',
    };
  } else if (score >= 70) {
    return {
      level: 'good',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-200',
      label: 'Good',
    };
  } else if (score >= 50) {
    return {
      level: 'fair',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50 border-yellow-200',
      label: 'Fair',
    };
  } else if (score >= 30) {
    return {
      level: 'poor',
      color: 'text-orange-700',
      bgColor: 'bg-orange-50 border-orange-200',
      label: 'Poor',
    };
  } else {
    return {
      level: 'critical',
      color: 'text-red-700',
      bgColor: 'bg-red-50 border-red-200',
      label: 'Critical',
    };
  }
}

export function calculateBoostFromActivity(
  durationMinutes: number,
  difficulty: number
): number {
  const baseBoost = Math.min(durationMinutes / 10, 10);
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.2;
  return baseBoost * difficultyMultiplier;
}

export function predictDaysUntilDecay(
  currentScore: number,
  targetScore: number,
  decayRate: number
): number {
  if (currentScore <= targetScore) return 0;
  const days = Math.log(targetScore / currentScore) / -decayRate;
  return Math.max(0, Math.round(days));
}

export function generateDecayCurveData(
  initialScore: number,
  decayRate: number,
  days: number
): { day: number; score: number }[] {
  const data = [];
  for (let day = 0; day <= days; day++) {
    const score = calculateDecayedScore(initialScore, decayRate, day);
    data.push({ day, score });
  }
  return data;
}
