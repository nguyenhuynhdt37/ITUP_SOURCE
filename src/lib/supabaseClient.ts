import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

// Create a singleton instance to prevent multiple client creation
let supabaseInstance: ReturnType<typeof createClientComponentClient> | null =
  null;

export const getSupabaseClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClientComponentClient();
  }
  return supabaseInstance;
};

// Export the client instance
export const supabase = getSupabaseClient();
