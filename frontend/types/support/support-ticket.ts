export type SupportTicketStatus = "OPEN" | "WAITING_FOR_SUPPORT" | "WAITING_FOR_CUSTOMER" | "RESOLVED" | "CLOSED";
export type SupportTicketCategory = "ORDER" | "PAYMENT" | "DELIVERY" | "PRODUCT" | "ACCOUNT" | "OTHER";
export type SupportMessage = { id: number; message: string; createdAt: string; author: { id: number; firstName: string; lastName: string; role: "CUSTOMER" | "SYSTEM_ADMIN" | "FLORIST" } };
export type SupportTicket = {
  id: number; reference: string; subject: string; category: SupportTicketCategory; status: SupportTicketStatus;
  customerId: number; customer?: { id: number; firstName: string; lastName: string; email: string };
  orderId: number | null; order: { id: number; orderNumber: string } | null;
  messages?: SupportMessage[]; _count?: { messages: number }; createdAt: string; updatedAt: string; resolvedAt: string | null; closedAt: string | null;
};
export type CreateSupportTicket = { subject: string; category: SupportTicketCategory; orderId?: number; message: string };
