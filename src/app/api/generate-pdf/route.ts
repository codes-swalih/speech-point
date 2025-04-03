import { NextRequest, NextResponse } from "next/server";
import jsPDF from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const { title, transcription, keyPoints } = await request.json();
    
    if (!transcription) {
      return NextResponse.json({ error: "No transcription provided" }, { status: 400 });
    }

    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set up initial position
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const textWidth = pageWidth - (margin * 2);
    
    // Add title
    doc.setFontSize(18);
    doc.text(title || "Transcription Document", pageWidth / 2, y, { align: "center" });
    y += 15;
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: "center" });
    y += 15;
    
    // Add key points section if available
    if (keyPoints && keyPoints.points && keyPoints.points.length > 0) {
      doc.setFontSize(14);
      doc.text("Key Points", margin, y);
      y += 10;
      
      doc.setFontSize(11);
      keyPoints.points.forEach((point : any, index :any) => {
        // Add point title
        doc.setFont("helvetica", 'bold');
        const pointText = `${index + 1}. ${point.point}`;
        doc.text(pointText, margin, y);
        y += 7;
        
        // Add point details with wrapping
        doc.setFont("helvetica", 'normal');
        const detailLines = doc.splitTextToSize(point.details, textWidth);
        detailLines.forEach((line: string) => {
          // Check if we need a new page
          if (y > 270) {
            doc.addPage();
            y = 20;
          }
          doc.text(line, margin, y);
          y += 6;
        });
        
        y += 5; // Add space between points
      });
      
      y += 10; // Add space before transcription
    }
    
    // Add transcription section
    doc.setFontSize(14);
    doc.text("Full Transcription", margin, y);
    y += 10;
    
    // Add transcription text with wrapping
    doc.setFontSize(10);
    const transcriptionLines = doc.splitTextToSize(transcription, textWidth);
    transcriptionLines.forEach((line : string) => {
      // Check if we need a new page
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 5;
    });
    
    // Generate PDF as base64 with proper data URI format
    const pdfBase64 = doc.output('datauristring');
    
    return NextResponse.json({ pdf: pdfBase64 });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}