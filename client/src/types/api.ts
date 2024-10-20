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

export type ApiContextType = {
    api: IApi;
    requestToken: string | null;
    setRequestToken: React.Dispatch<React.SetStateAction<string | null>>;
};

export interface IApi {
    userApi: ReturnType<typeof createUserApi>;
    duoApi: ReturnType<typeof createDuoApi>;
    ruleApi: ReturnType<typeof createRuleApi>;
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

export type GetDuoResponse = {
    myDuo: Duo[];
    requestsSent: Duo[];
    requestsReceived: Duo[];
};
