import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Question, CourseRanking } from "@/types";

export function exportQuestionsPdf(
  questions: Question[],
  coursTitle: string,
  sessionName: string
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(20);
  doc.setTextColor(59, 130, 246);
  doc.text("Edesio", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Session : ${sessionName}`, 14, 28);
  
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(`Questions - ${coursTitle}`, 14, 40);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 14, 48);
  doc.text(`${questions.length} question(s)`, 14, 54);

  let yPos = 65;

  questions.forEach((q, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    const typeLabel = q.type === "single" ? "QCM" : q.type === "multiple" ? "Choix multiples" : "Question ouverte";
    
    doc.setFontSize(11);
    doc.setTextColor(59, 130, 246);
    doc.text(`Question ${index + 1} (${typeLabel})`, 14, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setTextColor(0);
    
    const questionLines = doc.splitTextToSize(q.question, pageWidth - 28);
    doc.text(questionLines, 14, yPos);
    yPos += questionLines.length * 5 + 3;

    if (q.type === "single" || q.type === "multiple") {
      if (q.propositions && q.propositions.length > 0) {
        doc.setTextColor(60);
        q.propositions.forEach((prop, i) => {
          const letter = String.fromCharCode(65 + i);
          const propText = `${letter}. ${prop}`;
          const propLines = doc.splitTextToSize(propText, pageWidth - 35);
          doc.text(propLines, 20, yPos);
          yPos += propLines.length * 5;
        });
        yPos += 2;
      }

      doc.setTextColor(34, 139, 34);
      if (q.type === "single" && q.good_answer) {
        doc.text(`Réponse : ${q.good_answer}`, 14, yPos);
        yPos += 6;
      } else if (q.type === "multiple" && q.good_answers && q.good_answers.length > 0) {
        doc.text(`Réponses : ${q.good_answers.join(", ")}`, 14, yPos);
        yPos += 6;
      }
    } else if (q.type === "open") {
      doc.setTextColor(34, 139, 34);
      if (q.good_answer) {
        const repLines = doc.splitTextToSize(`Réponse attendue : ${q.good_answer}`, pageWidth - 28);
        doc.text(repLines, 14, yPos);
        yPos += repLines.length * 5 + 2;
      }
    }

    if (q.explication) {
      doc.setTextColor(100);
      const expLines = doc.splitTextToSize(`Explication : ${q.explication}`, pageWidth - 28);
      doc.text(expLines, 14, yPos);
      yPos += expLines.length * 5;
    }

    yPos += 8;
  });

  const fileName = `questions_${coursTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

export function exportClassementPdf(
  rankings: CourseRanking[],
  coursTitle: string,
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
  doc.text(`Résultats - ${coursTitle}`, 14, 40);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Exporté le ${new Date().toLocaleDateString("fr-FR")}`, 14, 48);
  doc.text(`${rankings.length} élève(s)`, 14, 54);

  const tableData = rankings.map((r) => [
    r.rank.toString(),
    r.name || "Anonyme",
    `${r.correct_answers}/${r.attempted_questions}`,
    `${Math.round(r.success_rate)}%`,
  ]);

  autoTable(doc, {
    startY: 62,
    head: [["Rang", "Élève", "Score", "Taux de réussite"]],
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

  const fileName = `resultats_${coursTitle.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}
