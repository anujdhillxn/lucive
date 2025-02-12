import { IGetDuoResponse, Remote } from "../types/api";
import { Duo } from "../types/state";

export const createDuoApi = (remote: Remote) => {
    const { get, post, put, del } = remote;

    const getDuo = (): Promise<IGetDuoResponse> => {
        return get("duos/get-duo");
    };

    const createDuo = (invitationToken: string) => {
        return post("duos/create-duo", { invitation_token: invitationToken });
    };

    const deleteDuo = () => {
        return del("duos/delete-duo");
    };

    return { getDuo, createDuo, deleteDuo };
};
