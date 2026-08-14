"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

import { changePassword } from "@/lib/api/users";

export default function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showCurrent, setShowCurrent] =
        useState(false);

    const [showNew, setShowNew] =
        useState(false);

    const [showConfirm, setShowConfirm] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [success, setSuccess] =
        useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault();

        setError(null);
        setSuccess(false);

        if (!currentPassword) {
            setError(
                "Introduza a sua password atual.",
            );
            return;
        }

        if (newPassword.length < 8) {
            setError(
                "A nova password deve ter pelo menos 8 caracteres.",
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(
                "As passwords não coincidem.",
            );
            return;
        }

        if (currentPassword === newPassword) {
            setError(
                "A nova password deve ser diferente da atual.",
            );
            return;
        }

        try {
            setLoading(true);

            await changePassword({
                currentPassword,
                newPassword,
            });

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

            setSuccess(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível alterar a password.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
        >
            {/* PASSWORD ATUAL */}

            <div>
                <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Password atual
                </label>

                <div className="relative">

                    <Lock
                        size={18}
                        className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-gray-400
                        "
                    />

                    <input
                        id="currentPassword"
                        type={
                            showCurrent
                                ? "text"
                                : "password"
                        }
                        value={currentPassword}
                        onChange={(event) =>
                            setCurrentPassword(
                                event.target.value,
                            )
                        }
                        autoComplete="current-password"
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            py-3
                            pl-11
                            pr-12
                            outline-none
                            transition
                            focus:border-[#55624A]
                            focus:ring-4
                            focus:ring-[#55624A]/10
                        "
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowCurrent(
                                (value) => !value,
                            )
                        }
                        className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            rounded-lg
                            p-2
                            text-gray-400
                            transition
                            hover:bg-gray-100
                            hover:text-gray-600
                        "
                        aria-label={
                            showCurrent
                                ? "Esconder password"
                                : "Mostrar password"
                        }
                    >
                        {showCurrent ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>

                </div>
            </div>

            {/* NOVA PASSWORD */}

            <div>
                <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Nova password
                </label>

                <div className="relative">

                    <Lock
                        size={18}
                        className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-gray-400
                        "
                    />

                    <input
                        id="newPassword"
                        type={
                            showNew
                                ? "text"
                                : "password"
                        }
                        value={newPassword}
                        onChange={(event) =>
                            setNewPassword(
                                event.target.value,
                            )
                        }
                        autoComplete="new-password"
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            py-3
                            pl-11
                            pr-12
                            outline-none
                            transition
                            focus:border-[#55624A]
                            focus:ring-4
                            focus:ring-[#55624A]/10
                        "
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowNew(
                                (value) => !value,
                            )
                        }
                        className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            rounded-lg
                            p-2
                            text-gray-400
                            transition
                            hover:bg-gray-100
                            hover:text-gray-600
                        "
                        aria-label={
                            showNew
                                ? "Esconder password"
                                : "Mostrar password"
                        }
                    >
                        {showNew ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>

                </div>

                <p className="mt-2 text-xs text-gray-400">
                    Mínimo de 8 caracteres.
                </p>
            </div>

            {/* CONFIRMAR */}

            <div>
                <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Confirmar nova password
                </label>

                <div className="relative">

                    <Lock
                        size={18}
                        className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-gray-400
                        "
                    />

                    <input
                        id="confirmPassword"
                        type={
                            showConfirm
                                ? "text"
                                : "password"
                        }
                        value={confirmPassword}
                        onChange={(event) =>
                            setConfirmPassword(
                                event.target.value,
                            )
                        }
                        autoComplete="new-password"
                        className="
                            w-full
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            py-3
                            pl-11
                            pr-12
                            outline-none
                            transition
                            focus:border-[#55624A]
                            focus:ring-4
                            focus:ring-[#55624A]/10
                        "
                    />

                    <button
                        type="button"
                        onClick={() =>
                            setShowConfirm(
                                (value) => !value,
                            )
                        }
                        className="
                            absolute
                            right-3
                            top-1/2
                            -translate-y-1/2
                            rounded-lg
                            p-2
                            text-gray-400
                            transition
                            hover:bg-gray-100
                            hover:text-gray-600
                        "
                        aria-label={
                            showConfirm
                                ? "Esconder password"
                                : "Mostrar password"
                        }
                    >
                        {showConfirm ? (
                            <EyeOff size={18} />
                        ) : (
                            <Eye size={18} />
                        )}
                    </button>

                </div>
            </div>

            {/* ERROR */}

            {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* SUCCESS */}

            {success && (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    Password alterada com sucesso.
                </div>
            )}

            {/* SUBMIT */}

            <button
                type="submit"
                disabled={loading}
                className="
                    w-full
                    rounded-2xl
                    bg-[#55624A]
                    px-5
                    py-3.5
                    font-medium
                    text-white
                    transition
                    hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                "
            >
                {loading
                    ? "A alterar..."
                    : "Alterar password"}
            </button>
        </form>
    );
}