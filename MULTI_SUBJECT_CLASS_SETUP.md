# Multi-Subject/Class Assignment Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Apply Database Migrations
Run these migrations in order to set up the new teacher assignment system:

```bash
# Apply the teacher assignments table migration
supabase db push

# Or manually apply the migrations:
# 1. 20250116000001_create_teacher_assignments.sql
# 2. 20250116000002_migrate_existing_teacher_assignments.sql
```

### Step 2: Verify Migration
After applying migrations, verify that:
1. The `teacher_assignments` table was created
2. Existing teacher assignments were migrated from user metadata
3. No errors occurred during migration

### Step 3: Test the System

#### For New Teachers:
1. Go to **Users > Create Login Details**
2. Select **Subject Teacher** role
3. Choose **multiple subjects** (2-5) and **multiple classes** (3-5)
4. Generate and create the teacher account
5. Verify the teacher can access all assigned subjects/classes in Result Entry

#### For Existing Teachers:
1. Go to **Users > Manage Users**
2. Find a Subject Teacher and click **Assign**
3. Modify their subject/class assignments
4. Test that changes take effect in Result Entry

#### For Result Entry:
1. Login as a Subject Teacher
2. Go to **Results > Result Entry**
3. Verify only assigned subjects appear in dropdown
4. Verify classes filter based on selected subject
5. Test entering results for different subject-class combinations

## 🔧 Troubleshooting

### Error: "React is not defined"
✅ **Fixed**: Added missing React import to ResultEntry.tsx

### Error: "Failed to load resource: 400"
✅ **Fixed**: Added fallback to user metadata when teacher_assignments table doesn't exist

### No Subjects/Classes Showing
1. Check if teacher has assignments in `teacher_assignments` table
2. Verify school_id matches in all related tables
3. Check if fallback to user metadata is working

### Migration Issues
If migration fails:
1. Check if all required tables exist (subjects, classes, schools)
2. Verify user has proper permissions
3. Run migration step by step

## 📊 Database Schema

### New Table: `teacher_assignments`
```sql
- id (UUID, Primary Key)
- teacher_id (UUID, Foreign Key to auth.users)
- subject_id (UUID, Foreign Key to subjects)
- class_id (UUID, Foreign Key to classes)
- school_id (UUID, Foreign Key to schools)
- assigned_by (UUID, Foreign Key to auth.users)
- assigned_at (Timestamp)
- is_active (Boolean)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Helper Functions
- `get_teacher_subjects(teacher_id)` - Returns assigned subjects
- `get_teacher_classes(teacher_id)` - Returns assigned classes
- `is_teacher_assigned_to_subject_class(teacher_id, subject_id, class_id)` - Checks assignment

## 🎯 Key Features

1. **Multi-Subject Support**: Teachers can be assigned 2-5 subjects
2. **Multi-Class Support**: Teachers can be assigned 3-5 classes
3. **Smart Filtering**: Classes automatically filter based on selected subject
4. **Assignment Management**: Easy modification of teacher assignments
5. **Backward Compatibility**: Falls back to user metadata if needed
6. **School Isolation**: All assignments are properly isolated by school

## 🔄 Migration Process

The system automatically migrates existing teacher assignments from `user_metadata.subjects` and `user_metadata.classes` to the new relational structure.

### Before Migration:
- Assignments stored in user metadata as arrays
- One account per subject-class combination
- Limited flexibility

### After Migration:
- Assignments stored in relational table
- One account per teacher with multiple assignments
- Full flexibility for multi-subject/class teachers

## 📝 Usage Examples

### Creating a Multi-Subject Teacher
```
Role: Subject Teacher
Subjects: Mathematics, Physics, Chemistry
Classes: JSS1A, JSS1B, JSS2A, SS1A
Result: 1 teacher account with 12 assignments (3 subjects × 4 classes)
```

### Managing Assignments
```
Current: Mathematics + JSS1A, JSS1B
Add: Physics + JSS1A, JSS1B, JSS2A
Result: 5 total assignments for this teacher
```

### Result Entry Experience
```
1. Teacher selects "Mathematics" → Only JSS1A, JSS1B appear in class dropdown
2. Teacher selects "Physics" → Only JSS1A, JSS1B, JSS2A appear in class dropdown
3. Teacher can only enter results for their assigned combinations
```

## 🚨 Important Notes

1. **Run migrations first** before testing the new features
2. **Backup your database** before applying migrations
3. **Test thoroughly** in a development environment first
4. **Monitor logs** for any migration issues
5. **Fallback system** ensures compatibility during transition

## 🆘 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify database migrations were applied successfully
3. Check that all required tables and functions exist
4. Ensure school isolation is working properly
5. Test with a simple teacher assignment first

The system is designed to be backward compatible, so existing functionality should continue to work even if the new features aren't fully set up yet.
