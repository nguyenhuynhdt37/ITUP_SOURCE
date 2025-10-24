import { supabase } from "./supabaseClient";

export const getAdminUser = async () => {
  try {
    // Lấy session hiện tại
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return { user: null, admin: null, error: sessionError };
    }

    // Kiểm tra quyền admin
    const email = session.user?.email || "";
    const { data: admin, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("email", email)
      .single();

    if (adminError || !admin) {
      return { user: session.user, admin: null, error: adminError };
    }

    return { user: session.user, admin, error: null };
  } catch (error) {
    return { user: null, admin: null, error };
  }
};
