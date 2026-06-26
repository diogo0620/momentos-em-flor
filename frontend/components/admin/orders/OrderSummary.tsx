import SectionCard from "@/components/admin/common/SectionCard";
import InfoField from "@/components/admin/common/InfoField";
import StatusBadge from "@/components/admin/common/StatusBadge";

type Props = {
    order: {
        id: string;
        status: string;
        customerName: string;
        total: number;
        floristId: string | null;
    };
};

export default function OrderSummary({
    order,
}: Props) {
    return (
        <SectionCard title="Resumo">

            <div className="grid gap-8 md:grid-cols-2">

                <InfoField
                    label="Encomenda"
                    value={`#${order.id}`}
                />

                <InfoField
                    label="Estado"
                    value={
                        <StatusBadge
                            status={order.status}
                        />
                    }
                />

                <InfoField
                    label="Cliente"
                    value={order.customerName}
                />

                <InfoField
                    label="Total"
                    value={`${order.total.toFixed(2)} €`}
                />

                <InfoField
                    label="Florista"
                    value={
                        order.floristId
                            ? "Atribuída"
                            : "Por atribuir"
                    }
                />

            </div>

        </SectionCard>
    );
}