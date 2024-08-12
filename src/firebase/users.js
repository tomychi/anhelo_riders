import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  runTransaction,
} from 'firebase/firestore';
import { obtenerFechaActual } from './orders';

// Función para obtener el nombre del usuario por UID
export const fetchUserNameByUid = async (uid) => {
  const firestore = getFirestore();
  const userDocRef = doc(firestore, 'users', uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return userDoc.data().name; // Asegúrate de que el campo del nombre se llama 'name'
  } else {
    console.error('No se encontró el usuario');
    return null;
  }
};

export const startRide = async (cadeteId, orders, totalDistance) => {
  const startTime = new Date();
  const firestore = getFirestore();
  const fechaActual = obtenerFechaActual();
  const [dia, mes, anio] = fechaActual.split('/');

  const rideId = new Date().getTime().toString();
  // Actualiza el documento del usuario para iniciar una nueva vuelta
  const userRef = doc(firestore, 'users', cadeteId);
  await updateDoc(userRef, {
    vueltas: arrayUnion({
      rideId, // Genera un ID único usando timestamp
      startTime: startTime,
      orders: orders.map((order) => ({
        orderId: order.id,
      })),
      totalDistance: totalDistance,
      totalDuration: 0,
      status: 'ongoing',
    }),
  });

  const pedidosRef = doc(firestore, 'pedidos', anio, mes, dia);
  await runTransaction(firestore, async (transaction) => {
    const pedidosDoc = await transaction.get(pedidosRef);

    if (!pedidosDoc.exists()) {
      transaction.set(pedidosRef, {
        pedidos: orders.map((order) => ({
          ...order,
          status: 'pending',
        })),
      });
    } else {
      const existingPedidos = pedidosDoc.data()?.pedidos || [];
      const updatedPedidos = existingPedidos.map((pedido) =>
        orders.some((order) => order.id === pedido.id)
          ? { ...pedido, status: 'pending' }
          : pedido
      );
      console.log('Updated Pedidos:', updatedPedidos);
      transaction.update(pedidosRef, { pedidos: updatedPedidos });
    }
  });
  return rideId;
};

export const endRide = async (
  rideId,
  totalDistance,
  totalDuration,
  cadeteId // Ahora pasamos el cadeteId como parámetro
) => {
  const endTime = new Date();
  const firestore = getFirestore();

  // Obtén la referencia al documento del usuario
  const userRef = doc(firestore, 'users', cadeteId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    const existingRides = userData.vueltas || [];

    // Busca la vuelta que se está terminando para actualizarla
    const updatedRides = existingRides.map((ride) =>
      ride.rideId === rideId
        ? {
            ...ride,
            endTime: endTime,
            totalDistance: totalDistance,
            totalDuration: totalDuration,
            status: 'completed', // Marca la vuelta como completada
          }
        : ride
    );

    // Verifica los datos antes de la actualización
    console.log('Updated Rides:', updatedRides);
    if (updatedRides.some((ride) => ride === undefined || ride === null)) {
      console.error('Datos de vuelta inválidos:', updatedRides);
      return;
    }

    // Actualiza el documento del usuario
    await updateDoc(userRef, { vueltas: updatedRides });
  } else {
    console.error('No se encontró el usuario');
  }
};
