"use client";
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api/common/client';
export default function FiscalMappingsPage() {
    const [type, setType] = useState('customer');
    const [localId, setLocalId] = useState('');
    const [moloniId, setMoloniId] = useState('');
    const [message, setMessage] = useState('');
    const [busy, setBusy] = useState(false);
    async function save(event: FormEvent) {
        event.preventDefault(); setBusy(true); setMessage('');
        try { await apiFetch('/admin/moloni/mappings', { method: 'PUT', body: JSON.stringify({ type, localId: Number(localId), moloniId: Number(moloniId) }) }); setMessage('Associação validada e guardada. Podes repetir a emissão na faturação.'); }
        catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível guardar.'); }
        finally { setBusy(false); }
    }
    return <div className="max-w-3xl space-y-6"><h1 className="text-3xl font-semibold">Corrigir associações Moloni</h1><p>A faturação continua automática. Corrige aqui a associação de um cliente ou produto existente na Moloni. A alteração aplica-se às próximas emissões; não altera documentos já emitidos.</p><form onSubmit={save} className="space-y-5 rounded-3xl bg-white p-6">
        <label className="block">Tipo<select value={type} onChange={e => setType(e.target.value)} className="mt-2 block w-full rounded-xl border p-3"><option value="customer">Cliente</option><option value="product">Produto</option></select></label>
        <label className="block">ID na plataforma<input required type="number" min="1" step="1" value={localId} onChange={e => setLocalId(e.target.value)} className="mt-2 block w-full rounded-xl border p-3" /></label>
        <label className="block">ID na Moloni<input required type="number" min="1" step="1" value={moloniId} onChange={e => setMoloniId(e.target.value)} className="mt-2 block w-full rounded-xl border p-3" /></label>
        <button disabled={busy} className="rounded-xl bg-[#55624A] px-5 py-3 text-white disabled:opacity-50">{busy ? 'A validar…' : 'Validar e guardar associação'}</button><p role="status">{message}</p>
    </form><div className="flex gap-5"><Link href="/admin/fiscal-documents" className="underline">Voltar à faturação</Link><Link href="/admin/settings" className="underline">Configuração Moloni</Link><Link href="/admin/tax-codes" className="underline">Códigos de IVA</Link></div></div>;
}
