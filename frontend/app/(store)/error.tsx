"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function StoreError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return (
        <div className="min-h-[65vh] bg-[#F8F9F5] px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-xl rounded-[2rem] border border-[#E7EAE2] bg-white p-8 text-center shadow-[0_18px_55px_rgba(47,59,42,0.08)] sm:p-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9EDE8] text-[#A85F4D]"><AlertTriangle size={24} /></div>
                <h1 className="mt-6 text-2xl font-semibold text-[#2F3B2A]">Não foi possível abrir esta página</h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#7A8373]">Ocorreu um problema inesperado. Pode tentar novamente sem perder os artigos do carrinho.</p>
                <button type="button" onClick={reset} className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#55624A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#46523D]"><RefreshCw size={16} />Tentar novamente</button>
            </div>
        </div>
    );
}
