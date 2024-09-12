import {
  getFirestore,
  doc,
  onSnapshot,
  runTransaction,
  collection,
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

export const ReadOrdersForToday = (userName, callback) => {
  const firestore = getFirestore();
  const currentDate = new Date();
  const currentHour = currentDate.getHours();

  let targetDate;

  if (currentHour < 6) {
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    targetDate = previousDay;
  } else {
    targetDate = currentDate;
  }

  const day = String(targetDate.getDate()).padStart(2, '0');
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const year = String(targetDate.getFullYear());

  const ordersDocRef = doc(firestore, 'pedidos', year, month, day);

  return onSnapshot(
    ordersDocRef,
    (docSnapshot) => {
      if (docSnapshot.exists()) {
        const pedidosDelDia = docSnapshot.data()?.pedidos || [];
        // Filtrar los pedidos por nombre del cadete
        const filteredOrders = pedidosDelDia.filter(
          (order) => order.cadete === userName
        );
        callback(filteredOrders);
      } else {
        callback([]);
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
        pedidosDelDia[index].status = 'delivered';
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

export const updateCadeteForOrder = (fechaPedido, pedidoId, nuevoCadete) => {
  const firestore = getFirestore();

  return new Promise((resolve, reject) => {
    const [dia, mes, anio] = fechaPedido.split('/');
    const pedidosCollectionRef = collection(firestore, 'pedidos', anio, mes);
    const pedidoDocRef = doc(pedidosCollectionRef, dia);

    runTransaction(firestore, async (transaction) => {
      const pedidoDocSnapshot = await transaction.get(pedidoDocRef);
      if (!pedidoDocSnapshot.exists()) {
        reject(new Error('El pedido no existe para la fecha especificada.'));
        return;
      }

      const existingData = pedidoDocSnapshot.data();
      const pedidosDelDia = existingData.pedidos || [];

      const pedidosActualizados = pedidosDelDia.map((pedido) => {
        if (pedido.fecha === fechaPedido && pedido.id === pedidoId) {
          return { ...pedido, cadete: nuevoCadete };
        } else {
          return pedido;
        }
      });

      transaction.set(pedidoDocRef, {
        ...existingData,
        pedidos: pedidosActualizados,
      });
    })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
};
