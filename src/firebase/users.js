import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  runTransaction,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { obtenerFechaActual } from './orders';

// Función para obtener el nombre del usuario por UID
export const fetchUserNameByUid = async (uid) => {
  const firestore = getFirestore();
  const userDocRef = doc(firestore, 'empleados', uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return userDoc.data(); // Asegúrate de que el campo del nombre se llama 'name'
  } else {
    console.error('No se encontró el usuario');
    return null;
  }
};

export const fetchUserVueltasByUid = async (uid, periodo) => {
  const firestore = getFirestore();
  const vueltasRef = collection(firestore, 'empleados', uid, 'vueltas');

  let startDate;

  // Establece la fecha de inicio basada en el período seleccionado
  const today = new Date();
  switch (periodo) {
    case 'HOY':
      startDate = new Date(today.setHours(0, 0, 0, 0)); // Hoy, desde la medianoche
      break;
    case 'SEMANA':
      startDate = new Date(today.setDate(today.getDate() - 7)); // Últimos 7 días
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'MES':
      startDate = new Date(today.setDate(1)); // El primer día de este mes
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate = new Date(0); // En caso de error, trae todo
      break;
  }

  // Crea la consulta para Firestore usando el rango de fechas
  const vueltasQuery = query(vueltasRef, where('startTime', '>=', startDate));

  const querySnapshot = await getDocs(vueltasQuery);
  const vueltas = querySnapshot.docs.map((doc) => doc.data());

  if (vueltas.length > 0) {
    return vueltas;
  } else {
    console.error('No se encontraron vueltas en el período seleccionado');
    return [];
  }
};

export const startRide = async (
  cadeteId,
  orders,
  totalDistance,
  totalDuration,
  paga
) => {
  const startTime = new Date();
  const firestore = getFirestore();
  const fechaActual = obtenerFechaActual();
  const [dia, mes, anio] = fechaActual.split('/');

  const rideId = new Date().getTime().toString();
  // Actualiza el documento del usuario para iniciar una nueva vuelta
  const userRef = doc(firestore, 'empleados', cadeteId);
  await updateDoc(userRef, {
    available: false,
    vueltas: arrayUnion({
      rideId, // Genera un ID único usando timestamp
      startTime: startTime,
      orders: orders.map((order) => ({
        orderId: order.id,
        direccion: order.direccion,
      })),
      totalDistance: totalDistance,
      totalDuration: totalDuration,
      paga,
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
      transaction.update(pedidosRef, { pedidos: updatedPedidos });
    }
  });
  return rideId;
};

export const endRide = async (rideId, cadeteId) => {
  const endTime = new Date();
  const firestore = getFirestore();

  const userRef = doc(firestore, 'empleados', cadeteId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    const existingRides = userData.vueltas || [];

    const updatedRides = existingRides.map((ride) => {
      if (ride.rideId === rideId) {
        const startTime = ride.startTime.toDate();
        const tiempoVuelta = (endTime - startTime) / (1000 * 60 * 60); // Tiempo en horas
        const kmPorHora = ride.totalDistance / tiempoVuelta;

        const tiempoVueltaMinutos = (endTime - startTime) / (1000 * 60); // Tiempo en minutos

        const tiempoVueltaMS = endTime - startTime;
        const horas = Math.floor(tiempoVueltaMS / (1000 * 60 * 60));
        const minutos = Math.floor(
          (tiempoVueltaMS % (1000 * 60 * 60)) / (1000 * 60)
        );
        const segundos = Math.floor((tiempoVueltaMS % (1000 * 60)) / 1000);
        const tiempoVueltaFormato = `${horas}h ${minutos}m ${segundos}s`;

        return {
          ...ride,
          endTime: endTime,
          status: 'completed',
          tiempoVuelta: tiempoVuelta.toFixed(2),
          tiempoVueltaMinutos: tiempoVueltaMinutos.toFixed(2),
          kmPorHora: kmPorHora.toFixed(2),
          tiempoVueltaFormato,
        };
      }
      return ride;
    });
    if (updatedRides.some((ride) => ride === undefined || ride === null)) {
      console.error('Datos de vuelta inválidos:', updatedRides);
      return;
    }

    await updateDoc(userRef, {
      vueltas: updatedRides,
      available: true,
    });
  } else {
    console.error('No se encontró el usuario');
  }
};
// Función para obtener constantes
export const fetchConstants = async () => {
  const firestore = getFirestore();
  const constDocRef = doc(firestore, 'constantes', 'sueldos');
  const constDoc = await getDoc(constDocRef);

  if (constDoc.exists()) {
    return constDoc.data().cadetes;
  } else {
    console.error('No se encontró el usuario');
    return null;
  }
};
