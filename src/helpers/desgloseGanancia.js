import { doc, getDoc, getFirestore } from "firebase/firestore";

const fetchConstants = async () => {
  const firestore = getFirestore();
  const constDocRef = doc(firestore, "constantes", "sueldos");
  const constDoc = await getDoc(constDocRef);

  if (constDoc.exists()) {
    const data = constDoc.data().cadetes;
    return data;
  } else {
    console.error('No se encontró el documento "sueldos"');
  }
};

export const calcularDesglosePaga = (vueltas, cadetesData) => {
  if (!vueltas.orders || vueltas.orders.length === 0) {
    return 0;
  }

  let totalPaga = 0;

  vueltas.orders;

  vueltas.forEach((vuelta) => {
    const puntosDeEntrega = vuelta.orders.length;
    const pagaPorPuntosDeEntrega =
      puntosDeEntrega * cadetesData.precioPuntoEntrega;
    const pagaPorKmRecorridos = vuelta.totalDistance * cadetesData?.precioPorKM;

    // Sumar al total de la vuelta
    const pagaVuelta = pagaPorPuntosDeEntrega + pagaPorKmRecorridos;
    totalPaga += pagaVuelta;

    // console.log(`
    //   Puntos de Entrega: $${pagaPorPuntosDeEntrega} (${puntosDeEntrega} puntos)
    //   Km recorridos: $${pagaPorKmRecorridos.toFixed(
    //     2
    //   )} (${vuelta.totalDistance.toFixed(2)} km)
    //   Total de la vuelta: $${pagaVuelta.toFixed(2)}
    // `);
  });

  return totalPaga;
};

export const calcularPagaPorUnaVuelta = async (vuelta) => {
  if (!vuelta) {
    return 0;
  }
  const cadetesData = await fetchConstants();

  if (!cadetesData) {
    console.error("No se pudieron obtener los datos de sueldos");
    return 0;
  }

  if (!vuelta.orders || vuelta.orders.length === 0) {
    return 0;
  }

  const puntosDeEntrega = vuelta.orders.length;
  const pagaPorPuntosDeEntrega =
    puntosDeEntrega * cadetesData.precioPuntoEntrega;
  const pagaPorKmRecorridos = vuelta.totalDistance * cadetesData.precioPorKM;

  const pagaVuelta = pagaPorPuntosDeEntrega + pagaPorKmRecorridos;

  // Puedes descomentar el siguiente bloque si quieres ver el desglose en consola.
  // console.log(`
  //   Puntos de Entrega: $${pagaPorPuntosDeEntrega} (${puntosDeEntrega} puntos)
  //   Km recorridos: $${pagaPorKmRecorridos.toFixed(
  //     2
  //   )} (${vuelta.totalDistance.toFixed(2)} km)
  //   Total de la vuelta: $${pagaVuelta.toFixed(2)}
  // `);

  return pagaVuelta;
};

export const calcularPagaPorVuelta = async (orders, totalDistance) => {
  const cadetesData = await fetchConstants();

  if (!cadetesData) {
    console.error("No se pudieron obtener los datos de sueldos");
    return 0;
  }

  const puntosDeEntrega = orders.length;
  const pagaPorPuntosDeEntrega =
    puntosDeEntrega * cadetesData.precioPuntoEntrega;
  const pagaPorKmRecorridos = totalDistance * cadetesData.precioPorKM;

  const pagaVuelta = pagaPorPuntosDeEntrega + pagaPorKmRecorridos;

  return pagaVuelta;
};
