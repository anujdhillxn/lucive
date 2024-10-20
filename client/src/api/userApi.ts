import { ILoginArgs, IRegisterArgs, Remote } from "../types/api";

export const createUserApi = (remote: Remote) => {
    const { get, post } = remote;

    const register = (userData: IRegisterArgs) => {
        return post("users/register", userData);
    };

    const login = (credentials: ILoginArgs) => {
        return post("users/login", credentials);
    };

    const getUser = () => {
        return get("users/me/");
    };

    const logout = () => {
        return post("users/logout");
    };
    return { register, login, getUser, logout };
};
