import { Remote } from "../types/api";
import { Word } from "../types/content";

export const createContentApi = (remote: Remote) => {
    const { get } = remote;

    const getWords = (count: number): Promise<Word[]> => {
        return get("content/random-words?n=" + count);
    };

    return { getWords };
};
