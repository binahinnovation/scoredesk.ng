/*
  # Migrate Existing Teacher Assignments
  
  This migration migrates existing teacher assignments from user_metadata
  to the new teacher_assignments table structure.
*/

-- Migrate existing teacher assignments from user metadata
DO $$
DECLARE
  user_record RECORD;
  subject_record RECORD;
  class_record RECORD;
  assignment_count INTEGER := 0;
BEGIN
  -- Loop through all users with Subject Teacher role
  FOR user_record IN 
    SELECT 
      u.id as user_id,
      u.raw_user_meta_data->>'subjects' as subjects_json,
      u.raw_user_meta_data->>'classes' as classes_json,
      p.school_id
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE ur.role = 'Subject Teacher'
      AND p.school_id IS NOT NULL
  LOOP
    -- Skip if no subjects or classes in metadata
    IF user_record.subjects_json IS NULL OR user_record.classes_json IS NULL THEN
      CONTINUE;
    END IF;
    
    -- Parse subjects array (assuming JSON format)
    BEGIN
      -- Handle both JSON array and comma-separated string formats
      DECLARE
        subjects_array TEXT[];
        classes_array TEXT[];
      BEGIN
        -- Parse subjects
        IF user_record.subjects_json LIKE '[%]' THEN
          -- JSON array format
          subjects_array := ARRAY(SELECT jsonb_array_elements_text(user_record.subjects_json::jsonb));
        ELSE
          -- Comma-separated format
          subjects_array := string_to_array(user_record.subjects_json, ',');
        END IF;
        
        -- Parse classes
        IF user_record.classes_json LIKE '[%]' THEN
          -- JSON array format
          classes_array := ARRAY(SELECT jsonb_array_elements_text(user_record.classes_json::jsonb));
        ELSE
          -- Comma-separated format
          classes_array := string_to_array(user_record.classes_json, ',');
        END IF;
        
        -- Create assignments for each subject-class combination
        FOR subject_record IN 
          SELECT s.id, s.name
          FROM public.subjects s
          WHERE s.name = ANY(subjects_array)
            AND s.school_id = user_record.school_id
        LOOP
          FOR class_record IN 
            SELECT c.id, c.name
            FROM public.classes c
            WHERE c.name = ANY(classes_array)
              AND c.school_id = user_record.school_id
          LOOP
            -- Insert assignment (ignore if already exists)
            INSERT INTO public.teacher_assignments (
              teacher_id, 
              subject_id, 
              class_id, 
              school_id,
              assigned_by
            )
            VALUES (
              user_record.user_id,
              subject_record.id,
              class_record.id,
              user_record.school_id,
              user_record.user_id -- Self-assigned during migration
            )
            ON CONFLICT (teacher_id, subject_id, class_id) DO NOTHING;
            
            assignment_count := assignment_count + 1;
          END LOOP;
        END LOOP;
      END;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but continue with other users
        RAISE NOTICE 'Error migrating assignments for user %: %', user_record.user_id, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Migrated % teacher assignments from user metadata', assignment_count;
END $$;

-- Verify migration results
DO $$
DECLARE
  total_assignments INTEGER;
  total_teachers INTEGER;
  teachers_with_assignments INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_assignments FROM public.teacher_assignments;
  SELECT COUNT(*) INTO total_teachers FROM public.user_roles WHERE role = 'Subject Teacher';
  SELECT COUNT(DISTINCT teacher_id) INTO teachers_with_assignments FROM public.teacher_assignments;
  
  RAISE NOTICE 'Migration Summary:';
  RAISE NOTICE '- Total teacher assignments: %', total_assignments;
  RAISE NOTICE '- Total subject teachers: %', total_teachers;
  RAISE NOTICE '- Teachers with assignments: %', teachers_with_assignments;
END $$;
