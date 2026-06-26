import SectionCard from "@/components/admin/common/SectionCard";
import InfoField from "@/components/admin/common/InfoField";
import StatusBadge from "@/components/admin/common/StatusBadge";
import { Product } from "@/types/product";

type Props = {
    product: Product;
};

export default function ProductSummary({
    product,
}: Props) {
    return (
        <SectionCard title="Resumo">

            <div className="grid gap-8 md:grid-cols-2">

                <InfoField
                    label="ID"
                    value={`#${product.id}`}
                />

                <InfoField
                    label="Estado"
                    value={
                        <StatusBadge
                            status={
                                product.active
                                    ? "ACTIVE"
                                    : "INACTIVE"
                            }
                        />
                    }
                />

                <InfoField
                    label="Nome"
                    value={product.name}
                />

                <InfoField
                    label="Categoria"
                    value={product.category}
                />

                <div className="md:col-span-2">

                    <InfoField
                        label="Descrição"
                        value={product.description}
                    />

                </div>

            </div>

        </SectionCard>
    );
}