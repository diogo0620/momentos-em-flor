export type AdminFloristDetail = {
    id: number;
    name: string;
    legalName: string;
    taxNumber: string;
    email: string;
    phone: string;
    website?: string;
    description?: string;
    addressStreet: string;
    addressStreetNumber: string;
    addressStreet2?: string;
    addressPostalCode: string;
    addressCity: string;
    addressDistrict: string;
    addressCountryCode: string;
    deliveryRadiusKm: number;
    acceptingOrders: boolean;
    active: boolean;
    admins: FloristAdmin[];
    createdAt: Date;
    updatedAt: Date;
}

export type FloristAdmin = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    active: boolean
}