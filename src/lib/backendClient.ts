/**
 * @deprecated All functions previously handled by Edge Functions have been
 * migrated to the Python FastAPI backend (see `src/lib/customerApi.ts`).
 * This file is retained only for backwards compatibility and is no longer called.
 */
import { supabase } from "./supabase";

export const invokeFunction = async (functionName: string, options: any = {}) => {
  console.warn(`⚠️ [Deprecated] invokeFunction called for: ${functionName}. All logic has moved to the REST API.`);
  return supabase.functions.invoke(functionName, options);
};
