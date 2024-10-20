import { GetDuoResponse, Remote } from "../types/api";

export const createDuoApi = (remote: Remote) => {
    const { get, post, put, del } = remote;

    const getDuos = (): Promise<GetDuoResponse> => {
        return get("duos/duo-list");
    };

    const createDuo = (username: string) => {
        return post("duos/create-duo", { user2_username: username });
    };

    const confirmDuo = (username: string) => {
        return put("duos/confirm-duo", { user1_username: username });
    };

    const deleteDuo = (username: string) => {
        return del("duos/delete-duo", { with_user_name: username });
    };

    return { getDuos, createDuo, confirmDuo, deleteDuo };
};
