
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Plus, Trash2, Users, UserPlus } from 'lucide-react';
import { UserRole } from '@/types/user';

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
  'ICT', 'Marketing'
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
  const [customSubject, setCustomSubject] = useState('');
  const [showCustomSubject, setShowCustomSubject] = useState(false);
  const [loginPreviews, setLoginPreviews] = useState<LoginPreview[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);
  const [sendCredentials, setSendCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load school alias from user profile
  useEffect(() => {
    const loadSchoolAlias = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('school_name')
            .eq('id', user.id)
            .single();
          
          if (profile?.school_name) {
            // Convert school name to alias (lowercase, remove spaces)
            const alias = profile.school_name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
            setSchoolAlias(alias);
          }
        }
      } catch (error) {
        console.error('Error loading school alias:', error);
      }
    };
    loadSchoolAlias();
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
      // Generate combinations of subjects and classes
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
      // Generate for each selected class
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
      // Single exam officer
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

  const createLogins = async () => {
    if (loginPreviews.length === 0) {
      toast({
        title: "No Logins to Create",
        description: "Please generate login previews first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create users in auth and profiles
      const createdUsers = [];
      
      for (const preview of loginPreviews) {
        // Sign up user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: preview.email,
          password: preview.password,
          user_metadata: {
            username: preview.username,
            role: preview.role,
            subjects: preview.subjects,
            classes: preview.classes,
            school_alias: schoolAlias,
            created_by: user.id
          }
        });

        if (authError) {
          console.error('Auth error:', authError);
          continue;
        }

        if (authData.user) {
          // Create user role
          await supabase.from('user_roles').insert({
            user_id: authData.user.id,
            role: preview.role
          });

          createdUsers.push(preview);
        }
      }

      toast({
        title: "Success",
        description: `Created ${createdUsers.length} login accounts successfully`,
      });

      // Reset form
      setSelectedSubjects([]);
      setSelectedClasses([]);
      setSelectedRole('');
      setLoginPreviews([]);

    } catch (error) {
      console.error('Error creating logins:', error);
      toast({
        title: "Error",
        description: "Failed to create some login accounts. Please try again.",
        variant: "destructive",
      });
    } finally {
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
                description="Used in email generation (auto-filled from your school profile)"
              />
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
