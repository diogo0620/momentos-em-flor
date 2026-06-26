import PageHeader from "@/components/admin/common/PageHeader";

import DetailLayout from "@/components/admin/cards/DetailLayout";
import HistoryCard from "@/components/admin/cards/HistoryCard";

import SectionCard from "@/components/admin/common/SectionCard";

import OrderSummary from "@/components/admin/orders/OrderSummary";
import CustomerCard from "@/components/admin/orders/CustomerCard";
import ProductCard from "@/components/admin/orders/ProductCard";
import FloristCard from "@/components/admin/orders/FloristCard";

import { getOrderDetails } from "@/lib/admin/order-details";

type Props = {
    params: Promise<{
        id: string;
    }>;
};

export default async function OrderDetailsPage({
    params,
}: Props) {

    const { id } = await params;

    const {
        order,
        customer,
        florist,
        product,
        payment,
    } = getOrderDetails(id);

    return (

        <DetailLayout>

            <PageHeader
                title={`Encomenda #${order.id}`}
                subtitle="Consulte todos os detalhes da encomenda."
            />

            <OrderSummary
                order={order}
            />

            <div className="grid gap-8 xl:grid-cols-2">

                <CustomerCard
                    customer={customer}
                />

                <ProductCard
                    product={product}
                />

                <FloristCard
                    florist={
                        florist
                            ? {
                                name: florist.name,
                                city: florist.city,
                                rating:
                                    florist.rating,
                            }
                            : undefined
                    }
                />

                <SectionCard title="Pagamento">

                    <div className="grid gap-6 md:grid-cols-2">

                        <div>

                            <p className="text-sm text-gray-500">
                                Método
                            </p>

                            <p className="mt-1 font-medium">
                                {payment.method}
                            </p>

                        </div>

                        <div>

                            <p className="text-sm text-gray-500">
                                Estado
                            </p>

                            <p className="mt-1 font-medium">
                                {payment.status}
                            </p>

                        </div>

                        <div className="md:col-span-2">

                            <p className="text-sm text-gray-500">
                                Referência
                            </p>

                            <p className="mt-1 font-medium">
                                {payment.reference}
                            </p>

                        </div>

                    </div>

                </SectionCard>

            </div>

            <HistoryCard
                events={[
                    {
                        title: "Encomenda criada",
                        date: "12 Jun 2026 • 10:15",
                    },
                    {
                        title: "Pagamento confirmado",
                        date: "12 Jun 2026 • 10:16",
                    },
                    ...(order.floristId
                        ? [
                            {
                                title: "Florista atribuída",
                                date: "12 Jun 2026 • 10:20",
                            },
                        ]
                        : []),
                    ...(order.status === "DELIVERED"
                        ? [
                            {
                                title: "Encomenda entregue",
                                date: "13 Jun 2026 • 15:42",
                            },
                        ]
                        : []),
                ]}
            />

        </DetailLayout>

    );

}