
// @ts-ignore
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";

export function exportUsersToExcel(users: any[], role: string) {
  const data = users.map(user => ({
    "Name": user.full_name || user.user_id || "N/A",
    "School": user.school_name || "N/A",
    "Role": user.role,
    "Status": "Active"
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, role);
  XLSX.writeFile(wb, `users_${role.replace(/\s+/g, "_").toLowerCase()}.xlsx`);
}

export function exportUsersToPDF(users: any[], role: string) {
  const doc = new jsPDF();
  doc.text(`Users - ${role}`, 10, 10);
  const tableData = users.map(user => [
    user.full_name || user.user_id || "N/A",
    user.school_name || "N/A",
    user.role,
    "Active"
  ]);
  (autoTable as any)(doc, {
    startY: 20,
    head: [["Name", "School", "Role", "Status"]],
    body: tableData,
  });
  doc.save(`users_${role.replace(/\s+/g, "_").toLowerCase()}.pdf`);
}
