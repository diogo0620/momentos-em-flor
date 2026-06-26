import SectionCard from "@/components/admin/common/SectionCard";
import InfoField from "@/components/admin/common/InfoField";

type Props = {
    florist?: {
        name: string;
        city: string;
        rating: number;
    };
};

export default function FloristCard({
    florist,
}: Props) {
    return (
        <SectionCard title="Florista">

            {florist ? (

                <div className="space-y-5">

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
                        value={`⭐ ${florist.rating}`}
                    />

                </div>

            ) : (

                <p className="text-gray-500">
                    Ainda não foi atribuída uma florista.
                </p>

            )}

        </SectionCard>
    );
}