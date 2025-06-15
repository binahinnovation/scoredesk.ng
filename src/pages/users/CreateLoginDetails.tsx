import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Plus, Trash2, Users, UserPlus, AlertCircle } from 'lucide-react';
import { UserRole } from '@/types/user';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Nigerian school structure
const CLASSES = [
  // Nursery Section
  'Nursery 1', 'Nursery 2', 'Nursery 3',
  // Primary Section
  'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
  // Junior Secondary
  'JSS1A', 'JSS1B', 'JSS1C', 'JSS2A', 'JSS2B', 'JSS2C', 'JSS3A', 'JSS3B', 'JSS3C',
  // Senior Secondary
  'SS1A', 'SS1B', 'SS1C', 'SS2A', 'SS2B', 'SS2C', 'SS3A', 'SS3B', 'SS3C'
];

const SUBJECTS = [
  // Nursery/Primary Subjects
  'English Language', 'Mathematics', 'Verbal Reasoning', 'Quantitative Reasoning',
  'Basic Science', 'Civic Education', 'Social Studies', 'Phonics',
  'Yoruba', 'Hausa', 'Igbo', 'CRS', 'IRS', 'Creative Arts',
  'Computer Studies', 'Handwriting', 'Physical & Health Education', 'Practical Life Skills',
  // JSS Subjects
  'English Studies', 'Basic Technology', 'Business Studies', 'Agricultural Science',
  'Cultural & Creative Arts', 'French',
  // SSS Subjects
  'Biology', 'Chemistry', 'Physics', 'Government', 'Literature in English',
  'Economics', 'Geography', 'Further Mathematics', 'Commerce', 'Accounting',
  'ICT', 'Marketing', 'Arabic'
];

const USER_ROLES: UserRole[] = ['Subject Teacher', 'Form Teacher', 'Exam Officer'];

interface LoginPreview {
  username: string;
  email: string;
  role: UserRole;
  subjects: string[];
  classes: string[];
  password: string;
}

const CreateLoginDetails = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
  const [schoolAlias, setSchoolAlias] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomSubject, setShowCustomSubject] = useState(false);
  const [loginPreviews, setLoginPreviews] = useState<LoginPreview[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [sendCredentials, setSendCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState<string>('');
  const [debugLogs, setDebugLogs] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev, logMessage]);
  };

  // Load or assign schoolId and schoolName on mount
  useEffect(() => {
    const loadSchoolInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('school_name,school_id')
          .eq('id', user.id)
          .maybeSingle();

        let schoolIdValue = profile?.school_id ?? null;
        let schoolNameValue = profile?.school_name ?? null;

        // If profile doesn't have a schoolId, create a new school and update profile
        if (!schoolIdValue) {
          // Use school_name if set, else fallback to user's email prefix
          const newSchoolName = schoolNameValue || (user.email ? user.email.split('@')[0] + " School" : "Unnamed School");
          // Use a slugified alias
          const alias = newSchoolName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '').substring(0, 32);

          // Insert into schools table
          const { data: newSchool, error: schoolError } = await supabase
            .from('schools')
            .insert({
              name: newSchoolName,
              alias,
              created_by: user.id,
            })
            .select('id,name')
            .maybeSingle();

          if (schoolError || !newSchool?.id) {
            setSchoolAlias(alias);
            setSchoolName(newSchoolName);
            setSchoolId(null);
            return;
          }

          // Update profile with school_id and school_name
          await supabase.from('profiles').update({
            school_id: newSchool.id,
            school_name: newSchool.name
          }).eq('id', user.id);

          schoolIdValue = newSchool.id;
          schoolNameValue = newSchool.name;
        }

        setSchoolId(schoolIdValue);
        setSchoolName(schoolNameValue || "");
        setSchoolAlias(schoolNameValue ? schoolNameValue.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') : "");

      } catch (error) {
        console.error('Error loading school info:', error);
      }
    };
    loadSchoolInfo();
  }, []);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const generateUsername = (role: UserRole, subject?: string, className?: string) => {
    let username = '';
    
    if (role === 'Subject Teacher' && subject) {
      const subjectCode = subject.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
      const classCode = className ? className.toLowerCase().replace(/\s+/g, '') : '';
      username = classCode ? `${subjectCode}_${classCode}` : subjectCode;
    } else if (role === 'Form Teacher' && className) {
      const classCode = className.toLowerCase().replace(/\s+/g, '');
      username = `formmaster_${classCode}`;
    } else if (role === 'Exam Officer') {
      username = 'examofficer';
    }
    
    return username;
  };

  const generatePreviews = () => {
    if (!selectedRole || !schoolAlias.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a role and ensure school alias is set",
        variant: "destructive",
      });
      return;
    }

    const previews: LoginPreview[] = [];

    if (selectedRole === 'Subject Teacher') {
      selectedSubjects.forEach(subject => {
        selectedClasses.forEach(className => {
          const username = generateUsername(selectedRole, subject, className);
          previews.push({
            username,
            email: `${username}@${schoolAlias}.scoredesk.ng`,
            role: selectedRole,
            subjects: [subject],
            classes: [className],
            password: generatePassword()
          });
        });
      });
    } else if (selectedRole === 'Form Teacher') {
      selectedClasses.forEach(className => {
        const username = generateUsername(selectedRole, undefined, className);
        previews.push({
          username,
          email: `${username}@${schoolAlias}.scoredesk.ng`,
          role: selectedRole,
          subjects: selectedSubjects,
          classes: [className],
          password: generatePassword()
        });
      });
    } else if (selectedRole === 'Exam Officer') {
      const username = generateUsername(selectedRole);
      previews.push({
        username,
        email: `${username}@${schoolAlias}.scoredesk.ng`,
        role: selectedRole,
        subjects: selectedSubjects,
        classes: selectedClasses,
        password: generatePassword()
      });
    }

    setLoginPreviews(previews);
  };

  const addCustomSubject = () => {
    if (customSubject.trim() && !selectedSubjects.includes(customSubject.trim())) {
      setSelectedSubjects([...selectedSubjects, customSubject.trim()]);
      setCustomSubject('');
      setShowCustomSubject(false);
    }
  };

  // Ensure classes and subjects exist in database
  const ensureClassesAndSubjectsExist = async () => {
    try {
      // Get existing classes and subjects
      const { data: existingClasses } = await supabase.from('classes').select('name');
      const { data: existingSubjects } = await supabase.from('subjects').select('name');

      const existingClassNames = existingClasses?.map(c => c.name) || [];
      const existingSubjectNames = existingSubjects?.map(s => s.name) || [];

      // Insert missing classes
      const missingClasses = CLASSES.filter(className => !existingClassNames.includes(className));
      if (missingClasses.length > 0) {
        const classInserts = missingClasses.map(name => ({ name }));
        await supabase.from('classes').insert(classInserts);
      }

      // Insert missing subjects with auto-generated codes
      const missingSubjects = SUBJECTS.filter(subjectName => !existingSubjectNames.includes(subjectName));
      if (missingSubjects.length > 0) {
        const subjectInserts = missingSubjects.map(name => ({
          name,
          code: generateSubjectCode(name)
        }));
        await supabase.from('subjects').insert(subjectInserts);
      }
    } catch (error) {
      console.error('Error ensuring classes/subjects exist:', error);
    }
  };

  // Generate subject code automatically
  const generateSubjectCode = (subjectName: string) => {
    return subjectName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 4);
  };

  // --- FIX: always use full schoolName, not alias, in createLogins ---
  const createLogins = async () => {
    if (loginPreviews.length === 0) {
      const errorMsg = "No login previews to create. Please generate login previews first.";
      setError(errorMsg);
      addDebugLog(errorMsg);
      toast({
        title: "No Logins to Create",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError('');
    setDebugLogs([]);

    const { data: { session: originalSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !originalSession) {
      setError("Your session is invalid. Please refresh the page and log in again.");
      addDebugLog("Failed to get original session: " + (sessionError?.message || "No session found"));
      setLoading(false);
      return;
    }
    
    try {
      addDebugLog("Starting login creation process...");
      const principalUserId = originalSession.user.id;
      addDebugLog(`Current user ID: ${principalUserId}`);

      await ensureClassesAndSubjectsExist();

      const createdUsers = [];
      let failedUsers = [];

      addDebugLog(`Attempting to create ${loginPreviews.length} user accounts...`);

      for (const [index, preview] of loginPreviews.entries()) {
        try {
          addDebugLog(`Creating user ${index + 1}/${loginPreviews.length}: ${preview.email}`);
          // Assign both school_id and school_name to user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: preview.email,
            password: preview.password,
            options: {
              data: {
                username: preview.username,
                role: preview.role,
                subjects: preview.subjects,
                classes: preview.classes,
                school_id: schoolId,    // <-- The unique id for the school
                school_name: schoolName, // for human display
                full_name: preview.username,
                created_by: principalUserId
              }
            }
          });

          // Restore session
          await supabase.auth.setSession(originalSession);

          if (authError) {
            addDebugLog(`Auth error for ${preview.email}: ${authError.message}`);
            failedUsers.push({ preview, error: authError.message });
            continue;
          }
          if (authData.user) {
            addDebugLog(`Successfully created auth user: ${authData.user.id}`);

            // Insert role, also with school_id
            const { error: roleError } = await supabase.from('user_roles').insert({
              user_id: authData.user.id,
              role: preview.role,
              school_id: schoolId
            });

            if (roleError) {
              addDebugLog(`Role creation error for ${preview.email}: ${roleError.message}`);
            } else {
              addDebugLog(`Successfully created role for user: ${authData.user.id}`);
            }

            // Update profile with school_id and school_name (in case trigger misses)
            await supabase.from('profiles').update({
              school_id: schoolId,
              school_name: schoolName
            }).eq('id', authData.user.id);

            createdUsers.push(preview);
          } else {
            addDebugLog(`No user data returned for ${preview.email}`);
            failedUsers.push({ preview, error: "No user data returned" });
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          addDebugLog(`Error creating user ${preview.email}: ${errorMessage}`);
          failedUsers.push({ preview, error: errorMessage });
        }
      }

      if (createdUsers.length > 0) {
        toast({
          title: "Success",
          description: `Created ${createdUsers.length} login accounts successfully${failedUsers.length > 0 ? `. ${failedUsers.length} failed.` : ''}`,
        });

        // Reset form only if some accounts were created
        setSelectedSubjects([]);
        setSelectedClasses([]);
        setSelectedRole('');
        setLoginPreviews([]);
      }

      if (failedUsers.length > 0) {
        const errorMsg = `Failed to create ${failedUsers.length} accounts. Check debug logs for details.`;
        setError(errorMsg);
        addDebugLog(`Failed accounts: ${failedUsers.map(f => f.preview.email).join(', ')}`);
      }

      if (createdUsers.length === 0) {
        const errorMsg = "No accounts were created successfully. Please check the debug logs for details.";
        setError(errorMsg);
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      addDebugLog(`Fatal error: ${errorMessage}`);
      setError(errorMessage);
      console.error('Error creating logins:', error);
      toast({
        title: "Error",
        description: `Failed to create login accounts: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      await supabase.auth.setSession(originalSession);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center mb-6">
        <UserPlus className="h-8 w-8 text-blue-600 mr-3" />
        <div>
          <h1 className="text-3xl font-bold">Create Login Details</h1>
          <p className="text-gray-600">Generate login credentials for teachers and staff</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Debug Logs */}
      {debugLogs.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto bg-gray-50 p-3 rounded text-xs font-mono">
              {debugLogs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Login Configuration
            </CardTitle>
            <CardDescription>
              Configure the details for generating login accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* School Alias */}
            <div className="space-y-2">
              <Label htmlFor="schoolAlias">School Alias</Label>
              <Input
                id="schoolAlias"
                value={schoolAlias}
                onChange={(e) => setSchoolAlias(e.target.value)}
                placeholder="e.g., greenfield"
              />
              <p className="text-sm text-gray-500">Used in email generation (auto-filled from your school profile)</p>
            </div>

            {/* User Role */}
            <div className="space-y-2">
              <Label>User Role</Label>
              <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  {USER_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subjects */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Subjects</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomSubject(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Custom
                </Button>
              </div>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                {SUBJECTS.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject}
                      checked={selectedSubjects.includes(subject)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSubjects([...selectedSubjects, subject]);
                        } else {
                          setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
                        }
                      }}
                    />
                    <Label htmlFor={subject} className="text-sm cursor-pointer">
                      {subject}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedSubjects.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedSubjects.map((subject) => (
                    <span
                      key={subject}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center"
                    >
                      {subject}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setSelectedSubjects(selectedSubjects.filter(s => s !== subject))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Subject Input */}
            {showCustomSubject && (
              <div className="space-y-2">
                <Label htmlFor="customSubject">Custom Subject</Label>
                <div className="flex space-x-2">
                  <Input
                    id="customSubject"
                    value={customSubject}
                    onChange={(e) => setCustomSubject(e.target.value)}
                    placeholder="Enter custom subject"
                  />
                  <Button type="button" onClick={addCustomSubject}>Add</Button>
                  <Button type="button" variant="outline" onClick={() => setShowCustomSubject(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Classes */}
            <div className="space-y-2">
              <Label>Classes</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                {CLASSES.map((className) => (
                  <div key={className} className="flex items-center space-x-2">
                    <Checkbox
                      id={className}
                      checked={selectedClasses.includes(className)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedClasses([...selectedClasses, className]);
                        } else {
                          setSelectedClasses(selectedClasses.filter(c => c !== className));
                        }
                      }}
                    />
                    <Label htmlFor={className} className="text-sm cursor-pointer">
                      {className}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedClasses.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedClasses.map((className) => (
                    <span
                      key={className}
                      className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center"
                    >
                      {className}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setSelectedClasses(selectedClasses.filter(c => c !== className))}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Generate Preview Button */}
            <Button onClick={generatePreviews} className="w-full">
              Generate Login Preview
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Login Preview</CardTitle>
            <CardDescription>
              Review the login accounts that will be created
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginPreviews.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {loginPreviews.length} account(s) to create
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPasswords(!showPasswords)}
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                    {showPasswords ? 'Hide' : 'Show'} Passwords
                  </Button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {loginPreviews.map((preview, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <Label className="text-xs text-gray-500">Username</Label>
                          <p className="font-medium">{preview.username}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Role</Label>
                          <p>{preview.role}</p>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-gray-500">Email</Label>
                          <p className="font-medium text-blue-600">{preview.email}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Subjects</Label>
                          <p className="text-xs">{preview.subjects.join(', ')}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Classes</Label>
                          <p className="text-xs">{preview.classes.join(', ')}</p>
                        </div>
                        {showPasswords && (
                          <div className="col-span-2">
                            <Label className="text-xs text-gray-500">Password</Label>
                            <p className="font-mono text-sm bg-gray-100 p-1 rounded">{preview.password}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendCredentials"
                      checked={sendCredentials}
                      onCheckedChange={(checked) => setSendCredentials(checked as boolean)}
                    />
                    <Label htmlFor="sendCredentials" className="text-sm">
                      Send login credentials via email (optional)
                    </Label>
                  </div>

                  <Button 
                    onClick={createLogins} 
                    disabled={loading} 
                    className="w-full"
                    size="lg"
                  >
                    {loading ? "Creating Logins..." : "Create Login Accounts"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Configure settings and click "Generate Login Preview" to see accounts that will be created</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateLoginDetails;
