"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/AuthProvider";
import { getRedirectPath } from "@/lib/auth/auth";

export default function LoginPage() {
    const router = useRouter();

    const {
        user,
        isAuthenticated,
        isLoading,
        login,
    } = useAuth();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [error, setError] =
        useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    useEffect(() => {
        if (
            !isLoading &&
            isAuthenticated &&
            user
        ) {
            router.replace(
                getRedirectPath(user),
            );
        }
    }, [
        isLoading,
        isAuthenticated,
        user,
        router,
    ]);

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);
        setIsSubmitting(true);

        try {
            const authenticatedUser =
                await login(
                    email,
                    password,
                );

            router.replace(
                getRedirectPath(
                    authenticatedUser,
                ),
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível iniciar sessão.",
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F7F8F4]">
                <div className="text-sm text-gray-500">
                    A carregar...
                </div>
            </main>
        );
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7F8F4] px-6">
            <div className="w-full max-w-md">

                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-[#55624A]">
                        Momentos em Flor
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Inicia sessão na tua conta
                    </p>
                </div>

                <div className="rounded-3xl bg-white p-8 shadow-sm">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value,
                                    )
                                }
                                required
                                autoComplete="email"
                                placeholder="O teu email"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#55624A] focus:ring-2 focus:ring-[#D6DEC8]"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value,
                                    )
                                }
                                required
                                autoComplete="current-password"
                                placeholder="A tua password"
                                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#55624A] focus:ring-2 focus:ring-[#D6DEC8]"
                            />
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-[#55624A] px-4 py-3 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting
                                ? "A iniciar sessão..."
                                : "Iniciar sessão"}
                        </button>

                    </form>

                </div>

            </div>
        </main>
    );
}