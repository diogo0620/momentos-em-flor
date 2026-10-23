"use client";

import { useState, type FormEvent } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import { customerUsersApi } from "@/lib/api/users/customer-users";
import { CustomerChangePassword } from "@/types/users/customer/customer-user-change-password";

export default function AccountSecurityPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccess(null);
    setError(null);

    if (newPassword.length < 8) {
      setError("A nova palavra-passe deve ter pelo menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("A confirmação não coincide com a nova palavra-passe.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("A nova palavra-passe deve ser diferente da atual.");
      return;
    }

    setSaving(true);

    try {
      const data: CustomerChangePassword = {
        currentPassword,
        newPassword,
      };

      await customerUsersApi.changePassword(data);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setShowNew(false);

      setSuccess("A palavra-passe foi alterada com sucesso.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível alterar a palavra-passe.",
      );
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-[#E2E6DC] bg-white px-4 py-3 text-sm text-[#394633] outline-none transition placeholder:text-[#B2B7AB] focus:border-[#71805F] focus:ring-4 focus:ring-[#55624A]/10 disabled:bg-[#F7F8F4]";

  return (
    <div className="space-y-6 pb-4">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#7B876C]">
          Proteja a sua conta
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2F3B2A] sm:text-3xl">
          Segurança
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#7D8377]">
          Gira a sua palavra-passe e mantenha a sua conta protegida.
        </p>
      </header>

      <section className="rounded-3xl border border-[#E8EBE2] bg-white p-5 sm:p-7">
        <div className="flex items-start gap-4 border-b border-[#EEF0EA] pb-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F1F4EB] text-[#55624A]">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-[#2F3B2A]">
              Alterar palavra-passe
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#858A7F]">
              Utilize uma palavra-passe única, com pelo menos 8 caracteres.
            </p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-5">
          <PasswordField
            label="Palavra-passe atual"
            value={currentPassword}
            onChange={setCurrentPassword}
            visible={showCurrent}
            onToggle={() => setShowCurrent((value) => !value)}
            autoComplete="current-password"
            inputClass={inputClass}
            disabled={saving}
          />

          <PasswordField
            label="Nova palavra-passe"
            value={newPassword}
            onChange={setNewPassword}
            visible={showNew}
            onToggle={() => setShowNew((value) => !value)}
            autoComplete="new-password"
            inputClass={inputClass}
            disabled={saving}
          />

          <label className="block">
            <span className="text-sm font-medium text-[#46523C]">
              Confirmar nova palavra-passe
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              required
              disabled={saving}
              className={`${inputClass} mt-2`}
              placeholder="Repita a nova palavra-passe"
            />
          </label>

          {success && (
            <div
              role="status"
              className="flex gap-3 rounded-2xl border border-[#DCE7D2] bg-[#F4F8F0] p-4 text-sm text-[#4E6741]"
            >
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-2xl border border-[#EEDDD7] bg-[#FCF6F3] p-4 text-sm text-[#965A49]"
            >
              {error}
            </div>
          )}

          <div className="flex justify-end border-t border-[#EEF0EA] pt-5">
            <button
              type="submit"
              disabled={
                saving ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="inline-flex items-center gap-2 rounded-full bg-[#55624A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#394633] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <KeyRound size={16} />
              {saving ? "A atualizar…" : "Alterar palavra-passe"}
            </button>
          </div>
        </form>
      </section>

      <section className="flex items-start gap-3 rounded-3xl border border-[#E6EBDD] bg-[#F1F4EB] p-5 sm:p-6">
        <LockKeyhole size={18} className="mt-0.5 shrink-0 text-[#667557]" />
        <div>
          <h3 className="text-sm font-semibold text-[#394633]">
            Mantenha a sua conta segura
          </h3>
          <p className="mt-1 text-sm leading-6 text-[#73796D]">
            Nunca partilhe a sua palavra-passe. Se suspeitar que alguém teve
            acesso à sua conta, altere-a assim que possível.
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-[#EBD8D2] bg-white p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FCF2EE] text-[#A45F4B]">
            <AlertTriangle size={22} />
          </div>

          <div className="min-w-0">
            <h3 className="font-semibold text-[#793F32]">
              Eliminar a conta
            </h3>
            <p className="mt-1 text-sm leading-6 text-[#858A7F]">
              Se deixar de querer utilizar o Momentos em Flor, poderá solicitar
              a eliminação da sua conta. Esta ação deve ser tratada com cuidado,
              tendo em conta as encomendas e os registos que possam ter de ser
              conservados por obrigação legal.
            </p>
            <p className="mt-3 text-xs leading-5 text-[#9A756B]">
              A eliminação ainda precisa de uma operação própria na API antes
              de poder ser disponibilizada nesta página.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
  autoComplete,
  inputClass,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
  inputClass: string;
  disabled: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#46523C]">{label}</span>

      <div className="relative mt-2">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
          disabled={disabled}
          className={`${inputClass} pr-12`}
          placeholder="Introduza a palavra-passe"
        />

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={
            visible ? "Ocultar palavra-passe" : "Mostrar palavra-passe"
          }
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#858A7F] hover:bg-[#F1F4EB] hover:text-[#394633] disabled:opacity-50"
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
  );
}