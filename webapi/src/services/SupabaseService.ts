import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { Service } from "@tsed/common";

@Service()
export class SupabaseService {
  public supabase: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    this.supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "");
  }
}
