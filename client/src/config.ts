export const config: Config = {
    apiUrl: __DEV__
        ? "http://localhost:8000/api/"
        : "https://api-lucive.onrender.com/api/",
    showUsernameLoginBlock: __DEV__ ? true : false,
    showLogoutButton: __DEV__ ? true : false,
    googleWebClientId:
        "961671637836-in67eg2cnfcs5ctag0ef6okfd8j6j9hb.apps.googleusercontent.com",
};

interface Config {
    apiUrl: string;
    showUsernameLoginBlock: boolean;
    showLogoutButton: boolean;
    googleWebClientId: string;
}
