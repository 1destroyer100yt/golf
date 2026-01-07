// Types
export interface SchedulerData {
  players: string[];
  weeks: string[];
  availability: Record<string, string[]>;
  aggregateWeeks: Set<string>;
  preferredPairs: Map<string, number>;
  forbiddenPairs: Set<string>;
  objectives: {
    UNIQUE_PAIRINGS: number;
    MINIMIZE_SITOUTS: number;
    PREFERRED_PAIRS: number;
    MAX_PAIR_REPEATS: number;
  };
}

export interface Pairing {
  a?: string;
  b?: string;
  sitout?: string;
}

export interface ScheduleResult {
  schedule: Record<string, Pairing[]>;
  pairCounts: Map<string, number>;
  sitOuts: Map<string, number>;
  weeklyPairings: Map<string, Pairing[]>;
  scoreResult?: ScoreResult;
}

export interface ScoreResult {
  score: number;
  stats: {
    uniquePairs: number;
    totalSitouts: number;
    preferredUsed: number;
    pairRepeats: number;
  };
}

const CONFIG = {
  objectives: {
    UNIQUE_PAIRINGS: 8,
    MINIMIZE_SITOUTS: 6,
    PREFERRED_PAIRS: 7,
    MAX_PAIR_REPEATS: 3
  },
  penalties: {
    PREFERRED_PAIR_VIOLATION: 50,
    FORBIDDEN_PAIR_VIOLATION: 100,
    MAX_SITOUTS_PER_PLAYER: 10,
    UNBALANCED_PAIRINGS: 5
  }
};

export function parseData(text: string): SchedulerData {
  const lines = text.split('\n').map(l => l.trim());
  let section = '';
  const players: string[] = [];
  const weeks: string[] = [];
  const availability: Record<string, string[]> = {};
  const aggregateWeeks = new Set<string>();
  const preferredPairs = new Map<string, number>();
  const forbiddenPairs = new Set<string>();
  const objectives = { ...CONFIG.objectives };

  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;

    if (line.endsWith(':')) {
      section = line.slice(0, -1).toUpperCase();
      continue;
    }

    switch (section) {
      case 'PLAYERS':
        if (line) players.push(line);
        break;

      case 'WEEKS':
        if (line && !isNaN(Number(line))) weeks.push(line);
        break;

      case 'AGGREGATE_WEEKS':
        if (line && !isNaN(Number(line))) aggregateWeeks.add(line);
        break;

      case 'PREFERRED_PAIRS':
        if (line.includes(',')) {
          const parts = line.split(',').map(p => p.trim());
          if (parts.length >= 3) {
            const key = [parts[0], parts[1]].sort().join('|');
            preferredPairs.set(key, parseInt(parts[2]));
          }
        }
        break;

      case 'FORBIDDEN_PAIRS':
        if (line.includes(',')) {
          const parts = line.split(',').map(p => p.trim());
          if (parts.length >= 2) {
            forbiddenPairs.add([parts[0], parts[1]].sort().join('|'));
          }
        }
        break;

      case 'AVAILABILITY':
        if (line.includes(':')) {
          const [week, playerList] = line.split(':').map(p => p.trim());
          availability[week] = playerList.split(',').map(p => p.trim()).filter(p => p);
        }
        break;

      case 'OBJECTIVES':
        if (line.includes(':')) {
          const [key, value] = line.split(':').map(p => p.trim());
          if (key in objectives) {
            (objectives as Record<string, number>)[key] = Math.min(10, Math.max(1, parseInt(value) || (objectives as Record<string, number>)[key]));
          }
        }
        break;
    }
  }

  if (players.length === 0) throw new Error('No players specified');
  if (weeks.length === 0) throw new Error('No weeks specified');

  return {
    players,
    weeks,
    availability,
    aggregateWeeks,
    preferredPairs,
    forbiddenPairs,
    objectives
  };
}

export function buildSchedule(data: SchedulerData): ScheduleResult {
  const schedule: Record<string, Pairing[]> = {};
  const pairCounts = new Map<string, number>();
  const sitOuts = new Map<string, number>();
  const weeklyPairings = new Map<string, Pairing[]>();

  data.players.forEach(p => sitOuts.set(p, 0));

  for (const week of data.weeks) {
    const available = [...(data.availability[week] || [])];
    if (available.length === 0) continue;

    const pairings: Pairing[] = [];
    const shuffled = [...available].sort(() => Math.random() - 0.5);

    const paired = new Set<string>();
    for (let i = 0; i < shuffled.length; i++) {
      if (paired.has(shuffled[i])) continue;

      let bestPartner: number | null = null;
      let bestScore = -Infinity;

      for (let j = i + 1; j < shuffled.length; j++) {
        if (paired.has(shuffled[j])) continue;

        const a = shuffled[i];
        const b = shuffled[j];
        const key = [a, b].sort().join('|');

        if (data.forbiddenPairs.has(key)) continue;

        let score = 0;
        const currentCount = pairCounts.get(key) || 0;

        if (currentCount === 0) score += 10;

        const preferredLimit = data.preferredPairs.get(key);
        if (preferredLimit && currentCount < preferredLimit) {
          score += 5;
        }

        if (currentCount > 0) score -= currentCount * 3;

        if (score > bestScore) {
          bestScore = score;
          bestPartner = j;
        }
      }

      if (bestPartner !== null) {
        const a = shuffled[i];
        const b = shuffled[bestPartner];
        const key = [a, b].sort().join('|');

        pairings.push({ a, b });
        paired.add(a);
        paired.add(b);
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      }
    }

    const unpaired = shuffled.filter(p => !paired.has(p));
    unpaired.forEach(p => {
      pairings.push({ sitout: p });
      sitOuts.set(p, (sitOuts.get(p) || 0) + 1);
    });

    schedule[week] = pairings;
    weeklyPairings.set(week, pairings);
  }

  return {
    schedule,
    pairCounts,
    sitOuts,
    weeklyPairings
  };
}

export function calculateScore(data: SchedulerData, schedule: ScheduleResult): ScoreResult {
  let score = 0;
  const { pairCounts, sitOuts } = schedule;

  let uniquePairs = 0;
  pairCounts.forEach((count) => {
    if (count === 1) {
      score += data.objectives.UNIQUE_PAIRINGS * 2;
      uniquePairs++;
    } else if (count === 2) {
      score += data.objectives.UNIQUE_PAIRINGS;
    } else {
      score -= (count - 2) * data.objectives.MAX_PAIR_REPEATS;
    }
  });

  let totalSitouts = 0;
  sitOuts.forEach((count) => {
    totalSitouts += count;
    if (count === 0) {
      score += data.objectives.MINIMIZE_SITOUTS;
    } else if (count === 1) {
      score += data.objectives.MINIMIZE_SITOUTS / 2;
    } else {
      score -= (count - 1) * data.objectives.MINIMIZE_SITOUTS;
    }
  });

  let preferredUsed = 0;
  data.preferredPairs.forEach((limit, key) => {
    const count = pairCounts.get(key) || 0;
    if (count > 0 && count <= limit) {
      score += data.objectives.PREFERRED_PAIRS * (limit - count + 1);
      preferredUsed += count;
    } else if (count > limit) {
      score -= (count - limit) * CONFIG.penalties.PREFERRED_PAIR_VIOLATION;
    }
  });

  data.forbiddenPairs.forEach(key => {
    const count = pairCounts.get(key) || 0;
    if (count > 0) {
      score -= count * CONFIG.penalties.FORBIDDEN_PAIR_VIOLATION;
    }
  });

  const sitoutValues = Array.from(sitOuts.values());
  const maxSitouts = Math.max(...sitoutValues);
  const minSitouts = Math.min(...sitoutValues);
  if (maxSitouts - minSitouts > 2) {
    score -= (maxSitouts - minSitouts) * CONFIG.penalties.UNBALANCED_PAIRINGS;
  }

  return {
    score: Math.round(score),
    stats: {
      uniquePairs,
      totalSitouts,
      preferredUsed,
      pairRepeats: Array.from(pairCounts.values()).reduce((a, b) => a + Math.max(0, b - 1), 0)
    }
  };
}

export async function generateOptimalSchedule(
  data: SchedulerData,
  iterations: number,
  onProgress?: (progress: number) => void
): Promise<ScheduleResult> {
  let bestScore = -Infinity;
  let bestSchedule: ScheduleResult | null = null;

  const chunkSize = 100;
  const totalChunks = Math.ceil(iterations / chunkSize);

  for (let chunk = 0; chunk < totalChunks; chunk++) {
    const progress = ((chunk + 1) / totalChunks) * 100;
    onProgress?.(progress);

    for (let i = 0; i < chunkSize; i++) {
      const schedule = buildSchedule(data);
      const result = calculateScore(data, schedule);

      if (result.score > bestScore) {
        bestScore = result.score;
        bestSchedule = { ...schedule, scoreResult: result };
      }
    }

    await new Promise(resolve => setTimeout(resolve, 0));
  }

  if (!bestSchedule) {
    throw new Error('Failed to generate schedule');
  }

  return bestSchedule;
}

export const EXAMPLE_CONFIG = `# Golf Group Scheduler Configuration
# Format your data below:

PLAYERS:
Scott
Mark
GaryS
Greg
Ken
Bob
Chris
Dave

WEEKS:
1
2
3
4
5
6

AGGREGATE_WEEKS:
2
4
6

PREFERRED_PAIRS:
# Format: Player1,Player2,MaxTimesTogether
Scott,Mark,2
GaryS,Greg,3

FORBIDDEN_PAIRS:
# Players who should NOT be paired
Scott,Greg

AVAILABILITY:
# Format: Week:CommaSeparatedPlayers
1:Scott,Mark,GaryS,Greg,Bob,Chris
2:Scott,Mark,Ken,Bob,Dave
3:Scott,GaryS,Ken,Bob,Chris,Dave
4:Scott,Mark,Greg,Ken,Dave
5:Scott,Mark,GaryS,Ken,Bob,Chris
6:GaryS,Greg,Ken,Bob,Dave

OBJECTIVES:
# Weights for optimization (1-10)
UNIQUE_PAIRINGS: 8
MINIMIZE_SITOUTS: 6
PREFERRED_PAIRS: 7
MAX_PAIR_REPEATS: 3`;
