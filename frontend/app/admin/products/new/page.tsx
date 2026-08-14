import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import ProductForm from "@/components/admin/products/ProductForm";

export default function NewProductPage() {
    return (
        <div>

            <Link
                href="/admin/products"
                className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-[#55624A]"
            >
                <ArrowLeft size={16} />
                Voltar aos produtos
            </Link>

            <div className="mt-6">
                <PageHeader
                    title="Novo produto"
                    subtitle="Adiciona um novo produto ao catálogo."
                />
            </div>

            <div className="mt-8">
                <ProductForm />
            </div>

        </div>
    );
}