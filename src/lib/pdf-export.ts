import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CourseRanking } from "@/types";

export function exportClassementPdf(
  rankings: CourseRanking[],
  courseTitle: string,
  sessionName: string
) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text("Edesio", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Session : ${sessionName}`, 14, 28);
  
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(`Results — ${courseTitle}`, 14, 40);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Exported on ${new Date().toLocaleDateString("en-US")}`, 14, 48);
  doc.text(`${rankings.length} student(s)`, 14, 54);

  const tableData = rankings.map((r) => [
    r.rank.toString(),
    r.name || "Anonyme",
    `${r.correctAnswers}/${r.attemptedQuestions}`,
    `${Math.round(r.successRate)}%`,
  ]);

  autoTable(doc, {
    startY: 62,
    head: [["Rank", "Student", "Score", "Success rate"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      1: { cellWidth: 80 },
      2: { halign: "center", cellWidth: 40 },
      3: { halign: "center", cellWidth: 40 },
    },
  });

  const fileName = `resultats_${courseTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

export function downloadPdf(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = filename;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
}
