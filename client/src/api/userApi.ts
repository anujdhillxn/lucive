import { ILoginArgs, IRegisterArgs, Remote } from "../types/api";

export const createUserApi = (remote: Remote) => {
    const { get, post, put } = remote;

    const register = (userData: IRegisterArgs) => {
        return post("users/register", userData);
    };

    const login = (credentials: ILoginArgs) => {
        return post("users/login", credentials);
    };

    const googleLogin = (token: string) => {
        return post("users/auth/google", { access_token: token });
    };

    const getUser = () => {
        return get("users/me/");
    };

    const logout = () => {
        return post("users/logout");
    };

    const changeUsername = (newUsername: string) => {
        return put("users/change-username", { new_username: newUsername });
    };

    return { register, login, googleLogin, getUser, logout, changeUsername };
};
