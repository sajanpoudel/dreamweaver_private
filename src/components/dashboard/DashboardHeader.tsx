"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Compass, PenLine, BarChart2 } from "lucide-react";
import { SearchBar } from '@/components/search/SearchBar';
import { UserNav } from "@/components/dashboard/UserNav";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function DashboardHeader() {
  const { data: session } = useSession({
    required: true,
  });
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/10 bg-white/[0.02] backdrop-blur-lg supports-[backdrop-filter]:bg-white/[0.02]">
      <div className="px-4 flex h-16 items-center">
        {/* Left section: Logo and Search */}
        <div className="flex items-center gap-6">
          <Link
            href="/feed"
            className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text hover:opacity-80 transition-opacity"
          >
            dreamweaver
          </Link>
          <div className="w-full max-w-sm">
            <SearchBar />
          </div>
        </div>

        {/* Middle section: Navigation */}
        <nav className="flex-1 flex items-center justify-center gap-12">
          <Link href="/feed">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-10 h-10 rounded-full transition-colors",
                pathname === "/feed"
                  ? "bg-purple-500/10 text-purple-200"
                  : "text-white/80 hover:bg-purple-500/5 hover:text-purple-200"
              )}
            >
              <Compass className="h-5 w-5" />
              <span className="sr-only">Feed</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-10 h-10 rounded-full transition-colors",
                pathname === "/dashboard"
                  ? "bg-purple-500/10 text-purple-200"
                  : "text-white/80 hover:bg-purple-500/5 hover:text-purple-200"
              )}
            >
              <BarChart2 className="h-5 w-5" />
              <span className="sr-only">Dream Analysis</span>
            </Button>
          </Link>
        </nav>

        {/* Right section: Actions */}
        <div className="flex items-center gap-2">
          <Link href="/dreams/new">
            <Button
              variant="ghost"
              size="icon"
              className="w-10 h-10 rounded-full bg-purple-500/5 text-purple-200 hover:bg-purple-500/10 hover:text-white"
            >
              <PenLine className="h-5 w-5" />
              <span className="sr-only">New Dream</span>
            </Button>
          </Link>
          <UserNav />
        </div>
      </div>
    </header>
  );
} 