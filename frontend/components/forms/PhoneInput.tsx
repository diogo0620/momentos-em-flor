"use client";

type CountryOption = {
    code: string;
    label: string;
    prefix: string;
};

const COUNTRIES: CountryOption[] = [
    { code: "PT", label: "Portugal", prefix: "+351" },
    { code: "ES", label: "Espanha", prefix: "+34" },
    { code: "FR", label: "França", prefix: "+33" },
    { code: "GB", label: "Reino Unido", prefix: "+44" },
    { code: "DE", label: "Alemanha", prefix: "+49" },
    { code: "IT", label: "Itália", prefix: "+39" },
    { code: "BE", label: "Bélgica", prefix: "+32" },
    { code: "NL", label: "Países Baixos", prefix: "+31" },
    { code: "LU", label: "Luxemburgo", prefix: "+352" },
    { code: "CH", label: "Suíça", prefix: "+41" },
    { code: "IE", label: "Irlanda", prefix: "+353" },
    { code: "BR", label: "Brasil", prefix: "+55" },
    { code: "AO", label: "Angola", prefix: "+244" },
    { code: "MZ", label: "Moçambique", prefix: "+258" },
    { code: "CV", label: "Cabo Verde", prefix: "+238" },
    { code: "US", label: "EUA / Canadá", prefix: "+1" },
].sort((a, b) => b.prefix.length - a.prefix.length);

type PhoneInputProps = {
    id?: string;
    value: string;
    onValueChange: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    className?: string;
};

function splitPhone(value: string) {
    const digits = value.replace(/\D/g, "");
    const match = COUNTRIES.find((country) =>
        digits.startsWith(country.prefix.slice(1)),
    ) ?? COUNTRIES.find((country) => country.code === "PT")!;
    const prefixDigits = match.prefix.slice(1);
    return {
        country: match,
        national: digits.startsWith(prefixDigits)
            ? digits.slice(prefixDigits.length)
            : digits,
    };
}

export default function PhoneInput({
    id,
    value,
    onValueChange,
    disabled,
    required,
    className = "",
}: PhoneInputProps) {
    const { country, national } = splitPhone(value);

    function emit(prefix: string, rawNational: string) {
        const digits = rawNational.replace(/\D/g, "").replace(/^0+/, "");
        onValueChange(digits ? `${prefix}${digits}` : "");
    }

    return (
        <div className={`grid grid-cols-[minmax(125px,0.8fr)_minmax(0,1.4fr)] gap-2 ${className}`}>
            <select
                aria-label="País do número de telefone"
                value={country.code}
                disabled={disabled}
                onChange={(event) => {
                    const selected = COUNTRIES.find((item) => item.code === event.target.value)!;
                    emit(selected.prefix, national);
                }}
                className="min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-3.5 text-sm text-gray-700 outline-none focus:border-[#879477] focus:ring-4 focus:ring-[#D6DEC8]/50 disabled:bg-gray-50"
            >
                {[...COUNTRIES].sort((a, b) => a.label.localeCompare(b.label, "pt")).map((item) => (
                    <option key={item.code} value={item.code}>{item.code} {item.prefix}</option>
                ))}
            </select>
            <div className="relative min-w-0">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-400">{country.prefix}</span>
                <input
                    id={id}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={national}
                    onChange={(event) => emit(country.prefix, event.target.value)}
                    disabled={disabled}
                    required={required}
                    placeholder="912 345 678"
                    className="w-full rounded-xl border border-gray-200 bg-[#FCFCFB] py-3.5 pl-14 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#879477] focus:bg-white focus:ring-4 focus:ring-[#D6DEC8]/50 disabled:bg-gray-50"
                />
            </div>
        </div>
    );
}
