"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plus, BarChart, Compass } from "lucide-react";

export function DashboardHeader() {
  const { data: session } = useSession({
    required: true,
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/10 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/feed" className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">DreamWeaver</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-white hover:text-purple-200 transition-colors">
            <BarChart className="w-4 h-4" />
            Dream Analysis
          </Link>
          <Link href="/feed" className="flex items-center gap-2 text-sm font-medium text-white hover:text-purple-200 transition-colors">
            <Compass className="w-4 h-4" />
            Feed
          </Link>
          <Link href="/dreams/new">
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600">
              <Plus className="w-4 h-4 mr-2" />
              New Dream
            </Button>
          </Link>
          
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <Avatar 
                className="h-8 w-8 hover:ring-2 hover:ring-purple-500 transition-all"
              >
                <AvatarImage src={getImageUrl(session?.user?.image)} />
                <AvatarFallback className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                  {session?.user?.name?.[0] || session?.user?.email?.[0]}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 text-white">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                  <p className="text-xs text-gray-400">{session?.user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                <Link href="/profile/dreams" className="flex w-full">
                  My Dreams
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                <Link href="/profile/stories" className="flex w-full">
                  My Stories
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-white/10 cursor-pointer">
                <Link href="/profile" className="flex w-full">
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="focus:bg-white/10 cursor-pointer text-red-400 focus:text-red-400"
                onClick={() => signOut()}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      </div>
    </header>
  );
} 