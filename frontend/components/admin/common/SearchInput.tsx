"use client";

import { Search } from "lucide-react";

type Props = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

export default function SearchInput({
    value,
    onChange,
    placeholder = "Pesquisar...",
}: Props) {
    return (
        <div className="relative w-full">

            <Search
                size={18}
                className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                "
            />

            <input
                type="text"
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                placeholder={placeholder}
                className="
                    w-full
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    py-3
                    pl-11
                    pr-4
                    outline-none
                    transition-all
                    duration-200
                    focus:border-[#55624A]
                    focus:ring-4
                    focus:ring-[#55624A]/10
                "
            />

        </div>
    );
}