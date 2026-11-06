export type AdminUpdateFlorist = {
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
}