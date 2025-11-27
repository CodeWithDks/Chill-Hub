import { Sidebar } from "@/components/Sidebar";
import { UserNav } from "@/components/UserNav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar />
            </div>
            <main className="md:pl-72 h-full">
                <div className="flex items-center justify-end p-4 border-b h-16">
                    <UserNav />
                </div>
                <div className="p-8 h-[calc(100vh-4rem)] overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
