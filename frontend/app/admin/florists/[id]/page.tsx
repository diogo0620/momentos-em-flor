import PageHeader from "@/components/admin/common/PageHeader";

import DetailLayout from "@/components/admin/cards/DetailLayout";
import ImageCard from "@/components/admin/cards/ImageCard";
import MetadataCard from "@/components/admin/cards/MetadataCard";
import HistoryCard from "@/components/admin/cards/HistoryCard";

import FloristSummary from "@/components/admin/florists/FloristSummary";
import FloristOrders from "@/components/admin/florists/FloristOrders";

import { getFloristDetails } from "@/lib/admin/florist-details";
import FloristStatistics from "@/components/admin/florists/FloristStatisticts";
import FloristProducts from "@/components/admin/florists/FloristProduct";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function FloristDetailsPage({
    params,
}: Props) {

    const { id } = await params;

    const {
        florist,
        products,
        orders,
        statistics,
    } = getFloristDetails(id);

    return (

        <DetailLayout>

            <PageHeader
                title={florist.name}
                subtitle="Consulte e gerencie todas as informações da florista."
            />

            <FloristSummary
                florist={florist}
            />

            <div className="grid gap-8 xl:grid-cols-2">

                <ImageCard
                    src={florist.image}
                    alt={florist.name}
                    title="Fotografia"
                />

                <FloristStatistics
                    statistics={statistics}
                />

            </div>

            <FloristProducts
                products={products}
            />

            <FloristOrders
                orders={orders}
            />

            <div className="grid gap-8 xl:grid-cols-2">

                <MetadataCard
                    slug={`/florists/${florist.id}`}
                    active={florist.active}
                />

                <HistoryCard
                    events={[
                        {
                            title: "Florista registada",
                            date: "15 Jan 2026 • 09:20",
                        },
                        {
                            title: "Primeira encomenda",
                            date: "20 Jan 2026 • 16:10",
                        },
                        {
                            title: "Última atualização",
                            date: "18 Jun 2026 • 14:35",
                        },
                    ]}
                />

            </div>

        </DetailLayout>

    );

}