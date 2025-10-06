# Database Migration Setup Guide

## Overview
This guide helps you apply the school isolation RLS (Row Level Security) policies to your Supabase database.

## Prerequisites
- Access to Supabase Dashboard
- Admin/Owner role in your Supabase project
- Database access via SQL Editor

## Migration File
Location: `supabase/migrations/20250105000000_enforce_school_isolation.sql`

## Option 1: Apply via Supabase Dashboard (RECOMMENDED)

### Step 1: Open SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"

### Step 2: Copy Migration SQL
1. Open `supabase/migrations/20250105000000_enforce_school_isolation.sql`
2. Copy the ENTIRE contents
3. Paste into the SQL Editor

### Step 3: Execute Migration
1. Click "Run" button (or press Ctrl/Cmd + Enter)
2. Wait for execution to complete
3. Check for any errors in the output panel

### Step 4: Verify Migration
Run this query to verify the function was created:
```sql
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'get_current_user_school_id';
```

Expected output: Should return 1 row with function details.

Run this to verify policies:
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE policyname LIKE '%school%'
ORDER BY tablename, policyname;
```

Expected output: Should return multiple policies for students, results, classes, etc.

## Option 2: Apply via Supabase CLI

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Project linked: `supabase link --project-ref YOUR_PROJECT_REF`

### Steps
```bash
# 1. Navigate to project directory
cd path/to/scoredex

# 2. Push migration to database
supabase db push

# 3. Verify migration status
supabase db inspect
```

## Option 3: Apply via psql (Advanced)

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR_PASSWORD]@[YOUR_PROJECT_REF].supabase.co:5432/postgres"

# Run the migration
\i supabase/migrations/20250105000000_enforce_school_isolation.sql
```

## Post-Migration Tasks

### 1. Verify RLS is Enabled
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('students', 'results', 'classes', 'subjects', 'assessments');
```

All tables should show `rowsecurity = true`

### 2. Test Policy Functionality
```sql
-- Should only return your school's data
SELECT COUNT(*) FROM students WHERE school_id = get_current_user_school_id();
SELECT COUNT(*) FROM results WHERE school_id = get_current_user_school_id();
SELECT COUNT(*) FROM classes WHERE school_id = get_current_user_school_id();
```

### 3. Assign school_id to Existing Data (IF NEEDED)

⚠️ **WARNING**: Only run this if you have existing data without school_id

```sql
-- First, create a school for orphaned data
INSERT INTO schools (name, created_by)
VALUES ('Legacy School', auth.uid())
RETURNING id;

-- Note the returned ID, then update orphaned records
UPDATE students SET school_id = '[SCHOOL_ID_FROM_ABOVE]' WHERE school_id IS NULL;
UPDATE results SET school_id = '[SCHOOL_ID_FROM_ABOVE]' WHERE school_id IS NULL;
UPDATE classes SET school_id = '[SCHOOL_ID_FROM_ABOVE]' WHERE school_id IS NULL;
UPDATE subjects SET school_id = '[SCHOOL_ID_FROM_ABOVE]' WHERE school_id IS NULL;
UPDATE assessments SET school_id = '[SCHOOL_ID_FROM_ABOVE]' WHERE school_id IS NULL;
UPDATE terms SET school_id = '[SCHOOL_ID_FROM_ABOVE]' WHERE school_id IS NULL;
```

## Performance Optimization

After migration, create indexes for better performance:

```sql
-- Add indexes on school_id columns
CREATE INDEX IF NOT EXISTS idx_students_school_id ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_results_school_id ON results(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school_id ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school_id ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_assessments_school_id ON assessments(school_id);
CREATE INDEX IF NOT EXISTS idx_terms_school_id ON terms(school_id);
CREATE INDEX IF NOT EXISTS idx_scratch_cards_school_id ON scratch_cards(school_id);
CREATE INDEX IF NOT EXISTS idx_attendance_school_id ON attendance(school_id);
CREATE INDEX IF NOT EXISTS idx_question_papers_school_id ON question_papers(school_id);
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_school_id ON user_roles(school_id);
```

## Rollback (Emergency Only)

If something goes wrong, you can disable RLS temporarily:

```sql
-- EMERGENCY ROLLBACK - Use only if absolutely necessary
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE results DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
-- etc.
```

⚠️ **WARNING**: This removes data isolation. Only use for debugging.

## Troubleshooting

### Issue: "insufficient privilege" error
**Solution**: Make sure you're executing as the postgres user or have sufficient privileges.

### Issue: "relation does not exist"
**Solution**: Check that all tables exist in your database. The migration assumes standard ScoreDesk schema.

### Issue: Existing policies conflict
**Solution**: The migration includes `DROP POLICY IF EXISTS` statements. If you still get conflicts, manually drop conflicting policies first.

### Issue: Can't see any data after migration
**Solution**: 
1. Check that your profile has a school_id: `SELECT school_id FROM profiles WHERE id = auth.uid();`
2. If NULL, assign one: `UPDATE profiles SET school_id = '[SCHOOL_ID]' WHERE id = auth.uid();`

## Verification Queries

Run these after migration to ensure everything works:

```sql
-- 1. Check your school_id
SELECT get_current_user_school_id();

-- 2. Count accessible students
SELECT COUNT(*) FROM students;

-- 3. Try to access another school's data (should return 0)
SELECT COUNT(*) FROM students WHERE school_id != get_current_user_school_id();

-- 4. Verify you can insert
INSERT INTO students (first_name, last_name, student_id, school_id)
VALUES ('Test', 'Student', 'TEST001', get_current_user_school_id());

-- 5. Clean up test
DELETE FROM students WHERE student_id = 'TEST001';
```

## Success Criteria

✅ Migration successful if:
- All policies created without errors
- `get_current_user_school_id()` function works
- You can see your school's data
- You cannot see other schools' data
- You can create new records with school_id
- All indexes created successfully

## Support

If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Review the migration SQL for syntax errors
3. Ensure your user has proper permissions
4. Check that all required tables exist

## Next Steps

After successful migration:
1. Deploy updated application code
2. Test with multiple school accounts
3. Monitor for any RLS policy violations
4. Run performance tests with indexes

---

**Migration File**: `supabase/migrations/20250105000000_enforce_school_isolation.sql`
**Created**: January 2025
**Purpose**: Enforce complete data isolation between schools
**Impact**: HIGH - Affects all data access patterns

