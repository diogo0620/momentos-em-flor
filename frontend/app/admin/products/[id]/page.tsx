import PageHeader from "@/components/admin/common/PageHeader";

import DetailLayout from "@/components/admin/cards/DetailLayout";
import ImageCard from "@/components/admin/cards/ImageCard";
import PricingCard from "@/components/admin/cards/PricingCard";
import MetadataCard from "@/components/admin/cards/MetadataCard";
import HistoryCard from "@/components/admin/cards/HistoryCard";

import ProductSummary from "@/components/admin/products/ProductSummary";
import ProductFlorists from "@/components/admin/products/ProductFlorists";

import { getProductDetails } from "@/lib/admin/product-details";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function ProductDetailsPage({
    params,
}: Props) {

    const { id } = await params;

    const {
        product,
        pricing,
        florists,
    } = getProductDetails(id);

    return (

        <DetailLayout>

            <PageHeader
                title={product.name}
                subtitle="Consulte e gerencie todas as informações do produto."
            />

            <ProductSummary
                product={{
                    ...product,
                    active: true,
                }}
            />

            <div className="grid gap-8 xl:grid-cols-2">

                <ImageCard
                    src={product.image}
                    alt={product.name}
                />

                <PricingCard
                    sellingPrice={
                        pricing.sellingPrice
                    }
                    supplierPrice={
                        pricing.floristPrice
                    }
                />

            </div>

            <ProductFlorists
                florists={florists}
            />

            <div className="grid gap-8 xl:grid-cols-2">
                                <MetadataCard
                    slug={`/products/${product.id}`}
                    active={true}
                    featured={false}
                />

                <HistoryCard
                    events={[
                        {
                            title: "Produto criado",
                            date: "12 Jun 2026 • 09:15",
                        },
                        {
                            title: "Preço atualizado",
                            date: "18 Jun 2026 • 14:20",
                        },
                        {
                            title: "Descrição atualizada",
                            date: "20 Jun 2026 • 11:05",
                        },
                    ]}
                />

            </div>

        </DetailLayout>

    );

}