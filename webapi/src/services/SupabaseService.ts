import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { Service } from "@tsed/common";

import { Database } from "@src/models/types";

@Service()
export class SupabaseService {
  public supabase: SupabaseClient<Database>;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    this.supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "");
  }
}
