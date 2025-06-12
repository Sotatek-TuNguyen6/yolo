import { requireRole } from "@/app/utils/auth";

export default async function OrdersLayout({ children }: { children: React.ReactNode }) {
    await requireRole(['admin', 'staff']);
    return <>{children}</>;
}