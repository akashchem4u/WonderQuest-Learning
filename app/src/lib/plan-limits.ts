export type Plan = "free" | "family" | "family_plus";

export const PLAN_LIMITS = {
  free:        { maxChildren: 1, sessionsPerDay: 3, aiQuestions: false, weeklyDigest: false },
  family:      { maxChildren: 2, sessionsPerDay: Infinity, aiQuestions: true,  weeklyDigest: true },
  family_plus: { maxChildren: 5, sessionsPerDay: Infinity, aiQuestions: true,  weeklyDigest: true },
} as const;

export function getLimits(plan: Plan) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export function canAddChild(plan: Plan, currentChildCount: number): boolean {
  return currentChildCount < getLimits(plan).maxChildren;
}

export function canPlaySession(plan: Plan, sessionsToday: number): boolean {
  const limit = getLimits(plan).sessionsPerDay;
  return limit === Infinity || sessionsToday < limit;
}
