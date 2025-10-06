# Testing School Isolation - Complete Guide

## Overview
This guide provides step-by-step instructions to thoroughly test that schools cannot see each other's data.

## Test Environment Setup

### Prerequisites
- ✅ Database migration applied (`20250105000000_enforce_school_isolation.sql`)
- ✅ Application code deployed with school isolation fixes
- ✅ Two separate email accounts for testing
- ✅ Chrome/Firefox browser (recommend incognito mode for second account)

## Phase 1: Setup Test Schools

### Step 1.1: Create School A
1. Open browser in **Incognito/Private mode**
2. Navigate to `https://your-app-url.com/signup`
3. Sign up with:
   - Email: `schoola-test@example.com` (use your real email for testing)
   - Password: `TestSchoolA123!`
   - School Name: `Test School A`
   - Full Name: `Principal A`
4. ✅ Verify signup successful
5. ✅ Verify you're redirected to dashboard
6. **Keep this browser window open**

### Step 1.2: Create School B
1. Open **new incognito window** (separate from School A)
2. Navigate to `https://your-app-url.com/signup`
3. Sign up with:
   - Email: `schoolb-test@example.com` (use different real email)
   - Password: `TestSchoolB123!`
   - School Name: `Test School B`
   - Full Name: `Principal B`
4. ✅ Verify signup successful
5. ✅ Verify you're redirected to dashboard
6. **Keep this browser window open**

**You should now have two browser windows:**
- Window 1: Logged in as School A
- Window 2: Logged in as School B

## Phase 2: Populate School A Data

**In School A window:**

### Step 2.1: Create Classes for School A
1. Navigate to **Classes & Subjects**
2. Click **Quick Add → Add All Nigerian Classes**
3. ✅ Verify classes created successfully
4. Note: You should see classes like "Primary 1", "JSS1A", "SS1A", etc.

### Step 2.2: Create Subjects for School A
1. Still in **Classes & Subjects**
2. Switch to **Subjects** tab
3. Click **Quick Add → Add All Nigerian Subjects**
4. ✅ Verify subjects created successfully
5. Note: You should see subjects like "Mathematics", "English Language", etc.

### Step 2.3: Create Students for School A
1. Navigate to **Student Management**
2. Create 5 students with these details:

**Student 1:**
- First Name: Alice
- Last Name: Anderson
- Class: Primary 1
- Student ID: (auto-generated or use SA001)

**Student 2:**
- First Name: Bob
- Last Name: Brown
- Class: Primary 2
- Student ID: (auto-generated or use SA002)

**Student 3:**
- First Name: Charlie
- Last Name: Chen
- Class: JSS1A
- Student ID: (auto-generated or use SA003)

**Student 4:**
- First Name: Diana
- Last Name: Davis
- Class: JSS2A
- Student ID: (auto-generated or use SA004)

**Student 5:**
- First Name: Edward
- Last Name: Evans
- Class: SS1A
- Student ID: (auto-generated or use SA005)

3. ✅ Verify all 5 students appear in the student list
4. ✅ Note the total student count on dashboard

### Step 2.4: Create Terms for School A
1. Navigate to **Settings → Term Management**
2. Create term:
   - Name: First Term
   - Academic Year: 2024/2025
   - Start Date: 2024-09-01
   - End Date: 2024-12-15
   - Is Current: Yes

### Step 2.5: Enter Results for School A
1. Navigate to **Result Entry**
2. Select:
   - Class: Primary 1
   - Subject: Mathematics
   - Assessment: First CA
   - Term: First Term
3. Enter scores for Alice Anderson
4. Click **Save Results**
5. ✅ Verify results saved successfully

## Phase 3: Populate School B Data

**In School B window:**

### Step 3.1: Create Classes for School B
1. Navigate to **Classes & Subjects**
2. Create 3 custom classes:
   - "Grade 1"
   - "Grade 2"
   - "Grade 3"
3. ✅ Verify classes created successfully

### Step 3.2: Create Subjects for School B
1. Still in **Classes & Subjects**
2. Switch to **Subjects** tab
3. Create 3 subjects manually:
   - "Math"
   - "Science"
   - "English"
4. ✅ Verify subjects created successfully

### Step 3.3: Create Students for School B
1. Navigate to **Student Management**
2. Create 5 DIFFERENT students:

**Student 1:**
- First Name: Frank
- Last Name: Fisher
- Class: Grade 1
- Student ID: (auto-generated or use SB001)

**Student 2:**
- First Name: Grace
- Last Name: Green
- Class: Grade 1
- Student ID: (auto-generated or use SB002)

**Student 3:**
- First Name: Henry
- Last Name: Harris
- Class: Grade 2
- Student ID: (auto-generated or use SB003)

**Student 4:**
- First Name: Iris
- Last Name: Iverson
- Class: Grade 2
- Student ID: (auto-generated or use SB004)

**Student 5:**
- First Name: Jack
- Last Name: Johnson
- Class: Grade 3
- Student ID: (auto-generated or use SB005)

3. ✅ Verify all 5 students appear in the student list
4. ✅ Note the total student count on dashboard

## Phase 4: CRITICAL ISOLATION TESTS

### Test 4.1: Student Isolation
**In School A window:**
1. Navigate to **Student Management**
2. Search for "Frank" (School B student)
3. ✅ **PASS**: Should return NO results
4. ✅ **PASS**: Total student count should be 5 (only School A students)
5. ✅ **PASS**: Should only see Alice, Bob, Charlie, Diana, Edward

**In School B window:**
1. Navigate to **Student Management**
2. Search for "Alice" (School A student)
3. ✅ **PASS**: Should return NO results
4. ✅ **PASS**: Total student count should be 5 (only School B students)
5. ✅ **PASS**: Should only see Frank, Grace, Henry, Iris, Jack

### Test 4.2: Class Isolation
**In School A window:**
1. Navigate to **Classes & Subjects**
2. Check class list
3. ✅ **PASS**: Should only see Nigerian classes (Primary 1, JSS1A, etc.)
4. ✅ **PASS**: Should NOT see "Grade 1", "Grade 2", "Grade 3"

**In School B window:**
1. Navigate to **Classes & Subjects**
2. Check class list
3. ✅ **PASS**: Should only see "Grade 1", "Grade 2", "Grade 3"
4. ✅ **PASS**: Should NOT see "Primary 1", "JSS1A", etc.

### Test 4.3: Subject Isolation
**In School A window:**
1. Navigate to **Classes & Subjects → Subjects**
2. Check subject list
3. ✅ **PASS**: Should see Nigerian subjects (Mathematics, English Language, etc.)
4. ✅ **PASS**: Should NOT see "Math", "Science", "English" (School B's subjects)

**In School B window:**
1. Navigate to **Classes & Subjects → Subjects**
2. Check subject list
3. ✅ **PASS**: Should only see "Math", "Science", "English"
4. ✅ **PASS**: Should NOT see "Mathematics", "English Language" (School A's subjects)

### Test 4.4: Dashboard Isolation
**In School A window:**
1. Navigate to **Dashboard**
2. Check statistics:
   - ✅ **PASS**: Students count = 5
   - ✅ **PASS**: Classes count = ~30 (Nigerian classes)
   - ✅ **PASS**: Subjects count = ~40 (Nigerian subjects)
3. Check recent activity
4. ✅ **PASS**: Should only show School A activities

**In School B window:**
1. Navigate to **Dashboard**
2. Check statistics:
   - ✅ **PASS**: Students count = 5
   - ✅ **PASS**: Classes count = 3
   - ✅ **PASS**: Subjects count = 3
3. Check recent activity
4. ✅ **PASS**: Should only show School B activities

### Test 4.5: Result Entry Isolation
**In School A window:**
1. Navigate to **Result Entry**
2. Select any class
3. Check student list
4. ✅ **PASS**: Should only show School A students
5. ✅ **PASS**: Should NOT see Frank, Grace, Henry, Iris, Jack

**In School B window:**
1. Navigate to **Result Entry**
2. Select "Grade 1"
3. Check student list
4. ✅ **PASS**: Should only show School B students (Frank, Grace)
5. ✅ **PASS**: Should NOT see Alice, Bob, Charlie, Diana, Edward

### Test 4.6: Analytics Isolation
**In School A window:**
1. Navigate to **Analytics Dashboard**
2. Check all charts and graphs
3. ✅ **PASS**: All data should reflect only School A
4. ✅ **PASS**: No mention of School B students or activities

**In School B window:**
1. Navigate to **Analytics Dashboard**
2. Check all charts and graphs
3. ✅ **PASS**: All data should reflect only School B
4. ✅ **PASS**: No mention of School A students or activities

## Phase 5: Database-Level Verification

### Test 5.1: Direct Database Query (Via Supabase Dashboard)

1. Log into Supabase Dashboard
2. Go to **SQL Editor**
3. Run these queries:

**Query 1: Check School A's data**
```sql
-- Get School A's school_id (replace email)
SELECT school_id FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'schoola-test@example.com');

-- Check students for School A (replace [SCHOOL_A_ID])
SELECT COUNT(*) FROM students WHERE school_id = '[SCHOOL_A_ID]';
```
✅ **PASS**: Should return 5

**Query 2: Check School B's data**
```sql
-- Get School B's school_id (replace email)
SELECT school_id FROM profiles 
WHERE id = (SELECT id FROM auth.users WHERE email = 'schoolb-test@example.com');

-- Check students for School B (replace [SCHOOL_B_ID])
SELECT COUNT(*) FROM students WHERE school_id = '[SCHOOL_B_ID]';
```
✅ **PASS**: Should return 5

**Query 3: Cross-school verification**
```sql
-- These should be DIFFERENT school_ids
SELECT 
  'School A' as school,
  school_id,
  (SELECT COUNT(*) FROM students WHERE school_id = p.school_id) as student_count
FROM profiles p
WHERE id = (SELECT id FROM auth.users WHERE email = 'schoola-test@example.com')
UNION ALL
SELECT 
  'School B' as school,
  school_id,
  (SELECT COUNT(*) FROM students WHERE school_id = p.school_id) as student_count
FROM profiles p
WHERE id = (SELECT id FROM auth.users WHERE email = 'schoolb-test@example.com');
```
✅ **PASS**: Two different school_ids, each with 5 students

### Test 5.2: RLS Policy Verification
```sql
-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('students', 'results', 'classes', 'subjects');
```
✅ **PASS**: All tables should have `rowsecurity = true`

```sql
-- Check policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE tablename IN ('students', 'results', 'classes', 'subjects')
ORDER BY tablename, policyname;
```
✅ **PASS**: Should see multiple policies for each table

## Phase 6: Stress Tests

### Test 6.1: Bulk Data Test
1. In School A: Import 50 students via CSV
2. In School B: Import 50 students via CSV (different students)
3. ✅ **PASS**: Each school should see only their 55 students (5 + 50)

### Test 6.2: Concurrent Access Test
1. Have School A and School B both accessing data simultaneously
2. Create students in both schools at the same time
3. ✅ **PASS**: No data leakage between schools
4. ✅ **PASS**: Each school's operations don't affect the other

### Test 6.3: Result Entry Stress Test
1. Enter 100 results in School A
2. Enter 100 results in School B
3. ✅ **PASS**: Analytics show correct counts per school
4. ✅ **PASS**: No cross-contamination of results

## Success Criteria

✅ **COMPLETE ISOLATION** achieved if ALL these are true:

### Data Access
- [ ] School A cannot see School B's students
- [ ] School B cannot see School A's students
- [ ] School A cannot see School B's classes
- [ ] School B cannot see School A's classes
- [ ] School A cannot see School B's subjects
- [ ] School B cannot see School A's subjects
- [ ] School A cannot see School B's results
- [ ] School B cannot see School A's results

### Dashboard & Analytics
- [ ] Dashboard shows only school-specific counts
- [ ] Analytics reflect only school-specific data
- [ ] Recent activity shows only school-specific events

### Data Operations
- [ ] Each school can create their own data
- [ ] Each school can update their own data
- [ ] Each school can delete their own data
- [ ] No school can modify another school's data

### Database Level
- [ ] RLS policies active on all tables
- [ ] Direct queries respect school boundaries
- [ ] Function `get_current_user_school_id()` works correctly

## Troubleshooting Failed Tests

### If School A can see School B's data:
1. Check database migration was applied
2. Verify RLS is enabled: See Test 5.2
3. Check application code has school_id filtering
4. Clear browser cache and reload

### If counts don't match:
1. Check for orphaned data (school_id = NULL)
2. Run cleanup query:
```sql
-- Find orphaned records
SELECT 'students' as table_name, COUNT(*) FROM students WHERE school_id IS NULL
UNION ALL
SELECT 'results', COUNT(*) FROM results WHERE school_id IS NULL
UNION ALL
SELECT 'classes', COUNT(*) FROM classes WHERE school_id IS NULL;
```

### If queries fail:
1. Check user has school_id assigned:
```sql
SELECT id, school_id FROM profiles WHERE id = auth.uid();
```
2. If NULL, assign school_id

## Test Report Template

```markdown
# School Isolation Test Report

**Test Date**: [DATE]
**Tester**: [YOUR NAME]
**Environment**: [PRODUCTION/STAGING/DEV]

## Test Results

### Phase 1: Setup
- School A Created: ✅ / ❌
- School B Created: ✅ / ❌

### Phase 2: Data Population
- School A Data: ✅ / ❌
- School B Data: ✅ / ❌

### Phase 3: Isolation Tests
- Student Isolation: ✅ / ❌
- Class Isolation: ✅ / ❌
- Subject Isolation: ✅ / ❌
- Dashboard Isolation: ✅ / ❌
- Result Entry Isolation: ✅ / ❌
- Analytics Isolation: ✅ / ❌

### Phase 4: Database Verification
- Direct Queries: ✅ / ❌
- RLS Policies: ✅ / ❌

### Phase 5: Stress Tests
- Bulk Data: ✅ / ❌
- Concurrent Access: ✅ / ❌

## Overall Result
**PASS** / **FAIL**

## Issues Found
[List any issues]

## Recommendations
[List recommendations]
```

## Cleanup After Testing

Once testing is complete:

```sql
-- Delete test schools and all their data
DELETE FROM students WHERE school_id IN (
  SELECT school_id FROM profiles WHERE id IN (
    SELECT id FROM auth.users WHERE email IN ('schoola-test@example.com', 'schoolb-test@example.com')
  )
);

-- Delete test users
DELETE FROM auth.users WHERE email IN ('schoola-test@example.com', 'schoolb-test@example.com');
```

---

**Duration**: ~30-45 minutes for complete test
**Required**: 2 email accounts, 2 browser windows
**Goal**: Zero data leakage between schools

