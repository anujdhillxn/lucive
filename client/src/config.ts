export const config: Config = {
    apiUrl: __DEV__
        ? "http://localhost:8000/api/"
        : "https://api-lucive.onrender.com/api/",
    showUsernameLoginBlock: __DEV__ ? true : false,
    showLogoutButton: __DEV__ ? true : false,
};

interface Config {
    apiUrl: string;
    showUsernameLoginBlock: boolean;
    showLogoutButton: boolean;
}
