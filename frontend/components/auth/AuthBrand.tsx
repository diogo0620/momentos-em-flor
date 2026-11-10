import Image from "next/image";
import Link from "next/link";

type AuthBrandProps = {
    className?: string;
};

export default function AuthBrand({ className = "" }: AuthBrandProps) {
    return (
        <div className={`text-center ${className}`}>
            <Link
                href="/"
                aria-label="Momentos em Flor — início"
                className="inline-flex rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#D6DEC8]"
            >
                <Image
                    src="/logo.svg"
                    alt="Momentos em Flor"
                    width={240}
                    height={64}
                    className="h-auto w-[220px] sm:w-[240px]"
                    priority
                />
            </Link>
            <p className="mt-3 text-sm text-gray-500">
                Flores que tornam cada momento especial.
            </p>
        </div>
    );
}
