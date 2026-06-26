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
                rounded-3xl
                bg-white
                px-8
                py-20
                text-center
                shadow-sm
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
                    bg-[#F3F5EE]
                "
            >
                <Icon
                    size={36}
                    className="text-[#55624A]"
                />
            </div>

            <h3 className="text-2xl font-semibold text-[#2F3B2A]">
                {title}
            </h3>

            <p className="mt-3 max-w-md text-gray-500">
                {description}
            </p>
        </div>
    );
}