import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import CategoryForm from "@/components/admin/categories/CategoryForm";

export default function NewCategoryPage() {
    return (
        <div className="space-y-8 pb-10">
            <div>
                <Link
                    href="/admin/categories"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-500
                        transition
                        hover:text-[#55624A]
                    "
                >
                    <ArrowLeft size={16} />
                    Voltar às categorias
                </Link>

                <div className="mt-5">
                    <PageHeader
                        title="Nova categoria"
                        subtitle="Cria uma nova categoria para organizar os produtos."
                    />
                </div>
            </div>

            <CategoryForm />
        </div>
    );
}

