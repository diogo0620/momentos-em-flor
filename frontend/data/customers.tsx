export type Customer = {
    id: string;
    name: string;
    email: string;
    city: string;
    orders: number;
    totalSpent: number;
    lastOrder: string;
    active: boolean;
};

export const customers: Customer[] = [
    {
        id: "1",
        name: "João Silva",
        email: "joao@email.pt",
        city: "Porto",
        orders: 8,
        totalSpent: 285,
        lastOrder: "Hoje",
        active: true,
    },
    {
        id: "2",
        name: "Ana Costa",
        email: "ana@email.pt",
        city: "Aveiro",
        orders: 2,
        totalSpent: 64,
        lastOrder: "Ontem",
        active: true,
    },
    {
        id: "3",
        name: "Carlos Martins",
        email: "carlos@email.pt",
        city: "Lisboa",
        orders: 1,
        totalSpent: 32,
        lastOrder: "12/06/2026",
        active: false,
    },
];