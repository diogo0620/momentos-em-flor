"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, UploadCloud } from "lucide-react";

import { apiFetch } from "@/lib/api/common/client";

type MappingType = "customer" | "product" | "tax";

type SyncResponse = {
  moloniId: string;
  action: "created" | "synced" | "validated";
  message: string;
};

export default function MoloniIntegrationActions({
  type,
  localId,
  moloniId,
  onMoloniId,
  disabled = false,
}: {
  type: MappingType;
  localId?: number;
  moloniId: string;
  onMoloniId: (value: string) => void;
  disabled?: boolean;
}) {
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const hasMoloniId = moloniId.trim() !== "";

  async function run() {
    if (!localId) return;
    setWorking(true);
    setMessage("");
    setFailed(false);
    try {
      if (hasMoloniId) {
        const parsedId = Number(moloniId);
        if (!Number.isSafeInteger(parsedId) || parsedId <= 0) {
          throw new Error("Introduz um Moloni ID válido.");
        }
        await apiFetch("/admin/moloni/mappings", {
          method: "PUT",
          body: JSON.stringify({ type, localId, moloniId: parsedId }),
        });
      }

      const response = await apiFetch<SyncResponse>(
        "/admin/moloni/mappings/sync",
        {
          method: "POST",
          body: JSON.stringify({ type, localId }),
        },
      );
      onMoloniId(response.moloniId);
      setMessage(response.message);
    } catch (error) {
      setFailed(true);
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a integração com a Moloni.",
      );
    } finally {
      setWorking(false);
    }
  }

  if (!localId) {
    return (
      <p className="text-xs leading-5 text-[#6F7869]">
        Guarda primeiro o registo para disponibilizar a integração com a Moloni.
      </p>
    );
  }

  if (type === "tax" && !hasMoloniId) {
    return (
      <p className="text-xs leading-5 text-amber-700">
        Introduz o Moloni ID. A taxa só pode ser validada depois de existir uma
        associação.
      </p>
    );
  }

  const label =
    type === "tax"
      ? "Validar na Moloni"
      : hasMoloniId
        ? "Sincronizar com a Moloni"
        : "Criar na Moloni";

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => void run()}
        disabled={disabled || working}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#BFC9B8] bg-white px-4 text-sm font-semibold text-[#40513C] transition hover:bg-[#F2F5EE] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {working ? (
          <Loader2 size={17} className="animate-spin" />
        ) : type === "tax" ? (
          <CheckCircle2 size={17} />
        ) : hasMoloniId ? (
          <RefreshCw size={17} />
        ) : (
          <UploadCloud size={17} />
        )}
        {working ? "A comunicar com a Moloni…" : label}
      </button>
      {message && (
        <p
          role="status"
          className={`text-xs leading-5 ${failed ? "text-red-700" : "text-green-700"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
