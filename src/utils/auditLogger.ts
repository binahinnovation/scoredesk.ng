import { supabase } from "@/integrations/supabase/client";

interface LogEditParams {
  schoolId: string;
  actorId: string;
  actionType: 'insert' | 'update' | 'delete';
  tableName: string;
  recordId: string;
  oldValue: object | null;
  newValue: object | null;
  reason?: string | null;
}

export async function logEdit({
  schoolId,
  actorId,
  actionType,
  tableName,
  recordId,
  oldValue,
  newValue,
  reason = null,
}: LogEditParams) {
  try {
    const { error } = await supabase.rpc('fn_log_edit', {
      p_school_id: schoolId,
      p_actor_id: actorId,
      p_action: actionType,
      p_table: tableName,
      p_record: recordId,
      p_old: oldValue,
      p_new: newValue,
      p_reason: reason,
    });

    if (error) {
      console.error(`Error logging edit for ${tableName} (${recordId}):`, error);
    }
  } catch (err) {
    console.error(`Unexpected error logging edit for ${tableName} (${recordId}):`, err);
  }
}

// Helper function to get current user's school ID
export async function getCurrentUserSchoolId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('school_id')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error("Error fetching user's school ID:", error);
      return null;
    }

    return profile?.school_id || null;
  } catch (err) {
    console.error("Unexpected error fetching school ID:", err);
    return null;
  }
}