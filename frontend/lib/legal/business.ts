export const legalBusiness = {
    brandName: "Momentos em Flor",
    legalName: process.env.NEXT_PUBLIC_LEGAL_ENTITY?.trim() || "",
    taxNumber: process.env.NEXT_PUBLIC_LEGAL_NIF?.trim() || "",
    address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() || "",
    email:
        process.env.NEXT_PUBLIC_PRIVACY_EMAIL?.trim() ||
        process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
        "",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || "",
    ralName: process.env.NEXT_PUBLIC_RAL_NAME?.trim() || "",
    ralUrl: process.env.NEXT_PUBLIC_RAL_URL?.trim() || "",
    complaintsUrl:
        process.env.NEXT_PUBLIC_BOOK_OF_COMPLAINTS_URL?.trim() ||
        "https://www.livroreclamacoes.pt/Inicio/",
};

export const legalLastUpdated = "5 de novembro de 2026";
