import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Función para obtener la dirección parcial
const obtenerDireccionParcial = (direccion) => {
  return direccion.split(',')[0].trim();
};

// Función para renderizar las direcciones
const renderDirecciones = (orders) => {
  if (orders.length === 0) return ['No hay direcciones'];

  return orders.map((order) => {
    const isInvalid = order.map[0] === 0 && order.map[1] === 0;
    const direccion = obtenerDireccionParcial(order.direccion);
    return `- ${direccion}${isInvalid ? ' (Inválida)' : ''}`;
  });
};

// Función para generar el PDF
export const generatePDF = (
  vueltas,
  totalOrders,
  formatearFecha,
  currencyFormat,
  paga
) => {
  const doc = new jsPDF('p', 'mm', 'a4'); // 'p' para portrait, 'mm' para milímetros, 'a4' tamaño de página

  // Agregar título
  doc.setFontSize(20);
  doc.text('Reporte de Vueltas', 14, 20);

  // Agregar total de órdenes
  doc.setFontSize(14);
  doc.text(`Total de órdenes en todas las vueltas: ${totalOrders}`, 14, 30);

  // Configuración de la tabla
  const tableColumn = [
    'Vuelta',
    'Direcciones',
    'Recorrido',
    'Km/hr',
    'Ganancia',
  ];
  const tableRows = vueltas.map((vuelta) => {
    // Formatear direcciones
    const direcciones = renderDirecciones(vuelta.orders).join('\n');

    return [
      `Vuelta ${formatearFecha(vuelta.startTime)}`,
      direcciones,
      `${vuelta.totalDistance.toFixed(2)} kms`,
      `${
        parseFloat(vuelta.kmPorHora)
          ? parseFloat(vuelta.kmPorHora).toFixed(2)
          : 0
      } km/hr`,
      paga[vuelta.rideId]
        ? currencyFormat(paga[vuelta.rideId])
        : 'Calculando...',
    ];
  });

  // Agregar tabla al PDF
  doc.autoTable({
    startY: 40,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [52, 152, 219], // Color de fondo para el encabezado de la tabla
      textColor: [255, 255, 255], // Color del texto en el encabezado
      fontSize: 12,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240], // Color alternativo de las filas
    },
    margin: { top: 40 },
  });

  // Guardar el PDF
  doc.save('detalle_ganancias.pdf');
};
