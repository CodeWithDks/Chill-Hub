"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Users, MessageSquare, Tv, User } from "lucide-react";

const routes = [
    {
        label: "Friends",
        icon: Users,
        href: "/friends",
        color: "text-sky-500",
    },
    {
        label: "Chat",
        icon: MessageSquare,
        href: "/chat",
        color: "text-emerald-500",
    },
    {
        label: "Watch Together",
        icon: Tv,
        href: "/watch",
        color: "text-violet-500",
    },
    {
        label: "Profile",
        icon: User,
        href: "/profile",
        color: "text-pink-700",
    },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-slate-900 text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/friends" className="flex items-center pl-3 mb-14">
                    <h1 className="text-2xl font-bold">Chill Hub</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname.startsWith(route.href) ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
