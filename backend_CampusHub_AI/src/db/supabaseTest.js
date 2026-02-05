import { supabase } from "../config/supabase.js";

export const testSupabaseConnection = async () => {
  try {
    // this table always exists
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Supabase connection failed.", error.message);
    } else {
      console.log("Supabase connection established successfully.");
    }
  } catch (error) {
    console.error("❌ Unexpected error:", error.message);
  }
};
