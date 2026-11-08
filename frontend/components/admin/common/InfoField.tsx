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
            <p className="text-xs font-semibold uppercase tracking-wide text-[#7b857d]">
                {label}
            </p>

            <div className="mt-1.5 font-medium text-[#203128]">
                {value}
            </div>
        </div>
    );
}
