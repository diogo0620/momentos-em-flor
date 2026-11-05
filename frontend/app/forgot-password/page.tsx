"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

import { passwordRecoveryApi } from "@/lib/api/auth/password-recovery";
import { isValidEmail } from "@/lib/validation/auth";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    async function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);

        if (!isValidEmail(email)) {
            setError("Introduz um endereço de email válido.");
            return;
        }

        setSubmitting(true);
        try {
            await passwordRecoveryApi.forgotPassword(email.trim().toLowerCase());
            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Não foi possível enviar o email de recuperação.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#F7F8F4] px-6 py-12">
            <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_20px_60px_rgba(47,59,42,0.08)] sm:p-10">
                <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#55624A] text-xl text-white">✿</div>
                <h1 className="text-2xl font-semibold text-[#2F3B2A]">Recuperar password</h1>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                    Indica o email da tua conta. Enviaremos uma ligação para definires uma nova password.
                </p>

                {sent ? (
                    <div className="mt-7 space-y-5">
                        <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                            Se existir uma conta com este email, receberás uma ligação de recuperação. Verifica também a pasta de spam.
                        </div>
                        <Link href="/login" className="block text-center text-sm font-semibold text-[#55624A] hover:text-[#3F4B37]">
                            Voltar ao início de sessão
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={submit} className="mt-7 space-y-5" noValidate>
                        <label className="block text-sm font-medium text-[#374132]" htmlFor="email">
                            Email
                            <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="mt-2 w-full rounded-xl border border-gray-200 bg-[#FCFCFB] px-4 py-3.5 text-sm outline-none focus:border-[#879477] focus:ring-4 focus:ring-[#D6DEC8]/50" />
                        </label>
                        {error && <div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
                        <button type="submit" disabled={submitting} className="w-full rounded-xl bg-[#55624A] px-4 py-3.5 font-medium text-white hover:bg-[#48553E] disabled:opacity-60">
                            {submitting ? "A enviar..." : "Enviar ligação de recuperação"}
                        </button>
                        <Link href="/login" className="block text-center text-sm font-semibold text-[#55624A] hover:text-[#3F4B37]">Voltar</Link>
                    </form>
                )}
            </div>
        </main>
    );
}
