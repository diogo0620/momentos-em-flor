"use client";
import { useCallback, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api/common/client';
export default function HomeVideosPage() {
    const [videos, setVideos] = useState<{ name: string; url: string }[]>([]);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const load = useCallback(async () => { const result = await apiFetch<{ data: { name: string; url: string }[] }>('/home-videos'); setVideos(result.data); }, []);
    useEffect(() => { void load().catch(e => setError(e.message)); }, [load]);
    async function upload(file?: File) {
        if (!file) return;
        if (!['video/mp4', 'video/webm'].includes(file.type) || file.size > 30 * 1024 * 1024) { setError('Seleciona um MP4 ou WebM até 30 MB.'); return; }
        setBusy(true); setError('');
        try { const body = new FormData(); body.append('file', file); await apiFetch('/home-videos', { method: 'POST', body }); await load(); }
        catch (e) { setError(e instanceof Error ? e.message : 'Falha no envio.'); } finally { setBusy(false); }
    }
    async function remove(name: string) {
        if (!window.confirm('Remover este vídeo da homepage e do armazenamento?')) return;
        setBusy(true); setError('');
        try { await apiFetch(`/home-videos/${encodeURIComponent(name)}`, { method: 'DELETE' }); await load(); }
        catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível remover.'); } finally { setBusy(false); }
    }
    return <div className="space-y-6"><h1 className="text-3xl font-semibold">Vídeos da homepage</h1><p>MP4 ou WebM, até 30 MB. Os primeiros quatro vídeos são apresentados na homepage, por ordem de envio.</p><label className="block rounded-2xl bg-white p-5">Adicionar vídeo<input disabled={busy} type="file" accept="video/mp4,video/webm" className="mt-3 block" onChange={e => { void upload(e.target.files?.[0]); e.target.value = ''; }} /></label>{busy && <p role="status">A processar…</p>}{error && <p role="alert" className="text-red-700">{error}</p>}<div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{videos.map(video => <article key={video.name} className="rounded-2xl bg-white p-4"><video src={video.url} controls preload="metadata" className="aspect-[9/16] w-full" /><button disabled={busy} onClick={() => void remove(video.name)} className="mt-4 text-red-700">Remover vídeo</button></article>)}</div></div>;
}
