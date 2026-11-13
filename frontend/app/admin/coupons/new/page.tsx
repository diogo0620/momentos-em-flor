import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/admin/common/PageHeader";
import CouponForm from "@/components/admin/coupons/CouponForm";

export default function NewCouponPage() { return <div className="space-y-6 pb-10"><Link href="/admin/coupons" className="inline-flex items-center gap-2 text-sm font-semibold text-[#55624A]"><ArrowLeft size={16} /> Voltar aos cupões</Link><PageHeader title="Novo cupão" subtitle="Define o código, o desconto, a validade e os limites de utilização." /><CouponForm /></div>; }
