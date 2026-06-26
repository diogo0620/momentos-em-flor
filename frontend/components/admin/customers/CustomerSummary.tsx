import SectionCard from "@/components/admin/common/SectionCard";
import InfoField from "@/components/admin/common/InfoField";
import StatusBadge from "@/components/admin/common/StatusBadge";

type Props = {
    customer: {
        id: string;
        name: string;
        email: string;
        city: string;
        orders: number;
        totalSpent: number;
        active: boolean;
    };
};

export default function CustomerSummary({
    customer,
}: Props) {
    return (
        <SectionCard title="Resumo">

            <div className="grid gap-8 md:grid-cols-2">

                <InfoField
                    label="ID"
                    value={`#${customer.id}`}
                />

                <InfoField
                    label="Estado"
                    value={
                        <StatusBadge
                            status={
                                customer.active
                                    ? "ACTIVE"
                                    : "INACTIVE"
                            }
                        />
                    }
                />

                <InfoField
                    label="Nome"
                    value={customer.name}
                />

                <InfoField
                    label="Email"
                    value={customer.email}
                />

                <InfoField
                    label="Cidade"
                    value={customer.city}
                />

                <InfoField
                    label="Encomendas"
                    value={customer.orders}
                />

                <InfoField
                    label="Total Gasto"
                    value={`${customer.totalSpent.toFixed(2)} €`}
                />

            </div>

        </SectionCard>
    );
}