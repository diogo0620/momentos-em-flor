import { orders } from "@/data/orders";

export default function FloristPage() {
  const floristOrders =
    orders.filter(
      (order) => order.floristId === "1"
    );

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold">
        Portal Florista
      </h1>

      <div className="mt-8 space-y-4">
        {floristOrders.map((order) => (
          <div
            key={order.id}
            className="border rounded p-4"
          >
            <div>
              Encomenda #{order.id}
            </div>

            <div>
              {order.product}
            </div>

            <div>
              {order.customerName}
            </div>

            <button className="mt-3 rounded bg-black px-4 py-2 text-white">
              Aceitar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}