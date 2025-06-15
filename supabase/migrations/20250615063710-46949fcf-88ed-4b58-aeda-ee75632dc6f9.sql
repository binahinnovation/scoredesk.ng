
-- 1. Add a school_id column to profiles, if not present
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_id uuid;

-- 2. Create a schools table if not existing, to store each school and its unique id
CREATE TABLE IF NOT EXISTS public.schools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  alias text,
  created_by uuid, -- user who created the school
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Assign principals to their school. For any profile that is principal and missing a school_id, auto-create a school and assign.
--    This is an advisory comment, not SQL (manual data repair may be needed after initial migration).

-- 4. Optionally, enforce that all profiles have a school_id by making it NOT NULL after assigning.

-- 5. Add a school_id column to user_roles for direct linking (optional for future features)
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS school_id uuid;

-- 6. Update the get_manageable_users() function (if necessary) to use school_id instead of matching on school_name for principal views.
--    Modifications will be needed in the function for proper filtering.

