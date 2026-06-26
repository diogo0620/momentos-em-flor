import Link from "next/link";

import StatusBadge from "@/components/admin/common/StatusBadge";
import SectionCard from "@/components/admin/common/SectionCard";
import EmptyState from "@/components/admin/common/EmptyState";

type Order = {
    id: string;
    customerName: string;
    product: string;
    total: number;
    status: string;
};

type Props = {
    orders: Order[];
};

export default function FloristOrders({
    orders,
}: Props) {
    return (
        <SectionCard title="Últimas Encomendas">

            {orders.length === 0 ? (

                <EmptyState
                    title="Sem encomendas"
                    description="Esta florista ainda não recebeu encomendas."
                />

            ) : (

                <div className="space-y-4">

                    {orders.map((order) => (

                        <Link
                            key={order.id}
                            href={`/admin/orders/${order.id}`}
                            className="
                                flex
                                items-center
                                justify-between
                                rounded-2xl
                                border
                                border-gray-100
                                p-5
                                transition
                                hover:border-[#D6DEC8]
                                hover:bg-[#F8F9F5]
                            "
                        >

                            <div>

                                <h3 className="font-semibold text-[#2F3B2A]">
                                    #{order.id}
                                </h3>

                                <p className="mt-1 text-sm text-gray-600">
                                    {order.customerName}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {order.product}
                                </p>

                            </div>

                            <div className="flex items-center gap-8">

                                <div className="text-right">

                                    <p className="font-semibold">
                                        {order.total.toFixed(2)} €
                                    </p>

                                </div>

                                <StatusBadge
                                    status={order.status}
                                />

                            </div>

                        </Link>

                    ))}

                </div>

            )}

        </SectionCard>
    );
}