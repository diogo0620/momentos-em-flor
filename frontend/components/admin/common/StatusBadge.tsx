type Props = {
    status: string;
};

const styles: Record<
    string,
    string
> = {
    ACTIVE:
        "bg-green-100 text-green-700",

    INACTIVE:
        "bg-red-100 text-red-700",

    PENDING:
        "bg-yellow-100 text-yellow-700",

    ASSIGNED:
        "bg-blue-100 text-blue-700",

    DELIVERED:
        "bg-green-100 text-green-700",
};

const labels: Record<string, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    PENDING: "Pendente",
    VIEWED: "Visualizada",
    ACCEPTED: "Aceite",
    DECLINED: "Recusada",
    CANCELLED: "Cancelada",
    PENDING_PAYMENT: "Pagamento pendente",
    CREATED: "Criada",
    WAITING_FOR_FLORISTS: "A aguardar atribuição",
    ASSIGNED: "Atribuída",
    IN_PRODUCTION: "Em preparação",
    READY_FOR_DELIVERY: "Pronta para entrega",
    DELIVERED: "Entregue",
    PAID: "Pago",
    FAILED: "Falhou",
    REFUNDED: "Reembolsado",
    DUE: "Por pagar",
};

export default function StatusBadge({
    status,
}: Props) {
    return (
        <span
            className={`
                rounded-full
                px-3
                py-1
                text-sm
                font-medium
                ${styles[status] ?? "bg-gray-100 text-gray-700"}
            `}
        >
            {labels[status] ?? status}
        </span>
    );
}
