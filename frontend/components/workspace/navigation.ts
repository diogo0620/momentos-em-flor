import {
    Banknote,
    ClipboardList,
    Flower2,
    Heart,
    LayoutDashboard,
    LockKeyhole,
    Package,
    ReceiptText,
    Settings,
    ShoppingBag,
    Tags,
    UserRound,
    Users,
    CreditCard,
    TicketPercent,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
    href: string;
    label: string;
    icon: LucideIcon;
    exact?: boolean;
};

export const adminNavigation: NavigationItem[] = [
    { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
    { href: "/admin/orders", label: "Encomendas", icon: ShoppingBag },
    { href: "/admin/order-offers", label: "Propostas", icon: ClipboardList },
    { href: "/admin/compensations", label: "Compensações", icon: Banknote },
    { href: "/admin/fiscal-documents", label: "Faturação", icon: ReceiptText },
    { href: "/admin/categories", label: "Categorias", icon: Tags },
    { href: "/admin/products", label: "Produtos", icon: Package },
    { href: "/admin/florists", label: "Floristas", icon: Flower2 },
    { href: "/admin/users", label: "Utilizadores", icon: Users },
    { href: "/admin/settings", label: "Definições", icon: Settings },
    { href: "/admin/home-videos", label: "Vídeos da homepage", icon: Settings },
    { href: "/admin/fiscal-mappings", label: "Associações Moloni", icon: Settings },
    { href: "/admin/coupons", label: "Cupões", icon: TicketPercent },
    { href: "/admin/subscription-plans", label: "Subscrições", icon: CreditCard },
];

export const floristNavigation: NavigationItem[] = [
    { href: "/florist", label: "Visão geral", icon: LayoutDashboard, exact: true },
    { href: "/florist/offers", label: "Propostas", icon: ClipboardList },
    { href: "/florist/orders", label: "Encomendas", icon: ShoppingBag },
    { href: "/florist/compensations", label: "Pagamentos", icon: Banknote },
    { href: "/florist/subscription", label: "Subscrição", icon: CreditCard },
];

export const accountNavigation: NavigationItem[] = [
    { href: "/account", label: "Visão geral", icon: LayoutDashboard, exact: true },
    { href: "/account/orders", label: "Encomendas", icon: Package },
    { href: "/account/profile", label: "Dados pessoais", icon: UserRound },
    { href: "/account/security", label: "Segurança", icon: LockKeyhole },
    { href: "/favorites", label: "Favoritos", icon: Heart },
];

export function isNavigationItemActive(pathname: string, item: NavigationItem) {
    return item.exact
        ? pathname === item.href
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
}
