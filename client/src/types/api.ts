import { createContentApi } from "../api/contentApi";
import { createDuoApi } from "../api/duoApi";
import { createRuleApi } from "../api/ruleApi";
import { createUserApi } from "../api/userApi";
import { Duo } from "./state";

export type Remote = {
    get: (endpoint: string, headers?: HeadersInit) => Promise<any>;
    post: (endpoint: string, body?: any, headers?: HeadersInit) => Promise<any>;
    put: (endpoint: string, body: any, headers?: HeadersInit) => Promise<any>;
    del: (endpoint: string, body?: any, headers?: HeadersInit) => Promise<any>;
};

export interface IApiResponse<T> {
    data: T;
    message: string;
}

export type ApiContextType = {
    api: IApi;
    requestToken: string | null;
    setRequestToken: React.Dispatch<
        React.SetStateAction<string | null | undefined>
    >;
};

export interface IApi {
    userApi: ReturnType<typeof createUserApi>;
    duoApi: ReturnType<typeof createDuoApi>;
    ruleApi: ReturnType<typeof createRuleApi>;
    contentApi: ReturnType<typeof createContentApi>;
}

export interface IRegisterArgs {
    username: string;
    password: string;
    email: string;
}

export interface IRegisterResponse {
    token: string;
}

export interface ILoginArgs {
    identifier: string;
    password: string;
}

export interface ILoginResponse {
    token: string;
}

export interface IUserResponse {
    username: string;
    email: string;
}
