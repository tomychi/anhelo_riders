export const calcularDemora = (horaPedido) => {
  const [horas, minutos] = horaPedido.split(':').map(Number);
  const pedidoDate = new Date();
  pedidoDate.setHours(horas, minutos, 0, 0);

  const now = new Date();
  const diffMs = now - pedidoDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const remainingMins = diffMins % 60;

  return `${diffHours}h ${remainingMins}m`;
};
