import {
  getFirestore,
  doc,
  onSnapshot,
  runTransaction,
} from 'firebase/firestore';

export const obtenerFechaActual = () => {
  const fechaActual = new Date();
  const dia = String(fechaActual.getDate()).padStart(2, '0');
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0');
  const anio = fechaActual.getFullYear();

  // Formatea la fecha como "DD/MM/AAAA"
  const fechaFormateada = `${dia}/${mes}/${anio}`;

  return fechaFormateada;
};

export const obtenerHoraActual = () => {
  // Obtener la hora actual
  const ahora = new Date();

  // Sumar 5 minutos
  ahora.setMinutes(ahora.getMinutes());

  // Obtener las horas y los minutos
  const horas = ahora.getHours().toString().padStart(2, '0');
  const minutos = ahora.getMinutes().toString().padStart(2, '0');

  // Formatear la hora como 'HH:mm'
  const horaFormateada = horas + ':' + minutos;

  return horaFormateada;
};

export const ReadOrdersForToday = (callback) => {
  const firestore = getFirestore();
  const currentDate = new Date();
  const currentHour = currentDate.getHours();

  let targetDate;

  // Si la hora actual está entre la medianoche y las 6 a.m., tomar los pedidos del día anterior
  if (currentHour < 6) {
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1); // Restar un día
    targetDate = previousDay;
  } else {
    targetDate = currentDate;
  }

  const day = String(targetDate.getDate()).padStart(2, '0');
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const year = String(targetDate.getFullYear());

  // Referencia al documento correspondiente (hoy o la noche anterior)
  const ordersDocRef = doc(firestore, 'pedidos', year, month, day);

  // Escuchar cambios en el documento del día objetivo
  return onSnapshot(
    ordersDocRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        // Si el documento existe, obtener el arreglo de pedidos
        const pedidosDelDia = docSnapshot.data()?.pedidos || [];
        callback(pedidosDelDia); // Llamar a la función de devolución de llamada con los pedidos encontrados
      } else {
        // Si el documento no existe, no hay pedidos para el día actual
        callback([]); // Llamar a la función de devolución de llamada con un arreglo vacío
      }
    },
    (error) => {
      console.error('Error al obtener los pedidos para el día actual:', error);
    }
  );
};

export const marcarPedidoComoEntregado = async (pedidoId, fecha) => {
  const [dia, mes, anio] = fecha.split('/');
  const tiempo = obtenerHoraActual();
  try {
    const firestore = getFirestore();
    const pedidoDocRef = doc(firestore, 'pedidos', anio, mes, dia);

    await runTransaction(firestore, async (transaction) => {
      const pedidoDocSnapshot = await transaction.get(pedidoDocRef);

      if (!pedidoDocSnapshot.exists()) {
        console.error('No se encontró el documento del día en Firestore');
        return;
      }

      const pedidosDelDia = pedidoDocSnapshot.data()?.pedidos || [];
      const index = pedidosDelDia.findIndex((pedido) => pedido.id === pedidoId);

      if (index !== -1) {
        pedidosDelDia[index].tiempoEntregado = tiempo;
        pedidosDelDia[index].entregado = true;
        transaction.set(pedidoDocRef, { pedidos: pedidosDelDia });
        console.log('Pedido marcado como entregado en Firestore');
      } else {
        console.error(
          'El pedido no fue encontrado en el arreglo de pedidos del día'
        );
      }
    });
  } catch (error) {
    console.error('Error al marcar pedido como entregado en Firestore:', error);
  }
};
