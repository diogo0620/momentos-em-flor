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
            {status}
        </span>
    );
}