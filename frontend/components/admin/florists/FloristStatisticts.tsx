import SectionCard from "@/components/admin/common/SectionCard";
import InfoField from "@/components/admin/common/InfoField";

type Props = {
    statistics: {
        totalOrders: number;
        revenue: number;
        rating: number;
        totalProducts: number;
    };
};

export default function FloristStatistics({
    statistics,
}: Props) {
    return (
        <SectionCard title="Estatísticas">

            <div className="grid gap-8 md:grid-cols-2">

                <InfoField
                    label="Encomendas"
                    value={statistics.totalOrders}
                />

                <InfoField
                    label="Receita"
                    value={`${statistics.revenue.toFixed(2)} €`}
                />

                <InfoField
                    label="Produtos"
                    value={statistics.totalProducts}
                />

                <InfoField
                    label="Rating"
                    value={`⭐ ${statistics.rating.toFixed(1)}`}
                />

            </div>

        </SectionCard>
    );
}