"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, Mail, Phone, Save, UserRound } from "lucide-react";
import { updateMyProfile } from "@/lib/api/users";
import { useAuth } from "@/lib/auth/AuthProvider";

export default function AccountProfilePage() {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhone(user.phone ?? "");
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    if (!cleanFirstName || !cleanLastName) {
      setErrorMessage("Preencha o nome e o apelido para continuar.");
      return;
    }
    try {
      setIsSaving(true);
      const response = await updateMyProfile({ firstName: cleanFirstName, lastName: cleanLastName, phone: phone.trim() || undefined });
      updateUser(response.data);
      setSuccessMessage("Os seus dados foram atualizados com sucesso.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível atualizar os seus dados.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!user) return <div className="rounded-3xl border border-[#E8EBE2] bg-white p-8 text-center"><UserRound className="mx-auto text-[#71805F]" size={28} /><h2 className="mt-4 text-lg font-semibold text-[#2F3B2A]">Perfil</h2><p className="mt-2 text-sm text-[#858A7F]">Não foi possível carregar os seus dados.</p></div>;

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const inputClass = "w-full rounded-2xl border border-[#E2E6DC] bg-white px-4 py-3 text-sm text-[#394633] outline-none transition placeholder:text-[#B2B7AB] focus:border-[#71805F] focus:ring-4 focus:ring-[#55624A]/10 disabled:cursor-not-allowed disabled:bg-[#F7F8F4]";

  return <div className="space-y-6 pb-4">
    <PageIntro eyebrow="A sua informação" title="Dados pessoais" description="Mantenha os seus contactos atualizados para tornar cada encomenda mais simples." />
    <section className="rounded-3xl border border-[#E8EBE2] bg-white p-5 shadow-[0_4px_20px_rgba(47,59,42,0.025)] sm:p-7">
      <div className="flex items-center gap-4 border-b border-[#EEF0EA] pb-6"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#D6DEC8] text-lg font-semibold text-[#46523C]">{initials || <UserRound size={25} />}</div><div className="min-w-0"><h2 className="truncate text-lg font-semibold text-[#2F3B2A]">{user.firstName} {user.lastName}</h2><p className="mt-1 truncate text-sm text-[#858A7F]">{user.email}</p><span className="mt-2 inline-flex rounded-full bg-[#F1F4EB] px-2.5 py-1 text-[11px] font-medium text-[#627153]">Conta de cliente</span></div></div>
      <form onSubmit={handleSubmit} className="space-y-6 pt-6">
        <div><h3 className="text-base font-semibold text-[#2F3B2A]">Informação da conta</h3><p className="mt-1 text-sm text-[#858A7F]">Os campos assinalados são obrigatórios.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block"><span className="text-sm font-medium text-[#46523C]">Nome <span className="text-[#8B695D]">*</span></span><input value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" disabled={isSaving} required className={`${inputClass} mt-2`} placeholder="O seu nome" /></label>
          <label className="block"><span className="text-sm font-medium text-[#46523C]">Apelido <span className="text-[#8B695D]">*</span></span><input value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" disabled={isSaving} required className={`${inputClass} mt-2`} placeholder="O seu apelido" /></label>
        </div>
        <label className="block"><span className="text-sm font-medium text-[#46523C]">Email</span><div className="relative mt-2"><Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA091]" /><input type="email" value={user.email} readOnly disabled className={`${inputClass} cursor-not-allowed bg-[#F7F8F4] pl-11 text-[#858A7F]`} /></div><span className="mt-2 block text-xs leading-5 text-[#92978C]">O email associado à conta não pode ser alterado nesta página.</span></label>
        <label className="block"><span className="text-sm font-medium text-[#46523C]">Telefone</span><div className="relative mt-2"><Phone size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9AA091]" /><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" disabled={isSaving} className={`${inputClass} pl-11`} placeholder="+351 912 345 678" /></div><span className="mt-2 block text-xs leading-5 text-[#92978C]">Pode ser utilizado para contactos relacionados com as suas encomendas.</span></label>
        {successMessage && <div role="status" className="flex gap-3 rounded-2xl border border-[#DCE7D2] bg-[#F4F8F0] p-4 text-sm text-[#4E6741]"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><p>{successMessage}</p></div>}
        {errorMessage && <div role="alert" className="rounded-2xl border border-[#EEDDD7] bg-[#FCF6F3] p-4 text-sm text-[#965A49]">{errorMessage}</div>}
        <div className="flex justify-end border-t border-[#EEF0EA] pt-5"><button type="submit" disabled={isSaving} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#55624A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#394633] disabled:cursor-not-allowed disabled:opacity-60"><Save size={16} />{isSaving ? "A guardar…" : "Guardar alterações"}</button></div>
      </form>
    </section>
  </div>;
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="pb-1"><p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#7B876C]">{eyebrow}</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2F3B2A] sm:text-3xl">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#7D8377]">{description}</p></div>;
}
