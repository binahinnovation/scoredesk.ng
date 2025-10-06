
export async function exportUsersToExcel(users: any[], role: string) {
  // @ts-expect-error: Vite/TS sometimes can't find module types, but runtime import is fine.
  const XLSX = (await import("xlsx")) as any;
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

export async function exportUsersToPDF(users: any[], role: string) {
  // @ts-expect-error: For autotable, as ESM interop is inconsistent
  const jsPDFModule = await import("jspdf");
  // @ts-expect-error: For autotable, as ESM interop is inconsistent
  const autoTableModule = await import("jspdf-autotable");

  const jsPDF = jsPDFModule.default;
  // Sometimes autotable is a callable function, sometimes under .default:
  const autoTable = (autoTableModule.default || autoTableModule) as Function;

  const doc = new jsPDF();
  doc.text(`Users - ${role}`, 10, 10);
  const tableData = users.map(user => [
    user.full_name || user.user_id || "N/A",
    user.school_name || "N/A",
    user.role,
    "Active"
  ]);
  autoTable(doc, {
    startY: 20,
    head: [["Name", "School", "Role", "Status"]],
    body: tableData,
  });
  doc.save(`users_${role.replace(/\s+/g, "_").toLowerCase()}.pdf`);
}
