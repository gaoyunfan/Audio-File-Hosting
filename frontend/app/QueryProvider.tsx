"use client";

import { toastError } from "@/lib/utils";
import {
  isServer,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";

function makeQueryClient(router: any) {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const errorMessage = error?.message || "";

        if (errorMessage.includes("Session terminated")) {
          toastError("Re-login required");
          router.push("/users/login");
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient(router: any) {
  if (isServer) {
    return makeQueryClient(router);
  } else {
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient(router);
    }
    return browserQueryClient;
  }
}

export default function QueryProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = getQueryClient(router);
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
