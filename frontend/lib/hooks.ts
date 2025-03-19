"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { refreshAccessToken, getUserFromSession } from "@/lib/actions/auth";
import { toastError } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuth() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const refreshInterval = 1 * 60 * 1000;
  const [lastRefreshTime, setLastRefreshTime] = useState<number | null>(null);

  useEffect(() => {
    const savedTime = localStorage.getItem("lastRefreshTime");
    if (savedTime) {
      setLastRefreshTime(parseInt(savedTime, 10));
    }
  }, []);

  const userQuery = useQuery({
    queryKey: ["userSession"],
    queryFn: async () => {
      console.log("Fetching user session...");
      try {
        const user = await getUserFromSession();
        console.log("User session:", user);
        return user ?? null;
      } catch (error) {
        console.error("Error fetching user session:", error);
        return null;
      }
    },
    staleTime: refreshInterval,
  });

  useEffect(() => {
    if (!lastRefreshTime) return;

    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime;
    const nextRefreshIn = Math.max(refreshInterval - timeSinceLastRefresh, 0);

    console.log(
      `Last refresh at: ${new Date(
        lastRefreshTime
      ).toLocaleTimeString()}, Next refresh in: ${nextRefreshIn / 1000} seconds`
    );

    const timeout = setTimeout(async () => {
      console.log("Auto-refreshing access token...");
      const { success } = await refreshAccessToken();

      if (!success) {
        toastError("Session expired. Please login again.");
        localStorage.removeItem("lastRefreshTime");
        router.push("/user/login");
      } else {
        localStorage.setItem("lastRefreshTime", Date.now().toString());
        setLastRefreshTime(Date.now());
      }
    }, nextRefreshIn);

    return () => clearTimeout(timeout);
  }, [lastRefreshTime]);

  return {
    user: userQuery.data,
    isUserLoading: userQuery.isLoading,
    updateLastRefreshTime: () => {
      localStorage.setItem("lastRefreshTime", Date.now().toString());
      setLastRefreshTime(Date.now());
    },
  };
}
