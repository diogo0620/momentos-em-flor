import { LucideIcon, Inbox } from "lucide-react";

type Props = {
    title: string;
    description: string;
    icon?: LucideIcon;
};

export default function EmptyState({
    title,
    description,
    icon: Icon = Inbox,
}: Props) {
    return (
        <div
            className="
                flex
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-[#e1e5df]
                bg-white
                px-8
                py-20
                text-center
                shadow-[0_1px_2px_rgba(25,42,33,0.03)]
            "
        >
            <div
                className="
                    mb-6
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    bg-[#eef2ed]
                "
            >
                <Icon
                    size={36}
                    className="text-[#42604d]"
                />
            </div>

            <h3 className="text-2xl font-semibold tracking-tight text-[#203128]">
                {title}
            </h3>

            <p className="mt-3 max-w-md text-[#6d776f]">
                {description}
            </p>
        </div>
    );
}
