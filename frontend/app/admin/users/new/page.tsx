
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";

import UserForm from "@/components/admin/users/UserForm";

export default function NewUserPage() {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-8">
            <div>
                <Link
                    href="/admin/users"
                    className="inline-flex items-center gap-2 text-sm text-[#7A8474] transition hover:text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar aos utilizadores
                </Link>

                <div className="mt-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                        <UserPlus size={23} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-[#2F3B2A]">
                            Novo utilizador
                        </h1>
                        <p className="mt-1 text-sm text-[#7A8474]">
                            Cria uma conta e define o respetivo perfil de acesso.
                        </p>
                    </div>
                </div>
            </div>

            <UserForm />
        </div>
    );
}
