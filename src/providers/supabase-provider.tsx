"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  // Tạo client 1 lần, provider tự quản lý session
  const supabase = createClientComponentClient();

  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}
