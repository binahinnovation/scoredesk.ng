
export type UserRole = 'Principal' | 'Exam Officer' | 'Form Teacher' | 'Subject Teacher';

export const rolePermissionMatrix = [
  { name: "Dashboard", principal: true, examOfficer: true, formTeacher: true, subjectTeacher: true },
  { name: "User Management", principal: true, examOfficer: false, formTeacher: false, subjectTeacher: false },
  { name: "Student Management", principal: true, examOfficer: true, formTeacher: true, subjectTeacher: false },
  { name: "Class/Subject Setup", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Result Upload", principal: false, examOfficer: false, formTeacher: false, subjectTeacher: true },
  { name: "Result Approval", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Position & Ranking", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Report Card Designer", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "School Branding", principal: true, examOfficer: false, formTeacher: false, subjectTeacher: false },
  { name: "Scratch Card Generator", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Analytics Dashboard", principal: true, examOfficer: true, formTeacher: false, subjectTeacher: false },
  { name: "Settings", principal: true, examOfficer: false, formTeacher: false, subjectTeacher: false },
];
