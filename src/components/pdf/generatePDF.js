import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
export const generatePDF = async () => {
  const doc = new jsPDF();

  // Captura el contenido del componente con el ID 'vueltas' como una imagen
  const content = document.getElementById('vueltas');
  if (!content) return;

  const canvas = await html2canvas(content);
  const imgData = canvas.toDataURL('image/png');

  doc.addImage(imgData, 'PNG', 0, 0, 210, 297); // A4 size in mm
  doc.save('detalle_ganancias.pdf');
};
