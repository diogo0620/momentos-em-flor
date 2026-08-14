import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import FloristForm from "@/components/admin/florists/FloristForm";

import { getFlorist } from "@/lib/api/florists";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function EditFloristPage({
    params,
}: Props) {
    const { id } = await params;

    const floristId = Number(id);

    if (Number.isNaN(floristId)) {
        return (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
                <h2 className="text-2xl font-bold">
                    Florista inválida
                </h2>

                <p className="mt-2 text-gray-500">
                    O ID da florista não é válido.
                </p>

                <Link
                    href="/admin/florists"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar às floristas
                </Link>
            </div>
        );
    }

    try {
        const response =
            await getFlorist(floristId);

        const florist = response.data;

        return (
            <div>
                <Link
                    href={`/admin/florists/${florist.id}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar à florista
                </Link>

                <div className="mt-6">
                    <PageHeader
                        title="Editar florista"
                        subtitle={`Editar ${florist.name}`}
                    />
                </div>

                <div className="mt-8">
                    <FloristForm
                        florist={florist}
                    />
                </div>
            </div>
        );
    } catch {
        return (
            <div>
                <Link
                    href="/admin/florists"
                    className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar às floristas
                </Link>

                <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
                    <h2 className="text-2xl font-bold">
                        Florista não encontrada
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Não foi possível carregar a
                        florista #{id}.
                    </p>
                </div>
            </div>
        );
    }
}