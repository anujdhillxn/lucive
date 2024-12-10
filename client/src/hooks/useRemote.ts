import { useState, useCallback, useEffect } from "react";
import { Remote } from "../types/api";

interface RequestOptions {
    method: string;
    headers?: HeadersInit;
    body?: any;
}

const useRemote = (
    requestToken: string | null | undefined,
    baseUrl: string
): Remote => {
    const request = useCallback(
        async (endpoint: string, options: RequestOptions) => {
            const headers = new Headers(options.headers);
            if (requestToken) {
                headers.set("Authorization", `Token ${requestToken}`);
            }
            headers.set("Content-Type", "application/json");
            try {
                const response = await fetch(`${baseUrl}${endpoint}`, {
                    ...options,
                    headers,
                });
                if (!response.ok) {
                    throw new Error(
                        `HTTP error! status: ${response.status} ${response.statusText}`
                    );
                }
                const text = await response.text();
                const data = text ? JSON.parse(text) : {};
                return data;
            } catch (err: any) {
                throw err;
            }
        },
        [baseUrl, requestToken]
    );

    const get = useCallback(
        (endpoint: string, headers?: HeadersInit) => {
            return request(endpoint, { method: "GET", headers });
        },
        [request]
    );

    const post = useCallback(
        (endpoint: string, body: any, headers?: HeadersInit) => {
            return request(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...headers },
                body: JSON.stringify(body),
            });
        },
        [request]
    );

    const put = useCallback(
        (endpoint: string, body: any, headers?: HeadersInit) => {
            return request(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json", ...headers },
                body: JSON.stringify(body),
            });
        },
        [request]
    );

    const del = useCallback(
        (endpoint: string, body: any, headers?: HeadersInit) => {
            return request(endpoint, {
                method: "DELETE",
                headers,
                body: JSON.stringify(body),
            });
        },
        [request]
    );

    return { get, post, put, del };
};

export default useRemote;
