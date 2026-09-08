import Link from "next/link";
import {
    ArrowLeft,
    CalendarDays,
    Image as ImageIcon,
    Package,
    Pencil,
    Tag,
    Users,
} from "lucide-react";

import PageHeader from "@/components/admin/common/PageHeader";
import StatusBadge from "@/components/admin/common/StatusBadge";
import DeleteProductButton from "@/components/admin/products/DeleteProductButton";

import {
    getAdminProduct,
    type ProductAdminDetail,
    type ProductAdminImage,
} from "@/lib/api/products";

/* ==========================================================================
   HELPERS
   ========================================================================== */

function formatPrice(value: number | null) {
    if (value === null) {
        return "—";
    }

    return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: "EUR",
    }).format(Number(value));
}

function formatDate(value: string) {
    return new Date(value).toLocaleString("pt-PT", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function pricingTypeLabel(
    type: ProductAdminDetail["pricingType"],
) {
    return type === "FIXED"
        ? "Preço fixo"
        : "Por unidade";
}

function variantTypeLabel(type: string) {
    switch (type) {
        case "SIZE":
            return "Tamanho";

        case "COLOR":
            return "Cor";

        case "FORMAT":
            return "Formato";

        default:
            return type;
    }
}

/* ==========================================================================
   PAGE
   ========================================================================== */

export default async function ProductDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const productId = Number(id);

    if (Number.isNaN(productId)) {
        return (
            <div className="p-10">
                Produto inválido.
            </div>
        );
    }

    let product: ProductAdminDetail;

    try {
        product = await getAdminProduct(productId);
    } catch {
        return (
            <div>
                <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-2 text-sm text-[#55624A]"
                >
                    <ArrowLeft size={16} />
                    Voltar aos produtos
                </Link>

                <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm">
                    <Package
                        size={40}
                        className="mx-auto text-gray-300"
                    />

                    <h2 className="mt-4 text-2xl font-bold">
                        Produto não encontrado
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Não foi possível encontrar o produto #{id}.
                    </p>
                </div>
            </div>
        );
    }

    const hasVariants = product.variants.length > 0;
    const hasComponents = product.components.length > 0;

    return (
        <div className="space-y-8 pb-10">
            {/* ==================================================================
                HEADER
            ================================================================== */}

            <div>
                <Link
                    href="/admin/products"
                    className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        text-gray-500
                        transition
                        hover:text-[#55624A]
                    "
                >
                    <ArrowLeft size={16} />
                    Voltar aos produtos
                </Link>

                <div className="mt-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <PageHeader
                        title={product.name}
                        subtitle={`Detalhes do produto #${product.id}`}
                    />

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-2xl
                                bg-[#55624A]
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-[#46523C]
                            "
                        >
                            <Pencil size={17} />
                            Editar produto
                        </Link>

                        <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                        />
                    </div>
                </div>
            </div>

            {/* ==================================================================
                SUMMARY
            ================================================================== */}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard
                    icon={Package}
                    label="Estado"
                    value={product.active ? "Ativo" : "Inativo"}
                    valueClassName={
                        product.active
                            ? "text-green-700"
                            : "text-gray-500"
                    }
                />

                <SummaryCard
                    icon={Tag}
                    label="Categoria"
                    value={product.category?.name}
                />

                <SummaryCard
                    label="Preço final"
                    value={formatPrice(product.price)}
                    description="Preço apresentado ao cliente"
                />

                <SummaryCard
                    label="Tipo de preço"
                    value={pricingTypeLabel(product.pricingType)}
                />
            </div>

            {/* ==================================================================
                PRODUCT INFORMATION
            ================================================================== */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <SectionHeader
                    title="Informações do produto"
                    description="Dados gerais e configuração comercial."
                />

                <div className="mt-8 grid gap-x-8 gap-y-7 md:grid-cols-2 lg:grid-cols-3">
                    <InfoItem
                        label="Nome"
                        value={product.name}
                    />

                    <InfoItem
                        label="Slug"
                        value={product.slug}
                    />

                    <InfoItem
                        label="Categoria"
                        value={product.category?.name}
                    />

                    <InfoItem
                        label="Tipo de preço"
                        value={pricingTypeLabel(product.pricingType)}
                    />

                    <InfoItem
                        label="Preço final"
                        value={formatPrice(product.price)}
                        highlight
                    />

                    <InfoItem
                        label="Ordem"
                        value={String(product.sortOrder)}
                    />
                </div>

                <div className="mt-8 border-t border-gray-100 pt-8">
                    <p className="text-sm font-medium text-gray-400">
                        Descrição
                    </p>

                    <p className="mt-2 leading-7 text-gray-600">
                        {product.description || "Sem descrição."}
                    </p>
                </div>
            </section>

            {/* ==================================================================
                PRICING
            ================================================================== */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <SectionHeader
                    title="Preços e compensações"
                    description="Valores comerciais configurados para este produto."
                />

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <PriceCard
                        label="Preço base"
                        value={formatPrice(product.basePrice)}
                        description="Preço do produto antes de IVA"
                    />

                    <PriceCard
                        label="Compensação base"
                        value={formatPrice(
                            product.baseFloristCompensation,
                        )}
                        description="Valor pago ao florista"
                    />

                    <PriceCard
                        label="Preço final"
                        value={formatPrice(product.price)}
                        description="Preço final para o cliente"
                        highlight
                    />
                </div>
            </section>

            {/* ==================================================================
                IMAGES
            ================================================================== */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <SectionHeader
                    title="Imagens"
                    description={`${product.images.length} imagem${
                        product.images.length === 1 ? "" : "ns"
                    } associada${
                        product.images.length === 1 ? "" : "s"
                    } ao produto.`}
                    icon={ImageIcon}
                />

                {product.images.length === 0 ? (
                    <EmptySection
                        icon={ImageIcon}
                        message="Este produto não tem imagens."
                    />
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {product.images.map((image) => (
                            <ProductImageCard
                                key={image.id}
                                image={image}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* ==================================================================
                VARIANTS
            ================================================================== */}

            {hasVariants && (
                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                    <SectionHeader
                        title="Variantes"
                        description={`${product.variants.length} variante${
                            product.variants.length === 1
                                ? ""
                                : "s"
                        } configurada${
                            product.variants.length === 1
                                ? ""
                                : "s"
                        }.`}
                    />

                    <div className="mt-8 overflow-x-auto">
                        <table className="w-full min-w-[850px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-[#FAFBF8] text-left">
                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Variante
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Tipo
                                    </th>

                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Código
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Preço
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Compensação
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Estado
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {product.variants.map((variant) => (
                                    <tr
                                        key={variant.id}
                                        className="border-b border-gray-50"
                                    >
                                        <td className="px-5 py-5">
                                            <div className="flex items-center gap-3">
                                                {variant.image ? (
                                                    <img
                                                        src={
                                                            variant.image
                                                                .url
                                                        }
                                                        alt={
                                                            variant.image
                                                                .altText ||
                                                            variant.name
                                                        }
                                                        className="h-12 w-12 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                                                        <Package size={19} />
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-semibold text-[#2F3B2A]">
                                                        {variant.name}
                                                    </p>

                                                    <p className="mt-1 text-xs text-gray-400">
                                                        Ordem{" "}
                                                        {
                                                            variant.sortOrder
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-5">
                                            <span className="rounded-full bg-[#F3F5EE] px-3 py-1.5 text-xs font-medium text-[#55624A]">
                                                {variantTypeLabel(
                                                    variant.type,
                                                )}
                                            </span>
                                        </td>

                                        <td className="px-5 py-5 font-mono text-sm text-gray-500">
                                            {variant.code || "—"}
                                        </td>

                                        <td className="px-5 py-5 text-right">
                                            <p className="font-bold text-[#2F3B2A]">
                                                {formatPrice(
                                                    variant.price,
                                                )}
                                            </p>
                                        </td>

                                        <td className="px-5 py-5 text-right">
                                            <p className="font-semibold text-gray-600">
                                                {formatPrice(
                                                    variant.floristCompensation,
                                                )}
                                            </p>
                                        </td>

                                        <td className="px-5 py-5 text-center">
                                            <StatusBadge
                                                status={
                                                    variant.active
                                                        ? "ACTIVE"
                                                        : "INACTIVE"
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* ==================================================================
                COMPONENTS
            ================================================================== */}

            {hasComponents && (
                <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                    <SectionHeader
                        title="Componentes"
                        description={`${product.components.length} componente${
                            product.components.length === 1
                                ? ""
                                : "s"
                        } configurado${
                            product.components.length === 1
                                ? ""
                                : "s"
                        }.`}
                        icon={Users}
                    />

                    <div className="mt-8 overflow-x-auto">
                        <table className="w-full min-w-[900px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-[#FAFBF8] text-left">
                                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Componente
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Mínimo
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Recomendado
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Máximo
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Preço adicional
                                    </th>

                                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Compensação
                                    </th>

                                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        Estado
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {product.components.map((component) => (
                                    <tr
                                        key={component.id}
                                        className="border-b border-gray-50"
                                    >
                                        <td className="px-5 py-5">
                                            <div>
                                                <p className="font-semibold text-[#2F3B2A]">
                                                    {component.name}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    Ordem{" "}
                                                    {component.sortOrder}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-5 py-5 text-center font-medium text-gray-600">
                                            {component.minQuantity}
                                        </td>

                                        <td className="px-5 py-5 text-center font-semibold text-[#55624A]">
                                            {
                                                component.recommendedQuantity
                                            }
                                        </td>

                                        <td className="px-5 py-5 text-center font-medium text-gray-600">
                                            {component.maxQuantity}
                                        </td>

                                        <td className="px-5 py-5 text-right">
                                            <p className="font-semibold text-[#2F3B2A]">
                                                {formatPrice(
                                                    component.customerPricePerAdditionalUnit,
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                por unidade
                                            </p>
                                        </td>

                                        <td className="px-5 py-5 text-right">
                                            <p className="font-semibold text-gray-600">
                                                {formatPrice(
                                                    component.floristCompensationPerAdditionalUnit,
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-400">
                                                por unidade
                                            </p>
                                        </td>

                                        <td className="px-5 py-5 text-center">
                                            <StatusBadge
                                                status={
                                                    component.active
                                                        ? "ACTIVE"
                                                        : "INACTIVE"
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {/* ==================================================================
                METADATA
            ================================================================== */}

            <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
                <SectionHeader
                    title="Metadados"
                    description="Informação técnica e de gestão do produto."
                    icon={CalendarDays}
                />

                <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <InfoItem
                        label="ID"
                        value={String(product.id)}
                    />

                    <InfoItem
                        label="Ordem"
                        value={String(product.sortOrder)}
                    />

                    <InfoItem
                        label="Criado em"
                        value={formatDate(product.createdAt)}
                    />

                    <InfoItem
                        label="Atualizado em"
                        value={formatDate(product.updatedAt)}
                    />
                </div>
            </section>
        </div>
    );
}

/* ==========================================================================
   SUMMARY CARD
   ========================================================================== */

function SummaryCard({
    icon: Icon,
    label,
    value,
    description,
    valueClassName = "text-[#2F3B2A]",
}: {
    icon?: React.ElementType;
    label: string;
    value: string;
    description?: string;
    valueClassName?: string;
}) {
    return (
        <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                {Icon && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                        <Icon size={19} />
                    </div>
                )}

                <div
                    className={
                        Icon
                            ? "text-right"
                            : "w-full"
                    }
                >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        {label}
                    </p>

                    <p
                        className={`
                            mt-2
                            text-xl
                            font-bold
                            ${valueClassName}
                        `}
                    >
                        {value}
                    </p>

                    {description && (
                        <p className="mt-1 text-xs text-gray-400">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ==========================================================================
   SECTION HEADER
   ========================================================================== */

function SectionHeader({
    title,
    description,
    icon: Icon,
}: {
    title: string;
    description: string;
    icon?: React.ElementType;
}) {
    return (
        <div className="flex items-center gap-3">
            {Icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F5EE] text-[#55624A]">
                    <Icon size={19} />
                </div>
            )}

            <div>
                <h2 className="text-xl font-bold text-[#2F3B2A]">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                    {description}
                </p>
            </div>
        </div>
    );
}

/* ==========================================================================
   INFO ITEM
   ========================================================================== */

function InfoItem({
    label,
    value,
    highlight = false,
}: {
    label: string;
    value: string;
    highlight?: boolean;
}) {
    return (
        <div>
            <p className="text-sm text-gray-400">
                {label}
            </p>

            <p
                className={`
                    mt-1
                    break-words
                    font-medium
                    ${
                        highlight
                            ? "text-lg font-bold text-[#55624A]"
                            : "text-[#2F3B2A]"
                    }
                `}
            >
                {value}
            </p>
        </div>
    );
}

/* ==========================================================================
   PRICE CARD
   ========================================================================== */

function PriceCard({
    label,
    value,
    description,
    highlight = false,
}: {
    label: string;
    value: string;
    description: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={`
                rounded-2xl
                border
                p-5
                ${
                    highlight
                        ? "border-[#DDE4D5] bg-[#F7F9F4]"
                        : "border-gray-100 bg-[#FAFBF8]"
                }
            `}
        >
            <p className="text-sm text-gray-500">
                {label}
            </p>

            <p
                className={`
                    mt-2
                    text-2xl
                    font-bold
                    ${
                        highlight
                            ? "text-[#55624A]"
                            : "text-[#2F3B2A]"
                    }
                `}
            >
                {value}
            </p>

            <p className="mt-1 text-xs text-gray-400">
                {description}
            </p>
        </div>
    );
}

/* ==========================================================================
   IMAGE CARD
   ========================================================================== */

function ProductImageCard({
    image,
}: {
    image: ProductAdminImage;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-[#FAFBF8]">
            <div className="relative aspect-square overflow-hidden bg-[#F3F5EE]">
                <img
                    src={image.url}
                    alt={
                        image.altText ||
                        "Imagem do produto"
                    }
                    className="h-full w-full object-cover"
                />

                {image.isPrimary && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#55624A] shadow-sm">
                        Principal
                    </span>
                )}
            </div>

            <div className="p-4">
                <p className="truncate text-sm font-medium text-[#2F3B2A]">
                    {image.altText ||
                        "Sem texto alternativo"}
                </p>

                <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>
                        Ordem {image.sortOrder}
                    </span>

                    <span>
                        {image.variantId
                            ? `Variante #${image.variantId}`
                            : "Produto"}
                    </span>
                </div>
            </div>
        </div>
    );
}

/* ==========================================================================
   EMPTY SECTION
   ========================================================================== */

function EmptySection({
    icon: Icon,
    message,
}: {
    icon: React.ElementType;
    message: string;
}) {
    return (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-[#FAFBF8] px-6 py-12 text-center">
            <Icon
                size={28}
                className="mx-auto text-gray-300"
            />

            <p className="mt-3 text-sm text-gray-400">
                {message}
            </p>
        </div>
    );
}