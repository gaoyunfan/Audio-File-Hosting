"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/hooks";
import { getUserFromSession, handleLogout } from "@/lib/actions/auth";
import { toast } from "react-toastify";
import { CircleUserRound } from "lucide-react";

export default function NavBar() {
  const { user } = useAuth();
  const router = useRouter();

  const pathname = usePathname();
  if (pathname === "/user/login" || pathname === "/user/register") {
    return null;
  }

  const performLogout = async () => {
    const result = await handleLogout();
    if (!result.success) {
      toast.error(`Error logging out`);
    } else {
      toast.success(result.message);
      router.push("/user/login");
    }
  };

  return (
    <nav className="bg-accent shadow-sm border-b py-4 h-14 px-6">
      <div className="flex justify-between items-center">
        <div className="min-w-[250px]">
          <Link href="/" className="text-xl font-bold ">
            Audio Hosting App
          </Link>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <CircleUserRound className="cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>{user?.username || "user"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={performLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
