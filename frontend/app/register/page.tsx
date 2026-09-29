"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/AuthProvider";
import { getRedirectPath } from "@/lib/auth/auth";

export default function RegisterPage() {
    const router = useRouter();

    const {
        user,
        isAuthenticated,
        isLoading,
    } = useAuth();

    const [firstName, setFirstName] =
        useState("");

    const [lastName, setLastName] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [phone, setPhone] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
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

        if (
            password !==
            confirmPassword
        ) {
            setError(
                "As passwords não coincidem.",
            );
            return;
        }

        setIsSubmitting(true);

        try {
            // TODO:
            // Ligar ao endpoint de registo
            // quando tivermos o contrato do backend.

            console.log({
                firstName,
                lastName,
                email,
                phone,
                password,
            });

            router.push("/login");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Não foi possível criar a conta.",
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
                            Criar uma conta
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Cria a tua conta para poderes
                            fazer e acompanhar as tuas encomendas.
                        </p>

                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >

                        {/* Nome / Apelido */}

                        <div className="grid gap-4 sm:grid-cols-2">

                            <div>

                                <label
                                    htmlFor="firstName"
                                    className="mb-2 block text-sm font-medium text-[#374132]"
                                >
                                    Nome
                                </label>

                                <input
                                    id="firstName"
                                    type="text"
                                    value={
                                        firstName
                                    }
                                    onChange={(event) =>
                                        setFirstName(
                                            event.target.value,
                                        )
                                    }
                                    required
                                    autoComplete="given-name"
                                    placeholder="O teu nome"
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

                            <div>

                                <label
                                    htmlFor="lastName"
                                    className="mb-2 block text-sm font-medium text-[#374132]"
                                >
                                    Apelido
                                </label>

                                <input
                                    id="lastName"
                                    type="text"
                                    value={
                                        lastName
                                    }
                                    onChange={(event) =>
                                        setLastName(
                                            event.target.value,
                                        )
                                    }
                                    required
                                    autoComplete="family-name"
                                    placeholder="O teu apelido"
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

                        </div>

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

                        {/* Telefone */}

                        <div>

                            <label
                                htmlFor="phone"
                                className="mb-2 block text-sm font-medium text-[#374132]"
                            >
                                Telefone
                            </label>

                            <input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(event) =>
                                    setPhone(
                                        event.target.value,
                                    )
                                }
                                required
                                autoComplete="tel"
                                placeholder="912 345 678"
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

                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-[#374132]"
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
                                autoComplete="new-password"
                                placeholder="Cria uma password"
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

                        {/* Confirm Password */}

                        <div>

                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-medium text-[#374132]"
                            >
                                Confirmar password
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                value={
                                    confirmPassword
                                }
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value,
                                    )
                                }
                                required
                                autoComplete="new-password"
                                placeholder="Repete a tua password"
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
                                ? "A criar conta..."
                                : "Criar conta"}
                        </button>

                    </form>

                    {/* Login */}

                    <div className="mt-8 border-t border-gray-100 pt-7 text-center">

                        <p className="text-sm text-gray-500">
                            Já tens uma conta?
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/login",
                                )
                            }
                            className="mt-2 text-sm font-semibold text-[#55624A] transition hover:text-[#3F4B37]"
                        >
                            Iniciar sessão
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

