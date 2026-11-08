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
                rounded-2xl
                border
                border-[#e1e5df]
                bg-white
                p-6
                shadow-[0_1px_2px_rgba(25,42,33,0.03)]
                transition
                hover:border-[#cbd3cb]
            "
        >
            <div className="flex items-start justify-between">

                <div>

                    <p className="text-sm font-medium text-[#6d776f]">
                        {title}
                    </p>

                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#203128]">
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
