"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    apiFetch,
    setAccessToken,
} from "@/lib/api/client";

import type {
    AuthenticatedUser,
    LoginResponse,
} from "./types";

interface AuthContextValue {
    user: AuthenticatedUser | null;

    isAuthenticated: boolean;

    isLoading: boolean;

    login: (
        email: string,
        password: string,
    ) => Promise<AuthenticatedUser>;

    updateUser: (
        user: AuthenticatedUser,
    ) => void;

    logout: () => Promise<void>;
}

const AuthContext =
    createContext<AuthContextValue | undefined>(
        undefined,
    );

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] =
        useState<AuthenticatedUser | null>(
            null,
        );

    const [isLoading, setIsLoading] =
        useState(true);

    /* ====================================================================== */
    /* RESTORE SESSION                                                        */
    /* ====================================================================== */

    const restoreSession =
        useCallback(async () => {
            try {
                const response =
                    await apiFetch<LoginResponse>(
                        "/auth/refresh",
                        {
                            method: "POST",
                            skipRefresh: true,
                        },
                    );

                setAccessToken(
                    response.accessToken,
                );

                setUser(
                    response.user,
                );
            } catch {
                setAccessToken(null);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        }, []);

    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    /* ====================================================================== */
    /* LOGIN                                                                  */
    /* ====================================================================== */

    const login =
        useCallback(
            async (
                email: string,
                password: string,
            ) => {
                const response =
                    await apiFetch<LoginResponse>(
                        "/auth/login",
                        {
                            method: "POST",
                            body: JSON.stringify({
                                email,
                                password,
                            }),
                            skipRefresh: true,
                        },
                    );

                setAccessToken(
                    response.accessToken,
                );

                setUser(
                    response.user,
                );

                return response.user;
            },
            [],
        );

    /* ====================================================================== */
    /* UPDATE USER                                                             */
    /* ====================================================================== */

    const updateUser =
        useCallback(
            (
                updatedUser: AuthenticatedUser,
            ) => {
                setUser(
                    updatedUser,
                );
            },
            [],
        );

    /* ====================================================================== */
    /* LOGOUT                                                                 */
    /* ====================================================================== */

    const logout =
        useCallback(async () => {
            try {
                await apiFetch(
                    "/auth/logout",
                    {
                        method: "POST",
                        skipRefresh: true,
                    },
                );
            } finally {
                setAccessToken(null);
                setUser(null);
            }
        }, []);

    /* ====================================================================== */
    /* CONTEXT VALUE                                                           */
    /* ====================================================================== */

    const value =
        useMemo(
            () => ({
                user,
                isAuthenticated:
                    !!user,
                isLoading,
                login,
                updateUser,
                logout,
            }),
            [
                user,
                isLoading,
                login,
                updateUser,
                logout,
            ],
        );

    return (
        <AuthContext.Provider
            value={value}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context =
        useContext(
            AuthContext,
        );

    if (!context) {
        throw new Error(
            "useAuth deve ser utilizado dentro de um AuthProvider.",
        );
    }

    return context;
}