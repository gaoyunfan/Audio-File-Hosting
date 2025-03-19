"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserFromSession, refreshAccessToken } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { toastError } from "./utils";

export function useUserSession() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: user, refetch } = useQuery({
    queryKey: ["userSession"],
    queryFn: getUserFromSession,
  });

  const updateUserSession = async () => {
    await queryClient.invalidateQueries({ queryKey: ["userSession"] });
  };

  return { user, updateUserSession };
}
