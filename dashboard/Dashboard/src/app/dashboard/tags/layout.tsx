import { requireRole } from "@/app/utils/auth";

export default async function TagsLayout({ children }: { children: React.ReactNode }) {
    await requireRole(['admin']);
    return <>{children}</>;
}   