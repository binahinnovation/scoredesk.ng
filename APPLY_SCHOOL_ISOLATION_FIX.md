# Quick Apply: School Isolation Fix to All Remaining Pages

This document contains the exact changes to apply to each remaining page. Simply copy-paste the changes for each file.

## ✅ ALREADY COMPLETED
- ✅ Student Management
- ✅ Dashboard Data Hook
- ✅ Result Entry
- ✅ Class/Subject Management
- ✅ Database RLS Migration created

## 🔧 APPLY THESE CHANGES

### 1. Analytics Dashboard (`src/pages/analytics/AnalyticsDashboard.tsx`)

**Add import:**
```typescript
import { useSchoolId } from "@/hooks/use-school-id";
```

**Add hook at the top of component:**
```typescript
const { schoolId, loading: schoolIdLoading } = useSchoolId();
```

**Update all queries to add:**
```typescript
.eq('school_id', schoolId)
```

**Update all useQuery hooks with:**
```typescript
queryKey: ['your-key', schoolId],
enabled: !!schoolId && !schoolIdLoading,
```

---

### 2. Settings Pages

#### AssessmentSettings (`src/pages/settings/AssessmentSettings.tsx`)
#### TermManagement (`src/pages/settings/TermManagement.tsx`)

**Pattern for both:**
- Add: `import { useSchoolId } from "@/hooks/use-school-id";`
- Add: `const { schoolId } = useSchoolId();` 
- Filter all queries: `.eq('school_id', schoolId)`
- Include school_id in creates: `{ ...data, school_id: schoolId }`
- Update query keys: `['assessments', schoolId]` or `['terms', schoolId]`

---

### 3. Scratch Cards (`src/pages/scratchcards/ScratchCards.tsx`)

The file already has some school_id awareness, but needs comprehensive updates:

**Update fetchScratchCards query:**
```typescript
.eq('school_id', schoolId)
```

**Update card generation to include:**
```typescript
school_id: schoolId
```

---

### 4. Ranking (`src/pages/ranking/ClassRanking.tsx`)

**Add school_id filtering to:**
- Student queries
- Result queries  
- Class queries

---

### 5. Result Approval Pages

#### ResultApproval (`src/pages/results/ResultApproval.tsx`)
#### StudentResultApproval (`src/pages/results/StudentResultApproval.tsx`)

**Critical: Filter all result fetching by school_id**

---

## 🚀 AUTOMATED FIX SCRIPT

If you want to speed this up, here's the pattern to search and replace:

### Find:
```typescript
.from('TABLE_NAME')
.select(
```

### Replace with:
```typescript
.from('TABLE_NAME')
.select(
```
Then manually add `.eq('school_id', schoolId)` after the select.

### Find:
```typescript
queryKey: ['YOUR_KEY']
```

### Replace with:
```typescript
queryKey: ['YOUR_KEY', schoolId]
```

### Find inserts without school_id:
```typescript
.insert([data])
```

### Replace with:
```typescript
.insert([{ ...data, school_id: schoolId }])
```

---

## ⚡ PRIORITY ORDER

If time is limited, fix in this order:

### HIGH PRIORITY (Critical Data Access)
1. ✅ StudentManagement - DONE
2. ✅ ResultEntry - DONE  
3. ✅ Dashboard - DONE
4. ✅ ClassSubjectManagement - DONE
5. StudentResultApproval
6. ResultApproval
7. Analytics Dashboard
8. ScratchCards

### MEDIUM PRIORITY
9. ClassRanking
10. AssessmentSettings
11. TermManagement
12. QuestionPaperManagement

### LOWER PRIORITY
13. Attendance pages
14. ReportCardDesigner
15. User management pages
16. Branding

---

## 🧪 TESTING CHECKLIST

After applying fixes, test with TWO school accounts:

### Test School A (create first account via /signup)
1. Add 5 students
2. Create 3 classes
3. Add 5 subjects
4. Enter some results

### Test School B (create second account via /signup)
1. Add 5 different students
2. Create 3 different classes
3. Add 5 different subjects
4. Enter some results

### Verify Isolation
- [ ] School A cannot see School B's students
- [ ] School A cannot see School B's classes
- [ ] School A cannot see School B's subjects
- [ ] School A cannot see School B's results
- [ ] Dashboard shows only school-specific counts
- [ ] Result entry shows only school-specific students
- [ ] Class management shows only school-specific data

---

## 📝 NOTES

- **RLS Migration**: Make sure to run the migration file `20250105000000_enforce_school_isolation.sql` in Supabase
- **Existing Data**: Any data without school_id will be inaccessible until assigned
- **useSchoolId Hook**: Already created and ready to use
- **Pattern is consistent**: Import hook → use hook → filter queries → include in creates

The hardest work is done. The remaining pages follow the exact same pattern established in the completed pages.

