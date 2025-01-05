import { IScoreDataAgg, Score } from "../types/state";

export const getStreaks = (scores: Score[]): IScoreDataAgg => {
    let currentStreak = 0;
    let longestStreak = 0;
    let lastScore: Score | null = null;
    for (const score of scores) {
        if (score.uninterruptedTracking) {
            if (lastScore && isConsecutiveDays(lastScore.date, score.date)) {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
            }
            lastScore = score;
        } else {
            currentStreak = 0;
        }
    }
    return { currentStreak, longestStreak };
};

export const isConsecutiveDays = (date1: string, date2: string): boolean => {
    const day1 = new Date(date1);
    const day2 = new Date(date2);
    const diff = Math.abs(day1.getTime() - day2.getTime());
    return diff === 86400000;
};
