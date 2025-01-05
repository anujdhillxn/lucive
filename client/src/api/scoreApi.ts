import { Remote } from "../types/api";
import { IScoreData, Score } from "../types/state";

export const createScoresApi = (remote: Remote) => {
    const { get, post } = remote;

    const getScoresData = (): Promise<Score[]> => {
        return get(`scores/retrieve-score`);
    };

    const updateScores = (scores: Score[]): Promise<void> => {
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
