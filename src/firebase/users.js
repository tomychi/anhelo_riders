import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  runTransaction,
  collection,
} from "firebase/firestore";
import { obtenerFechaActual } from "./orders";

// Función para obtener el nombre del usuario por UID
export const fetchUserNameByUid = async (uid) => {
  const firestore = getFirestore();
  const userDocRef = doc(firestore, "empleados", uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return userDoc.data(); // Asegúrate de que el campo del nombre se llama 'name'
  } else {
    console.error("No se encontró el usuario");
    return null;
  }
};

export const fetchUserVueltasByUid = async (uid, periodo) => {
  const firestore = getFirestore();
  const userDocRef = doc(firestore, "empleados", uid);

  try {
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      if (data.vueltas) {
        // Filtra las vueltas según el período seleccionado
        const filteredVueltas = filterVueltasByPeriod(data.vueltas, periodo);
        return filteredVueltas;
      } else {
        console.error(
          'El campo "vueltas" no existe en el documento del usuario',
        );
        return [];
      }
    } else {
      console.error("No se encontró el usuario");
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el documento del usuario:", error);
    return null;
  }
};

// Función para filtrar vueltas por período
const filterVueltasByPeriod = (vueltas, periodo) => {
  const today = new Date();
  let startDate;

  switch (periodo) {
    case "HOY":
      startDate = new Date(today.setHours(0, 0, 0, 0)); // Hoy, desde la medianoche
      break;
    case "SEMANA":
      startDate = new Date(today.setDate(today.getDate() - 7)); // Últimos 7 días
      startDate.setHours(0, 0, 0, 0);
      break;
    case "MES":
      startDate = new Date(today.setDate(1)); // El primer día de este mes
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate = new Date(0); // En caso de error, trae todo
      break;
  }

  // Filtra las vueltas basadas en la fecha de inicio
  return vueltas.filter((vuelta) => {
    const startTime = new Date(vuelta.startTime.toDate()); // Convierte Timestamp a Date
    return startTime >= startDate;
  });
};

export const startRide = async (
  cadeteId,
  orders,
  totalDistance,
  totalDuration,
  paga,
) => {
  const startTime = new Date();
  const firestore = getFirestore();

  // Genera un ID único usando timestamp
  const rideId = new Date().getTime().toString();
  const userRef = doc(firestore, "empleados", cadeteId);

  // Obtiene el documento del cadete
  const userSnapshot = await getDoc(userRef);

  // Si el documento existe
  if (userSnapshot.exists()) {
    const cadeteData = userSnapshot.data();

    // Revisa si alguna vuelta tiene los mismos pedidos (misma cantidad y mismos IDs de pedidos)
    const sameOrdersExist = cadeteData.vueltas?.some((vuelta) => {
      const existingOrderIds = vuelta.orders
        .map((order) => order.orderId)
        .sort();
      const newOrderIds = orders.map((order) => order.id).sort();

      // Compara los pedidos existentes con los nuevos pedidos
      return JSON.stringify(existingOrderIds) === JSON.stringify(newOrderIds);
    });

    // Si ya existe una vuelta con los mismos pedidos, no permite continuar
    if (sameOrdersExist) {
      console.log("Ya existe una vuelta con los mismos pedidos.");
      return null; // O lanza un error o devuelve un valor indicando que no se realizó la operación
    }
  }

  // Si no hay vueltas con los mismos pedidos, se crea una nueva vuelta
  await updateDoc(userRef, {
    available: false,
    vueltas: arrayUnion({
      rideId,
      startTime: startTime,
      orders: orders.map((order) => ({
        orderId: order.id,
        direccion: order.direccion,
        map: order.map,
      })),
      totalDistance: totalDistance,
      totalDuration: totalDuration,
      paga,
      status: "ongoing",
    }),
  });

  return rideId;
};

export const endRide = async (rideId, cadeteId) => {
  const endTime = new Date();
  const firestore = getFirestore();

  const userRef = doc(firestore, "empleados", cadeteId);
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
          (tiempoVueltaMS % (1000 * 60 * 60)) / (1000 * 60),
        );
        const segundos = Math.floor((tiempoVueltaMS % (1000 * 60)) / 1000);
        const tiempoVueltaFormato = `${horas}h ${minutos}m ${segundos}s`;

        return {
          ...ride,
          endTime: endTime,
          status: "completed",
          tiempoVuelta: tiempoVuelta.toFixed(2),
          tiempoVueltaMinutos: tiempoVueltaMinutos.toFixed(2),
          kmPorHora: kmPorHora.toFixed(2),
          tiempoVueltaFormato,
        };
      }
      console.log(ride);
      return ride;
    });
    if (updatedRides.some((ride) => ride === undefined || ride === null)) {
      console.error("Datos de vuelta inválidos:", updatedRides);
      return;
    }

    await updateDoc(userRef, {
      vueltas: updatedRides,
      available: true,
    });
  } else {
    console.error("No se encontró el usuario");
  }
};
// Función para obtener constantes
export const fetchConstants = async () => {
  const firestore = getFirestore();
  const constDocRef = doc(firestore, "constantes", "sueldos");
  const constDoc = await getDoc(constDocRef);

  if (constDoc.exists()) {
    return constDoc.data().cadetes;
  } else {
    console.error("No se encontró el usuario");
    return null;
  }
};

export const deleteRide = async (cadeteId, rideId) => {
  const firestore = getFirestore();

  try {
    const userRef = doc(firestore, "empleados", cadeteId);

    // Obtener el documento del usuario
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const vueltas = userData.vueltas || [];

      // Encontrar el índice del objeto con el rideId
      const index = vueltas.findIndex((vuelta) => vuelta.rideId === rideId);

      if (index !== -1) {
        // Crear un nuevo arreglo de vueltas sin el objeto a eliminar
        const updatedVueltas = vueltas.filter(
          (vuelta) => vuelta.rideId !== rideId,
        );

        // Actualizar el documento con el nuevo arreglo de vueltas
        await updateDoc(userRef, {
          vueltas: updatedVueltas,
          available: true,
        });

        console.log(`Vuelta con ID ${rideId} eliminada exitosamente.`);
      } else {
        console.error(`No se encontró una vuelta con ID ${rideId}.`);
      }
    } else {
      console.error("No se encontró el documento del usuario.");
    }
  } catch (error) {
    console.error("Error al eliminar la vuelta:", error);
  }
};
export const updateCadeteInfo = async (cadeteId, velocidadPromedio) => {
  const firestore = getFirestore();

  // Función para obtener los niveles desde Firestore
  const obtenerNiveles = async () => {
    try {
      const docRef = doc(firestore, "constantes", "niveles");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data(); // Devolver los datos de niveles
      } else {
        console.log("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo los niveles:", error);
      return null;
    }
  };

  // Asignar nivel según la velocidad promedio
  const asignarNivelCadete = (velocidadPromedio, niveles) => {
    let nivelCadete = "";

    if (
      velocidadPromedio >= niveles.nivel1.velocidadMinima &&
      velocidadPromedio <= niveles.nivel1.velocidadMaxima
    ) {
      nivelCadete = "Nivel 1";
    } else if (
      velocidadPromedio >= niveles.nivel2.velocidadMinima &&
      velocidadPromedio <= niveles.nivel2.velocidadMaxima
    ) {
      nivelCadete = "Nivel 2";
    } else if (
      velocidadPromedio >= niveles.nivel3.velocidadMinima &&
      velocidadPromedio <= niveles.nivel3.velocidadMaxima
    ) {
      nivelCadete = "Nivel 3";
    } else if (
      velocidadPromedio >= niveles.nivel4.velocidadMinima &&
      velocidadPromedio <= niveles.nivel4.velocidadMaxima
    ) {
      nivelCadete = "Nivel 4";
    } else if (velocidadPromedio >= niveles.nivel5.velocidadMinima) {
      nivelCadete = "Nivel 5";
    }

    return nivelCadete;
  };

  try {
    // Obtener niveles desde Firestore
    const niveles = await obtenerNiveles();
    if (!niveles) {
      throw new Error("No se pudieron obtener los niveles.");
    }

    // Calcular el nivel del cadete basado en su velocidad promedio
    const nivelCadete = asignarNivelCadete(velocidadPromedio, niveles);

    // Actualizar la velocidad promedio y el nivel del cadete en Firestore
    const cadeteRef = doc(firestore, "empleados", cadeteId);
    await updateDoc(cadeteRef, {
      velocidadPromedio,
      nivelCadete,
    });

    console.log("Datos del cadete actualizados correctamente.");
  } catch (error) {
    console.error("Error actualizando los datos del cadete:", error);
  }
};

export const updateCercaForOrder = (fechaPedido, pedidoId) => {
  const firestore = getFirestore();

  return new Promise((resolve, reject) => {
    const [dia, mes, anio] = fechaPedido.split("/");
    const pedidosCollectionRef = collection(firestore, "pedidos", anio, mes);
    const pedidoDocRef = doc(pedidosCollectionRef, dia);

    runTransaction(firestore, async (transaction) => {
      const pedidoDocSnapshot = await transaction.get(pedidoDocRef);
      if (!pedidoDocSnapshot.exists()) {
        reject(new Error("El pedido no existe para la fecha especificada."));
        return;
      }

      const existingData = pedidoDocSnapshot.data();
      const pedidosDelDia = existingData.pedidos || [];

      const pedidosActualizados = pedidosDelDia.map((pedido) => {
        if (pedido.fecha === fechaPedido && pedido.id === pedidoId) {
          // Cambiar la propiedad "cerca" a true
          return {
            ...pedido,
            cerca: true, // Actualizar la propiedad "cerca"
          };
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
