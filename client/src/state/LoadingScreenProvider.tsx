import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useAppContext } from '../hooks/useAppContext';

export const LoadingScreenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { loading } = useAppContext();
};