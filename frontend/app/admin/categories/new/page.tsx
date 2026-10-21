
import Link from "next/link";
import { ArrowLeft, FolderPlus } from "lucide-react";

import CategoryForm from "@/components/admin/categories/CategoryForm";

export default function NewCategoryPage() {
    return (
        <div className="mx-auto w-full max-w-5xl space-y-8">
            <div>
                <Link
                    href="/admin/categories"
                    className="inline-flex items-center gap-2 text-sm text-[#7A8474] transition hover:text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar às categorias
                </Link>

                <div className="mt-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F3F5EE] text-[#55624A]">
                        <FolderPlus size={23} />
                    </div>

                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-[#2F3B2A]">
                            Nova categoria
                        </h1>
                        <p className="mt-1 text-sm text-[#7A8474]">
                            Cria uma categoria para organizar os produtos.
                        </p>
                    </div>
                </div>
            </div>

            <CategoryForm />
        </div>
    );
}
