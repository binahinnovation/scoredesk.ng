const SUPABASE_URL = "https://pvptekcpmmuwonnlemjq.supabase.co";

async function testSupabase() {
  try {
    const res = await fetch(`${SUPABASE_URL}`);
  } catch (e) {
    console.error("Fetch error:", e.message);
    console.error("Cause:", e.cause);
  }
}

testSupabase();
