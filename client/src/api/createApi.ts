import { createDuoApi } from "./duoApi";
import { createRuleApi } from "./ruleApi";
import { createUserApi } from "./userApi";
import { IApi, Remote } from "../types/api";
import { createContentApi } from "./contentApi";

export const createApi = (remote: Remote): IApi => {
    const userApi = createUserApi(remote);
    const duoApi = createDuoApi(remote);
    const ruleApi = createRuleApi(remote);
    const contentApi = createContentApi(remote);
    return { userApi, duoApi, ruleApi, contentApi };
};
