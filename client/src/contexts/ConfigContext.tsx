import React, { createContext, useContext, ReactNode } from 'react';

// Define the config types if needed
interface Config {
    apiUrl: string;
    showUsernameLoginBlock: boolean;
}

// Create the ConfigContext
export const ConfigContext = createContext<Config | undefined>(undefined);

// Define environment-specific values
const config: Config = {
    apiUrl: __DEV__ ? 'http://localhost:8000/api/' : 'http://localhost:8000/api/',
    showUsernameLoginBlock: __DEV__ ? true : false,
};

// ConfigProvider component
interface ConfigProviderProps {
    children: ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => (
    <ConfigContext.Provider value={config}>
        {children}
    </ConfigContext.Provider>
);