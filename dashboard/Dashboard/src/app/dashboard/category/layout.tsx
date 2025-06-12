import { requireRole } from "@/app/utils/auth";

export default async function CategoryLayout({ children }: { children: React.ReactNode }) {
    await requireRole(['admin']);
    return <>{children}</>;
}   