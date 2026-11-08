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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>

                <h1 className="text-3xl font-semibold tracking-[-0.035em] text-[#203128] sm:text-4xl">
                    {title}
                </h1>

                {subtitle && (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d776f] sm:text-base">
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
