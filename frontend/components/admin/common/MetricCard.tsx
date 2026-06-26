import { LucideIcon } from "lucide-react";

type Props = {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color?: string;
};

export default function MetricCard({
    title,
    value,
    subtitle,
    icon: Icon,
    color = "#55624A",
}: Props) {
    return (
        <div
            className="
                rounded-3xl
                bg-white
                p-6
                shadow-sm
                transition
                hover:-translate-y-1
                hover:shadow-lg
            "
        >
            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm text-gray-500">
                        {title}
                    </p>

                    <h2 className="mt-3 text-4xl font-bold text-[#2F3B2A]">
                        {value}
                    </h2>

                    {subtitle && (
                        <p className="mt-2 text-sm text-gray-500">
                            {subtitle}
                        </p>
                    )}

                </div>

                <div
                    className="
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-2xl
                    "
                    style={{
                        backgroundColor: `${color}15`,
                    }}
                >
                    <Icon
                        size={28}
                        color={color}
                    />
                </div>

            </div>
        </div>
    );
}