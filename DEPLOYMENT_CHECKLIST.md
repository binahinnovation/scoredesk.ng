# School Isolation Fix - Deployment Checklist

## 🎯 Purpose
This checklist ensures proper deployment of the school data isolation fix to prevent schools from seeing each other's data.

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### Code Changes
- [x] `src/hooks/use-school-id.tsx` - Created centralized school ID hook
- [x] `src/utils/auditLogger.ts` - Updated to use centralized getCurrentUserSchoolId
- [x] `src/pages/students/StudentManagement.tsx` - Added school_id filtering
- [x] `src/hooks/use-dashboard-data.tsx` - Added school_id filtering
- [x] `src/pages/results/ResultEntry.tsx` - Added school_id filtering
- [x] `src/pages/classes/ClassSubjectManagement.tsx` - Added school_id filtering
- [ ] `src/pages/analytics/AnalyticsDashboard.tsx` - Add school_id filtering
- [ ] `src/pages/results/ResultApproval.tsx` - Add school_id filtering
- [ ] `src/pages/results/StudentResultApproval.tsx` - Add school_id filtering
- [ ] `src/pages/ranking/ClassRanking.tsx` - Add school_id filtering
- [ ] `src/pages/scratchcards/ScratchCards.tsx` - Review and update school_id filtering
- [ ] Other pages as per `APPLY_SCHOOL_ISOLATION_FIX.md`

### Database Migration
- [ ] Review `supabase/migrations/20250105000000_enforce_school_isolation.sql`
- [ ] Backup current database (via Supabase Dashboard)
- [ ] Apply migration (see `DATABASE_MIGRATION_GUIDE.md`)
- [ ] Verify migration success
- [ ] Create performance indexes

### Documentation
- [x] `SCHOOL_ISOLATION_FIX.md` - Implementation summary
- [x] `APPLY_SCHOOL_ISOLATION_FIX.md` - Quick apply guide
- [x] `DATABASE_MIGRATION_GUIDE.md` - Migration instructions
- [x] `TESTING_SCHOOL_ISOLATION.md` - Testing procedures
- [x] `DEPLOYMENT_CHECKLIST.md` - This file

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Pre-Deployment Preparation
**Estimated Time: 15 minutes**

- [ ] Review all code changes
- [ ] Run linting: `npm run lint`
- [ ] Fix any linting errors
- [ ] Build application: `npm run build`
- [ ] Test build locally: `npm run preview`
- [ ] Commit all changes to git
- [ ] Create deployment branch: `git checkout -b deploy/school-isolation-fix`
- [ ] Push to remote: `git push origin deploy/school-isolation-fix`

### Step 2: Database Backup
**Estimated Time: 5 minutes**

- [ ] Log into Supabase Dashboard
- [ ] Navigate to Database → Backups
- [ ] Create manual backup
- [ ] Name it: `pre-school-isolation-fix-[DATE]`
- [ ] Wait for backup to complete
- [ ] Download backup file (optional but recommended)

### Step 3: Apply Database Migration
**Estimated Time: 10 minutes**

Follow instructions in `DATABASE_MIGRATION_GUIDE.md`:

- [ ] Open Supabase SQL Editor
- [ ] Copy migration SQL from `supabase/migrations/20250105000000_enforce_school_isolation.sql`
- [ ] Paste into SQL Editor
- [ ] Execute migration
- [ ] Verify no errors
- [ ] Run verification queries:
  ```sql
  -- Check function exists
  SELECT proname FROM pg_proc WHERE proname = 'get_current_user_school_id';
  
  -- Check policies created
  SELECT COUNT(*) FROM pg_policies WHERE policyname LIKE '%school%';
  
  -- Check RLS enabled
  SELECT tablename, rowsecurity FROM pg_tables 
  WHERE schemaname = 'public' AND rowsecurity = true;
  ```
- [ ] All verification queries pass ✅

### Step 4: Create Performance Indexes
**Estimated Time: 5 minutes**

```sql
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

- [ ] All indexes created successfully ✅

### Step 5: Handle Existing Data
**Estimated Time: Variable**

⚠️ **CRITICAL**: Check for data without school_id

```sql
-- Check for orphaned data
SELECT 'students' as table_name, COUNT(*) as orphaned FROM students WHERE school_id IS NULL
UNION ALL
SELECT 'results', COUNT(*) FROM results WHERE school_id IS NULL
UNION ALL
SELECT 'classes', COUNT(*) FROM classes WHERE school_id IS NULL
UNION ALL
SELECT 'subjects', COUNT(*) FROM subjects WHERE school_id IS NULL
UNION ALL
SELECT 'assessments', COUNT(*) FROM assessments WHERE school_id IS NULL
UNION ALL
SELECT 'terms', COUNT(*) FROM terms WHERE school_id IS NULL;
```

**If orphaned data exists:**
- [ ] Identify the school for orphaned data
- [ ] Get the school_id
- [ ] Update orphaned records (see `DATABASE_MIGRATION_GUIDE.md`)
- [ ] Verify no orphaned data remains

### Step 6: Deploy Application Code
**Estimated Time: 10 minutes**

**For Lovable/Netlify/Vercel:**
- [ ] Merge deployment branch to main
- [ ] Push to main: `git push origin main`
- [ ] Wait for automatic deployment
- [ ] Check deployment logs
- [ ] Verify deployment successful

**For Manual Deployment:**
- [ ] Build production: `npm run build`
- [ ] Upload dist folder to hosting
- [ ] Clear CDN cache if applicable
- [ ] Verify deployment successful

### Step 7: Smoke Test (Quick Verification)
**Estimated Time: 5 minutes**

- [ ] Navigate to your app URL
- [ ] Log in with existing account
- [ ] Check Dashboard loads
- [ ] Check Student Management loads
- [ ] Check can see your own data
- [ ] No console errors

---

## 🧪 POST-DEPLOYMENT TESTING

### Immediate Tests (Within 1 hour)
**Estimated Time: 45 minutes**

Follow `TESTING_SCHOOL_ISOLATION.md` for comprehensive testing:

- [ ] Create two test school accounts
- [ ] Populate School A with test data
- [ ] Populate School B with test data
- [ ] Verify School A cannot see School B data
- [ ] Verify School B cannot see School A data
- [ ] Test all critical pages
- [ ] Run database verification queries
- [ ] All tests pass ✅

### Performance Monitoring (First 24 hours)
- [ ] Monitor query performance in Supabase Dashboard
- [ ] Check for slow queries
- [ ] Monitor error rates
- [ ] Monitor user complaints/support tickets
- [ ] Review application logs

---

## 🚨 ROLLBACK PLAN

**If critical issues occur:**

### Emergency Rollback (Use only if necessary)

**Step 1: Disable RLS Temporarily** (gives immediate relief)
```sql
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE results DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects DISABLE ROW LEVEL SECURITY;
ALTER TABLE assessments DISABLE ROW LEVEL SECURITY;
ALTER TABLE terms DISABLE ROW LEVEL SECURITY;
```

**Step 2: Revert Application Code**
- Revert to previous git commit
- Redeploy previous version

**Step 3: Restore Database Backup** (if data corruption)
- Use Supabase Dashboard → Database → Backups
- Restore to pre-migration backup

⚠️ **WARNING**: Rollback means schools can see each other's data again!

---

## ✅ SUCCESS CRITERIA

Deployment is successful when:

### Functional Requirements
- [x] All code changes deployed
- [x] Database migration applied
- [x] No deployment errors
- [x] Application loads normally
- [ ] All test cases pass
- [ ] Schools cannot see each other's data
- [ ] Users can still access their own data
- [ ] No increase in error rates

### Performance Requirements
- [ ] Page load times < 3 seconds
- [ ] Query response times < 500ms
- [ ] No database timeout errors
- [ ] No memory issues

### Business Requirements
- [ ] No user complaints about missing data
- [ ] No support tickets related to deployment
- [ ] All schools can operate normally
- [ ] Data integrity maintained

---

## 📊 POST-DEPLOYMENT MONITORING

### Week 1: Close Monitoring
**Daily Tasks:**
- [ ] Review error logs
- [ ] Check user feedback
- [ ] Monitor database performance
- [ ] Review support tickets
- [ ] Check for data isolation violations

**Metrics to Track:**
- Query performance (avg response time)
- Error rates (should be < 1%)
- User complaints (should be 0)
- Database CPU usage
- RLS policy violations (should be 0)

### Week 2-4: Normal Monitoring
- [ ] Weekly performance review
- [ ] Weekly user feedback review
- [ ] Monthly database health check

---

## 📝 DEPLOYMENT LOG

**Deployment Date**: _______________
**Deployed By**: _______________
**Version/Commit**: _______________

### Pre-Deployment
- Database Backup ID: _______________
- Migration Applied: ✅ / ❌
- Code Deployed: ✅ / ❌

### Testing
- Smoke Test: ✅ / ❌
- Isolation Test: ✅ / ❌
- Performance Test: ✅ / ❌

### Issues Encountered
- Issue 1: _______________
  - Resolution: _______________
- Issue 2: _______________
  - Resolution: _______________

### Sign-Off
- Technical Lead: _______________
- Product Owner: _______________

---

## 🔗 Related Documents

- [SCHOOL_ISOLATION_FIX.md](./SCHOOL_ISOLATION_FIX.md) - Implementation details
- [DATABASE_MIGRATION_GUIDE.md](./DATABASE_MIGRATION_GUIDE.md) - Database setup
- [TESTING_SCHOOL_ISOLATION.md](./TESTING_SCHOOL_ISOLATION.md) - Testing procedures
- [APPLY_SCHOOL_ISOLATION_FIX.md](./APPLY_SCHOOL_ISOLATION_FIX.md) - Quick fixes for remaining pages

---

## 📞 Support Contacts

**In case of issues:**
- Technical Lead: _______________
- Database Admin: _______________
- Supabase Support: support@supabase.com

---

**Last Updated**: January 2025
**Version**: 1.0
**Status**: Ready for Production Deployment

