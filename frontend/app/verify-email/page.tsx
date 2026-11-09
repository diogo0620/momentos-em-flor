"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Mail, XCircle } from "lucide-react";
import { publicUsersApi } from "@/lib/api/users/public-users";

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const email = searchParams.get("email") ?? "";
    const [status, setStatus] = useState<"waiting" | "loading" | "success" | "error">(token ? "loading" : "waiting");
    const [message, setMessage] = useState(token ? "A confirmar o seu email..." : "Enviámos uma ligação de confirmação para o seu email.");
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!token) return;
        publicUsersApi.verifyEmail(token)
            .then(() => { setStatus("success"); setMessage("O seu email foi confirmado. Já pode iniciar sessão."); })
            .catch((error) => { setStatus("error"); setMessage(error instanceof Error ? error.message : "Não foi possível confirmar o email."); });
    }, [token]);

    async function resend() {
        if (!email) return;
        try {
            setResending(true);
            await publicUsersApi.resendVerification(email);
            setMessage("Enviámos uma nova ligação de confirmação.");
            setStatus("waiting");
        } finally { setResending(false); }
    }

    const Icon = status === "success" ? CheckCircle2 : status === "error" ? XCircle : Mail;
    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f5f6f2] px-4">
            <section className="w-full max-w-md rounded-3xl border border-[#e1e5df] bg-white p-8 text-center shadow-sm">
                <Icon className={`mx-auto ${status === "success" ? "text-green-700" : status === "error" ? "text-red-700" : "text-[#52705d]"}`} size={36} />
                <h1 className="mt-5 text-2xl font-semibold text-[#203128]">Confirmar email</h1>
                <p className="mt-3 text-sm leading-6 text-[#6d776f]">{message}</p>
                {status === "success" && <Link href="/login" className="mt-6 inline-flex rounded-xl bg-[#26392f] px-5 py-3 text-sm font-semibold text-white">Iniciar sessão</Link>}
                {!token && email && <button type="button" onClick={() => void resend()} disabled={resending} className="mt-6 rounded-xl border border-[#dfe4dc] px-5 py-3 text-sm font-semibold text-[#304139] disabled:opacity-50">{resending ? "A enviar..." : "Reenviar email"}</button>}
                {status === "error" && <Link href="/register" className="mt-6 block text-sm font-semibold text-[#42604d]">Voltar ao registo</Link>}
            </section>
        </main>
    );
}

export default function VerifyEmailPage() {
    return <Suspense fallback={<main className="flex min-h-screen items-center justify-center">A carregar...</main>}><VerifyEmailContent /></Suspense>;
}
