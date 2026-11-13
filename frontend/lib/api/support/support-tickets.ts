import { apiFetch } from "@/lib/api/common/client";
import type { CreateSupportTicket, SupportTicket, SupportTicketStatus } from "@/types/support/support-ticket";

export const customerSupportApi = {
  list: (): Promise<SupportTicket[]> => apiFetch("/customer/support-tickets"),
  get: (id: number): Promise<SupportTicket> => apiFetch(`/customer/support-tickets/${id}`),
  create: (data: CreateSupportTicket): Promise<SupportTicket> => apiFetch("/customer/support-tickets", { method: "POST", body: JSON.stringify(data) }),
  reply: (id: number, message: string): Promise<SupportTicket> => apiFetch(`/customer/support-tickets/${id}/messages`, { method: "POST", body: JSON.stringify({ message }) }),
};

export const adminSupportApi = {
  list: (params: { status?: string; search?: string } = {}): Promise<SupportTicket[]> => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    return apiFetch(`/admin/support-tickets${query.size ? `?${query}` : ""}`);
  },
  get: (id: number): Promise<SupportTicket> => apiFetch(`/admin/support-tickets/${id}`),
  reply: (id: number, message: string): Promise<SupportTicket> => apiFetch(`/admin/support-tickets/${id}/messages`, { method: "POST", body: JSON.stringify({ message }) }),
  updateStatus: (id: number, status: SupportTicketStatus): Promise<void> => apiFetch(`/admin/support-tickets/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
