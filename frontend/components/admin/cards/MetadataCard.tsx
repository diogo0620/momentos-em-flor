import SectionCard from "@/components/admin/common/SectionCard";
import InfoField from "@/components/admin/common/InfoField";

type Props = {
    slug: string;
    active: boolean;
    featured?: boolean;
};

export default function MetadataCard({
    slug,
    active,
    featured = false,
}: Props) {
    return (
        <SectionCard title="Loja">

            <div className="grid gap-8 md:grid-cols-2">

                <InfoField
                    label="Slug"
                    value={slug}
                />

                <InfoField
                    label="Estado"
                    value={
                        active
                            ? "Ativo"
                            : "Inativo"
                    }
                />

                <InfoField
                    label="Em Destaque"
                    value={
                        featured
                            ? "Sim"
                            : "Não"
                    }
                />

            </div>

        </SectionCard>
    );
}