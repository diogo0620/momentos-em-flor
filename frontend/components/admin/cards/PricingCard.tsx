import SectionCard from "@/components/admin/common/SectionCard";
import InfoField from "@/components/admin/common/InfoField";

type Props = {
    sellingPrice: number;
    supplierPrice: number;
};

export default function PricingCard({
    sellingPrice,
    supplierPrice,
}: Props) {

    const profit =
        sellingPrice - supplierPrice;

    const margin =
        sellingPrice === 0
            ? 0
            : (profit / sellingPrice) * 100;

    return (
        <SectionCard title="Preços e Margens">

            <div className="grid gap-8 md:grid-cols-2">

                <InfoField
                    label="Preço de Venda"
                    value={`${sellingPrice.toFixed(2)} €`}
                />

                <InfoField
                    label="Pagamento à Florista"
                    value={`${supplierPrice.toFixed(2)} €`}
                />

                <InfoField
                    label="Lucro"
                    value={`${profit.toFixed(2)} €`}
                />

                <InfoField
                    label="Margem"
                    value={`${margin.toFixed(1)} %`}
                />

            </div>

        </SectionCard>
    );
}