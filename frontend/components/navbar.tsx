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
import { use, useEffect } from "react";
import { toastError } from "@/lib/utils";

export default function NavBar() {
  const router = useRouter();

  const pathname = usePathname();
  const { user, updateUserSession } = useUserSession();

  if (pathname === "/user/login" || pathname === "/user/register") {
    return <></>;
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

  useEffect(() => {
    console.log("useEffect: user detected", user);
    console.log(
      "useEffect: user detected, starting token refresh timer at",
      new Date().toLocaleTimeString()
    );
    const timerId = setInterval(async () => {
      const { success } = await refreshAccessToken();
      if (!success) {
        toastError("Session expired. Please login again");
        await updateUserSession();
        router.push("/user/login");
      }
    }, 1000 * 30 * 1);
    return () => clearInterval(timerId);
  }, [user, router, updateUserSession]);

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
