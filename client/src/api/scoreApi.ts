import { Remote } from "../types/api";
import { IScoreData, Score } from "../types/state";

export const createScoresApi = (remote: Remote) => {
    const { get, post } = remote;

    const getScoresData = (
        startDate: string,
        endDate: string
    ): Promise<Record<string, Score>> => {
        return get(
            `scores/retrieve-score?start_date=${startDate}&end_date=${endDate}`
        );
    };

    const updateScores = (scores: Score[]): Promise<IScoreData> => {
        return post(
            "scores/update-score",
            scores.map((score) => ({
                date: score.date,
                value: score.points,
                uninterrupted_tracking: score.uninterruptedTracking,
            }))
        );
    };

    return { getScoresData, updateScores };
};
