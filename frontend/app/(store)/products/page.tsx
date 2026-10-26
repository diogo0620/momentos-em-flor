"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
    useRef,
    type FormEvent,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    ArrowDownWideNarrow,
    ArrowRight,
    Check,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Flower2,
    Heart,
    RotateCcw,
    Search,
    SlidersHorizontal,
    Sparkles,
    X,
} from "lucide-react";

import ProductCard from "@/components/store/products/ProductCard";
import { publicProductsApi } from "@/lib/api/products/public-products";
import { PaginationParams } from "@/lib/api/common/base-api";
import { publicCategoriesApi } from "@/lib/api/categories/public-categories";
import { PublicCategoryList } from "@/types/categories/public/public-category-list";
import { PublicProductList } from "@/types/products/public/public-product-list";
import { ProductType } from "@/types/products/admin/admin-create-product";

type Filters = {
    categoryId: string;
    minPrice: string;
    maxPrice: string;
    type: "ALL" | ProductType;
    featured: boolean;
};

const PAGE_SIZE = 12;
const DEFAULT_FILTERS: Filters = {
    categoryId: "",
    minPrice: "",
    maxPrice: "",
    type: "ALL",
    featured: false,
};

const SORT_OPTIONS = [
    { value: "featured", label: "Recomendados", sort: "featured", order: "desc" as const },
    { value: "price-asc", label: "Preço: mais baixo", sort: "customerPrice", order: "asc" as const },
    { value: "price-desc", label: "Preço: mais alto", sort: "customerPrice", order: "desc" as const },
    { value: "name-asc", label: "Nome: A–Z", sort: "name", order: "asc" as const },
    { value: "name-desc", label: "Nome: Z–A", sort: "name", order: "desc" as const },
    { value: "newest", label: "Mais recentes", sort: "createdAt", order: "desc" as const },
];

function getInitialState(params: URLSearchParams) {
    const rawCategoryId = params.get("categoryId")?.trim() ?? "";

    const categoryId =
        /^\d+$/.test(rawCategoryId) && Number(rawCategoryId) > 0
            ? rawCategoryId
            : "";

    const rawType = params.get("type")?.trim().toUpperCase();

    const type: Filters["type"] =
        rawType === "SALE" || rawType === "RENTAL"
            ? rawType
            : "ALL";

    const rawMinPrice = params.get("minPrice") ?? "";
    const rawMaxPrice = params.get("maxPrice") ?? "";
    const minPrice = rawMinPrice !== "" && Number.isFinite(Number(rawMinPrice)) && Number(rawMinPrice) >= 0
        ? rawMinPrice
        : "";
    const maxPrice = rawMaxPrice !== "" && Number.isFinite(Number(rawMaxPrice)) && Number(rawMaxPrice) >= 0
        ? rawMaxPrice
        : "";

    const sort = params.get("sort");
    const sortValue = SORT_OPTIONS.some((option) => option.value === sort)
        ? sort!
        : "featured";
    const search = params.get("search") ?? "";
    const featured = params.get("featured") === "true";

    return {
        filters: { categoryId, minPrice, maxPrice, type, featured } satisfies Filters,
        search,
        sortValue,
    };
}

export default function ProductsPage() {
    const searchParams = useSearchParams();
    const queryString = searchParams.toString();
    const initialState = useRef<ReturnType<typeof getInitialState> | null>(null);
    if (initialState.current === null) {
        initialState.current = getInitialState(new URLSearchParams(queryString));
    }
    const lastQueryString = useRef(queryString);

    const [products, setProducts] = useState<PublicProductList[]>([]);
    const [categories, setCategories] = useState<PublicCategoryList[]>([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(0);
    const [total, setTotal] = useState(0);

    const [searchInput, setSearchInput] = useState(initialState.current.search);
    const [search, setSearch] = useState(initialState.current.search);
    const [draftFilters, setDraftFilters] = useState<Filters>(initialState.current.filters);
    const [filters, setFilters] = useState<Filters>(initialState.current.filters);
    const [sortValue, setSortValue] = useState(initialState.current.sortValue);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const selectedSort = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (filters.categoryId) count += 1;
        if (filters.minPrice !== "" || filters.maxPrice !== "") count += 1;
        if (filters.type !== "ALL") count += 1;
        if (filters.featured) count += 1;
        return count;
    }, [filters]);


    const loadProducts = useCallback(async (requestedPage: number) => {
        try {
            setIsLoading(true);
            setError(null);

            const params: PaginationParams & {
                categoryId?: number;
                minPrice?: number;
                maxPrice?: number;
                type?: ProductType;
                featured?: boolean;
            } = {
                page: requestedPage,
                pageSize: PAGE_SIZE,
                search,
                sort: selectedSort.sort,
                order: selectedSort.order,
            };

            if (filters.categoryId) {
                params.categoryId = Number(filters.categoryId);
            }

            if (filters.minPrice !== "") {
                params.minPrice = Number(filters.minPrice);
            }

            if (filters.maxPrice !== "") {
                params.maxPrice = Number(filters.maxPrice);
            }

            if (filters.type !== "ALL") {
                params.type = filters.type;
            }

            if (filters.featured) {
                params.featured = true;
            }

            const response = await publicProductsApi.getAll(params);

            setProducts(response.items);
            setPage(response.page);
            setPages(response.pages);
            setTotal(response.total);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Não foi possível carregar os produtos.",
            );
        } finally {
            setIsLoading(false);
        }
    }, [filters, search, selectedSort]);


    useEffect(() => {
        if (lastQueryString.current === queryString) return;

        lastQueryString.current = queryString;
        const nextState = getInitialState(new URLSearchParams(queryString));

        setDraftFilters(nextState.filters);
        setFilters(nextState.filters);
        setSearchInput(nextState.search);
        setSearch(nextState.search);
        setSortValue(nextState.sortValue);
        setPage(1);
        setError(null);
    }, [queryString]);

    useEffect(() => {
        void loadProducts(page);
    }, [loadProducts, page]);

    useEffect(() => {
        let cancelled = false;

        async function loadCategories() {
            try {
                const response = await publicCategoriesApi.getAll();
                if (!cancelled) {
                    setCategories(response.items);
                }
            } catch {
                // The product catalogue remains usable if categories cannot load.
            } finally {
                if (!cancelled) setIsLoadingCategories(false);
            }
        }

        void loadCategories();
        return () => { cancelled = true; };
    }, []);

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }

    function applyFilters() {
        const min = draftFilters.minPrice.trim();
        const max = draftFilters.maxPrice.trim();

        if ((min && Number(min) < 0) || (max && Number(max) < 0)) {
            setError("Os preços não podem ser negativos.");
            return;
        }

        if (min && max && Number(min) > Number(max)) {
            setError("O preço mínimo não pode ser superior ao preço máximo.");
            return;
        }

        setError(null);
        setPage(1);
        setFilters({ ...draftFilters });
        setMobileFiltersOpen(false);
    }

    function clearFilters() {
        setDraftFilters(DEFAULT_FILTERS);
        setFilters(DEFAULT_FILTERS);
        setSearchInput("");
        setSearch("");
        setSortValue("featured");
        setPage(1);
        setMobileFiltersOpen(false);
    }

    function changeSort(value: string) {
        setSortValue(value);
        setPage(1);
    }

    function goToPage(nextPage: number) {
        if (nextPage < 1 || nextPage > pages || nextPage === page) return;

        setPage(nextPage);

        document.getElementById("catalog-results")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }

    const pageNumbers = useMemo(() => {
        if (pages <= 5) {
            return Array.from({ length: pages }, (_, index) => index + 1);
        }

        const start = Math.max(1, Math.min(page - 2, pages - 4));

        return Array.from({ length: 5 }, (_, index) => start + index);
    }, [page, pages]);

    const categoryName = categories.find((category) => String(category.id) === filters.categoryId)?.name;

    return (
        <div className="min-h-screen bg-[#F8F9F5]">
            {/* Editorial catalogue header */}
            <section className="relative overflow-hidden border-b border-[#E8EBE4] bg-white">
                <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full bg-[#F3F5EE]" />
                <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 left-[38%] h-64 w-64 rounded-full bg-[#FAF7F0]" />
                <div className="relative mx-auto max-w-7xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
                    <nav aria-label="Navegação estrutural" className="mb-7 flex items-center gap-2 text-xs font-medium text-[#8B9484]">
                        <Link href="/" className="transition-colors hover:text-[#55624A]">Início</Link>
                        <ChevronRight size={13} aria-hidden="true" />
                        <span className="text-[#55624A]">Flores</span>
                    </nav>

                    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                        <div className="max-w-3xl">
                            <span className="inline-flex items-center gap-2 rounded-full bg-[#F3F5EE] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#55624A]">
                                <Flower2 size={14} /> A nossa coleção
                            </span>
                            <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.045em] text-[#2F3B2A] sm:text-4xl lg:text-[48px]">
                                Flores para os momentos <span className="text-[#7C896E]">que ficam.</span>
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#747D6E] sm:text-base sm:leading-7">
                                Descubra bouquets e arranjos pensados para surpreender. Encontre a escolha certa para cada pessoa, ocasião e orçamento.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-[#E6EADF] bg-[#FAFBF8] px-4 py-3 lg:min-w-[180px]">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8EDDF] text-[#55624A]"><Sparkles size={18} /></span>
                            <div>
                                <p className="text-lg font-semibold leading-5 text-[#2F3B2A]">{total}</p>
                                <p className="mt-1 text-xs text-[#7B8574]">{total === 1 ? "produto disponível" : "produtos disponíveis"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6 flex flex-col gap-3 sm:flex-row">
                    <label className="relative block min-w-0 flex-1">
                        <span className="sr-only">Pesquisar produtos</span>
                        <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#899382]" />
                        <input
                            type="search"
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            placeholder="O que procura? Ex.: rosas, aniversário..."
                            className="h-13 w-full rounded-2xl border border-[#E2E7DD] bg-white py-3.5 pl-12 pr-4 text-sm text-[#2F3B2A] shadow-[0_2px_10px_rgba(47,59,42,0.025)] outline-none transition placeholder:text-[#A0A797] focus:border-[#9BA88D] focus:ring-4 focus:ring-[#55624A]/[0.08]"
                        />
                    </label>
                    <button type="submit" className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#55624A] px-6 text-sm font-semibold text-white transition hover:bg-[#46523D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55624A] focus-visible:ring-offset-2">
                        <Search size={17} /> Pesquisar
                    </button>
                </form>

                <div className="grid items-start gap-6 lg:grid-cols-[248px_minmax(0,1fr)] xl:gap-8">
                    {/* Filters sidebar */}
                    <aside className="lg:sticky lg:top-28">
                        <button
                            type="button"
                            onClick={() => setMobileFiltersOpen((open) => !open)}
                            aria-expanded={mobileFiltersOpen}
                            className="flex w-full items-center justify-between rounded-2xl border border-[#E2E7DD] bg-white px-4 py-3.5 text-sm font-semibold text-[#35412F] shadow-sm lg:hidden"
                        >
                            <span className="inline-flex items-center gap-2"><SlidersHorizontal size={17} /> Filtrar produtos {activeFilterCount > 0 && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#55624A] px-1 text-[10px] text-white">{activeFilterCount}</span>}</span>
                            <ChevronDown size={17} className={`transition-transform ${mobileFiltersOpen ? "rotate-180" : ""}`} />
                        </button>

                        <div className={`${mobileFiltersOpen ? "mt-3 block" : "hidden"} rounded-2xl border border-[#E2E7DD] bg-white p-5 shadow-[0_4px_18px_rgba(47,59,42,0.035)] lg:mt-0 lg:block lg:p-5`}>
                            <div className="flex items-center justify-between border-b border-[#EEF0EB] pb-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#2F3B2A]"><SlidersHorizontal size={16} /> Filtros</div>
                                {activeFilterCount > 0 && <button type="button" onClick={clearFilters} className="text-xs font-semibold text-[#75816A] transition hover:text-[#2F3B2A]">Limpar tudo</button>}
                            </div>

                            <div className="border-b border-[#EEF0EB] py-5">
                                <label htmlFor="category-filter" className="mb-2.5 block text-sm font-semibold text-[#35412F]">Categoria</label>
                                <select id="category-filter" value={draftFilters.categoryId} onChange={(event) => setDraftFilters((current) => ({ ...current, categoryId: event.target.value }))} disabled={isLoadingCategories} className="h-11 w-full rounded-xl border border-[#E2E7DD] bg-[#FCFCFA] px-3 text-sm text-[#55624A] outline-none transition focus:border-[#9BA88D] focus:ring-4 focus:ring-[#55624A]/[0.08] disabled:opacity-60">
                                    <option value="">Todas as categorias</option>
                                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                                </select>
                            </div>

                            <div className="border-b border-[#EEF0EB] py-5">
                                <p className="mb-3 text-sm font-semibold text-[#35412F]">Intervalo de preço</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-[#899382]">Mínimo (€)</span><input type="number" min="0" step="0.01" inputMode="decimal" value={draftFilters.minPrice} onChange={(event) => setDraftFilters((current) => ({ ...current, minPrice: event.target.value }))} placeholder="0" className="h-10 w-full rounded-xl border border-[#E2E7DD] bg-[#FCFCFA] px-3 text-sm text-[#35412F] outline-none focus:border-[#9BA88D] focus:ring-4 focus:ring-[#55624A]/[0.08]" /></label>
                                    <label className="block"><span className="mb-1.5 block text-[11px] font-medium text-[#899382]">Máximo (€)</span><input type="number" min="0" step="0.01" inputMode="decimal" value={draftFilters.maxPrice} onChange={(event) => setDraftFilters((current) => ({ ...current, maxPrice: event.target.value }))} placeholder="Sem limite" className="h-10 w-full rounded-xl border border-[#E2E7DD] bg-[#FCFCFA] px-3 text-sm text-[#35412F] outline-none focus:border-[#9BA88D] focus:ring-4 focus:ring-[#55624A]/[0.08]" /></label>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {[{ label: "Até 25 €", min: "", max: "25" }, { label: "25–50 €", min: "25", max: "50" }, { label: "50 € +", min: "50", max: "" }].map((preset) => {
                                        const active = draftFilters.minPrice === preset.min && draftFilters.maxPrice === preset.max;
                                        return <button key={preset.label} type="button" onClick={() => setDraftFilters((current) => ({ ...current, minPrice: preset.min, maxPrice: preset.max }))} className={`rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition ${active ? "border-[#55624A] bg-[#F3F5EE] text-[#46523D]" : "border-[#E5E9E0] text-[#7B8574] hover:border-[#B9C3AE] hover:text-[#46523D]"}`}>{preset.label}</button>;
                                    })}
                                </div>
                            </div>

                            <div className="border-b border-[#EEF0EB] py-5">
                                <p className="mb-3 text-sm font-semibold text-[#35412F]">Tipo de produto</p>
                                <div className="space-y-2.5">
                                    {[{ value: "ALL", label: "Todos os produtos" }, { value: "SALE", label: "Para comprar" }, { value: "RENTAL", label: "Para alugar" }].map((option) => <label key={option.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-[#6F7967]"><input type="radio" name="product-type" value={option.value} checked={draftFilters.type === option.value} onChange={() => setDraftFilters((current) => ({ ...current, type: option.value as Filters["type"] }))} className="h-4 w-4 accent-[#55624A]" />{option.label}</label>)}
                                </div>
                            </div>

                            <label className="flex cursor-pointer items-start gap-3 py-5 text-sm text-[#596451]">
                                <input type="checkbox" checked={draftFilters.featured} onChange={(event) => setDraftFilters((current) => ({ ...current, featured: event.target.checked }))} className="mt-0.5 h-4 w-4 rounded accent-[#55624A]" />
                                <span><span className="block font-semibold text-[#35412F]">Em destaque</span><span className="mt-0.5 block text-xs leading-5 text-[#899382]">Ver apenas as nossas sugestões.</span></span>
                            </label>

                            <button type="button" onClick={applyFilters} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#55624A] px-4 text-sm font-semibold text-white transition hover:bg-[#46523D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55624A] focus-visible:ring-offset-2"><Check size={16} /> Aplicar filtros</button>
                        </div>
                    </aside>

                    {/* Results */}
                    <section id="catalog-results" className="min-w-0 scroll-mt-28">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-semibold tracking-[-0.025em] text-[#2F3B2A]">A nossa seleção</h2>
                                <p className="mt-1 text-xs text-[#899382]">{isLoading ? "A atualizar catálogo…" : `${total} ${total === 1 ? "resultado encontrado" : "resultados encontrados"}`}</p>
                            </div>
                            <label className="flex items-center gap-2 self-start text-xs font-medium text-[#899382] sm:self-auto">
                                <ArrowDownWideNarrow size={16} />
                                <span className="whitespace-nowrap">Ordenar por</span>
                                <select value={sortValue} onChange={(event) => changeSort(event.target.value)} className="h-10 max-w-[190px] rounded-xl border border-[#E2E7DD] bg-white px-3 text-xs font-semibold text-[#55624A] outline-none focus:border-[#9BA88D] focus:ring-4 focus:ring-[#55624A]/[0.08]">
                                    {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                                </select>
                            </label>
                        </div>

                        {(activeFilterCount > 0 || search) && <div className="mb-5 flex flex-wrap items-center gap-2">
                            <span className="mr-1 text-xs text-[#899382]">Filtros ativos:</span>
                            {search && <button type="button" onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE4D5] bg-white px-3 py-1.5 text-xs text-[#55624A]">Pesquisa: {search}<X size={12} /></button>}
                            {categoryName && <button type="button" onClick={() => { setFilters((current) => ({ ...current, categoryId: "" })); setDraftFilters((current) => ({ ...current, categoryId: "" })); setPage(1); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE4D5] bg-white px-3 py-1.5 text-xs text-[#55624A]">{categoryName}<X size={12} /></button>}
                            {(filters.minPrice !== "" || filters.maxPrice !== "") && <button type="button" onClick={() => { setFilters((current) => ({ ...current, minPrice: "", maxPrice: "" })); setDraftFilters((current) => ({ ...current, minPrice: "", maxPrice: "" })); setPage(1); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE4D5] bg-white px-3 py-1.5 text-xs text-[#55624A]">{filters.minPrice || "0"} € – {filters.maxPrice || "∞"} €<X size={12} /></button>}
                            {filters.type !== "ALL" && <button type="button" onClick={() => { setFilters((current) => ({ ...current, type: "ALL" })); setDraftFilters((current) => ({ ...current, type: "ALL" })); setPage(1); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE4D5] bg-white px-3 py-1.5 text-xs text-[#55624A]">{filters.type === "SALE" ? "Para comprar" : "Para alugar"}<X size={12} /></button>}
                            {filters.featured && <button type="button" onClick={() => { setFilters((current) => ({ ...current, featured: false })); setDraftFilters((current) => ({ ...current, featured: false })); setPage(1); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#DDE4D5] bg-white px-3 py-1.5 text-xs text-[#55624A]">Em destaque<X size={12} /></button>}
                            <button type="button" onClick={clearFilters} className="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-[#7B8574] hover:text-[#2F3B2A]"><RotateCcw size={12} /> Limpar</button>
                        </div>}

                        {error && <div role="alert" className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button type="button" onClick={() => setError(null)} aria-label="Fechar mensagem"><X size={16} /></button></div>}

                        {isLoading ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                                {Array.from({ length: 6 }, (_, index) => <div key={index} className="overflow-hidden rounded-3xl border border-[#E5E7E0] bg-white"><div className="aspect-[4/4.2] animate-pulse bg-[#ECEFE7]" /><div className="space-y-3 p-5"><div className="h-4 w-2/3 animate-pulse rounded bg-[#ECEFE7]" /><div className="h-3 w-1/3 animate-pulse rounded bg-[#F0F2EC]" /><div className="h-5 w-1/4 animate-pulse rounded bg-[#ECEFE7]" /></div></div>)}
                            </div>
                        ) : error && products.length === 0 ? (
                            <div className="rounded-3xl border border-[#E5E9DF] bg-white px-6 py-14 text-center">
                                <Flower2 size={30} className="mx-auto text-[#9BA88D]" />
                                <h3 className="mt-4 text-lg font-semibold text-[#2F3B2A]">Não foi possível carregar a coleção</h3>
                                <p className="mt-2 text-sm text-[#7B8574]">Verifique a ligação e tente novamente.</p>
                                <button type="button" onClick={() => void loadProducts(page)} className="mt-5 rounded-full bg-[#55624A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#46523D]">Tentar novamente</button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="rounded-3xl border border-[#E5E9DF] bg-white px-6 py-14 text-center sm:py-16">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F3F5EE] text-[#55624A]"><Search size={26} strokeWidth={1.5} /></div>
                                <h3 className="mt-5 text-xl font-semibold text-[#2F3B2A]">Não encontrámos resultados</h3>
                                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7B8574]">Experimente outra pesquisa ou ajuste os filtros para descobrir mais opções.</p>
                                <button type="button" onClick={clearFilters} className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#55624A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#46523D]"><RotateCcw size={15} /> Limpar pesquisa e filtros</button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
                                    {products.map((product) => <ProductCard key={product.id} product={product} />)}
                                </div>

                                {pages > 1 && <nav aria-label="Paginação de produtos" className="mt-9 flex flex-col gap-4 border-t border-[#E4E8DF] pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-xs text-[#899382]">A mostrar <span className="font-semibold text-[#55624A]">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</span> de <span className="font-semibold text-[#55624A]">{total}</span> produtos</p>
                                    <div className="flex items-center justify-between gap-1.5 sm:justify-end">
                                        <button type="button" onClick={() => goToPage(page - 1)} disabled={page <= 1} aria-label="Página anterior" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E7DD] bg-white text-[#55624A] transition hover:border-[#B9C3AE] hover:bg-[#F3F5EE] disabled:cursor-not-allowed disabled:opacity-35"><ChevronLeft size={18} /></button>
                                        {pageNumbers[0] > 1 && <><button type="button" onClick={() => goToPage(1)} className="hidden h-10 min-w-10 items-center justify-center rounded-xl border border-[#E2E7DD] bg-white px-3 text-sm text-[#55624A] hover:bg-[#F3F5EE] sm:flex">1</button>{pageNumbers[0] > 2 && <span className="px-1 text-[#A0A797]">…</span>}</>}
                                        {pageNumbers.map((number) => <button key={number} type="button" onClick={() => goToPage(number)} aria-current={number === page ? "page" : undefined} className={`h-10 min-w-10 rounded-xl border px-3 text-sm font-semibold transition ${number === page ? "border-[#55624A] bg-[#55624A] text-white shadow-sm" : "border-[#E2E7DD] bg-white text-[#55624A] hover:bg-[#F3F5EE]"}`}>{number}</button>)}
                                        {pageNumbers[pageNumbers.length - 1] < pages && <>{pageNumbers[pageNumbers.length - 1] < pages - 1 && <span className="px-1 text-[#A0A797]">…</span>}<button type="button" onClick={() => goToPage(pages)} className="hidden h-10 min-w-10 items-center justify-center rounded-xl border border-[#E2E7DD] bg-white px-3 text-sm text-[#55624A] hover:bg-[#F3F5EE] sm:flex">{pages}</button></>}
                                        <button type="button" onClick={() => goToPage(page + 1)} disabled={page >= pages} aria-label="Página seguinte" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E7DD] bg-white text-[#55624A] transition hover:border-[#B9C3AE] hover:bg-[#F3F5EE] disabled:cursor-not-allowed disabled:opacity-35"><ChevronRight size={18} /></button>
                                    </div>
                                </nav>}
                            </>
                        )}
                    </section>
                </div>

                <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl border border-[#E5E9DF] bg-white px-5 py-5 sm:flex-row sm:items-center sm:px-7">
                    <div className="flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3F5EE] text-[#55624A]"><Heart size={19} /></span><div><p className="text-sm font-semibold text-[#35412F]">Encontrou algo de que gosta?</p><p className="mt-1 text-xs text-[#899382]">Guarde os seus favoritos para voltar a eles mais tarde.</p></div></div>
                    <Link href="/favorites" className="inline-flex items-center gap-2 rounded-full border border-[#DDE4D5] px-4 py-2.5 text-sm font-semibold text-[#55624A] transition hover:bg-[#F3F5EE]">Ver favoritos <ArrowRight size={15} /></Link>
                </div>
            </div>
        </div>
    );
}
