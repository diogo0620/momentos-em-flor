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
  Clapperboard,
  Percent,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type NavigationGroup = {
  id: string;
  label: string;
  items: NavigationItem[];
  defaultOpen?: boolean;
  collapsible?: boolean;
};

export const adminNavigationGroups: NavigationGroup[] = [
  {
    id: "overview",
    label: "Geral",
    defaultOpen: true,
    collapsible: false,
    items: [
      {
        href: "/admin",
        label: "Visão geral",
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    id: "operations",
    label: "Dia a dia",
    defaultOpen: true,
    items: [
      { href: "/admin/orders", label: "Encomendas", icon: ShoppingBag },
      { href: "/admin/order-offers", label: "Propostas", icon: ClipboardList },
      { href: "/admin/florists", label: "Floristas", icon: Flower2 },
    ],
  },
  {
    id: "catalog",
    label: "Loja online",
    items: [
      { href: "/admin/products", label: "Produtos", icon: Package },
      { href: "/admin/categories", label: "Categorias", icon: Tags },
      { href: "/admin/coupons", label: "Cupões", icon: TicketPercent },
      {
        href: "/admin/home-videos",
        label: "Vídeos da loja",
        icon: Clapperboard,
      },
    ],
  },
  {
    id: "network",
    label: "Financeiro",
    items: [
      {
        href: "/admin/fiscal-documents",
        label: "Faturação",
        icon: ReceiptText,
      },
      { href: "/admin/compensations", label: "Compensações", icon: Banknote },
      {
        href: "/admin/subscription-plans",
        label: "Subscrições",
        icon: CreditCard,
      },
      { href: "/admin/tax-codes", label: "Códigos de IVA", icon: Percent },
    ],
  },
  {
    id: "configuration",
    label: "Administração",
    items: [
      { href: "/admin/users", label: "Utilizadores", icon: Users },
      { href: "/admin/settings", label: "Definições", icon: Settings },
    ],
  },
];

export const adminNavigation = adminNavigationGroups.flatMap(
  (group) => group.items,
);

export const floristNavigation: NavigationItem[] = [
  {
    href: "/florist",
    label: "Visão geral",
    icon: LayoutDashboard,
    exact: true,
  },
  { href: "/florist/offers", label: "Propostas", icon: ClipboardList },
  { href: "/florist/orders", label: "Encomendas", icon: ShoppingBag },
  { href: "/florist/compensations", label: "Pagamentos", icon: Banknote },
  { href: "/florist/subscription", label: "Subscrição", icon: CreditCard },
];

export const accountNavigation: NavigationItem[] = [
  {
    href: "/account",
    label: "Visão geral",
    icon: LayoutDashboard,
    exact: true,
  },
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
