export type IntentSession = {
  pageViews: number;
  duration: number;   // seconds
  ctaClicks: number;
  returned: boolean;
};

export function calculateScore(s: IntentSession): number {
  let score = 0;

  if (s.pageViews >= 3) score += 10;
  if (s.duration >= 60) score += 5;
  if (s.ctaClicks > 0) score += 10;
  if (s.returned) score += 10;

  return score;
}
