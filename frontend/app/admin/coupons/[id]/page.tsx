"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, TicketPercent } from "lucide-react";
import PageHeader from "@/components/admin/common/PageHeader";
import CouponForm from "@/components/admin/coupons/CouponForm";
import { adminCouponsApi, type AdminCoupon } from "@/lib/api/coupons/admin-coupons";

export default function CouponDetailPage() { const id = Number(useParams<{id:string}>().id); const [coupon,setCoupon]=useState<AdminCoupon|null>(null); const [error,setError]=useState(""); useEffect(()=>{void adminCouponsApi.get(id).then(setCoupon).catch((e)=>setError(e instanceof Error?e.message:"Não foi possível carregar o cupão."));},[id]); if(!coupon)return <div className="rounded-2xl bg-white p-10 text-center text-sm text-gray-500">{error || <Loader2 className="mx-auto animate-spin" />}</div>; return <div className="space-y-6 pb-10"><Link href="/admin/coupons" className="inline-flex items-center gap-2 text-sm font-semibold text-[#55624A]"><ArrowLeft size={16}/> Voltar aos cupões</Link><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><PageHeader title={coupon.code} subtitle="Consulta e atualiza as regras deste cupão."/><div className="rounded-xl bg-[#F3F5EE] px-4 py-3 text-sm text-[#55624A]"><TicketPercent size={16} className="mr-2 inline"/><strong>{coupon._count?.redemptions ?? 0}</strong> utilizações</div></div><CouponForm coupon={coupon}/></div>; }
