import SectionCard from "@/components/admin/common/SectionCard";
import InfoField from "@/components/admin/common/InfoField";

type Props = {
    customer: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
    };
};

export default function CustomerCard({
    customer,
}: Props) {
    return (
        <SectionCard title="Cliente">

            <div className="grid gap-6">

                <InfoField
                    label="Nome"
                    value={customer.name}
                />

                <InfoField
                    label="Email"
                    value={
                        customer.email ??
                        "-"
                    }
                />

                <InfoField
                    label="Telefone"
                    value={
                        customer.phone ??
                        "-"
                    }
                />

                <InfoField
                    label="Morada"
                    value={
                        customer.address ??
                        "-"
                    }
                />

            </div>

        </SectionCard>
    );
}