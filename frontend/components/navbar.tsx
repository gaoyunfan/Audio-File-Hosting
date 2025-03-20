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
import { useUserSession } from "@/lib/hooks";
import { handleLogout, refreshAccessToken } from "@/lib/actions/auth";
import { toast } from "react-toastify";
import { CircleUserRound } from "lucide-react";
import { useEffect } from "react";
import { toastError } from "@/lib/utils";

export default function NavBar() {
  const router = useRouter();

  const pathname = usePathname();
  const { user, updateUserSession } = useUserSession();
  useEffect(() => {
    if (!user) {
      console.log("No user detected, clearing token refresh timer if exists.");
      return;
    }
    console.log(
      "useEffect: user detected, starting token refresh timer at",
      new Date().toLocaleTimeString()
    );
    const timerId = setInterval(async () => {
      const { success } = await refreshAccessToken();
      if (!success) {
        clearInterval(timerId);
        toastError("Session expired. Please login again");
        router.push("/users/login");
      }
    }, 1000 * 60 * 13);
    return () => clearInterval(timerId);
  }, [user, router]);

  if (pathname === "/users/login" || pathname === "/users/register") {
    return <></>;
  }
  const performLogout = async () => {
    const result = await handleLogout();
    if (!result.success) {
      toast.error(`Error logging out`);
    } else {
      toast.success(result.message);
      await updateUserSession();
      router.push("/users/login");
    }
  };
  return (
    <nav className="bg-accent shadow-sm border-b py-4 h-14 px-6">
      <div className="flex justify-between items-center">
        <div className="min-w-[250px] flex items-center gap-4">
          <Link href="/" className="text-xl font-bold ">
            Audio Hosting App
          </Link>

          <Link href="/users" className="text-lg">
            User Management
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
