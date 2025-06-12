import { requireRole } from "@/app/utils/auth";

export default async function UserLayout({ children }: { children: React.ReactNode }) {
    await requireRole(['admin']);
    return <>{children}</>;
}   