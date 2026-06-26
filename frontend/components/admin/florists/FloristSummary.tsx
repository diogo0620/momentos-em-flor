import SectionCard from "@/components/admin/common/SectionCard";
import InfoField from "@/components/admin/common/InfoField";
import StatusBadge from "@/components/admin/common/StatusBadge";

type Props = {
    florist: {
        id: string;
        name: string;
        city: string;
        rating: number;
        active: boolean;
        ordersCompleted: number;
        acceptanceRate: number;
        averageDeliveryTime: string;
    };
};

export default function FloristSummary({
    florist,
}: Props) {
    return (
        <SectionCard title="Resumo">

            <div className="grid gap-8 md:grid-cols-2">

                <InfoField
                    label="ID"
                    value={`#${florist.id}`}
                />

                <InfoField
                    label="Estado"
                    value={
                        <StatusBadge
                            status={
                                florist.active
                                    ? "ACTIVE"
                                    : "INACTIVE"
                            }
                        />
                    }
                />

                <InfoField
                    label="Nome"
                    value={florist.name}
                />

                <InfoField
                    label="Cidade"
                    value={florist.city}
                />

                <InfoField
                    label="Rating"
                    value={`⭐ ${florist.rating.toFixed(1)}`}
                />

                <InfoField
                    label="Encomendas"
                    value={florist.ordersCompleted}
                />

                <InfoField
                    label="Taxa de Aceitação"
                    value={`${florist.acceptanceRate}%`}
                />

                <InfoField
                    label="Tempo Médio"
                    value={florist.averageDeliveryTime}
                />

            </div>

        </SectionCard>
    );
}