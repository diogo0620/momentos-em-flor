import SectionCard from "@/components/admin/common/SectionCard";

type Florist = {
    id: string;
    name: string;
    city: string;
    rating: number;
    floristPrice: number;
};

type Props = {
    florists: Florist[];
};

export default function ProductFlorists({
    florists,
}: Props) {
    return (
        <SectionCard title="Floristas Parceiras">

            <div className="space-y-4">

                {florists.length === 0 ? (

                    <p className="text-gray-500">
                        Nenhuma florista associada.
                    </p>

                ) : (

                    florists.map((florist) => (

                        <div
                            key={florist.id}
                            className="
                                flex
                                items-center
                                justify-between
                                rounded-2xl
                                border
                                border-gray-100
                                p-5
                            "
                        >

                            <div>

                                <h3 className="font-semibold">
                                    {florist.name}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {florist.city}
                                </p>

                            </div>

                            <div className="text-right">

                                <p className="font-medium">
                                    ⭐ {florist.rating}
                                </p>

                                <p className="mt-1 text-[#55624A] font-semibold">
                                    {florist.floristPrice.toFixed(2)} €
                                </p>

                            </div>

                        </div>

                    ))

                )}

            </div>

        </SectionCard>
    );
}