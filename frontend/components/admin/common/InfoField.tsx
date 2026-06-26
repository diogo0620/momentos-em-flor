type Props = {
    label: string;
    value: React.ReactNode;
};

export default function InfoField({
    label,
    value,
}: Props) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-500">
                {label}
            </p>

            <div className="mt-1 text-[#2F3B2A] font-medium">
                {value}
            </div>
        </div>
    );
}