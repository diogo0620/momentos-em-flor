"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Heart,
  Minus,
  Plus,
  ArrowUpRight,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";

import { publicProductsApi } from "@/lib/api/products/public-products";
import ProductGallery from "@/components/store/products/ProductGallery";
import ProductRecommendations from "@/components/store/products/ProductRecommendations";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import {
  PublicProductComponent,
  PublicProductDetail,
} from "@/types/products/public/public-product-detail";
type ComponentQuantities = Record<number, number>;

const formatPrice = (value: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(
    value,
  );

function ProductImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 100vw, 60vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#F3F5EE] text-[#9AA58D]">
        <Sparkles size={34} strokeWidth={1.3} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      preload={priority}
      sizes={sizes}
      quality={75}
      className="object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function PublicProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;
  return <ProductDetail key={slug} slug={slug} />;
}

function ProductDetail({ slug }: { slug: string }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<PublicProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null,
  );
  const [componentQuantities, setComponentQuantities] =
    useState<ComponentQuantities>({});
  const [quantity, setQuantity] = useState(1);
  const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void publicProductsApi
      .getBySlug(slug)
      .then((response) => {
        if (cancelled) return;
        if (!response?.id) {
          setProduct(null);
          setError("Não foi possível encontrar este produto.");
          return;
        }
        setProduct(response);
        setError(null);
        setQuantity(1);
        setAddedToCart(false);
        setSelectedAddonIds([]);
        setSelectedVariantId(response.variants?.[0]?.id ?? null);
        setComponentQuantities(
          Object.fromEntries(
            (response.components ?? []).map((component) => [
              component.id,
              component.minQuantity,
            ]),
          ),
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setProduct(null);
        setError(
          err instanceof Error
            ? err.message
            : "Ocorreu um erro ao carregar o produto.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug, retryAttempt]);

  const selectedVariant = useMemo(
    () =>
      product?.variants?.find((variant) => variant.id === selectedVariantId) ??
      null,
    [product, selectedVariantId],
  );

  const productImage = product?.image ?? "";
  const activeImage = selectedVariant?.image || productImage;

  const componentsExtra = useMemo(
    () =>
      (product?.components ?? []).reduce((total, component) => {
        const selected =
          componentQuantities[component.id] ?? component.minQuantity;
        return (
          total +
          Math.max(0, selected - component.minQuantity) *
            component.pricePerAdditionalUnit
        );
      }, 0),
    [product, componentQuantities],
  );

  const unitPrice = selectedVariant?.price ?? product?.price ?? 0;
  const totalUnitPrice = unitPrice + componentsExtra;
  const addonsTotal = (product?.addons ?? [])
    .filter((addon) => selectedAddonIds.includes(addon.id))
    .reduce((sum, addon) => sum + addon.price, 0);
  const totalPrice = totalUnitPrice * quantity + addonsTotal;
  const favorite = product ? isInWishlist(product.id) : false;

  const updateComponentQuantity = (
    component: PublicProductComponent,
    next: number,
  ) => {
    setComponentQuantities((current) => ({
      ...current,
      [component.id]: Math.min(
        component.maxQuantity,
        Math.max(component.minQuantity, next),
      ),
    }));
    setAddedToCart(false);
  };

  const handleAddToCart = () => {
    if (!product) return;

    const selectedComponents = (product.components ?? []).map((component) => ({
      componentId: component.id,
      name: component.name,
      quantity: componentQuantities[component.id] ?? component.minQuantity,
    }));

    const componentLabels = selectedComponents
      .map((component) => `${component.name}: ${component.quantity}`)
      .join(", ");

    const configurationDescription = [
      selectedVariant ? `Tamanho: ${selectedVariant.name}` : null,
      componentLabels || null,
    ]
      .filter(Boolean)
      .join(" · ");

    const cartItemId = [
      product.id,
      selectedVariant?.id ?? "default",
      ...selectedComponents.map(
        (component) => `${component.componentId}-${component.quantity}`,
      ),
    ].join("-");

    addItem({
      cartItemId,
      id: product.id,
      name: product.name,
      description: configurationDescription,
      image: selectedVariant?.image ?? product.image ?? "",
      price: totalUnitPrice,
      quantity,

      // Variante selecionada
      variantId: selectedVariant?.id,
      variantName: selectedVariant?.name,

      // Componentes e respetivas quantidades
      components: selectedComponents,
    });

    for (const addon of product.addons.filter((item) => selectedAddonIds.includes(item.id))) {
      addItem({
        cartItemId: `addon-${product.id}-${addon.id}`,
        id: addon.id,
        name: addon.name,
        description: "",
        image: addon.image ?? "",
        price: addon.price,
        quantity: 1,
      });
    }

    setAddedToCart(true);
  };

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#FCFCF9] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          <div className="aspect-[4/5] animate-pulse rounded-[2rem] bg-[#EEF0E9]" />
          <div className="space-y-5 py-4">
            <div className="h-4 w-28 animate-pulse rounded bg-[#EEF0E9]" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-[#EEF0E9]" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-[#EEF0E9]" />
            <div className="h-24 animate-pulse rounded-2xl bg-[#EEF0E9]" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-[70vh] bg-[#FCFCF9] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-[#E8EBE4] bg-white p-8 text-center shadow-sm">
          <Sparkles className="mx-auto text-[#657456]" size={30} />
          <h1 className="mt-5 text-2xl font-semibold text-[#2F3B2A]">
            Não encontrámos este produto
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#7A8474]">
            {error ??
              "O produto pode ter sido removido ou já não estar disponível."}
          </p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              setRetryAttempt((value) => value + 1);
            }}
            className="mt-6 rounded-full bg-[#55624A] px-6 py-3 text-sm font-semibold text-white hover:bg-[#414D37]"
          >
            Tentar novamente
          </button>
          <div className="mt-5">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#657456]"
            >
              <ArrowLeft size={16} /> Voltar aos produtos
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f6f1] pb-32 lg:pb-20 text-[#2F3B2A]">
      <div className="mx-auto max-w-[1440px] px-4 pt-6 sm:px-7 lg:px-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#7A8474] transition hover:text-[#2F3B2A]"
        >
          <ArrowLeft size={16} /> Voltar à loja
        </Link>

        <div className="mt-6 grid items-start gap-9 lg:grid-cols-[1.12fr_0.88fr] lg:gap-14">
          <section
            aria-label="Fotografias do produto"
            className="min-w-0 lg:sticky lg:top-28"
          >
            <ProductGallery
              key={activeImage}
              initialImage={activeImage}
              name={product.name}
              images={[
                { src: productImage, label: product.name },
                ...(product.variants ?? []).map((variant) => ({
                  src: variant.image,
                  label: product.name + " — " + variant.name,
                })),
              ]}
            >
              <button
                type="button"
                aria-label={
                  favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
                }
                aria-pressed={favorite}
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    image: productImage,
                  })
                }
                className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#e3e7dc] bg-white text-[#40513c] shadow-sm"
              >
                <Heart size={19} fill={favorite ? "currentColor" : "none"} />
              </button>
            </ProductGallery>
          </section>

          <section className="min-w-0 py-2 lg:py-4">
            {product.categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?categoryId=${category.id}`}
                    className="text-xs font-medium text-[#58664D] underline decoration-[#bfc8b5] underline-offset-4"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
            <p className="editorial-kicker mt-5">Momentos em Flor</p>
            <h1 className="mt-3 text-4xl leading-[1.08] tracking-[-.04em] sm:text-5xl lg:text-6xl">
              {product.name}
            </h1>
            <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-2xl font-semibold tracking-tight text-[#293e32]">
                {formatPrice(totalUnitPrice)}
              </span>
              {componentsExtra > 0 && (
                <span className="pb-1 text-sm text-[#7A8474]">
                  inclui personalização
                </span>
              )}
            </div>

            {product.type === "RENTAL" && product.rentalDeposit != null && (
              <div className="mt-3 rounded-2xl border border-[#E5E9DD] bg-[#F5F7F1] p-4">
                <p className="text-sm font-medium text-[#3F4B35]">
                  Caução de {formatPrice(product.rentalDeposit)}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#7A8474]">
                  A caução é apresentada separadamente do preço do aluguer.
                </p>
              </div>
            )}
            {product.description && (
              <p className="mt-5 whitespace-pre-line text-sm leading-7 text-[#626b5a]">
                {product.description}
              </p>
            )}

            {!!product.variants?.length && (
              <div className="mt-8 border-t border-[#dedfd3] pt-7">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">
                      Escolhe o tamanho
                    </h2>
                    <p className="mt-1 text-sm text-[#7A8474]">
                      Seleciona a opção ideal para o teu momento.
                    </p>
                  </div>
                  {selectedVariant && (
                    <span className="text-sm font-semibold text-[#55624A]">
                      {selectedVariant.name}
                    </span>
                  )}
                </div>
                <div className="mt-4 grid gap-3 min-[420px]:grid-cols-2">
                  {product.variants.map((variant) => {
                    const selected = selectedVariantId === variant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => {
                          setSelectedVariantId(variant.id);
                          setAddedToCart(false);
                        }}
                        className={`overflow-hidden rounded-2xl border text-left transition ${selected ? "border-[#657456] bg-[#F4F6F0] ring-1 ring-[#657456]" : "border-[#E5E9DD] bg-white hover:border-[#B8C3AA] hover:bg-[#FAFBF8]"}`}
                      >
                        <div className="flex gap-3 p-3">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                            <ProductImage
                              src={variant.image || productImage}
                              alt={variant.name}
                              sizes="56px"
                            />
                          </div>
                          <div className="min-w-0 flex-1 py-1">
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-semibold text-[#374132]">
                                {variant.name}
                              </span>
                              <span
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#657456] bg-[#657456] text-white" : "border-[#D5DBCD] text-transparent"}`}
                              >
                                <Check size={12} />
                              </span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-[#55624A]">
                              {formatPrice(variant.price)}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedVariant?.description && (
                  <div className="mt-3 rounded-xl bg-[#F3F5EE] px-4 py-3 text-sm leading-6 text-[#637057]">
                    <span className="font-semibold">
                      {selectedVariant.name}:
                    </span>{" "}
                    {selectedVariant.description}
                  </div>
                )}
              </div>
            )}

            {!!product.components?.length && (
              <div className="mt-8 border-t border-[#E8EBE4] pt-7">
                <h2 className="text-base font-semibold">
                  Personaliza o teu produto
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#7A8474]">
                  Ajusta as quantidades ao teu gosto.
                </p>
                <div className="mt-4 space-y-3">
                  {product.components.map((component) => {
                    const selected =
                      componentQuantities[component.id] ??
                      component.minQuantity;
                    const extraPrice =
                      Math.max(0, selected - component.minQuantity) *
                      component.pricePerAdditionalUnit;
                    return (
                      <div
                        key={component.id}
                        className="flex flex-col gap-3 rounded-2xl border border-[#E8EBE4] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-[#374132]">
                            {component.name}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#7A8474]">
                            Mín. {component.minQuantity} · Recomendado{" "}
                            {component.recommendedQuantity} · Máx.{" "}
                            {component.maxQuantity}
                          </p>
                          {extraPrice > 0 && (
                            <p className="mt-1 text-xs font-medium text-[#657456]">
                              +{formatPrice(extraPrice)}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 self-start rounded-full border border-[#E5E9DD] bg-[#FAFBF8] p-1 sm:self-auto">
                          <button
                            type="button"
                            aria-label={`Diminuir ${component.name}`}
                            disabled={selected <= component.minQuantity}
                            onClick={() =>
                              updateComponentQuantity(component, selected - 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#55624A] hover:bg-[#E9EDE1] disabled:opacity-30"
                          >
                            <Minus size={15} />
                          </button>
                          <span className="min-w-5 text-center text-sm font-semibold">
                            {selected}
                          </span>
                          <button
                            type="button"
                            aria-label={`Aumentar ${component.name}`}
                            disabled={selected >= component.maxQuantity}
                            onClick={() =>
                              updateComponentQuantity(component, selected + 1)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-full text-[#55624A] hover:bg-[#E9EDE1] disabled:opacity-30"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!!product.addons.length && (
              <section className="mt-8 border-t border-[#dedfd3] pt-7" aria-labelledby="product-addons-title">
                <p className="editorial-kicker">Completa o gesto</p>
                <h2 id="product-addons-title" className="mt-2 text-2xl tracking-tight">Acrescenta um detalhe especial</h2>
                <p className="mt-2 text-sm leading-6 text-[#687363]">Estes complementos estão disponíveis apenas com este produto.</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {product.addons.map((addon) => {
                    const selected = selectedAddonIds.includes(addon.id);
                    return (
                      <button key={addon.id} type="button" aria-pressed={selected} onClick={() => { setSelectedAddonIds((current) => selected ? current.filter((id) => id !== addon.id) : [...current, addon.id]); setAddedToCart(false); }} className={`flex items-center gap-3 rounded-2xl border p-3 text-left transition ${selected ? "border-[#55624A] bg-[#F3F5EE]" : "border-[#E3E7DD] bg-white hover:border-[#AAB5A0]"}`}>
                        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl"><ProductImage src={addon.image} alt="" sizes="64px" /></span>
                        <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#374132]">{addon.name}</span><span className="mt-1 block text-sm text-[#657456]">+ {formatPrice(addon.price)}</span></span>
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${selected ? "border-[#55624A] bg-[#55624A] text-white" : "border-[#C9D0C3]"}`}>{selected && <Check size={14} />}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            <div
              id="product-purchase"
              className="mt-8 scroll-mt-28 rounded-2xl border border-[#e2e5d9] bg-white p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Quantidade
                  </label>
                  <div className="flex h-12 w-fit items-center gap-4 rounded-full border border-[#E5E9DD] bg-white px-2">
                    <button
                      type="button"
                      aria-label="Diminuir quantidade"
                      disabled={quantity <= 1}
                      onClick={() => {
                        setQuantity((value) => Math.max(1, value - 1));
                        setAddedToCart(false);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#55624A] hover:bg-[#F3F5EE] disabled:opacity-30"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="min-w-4 text-center text-sm font-semibold">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar quantidade"
                      onClick={() => {
                        setQuantity((value) => value + 1);
                        setAddedToCart(false);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[#55624A] hover:bg-[#F3F5EE]"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#55624A] px-6 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#414D37] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#8A987B] focus:ring-offset-2"
                >
                  {addedToCart ? (
                    <Check size={18} />
                  ) : (
                    <ShoppingBag size={18} />
                  )}
                  {addedToCart
                    ? "Adicionado ao carrinho"
                    : "Adicionar ao carrinho"}
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl bg-[#F3F5EE] p-4">
                <div>
                  <p className="text-sm font-medium text-[#55624A]">Total</p>
                  <p className="mt-1 text-xs text-[#7A8474]">
                    {quantity} {quantity === 1 ? "unidade" : "unidades"}
                    {selectedVariant ? ` · ${selectedVariant.name}` : ""}
                  </p>
                </div>
                <p className="text-xl font-semibold tracking-tight">
                  {formatPrice(totalPrice)}
                </p>
              </div>
              {addedToCart && (
                <p
                  role="status"
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-[#536548]"
                >
                  <Check size={16} /> Produto adicionado ao carrinho.
                </p>
              )}
              {addedToCart && (
                <Link
                  href="/cart"
                  className="mt-4 flex min-h-11 items-center justify-center gap-3 rounded-full border border-[#40513c] text-sm font-semibold text-[#40513c]"
                >
                  Ver carrinho e continuar <ArrowUpRight size={16} />
                </Link>
              )}
              <p className="mt-4 text-xs leading-5 text-[#707766]">
                O envio é calculado no checkout.
              </p>
            </div>
            <div className="mt-6 border-y border-[#dedfd3]">
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold">
                  <span className="flex items-center gap-3">
                    <Truck size={17} /> Entrega e disponibilidade
                  </span>
                  <Plus
                    size={16}
                    className="transition-transform group-open:rotate-45"
                  />
                </summary>
                <p className="mt-4 text-sm leading-7 text-[#626b5a]">
                  Consulta a área de entrega e as condições aplicáveis antes de
                  encomendar. A disponibilidade está sujeita a confirmação.
                </p>
                <Link
                  href="/delivery-policy"
                  className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-semibold underline underline-offset-4"
                >
                  Consultar condições de entrega <ArrowUpRight size={14} />
                </Link>
              </details>
            </div>
          </section>
        </div>
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#dedfd3] bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-lg lg:hidden">
          <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#707766]">
                Total · {quantity} {quantity === 1 ? "unidade" : "unidades"}
              </p>
              <p className="text-xl font-semibold">{formatPrice(totalPrice)}</p>
            </div>
            <Link
              href={addedToCart ? "/cart" : "#product-purchase"}
              className="flex min-h-12 items-center gap-3 rounded-full bg-[#293e32] px-5 text-sm font-semibold text-white"
            >
              {addedToCart ? "Ver carrinho" : "Encomendar"}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
        <ProductRecommendations
          productId={product.id}
          categoryId={product.categories[0]?.id}
        />
      </div>
    </main>
  );
}
