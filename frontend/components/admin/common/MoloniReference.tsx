import Link from "next/link";

export default function MoloniReference({ id }: { id?: string | null }) {
    return <aside className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dce3d5] bg-[#f4f7ef] p-5">
        <div><h2 className="font-semibold text-[#35412f]">Associação à Moloni</h2>
            <p className="mt-1 text-sm text-[#657456]">{id ? `ID Moloni: ${id} · Reutilizado automaticamente na faturação.` : "Ainda sem ID Moloni. A associação é criada automaticamente na primeira faturação."}</p></div>
        <Link href="/admin/fiscal-documents" className="text-sm font-semibold text-[#35412f] underline underline-offset-4">Consultar faturação</Link>
    </aside>;
}
