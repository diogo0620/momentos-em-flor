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
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F7F8F4] px-6 py-12">

            {/* Decorative background */}

            <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-[#D6DEC8] opacity-40 blur-3xl" />

            <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-[#E7EBDD] opacity-60 blur-3xl" />

            <div className="relative w-full max-w-md">

                {/* Branding */}

                <div className="mb-8 text-center">

                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#55624A] shadow-sm">
                        <span className="text-2xl text-white">
                            ✿
                        </span>
                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-[#2F3B2A]">
                        Momentos em Flor
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Flores que tornam cada momento especial.
                    </p>

                </div>

                {/* Card */}

                <div className="rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_20px_60px_rgba(47,59,42,0.08)] sm:p-10">

                    <div className="mb-8">

                        <h2 className="text-2xl font-semibold text-[#2F3B2A]">
                            Bem-vindo de volta
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Inicia sessão para continuares
                            a tua experiência no Momentos em Flor.
                        </p>

                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Email */}

                        <div>

                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-[#374132]"
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
                                placeholder="exemplo@email.com"
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-[#FCFCFB]
                                    px-4
                                    py-3.5
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:border-[#879477]
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-[#D6DEC8]/50
                                "
                            />

                        </div>

                        {/* Password */}

                        <div>

                            <div className="mb-2 flex items-center justify-between">

                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-[#374132]"
                                >
                                    Password
                                </label>

                                <button
                                    type="button"
                                    className="text-xs font-medium text-[#6B795F] transition hover:text-[#55624A]"
                                    onClick={() => {}}
                                >
                                    Esqueceste-te da password?
                                </button>

                            </div>

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
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-gray-200
                                    bg-[#FCFCFB]
                                    px-4
                                    py-3.5
                                    text-sm
                                    text-gray-800
                                    outline-none
                                    transition
                                    placeholder:text-gray-400
                                    focus:border-[#879477]
                                    focus:bg-white
                                    focus:ring-4
                                    focus:ring-[#D6DEC8]/50
                                "
                            />

                        </div>

                        {/* Error */}

                        {error && (
                            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3.5 text-sm leading-5 text-red-600">
                                {error}
                            </div>
                        )}

                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="
                                w-full
                                rounded-xl
                                bg-[#55624A]
                                px-4
                                py-3.5
                                font-medium
                                text-white
                                shadow-sm
                                transition
                                hover:bg-[#48553E]
                                hover:shadow-md
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >
                            {isSubmitting
                                ? "A iniciar sessão..."
                                : "Iniciar sessão"}
                        </button>

                    </form>

                    {/* Register */}

                    <div className="mt-8 border-t border-gray-100 pt-7 text-center">

                        <p className="text-sm text-gray-500">
                            Ainda não tens conta?
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/register",
                                )
                            }
                            className="mt-2 text-sm font-semibold text-[#55624A] transition hover:text-[#3F4B37]"
                        >
                            Criar uma conta
                        </button>

                    </div>

                </div>

                <p className="mt-8 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} Momentos em Flor
                </p>

            </div>

        </main>
    );
}

