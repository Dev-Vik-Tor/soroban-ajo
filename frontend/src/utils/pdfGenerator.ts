import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ExportData {
  groupName: string;
  members: Array<{ name: string; address: string; contributions: number }>;
  contributions: Array<{ date: string; amount: number; member: string }>;
  totalContributed: number;
  startDate: string;
  endDate: string;
}

export function generatePDF(data: ExportData): Blob {
  const doc = new jsPDF();
  
  doc.setFontSize(16);
  doc.text(`Group Report: ${data.groupName}`, 14, 15);
  
  doc.setFontSize(10);
  doc.text(`Period: ${data.startDate} to ${data.endDate}`, 14, 25);
  doc.text(`Total Contributed: $${data.totalContributed.toFixed(2)}`, 14, 32);

  // Members table
  doc.setFontSize(12);
  doc.text('Members', 14, 45);
  
  const memberRows = data.members.map(m => [
    m.name,
    m.address.slice(0, 10) + '...',
    `$${m.contributions.toFixed(2)}`
  ]);

  (doc as any).autoTable({
    head: [['Name', 'Address', 'Contributions']],
    body: memberRows,
    startY: 50,
  });

  // Contributions table
  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(12);
  doc.text('Contribution History', 14, finalY + 10);

  const contribRows = data.contributions.map(c => [
    c.date,
    c.member,
    `$${c.amount.toFixed(2)}`
  ]);

  (doc as any).autoTable({
    head: [['Date', 'Member', 'Amount']],
    body: contribRows,
    startY: finalY + 15,
  });

  return doc.output('blob');
}

export function generateCSV(data: ExportData): Blob {
  let csv = `Group Report: ${data.groupName}\n`;
  csv += `Period: ${data.startDate} to ${data.endDate}\n`;
  csv += `Total Contributed: $${data.totalContributed.toFixed(2)}\n\n`;

  csv += 'MEMBERS\n';
  csv += 'Name,Address,Contributions\n';
  data.members.forEach(m => {
    csv += `"${m.name}","${m.address}","${m.contributions.toFixed(2)}"\n`;
  });

  csv += '\nCONTRIBUTION HISTORY\n';
  csv += 'Date,Member,Amount\n';
  data.contributions.forEach(c => {
    csv += `"${c.date}","${c.member}","${c.amount.toFixed(2)}"\n`;
  });

  return new Blob([csv], { type: 'text/csv' });
}
