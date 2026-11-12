export type CustomerUserDetail = {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    taxNumber: string | null;
    billingStreet: string | null;
    billingStreetNumber: string | null;
    billingStreet2: string | null;
    billingPostalCode: string | null;
    billingCity: string | null;
    billingDistrict: string | null;
    billingCountryCode: string | null;
    emailVerified: boolean;
}
