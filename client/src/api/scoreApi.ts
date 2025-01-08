import { Remote } from "../types/api";
import { Score } from "../types/state";

export const createScoresApi = (remote: Remote) => {
    const { get } = remote;

    const getScoresData = (): Promise<Score[]> => {
        return get(`scores/retrieve-score`);
    };

    return { getScoresData };
};
