
export type FloristAddress = {
    id: number;
    label?: string | null;
    street: string;
    street2?: string | null;
    postalCode: string;
    city: string;
    district: string;
    countryCode: string;
    latitude: number;
    longitude: number;
    notes?: string | null;
};

export type Florist = {
    id: number;

    name: string;

    legalName?: string | null;

    taxNumber: string;

    email: string;

    phone: string;

    website?: string | null;

    description?: string | null;

    active: boolean;

    acceptingOrders: boolean;

    deliveryRadiusKm: number;

    address: FloristAddress;

    createdAt: string;

    updatedAt: string;
};