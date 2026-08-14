import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import FloristForm from "@/components/admin/florists/FloristForm";

export default function NewFloristPage() {
    return (
        <div>

            <Link
                href="/admin/florists"
                className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"
            >
                <ArrowLeft size={16} />
                Voltar às floristas
            </Link>

            <div className="mt-6">
                <PageHeader
                    title="Nova florista"
                    subtitle="Adiciona uma nova florista parceira à plataforma."
                />
            </div>

            <div className="mt-8">
                <FloristForm />
            </div>

        </div>
    );
}