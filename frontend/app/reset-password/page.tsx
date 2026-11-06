"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

import { passwordRecoveryApi } from "@/lib/api/auth/password-recovery";
import { PASSWORD_REQUIREMENTS, validateStrongPassword } from "@/lib/validation/auth";

export default function ResetPasswordPage() {
    const [token, setToken] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmation, setConfirmation] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setToken(new URLSearchParams(window.location.search).get("token"));
    }, []);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (!token) {
            setError("A ligação de recuperação é inválida ou está incompleta.");
            return;
        }
        const passwordError = validateStrongPassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }
        if (newPassword !== confirmation) {
            setError("As passwords não coincidem.");
            return;
        }

        setSubmitting(true);
        try {
            await passwordRecoveryApi.resetPassword(token, newPassword);
            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível alterar a password.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7F8F4] px-6 py-12">
            <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_20px_60px_rgba(47,59,42,0.08)] sm:p-10">
                <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#55624A] text-xl text-white">✿</div>
                <h1 className="text-2xl font-semibold text-[#2F3B2A]">Definir nova password</h1>
                <p className="mt-2 text-sm leading-6 text-gray-500">{PASSWORD_REQUIREMENTS}</p>

                {success ? (
                    <div className="mt-7 space-y-5">
                        <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">A password foi alterada com sucesso.</div>
                        <Link href="/login?passwordReset=1" className="block rounded-xl bg-[#55624A] px-4 py-3.5 text-center font-medium text-white hover:bg-[#48553E]">Iniciar sessão</Link>
                    </div>
                ) : (
                    <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
                        <label className="block text-sm font-medium text-[#374132]">Nova password
                            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required className="mt-2 w-full rounded-xl border border-gray-200 bg-[#FCFCFB] px-4 py-3.5 text-sm outline-none focus:border-[#879477] focus:ring-4 focus:ring-[#D6DEC8]/50" />
                        </label>
                        <label className="block text-sm font-medium text-[#374132]">Confirmar nova password
                            <input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" required className="mt-2 w-full rounded-xl border border-gray-200 bg-[#FCFCFB] px-4 py-3.5 text-sm outline-none focus:border-[#879477] focus:ring-4 focus:ring-[#D6DEC8]/50" />
                        </label>
                        {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
                        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[#55624A] px-4 py-3.5 font-medium text-white hover:bg-[#48553E] disabled:opacity-60">{submitting ? "A guardar..." : "Guardar nova password"}</button>
                        <Link href="/login" className="block text-center text-sm font-semibold text-[#55624A] hover:text-[#3F4B37]">Voltar</Link>
                    </form>
                )}
            </div>
        </main>
    );
}
