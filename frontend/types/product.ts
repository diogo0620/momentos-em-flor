export type ProductType =
    | "SALE"
    | "RENTAL";


/* ============================================================
 * SHARED
 * ============================================================ */

export type ProductListImage = {
    url: string;
};

export type ProductImage = {
    url: string;
};

export type ProductCategory = {
    id: number;
    name: string;
};

export type ProductComponent = {
    id: number;
    name: string;
    minQuantity: number;
    recommendedQuantity: number;
    maxQuantity: number;
    customerPricePerAdditionalUnit: number;
    floristPricePerAdditionalUnit: number;
};

export type ProductVariant = {
    id: number;
    type: string;
    name: string;
    code: string;
    customerPrice: number;
    floristPrice: number;
    image: ProductImage | null;
};


/* ============================================================
 * CUSTOMER PRODUCT
 * ============================================================ */

/**
 * Base customer product.
 *
 * This is the full product returned in the detail endpoint.
 */
export type CustomerProductDetail = {
    id: number;
    name: string;
    slug: string;
    description: string | null;

    type: ProductType;
    featured: boolean;
    rentalDeposit: number | null;

    price: number;

    category: ProductCategory;

    images: ProductImage[];

    components: ProductComponent[];

    variants: ProductVariant[];

    active: boolean;
};


/**
 * Product returned in the customer product list.
 */
export type CustomerProductList =
    Pick<
        CustomerProductDetail,
        | "id"
        | "name"
        | "type"
        | "featured"
        | "price"
    >
    & {
        image: ProductListImage | null;
    };


/* ============================================================
 * ADMIN PRODUCT
 * ============================================================ */

/**
 * Base admin product.
 *
 * This is the full product returned in the detail endpoint.
 */
export type AdminProductDetail = {
    id: number;
    name: string;
    slug: string;
    description: string | null;

    type: ProductType;
    featured: boolean;
    rentalDeposit: number | null;

    customerPrice: number;
    floristPrice: number;

    category: ProductCategory;

    images: ProductImage[];

    components: ProductComponent[];

    variants: ProductVariant[];

    active: boolean;
};


/**
 * Product returned in the admin product list.
 */
export type AdminProductList =
    Pick<
        AdminProductDetail,
        | "id"
        | "name"
        | "slug"
        | "type"
        | "featured"
        | "customerPrice"
        | "active"
    >
    & {
        image: ProductListImage | null;
    };


/* ============================================================
 * PAGINATION
 * ============================================================ */

export type Pagination = {
    page: number;
    pageSize: number;
    total: number;
    pages: number;
};