
import { toast } from "@/components/ui/use-toast";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  student_id: string;
  class_id?: string;
  gender?: string;
  email?: string;
  phone?: string;
  status: string;
  classes?: { name: string };
}

export function useStudentExport() {
  const exportToPDF = (students: Student[], className?: string) => {
    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Popup blocked');
      }

      const title = className ? `${className} Student List` : 'All Students List';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; text-align: center; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${title}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total Students: ${students.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Contact</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(student => `
                <tr>
                  <td>${student.student_id}</td>
                  <td>${student.first_name} ${student.middle_name ? student.middle_name + ' ' : ''}${student.last_name}</td>
                  <td>${student.classes?.name || 'No Class'}</td>
                  <td>${student.gender || 'N/A'}</td>
                  <td>${student.email || student.phone || 'N/A'}</td>
                  <td>${student.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
      
      toast({
        title: "PDF Export",
        description: "Student list has been prepared for printing/saving as PDF.",
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const exportToExcel = (students: Student[], className?: string) => {
    try {
      const title = className ? `${className} Student List` : 'All Students List';
      
      // Create CSV content
      const headers = ['Student ID', 'First Name', 'Last Name', 'Middle Name', 'Class', 'Gender', 'Email', 'Phone', 'Status'];
      const csvContent = [
        headers.join(','),
        ...students.map(student => [
          student.student_id,
          student.first_name,
          student.last_name,
          student.middle_name || '',
          student.classes?.name || 'No Class',
          student.gender || '',
          student.email || '',
          student.phone || '',
          student.status
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Excel Export",
        description: "Student list has been downloaded as CSV file.",
      });
    } catch (error) {
      toast({
        title: "Export Error",
        description: "Failed to generate Excel file. Please try again.",
        variant: "destructive"
      });
    }
  };

  return { exportToPDF, exportToExcel };
}
