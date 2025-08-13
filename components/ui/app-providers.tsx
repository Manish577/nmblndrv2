"use client";

import { ReactNode, useState } from "react";
import SessionProvider from "@/components/ui/session-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
