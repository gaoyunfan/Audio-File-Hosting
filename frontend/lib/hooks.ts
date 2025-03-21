"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserFromSession } from "@/lib/actions/auth";

export function useUserSession() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ["userSession"],
    queryFn: getUserFromSession,
  });

  const updateUserSession = async () => {
    await queryClient.invalidateQueries({ queryKey: ["userSession"] });
  };

  return { user, updateUserSession };
}
