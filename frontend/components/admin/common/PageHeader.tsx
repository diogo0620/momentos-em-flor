import ActionButton from "../ActionButton";
import { LucideIcon } from "lucide-react";

type Props = {
    title: string;
    subtitle?: string;
    buttonText?: string;
    buttonHref?: string;
    buttonIcon?: LucideIcon;
};

export default function PageHeader({
    title,
    subtitle,
    buttonText,
    buttonHref,
    buttonIcon,
}: Props) {
    return (
        <div className="flex items-center justify-between">

            <div>

                <h1 className="text-4xl font-bold text-[#2F3B2A]">
                    {title}
                </h1>

                {subtitle && (
                    <p className="mt-2 text-gray-500">
                        {subtitle}
                    </p>
                )}

            </div>

            {buttonHref && buttonText && (
                <ActionButton
                    href={buttonHref}
                    icon={buttonIcon}
                >
                    {buttonText}
                </ActionButton>
            )}

        </div>
    );
}