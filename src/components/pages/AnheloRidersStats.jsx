import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchUserVueltasByUid, updateCadeteInfo } from "../../firebase/users";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useSelector } from "react-redux";
import { currencyFormat } from "../../helpers/currencyFormat";
import logo from "../../assets/anheloTMblack.png";
import arrow from "../../assets/arrowIcon.png";
import levelUp from "../../assets/levelUpIcon.png";
import detail from "../../assets/detailIcon.png";
import invite from "../../assets/personIcon.png";
import {
  calcularDesglosePaga,
  calcularPagaPorUnaVuelta,
} from "../../helpers/desgloseGanancia";
import { FechaSelect } from "../riders/FechaSelect";
import { generatePDF } from "../pdf/generatePDF";
import { CloudCog } from "lucide-react";
import NivelesComponent from "../riders/NivelesComponent";

const formatearFecha = (timestamp) => {
  if (!timestamp) return "";

  const date = new Date(
    timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000,
  );

  const dia = date.getDate().toString().padStart(2, "0");
  const mes = (date.getMonth() + 1).toString().padStart(2, "0");
  const año = date.getFullYear().toString().slice(-2);
  const horas = date.getHours().toString().padStart(2, "0");
  const minutos = date.getMinutes().toString().padStart(2, "0");

  return `del ${dia}/${mes}/${año} a las ${horas}:${minutos} hs`;
};

export const AnheloRidersStats = () => {
  const [paga, setPaga] = useState({});
  const navigate = useNavigate();
  const [isEstadisticasVisible, setIsEstadisticasVisible] = useState(false);
  const [isDesgloseVisible, setIsDesgloseVisible] = useState(false);
  const [vueltas, setVueltas] = useState([]);
  const [cadetesData, setCadetesData] = useState({
    precioPorKM: 0,
    precioPuntoEntrega: 0,
  });
  const [promedioGeneralPorViaje, setPromedioGeneralPorViaje] = useState(0);
  const [totalGanancias, setTotalGanancias] = useState(0);
  const [totalViajes, setTotalViajes] = useState(0);
  const user = useSelector((state) => state.auth.user);

  const fetchVueltas = async (periodo) => {
    if (user?.uid) {
      const fetchedVueltas = await fetchUserVueltasByUid(user.uid, periodo);
      let totalKmPorHora = 0;
      let validVueltas = 0;

      fetchedVueltas.forEach((v) => {
        if (v.kmPorHora && v.kmPorHora !== "0") {
          totalKmPorHora += parseFloat(v.kmPorHora);
          validVueltas++;
        }
      });

      const promedioKmPorHora =
        validVueltas > 0 ? totalKmPorHora / validVueltas : 0;
      // Actualizar la información del cadete si el promedio es mayor a 0
      if (promedioKmPorHora > 0) {
        await updateCadeteInfo(user.uid, promedioKmPorHora); // Llama a updateCadeteInfo con el promedio de km/h
      }
      setVueltas(fetchedVueltas || []);
    }
  };

  useEffect(() => {
    const fetchConstants = async () => {
      const firestore = getFirestore();
      const constDocRef = doc(firestore, "constantes", "sueldos");
      const constDoc = await getDoc(constDocRef);

      if (constDoc.exists()) {
        const cadetes = constDoc.data().cadetes;
        setCadetesData(cadetes);
      } else {
        console.error('No se encontró el documento "sueldos"');
      }
    };

    fetchConstants();
    fetchVueltas("HOY");
  }, [user.uid]);

  const calculateSpeed = (distance, duration) => {
    if (duration === 0) return 0;
    return (distance / (duration / 60)).toFixed(2);
  };

  useEffect(() => {
    const calcularPagas = async () => {
      const nuevasPagas = {};
      let gananciaTotal = 0;
      let viajesTotal = 0;

      for (const vuelta of vueltas) {
        const pagaVuelta = await calcularPagaPorUnaVuelta(vuelta);
        nuevasPagas[vuelta.rideId] = pagaVuelta;
        gananciaTotal += pagaVuelta;
        viajesTotal += vuelta.orders.length;
      }

      setPaga(nuevasPagas);
      setTotalGanancias(gananciaTotal);
      setTotalViajes(viajesTotal);

      if (viajesTotal > 0) {
        setPromedioGeneralPorViaje(gananciaTotal / viajesTotal);
      } else {
        setPromedioGeneralPorViaje(0);
      }
    };

    calcularPagas();
  }, [vueltas]);

  const toggleEstadisticas = () =>
    setIsEstadisticasVisible(!isEstadisticasVisible);
  const toggleDesglose = () => setIsDesgloseVisible(!isDesgloseVisible);

  const desglose = cadetesData ? calcularDesglosePaga(vueltas, cadetesData) : 0;

  const handleFechaChange = (periodo) => {
    fetchVueltas(periodo);
  };

  const obtenerDireccionParcial = (direccion) => {
    return direccion.split(",")[0].trim();
  };

  const renderDirecciones = (orders) => {
    if (orders.length === 0) return "No hay direcciones";

    return orders.map((order, index) => {
      const isInvalid = order.map[0] === 0 && order.map[1] === 0;
      const direccion = obtenerDireccionParcial(order.direccion);

      return (
        <div
          key={index}
          className={`direccion-item ${isInvalid ? "bg-red-main" : ""}`}
        >
          <p>- {direccion}</p>
        </div>
      );
    });
  };

  const contarTotalOrders = (vueltas) => {
    let totalOrders = 0;

    vueltas.forEach((vuelta) => {
      totalOrders += vuelta.orders.length;
    });

    return totalOrders;
  };

  const totalOrders = contarTotalOrders(vueltas);

  return (
    <div className="bg-gray-100 min-h-screen text-black font-coolvetica relative">
      <div className="bg-black p-4">
        {/* Div del header */}
        <div className="flex flex-row  justify-between mt-[-6px]">
          <NavLink
            to="/"
            className="flex items-center mb-6 flex-row gap-1 text-black"
          >
            <img
              src={arrow}
              className="h-2"
              style={{ filter: "invert(100%)", transform: "rotate(180deg)" }}
              alt=""
            />
            <span className="text-lg font-medium text-white ">Mapa</span>
          </NavLink>
          <img
            src={logo}
            className="h-3 mt-2 invert"
            style={{ filter: "invert(100%)" }}
            alt=""
          />
        </div>
        {/* Div de cash collected */}
        <div className="flex flex-col items-center mb-12 mt-[-6px]">
          <FechaSelect onFechaChange={handleFechaChange} />

          <h1 className="text-6xl mb-[-4px] text-white">
            {currencyFormat(totalGanancias)}
          </h1>
          <p className="text-green-500 text-sm">
            Como cadete nivel 4 hubieses ganado extra:{" "}
            {/* {currencyFormat(promedioGeneralPorViaje)} */}
          </p>
        </div>

        {/* Div de opciones */}
        <div className="absolute left-4 right-4 top-[180px]  flex flex-col gap-4">
          {/* div 1 */}
          <div className="flex flex-col gap-2 shadow-lg bg-gray-300 rounded-md px-4 pt-2 pb-2">
            {/* card de la opcion 1 */}
            <div
              onClick={toggleEstadisticas}
              className="flex flex-row justify-between items-center cursor-pointer"
            >
              <div className="flex flex-row items-center gap-2">
                <img src={levelUp} className="h-9" alt="" />
                <div className="flex flex-col">
                  <p className="text-sm">Ver detalle de las estadisticas</p>
                </div>
              </div>
              <img
                src={arrow}
                className={`h-2 transition-transform duration-500 ${
                  isEstadisticasVisible ? "-rotate-90" : "rotate-90"
                }`}
                alt=""
              />
            </div>

            {/* Contenido de estadísticas */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isEstadisticasVisible ? "max-h-[1000px]" : "max-h-0"
              }`}
            >
              <div className=" border border-1 mt-2 mb-2 border-black  rounded-md">
                <NivelesComponent />
              </div>
            </div>

            {/* Card de la opcion 2 */}
            <div
              onClick={toggleDesglose}
              className="flex flex-row justify-between items-center cursor-pointer"
            >
              <div className="flex flex-row items-center gap-2">
                <img src={detail} className="h-9" alt="" />
                <div className="flex flex-col">
                  <p className="text-xl mb-[-8px]">Detalle de las ganancias</p>
                  <p className="text-sm">Ver desgloce</p>
                </div>
              </div>
              <img
                src={arrow}
                className={`h-2 transition-transform duration-500 ${
                  isDesgloseVisible ? "-rotate-90" : "rotate-90"
                }`}
                alt=""
              />
            </div>

            <div
              className={`transition-all duration-500 ease-in-out ${
                isDesgloseVisible ? "max-h-[1000px]" : "max-h-0"
              }`}
            >
              <div
                id="vueltas"
                className="border-t border-black py-1 overflow-y-auto max-h-[400px]" // Agrega estas clases
              >
                <p>Total de órdenes en todas las vueltas: {totalOrders}</p>

                {vueltas.map((vuelta) => (
                  <div key={vuelta.rideId} className="mt-1 last:mb-0">
                    <h3 className="text-xl font-bold mb-2">
                      Vuelta {formatearFecha(vuelta.startTime)}
                    </h3>
                    {/* datos */}
                    <p>Direcciones: {renderDirecciones(vuelta.orders)}</p>
                    <p>Recorrido: {vuelta.totalDistance.toFixed(2)} kms</p>
                    <p>
                      Velocidad:{" "}
                      {calculateSpeed(
                        vuelta.totalDistance,
                        vuelta.totalDuration,
                      )}{" "}
                      km/hr
                    </p>
                    <p>
                      Ganancia:{" "}
                      {paga[vuelta.rideId]
                        ? currencyFormat(paga[vuelta.rideId])
                        : "Calculando..."}
                    </p>
                  </div>
                ))}
                <button
                  onClick={() =>
                    generatePDF(
                      vueltas,
                      totalOrders,
                      formatearFecha,
                      currencyFormat,
                      paga,
                    )
                  }
                  className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg hover:bg-blue-700"
                >
                  Descargar PDF
                </button>
              </div>
            </div>
          </div>

          {/* div 2 */}
          <div className="flex flex-col shadow-lg bg-gray-300 mb-4 rounded-md overflow-hidden">
            <div className="px-4 pt-2 pb-2">
              <div className="flex flex-row justify-between items-center">
                {/* Div de lo de la izquierda */}
                {/* <div className="flex flex-row items-top gap-2">
                  <img src={invite} className="h-9 mt-2" alt="" />
                  <div className="flex flex-col">
                    <p className="text-xl mb-[-5px]">Invita y gana</p>
                    <p className="text-sm leading-4">
                      Gana dinero extra por traer conocidos a trabajar a la app
                    </p>
                  </div>
                </div> */}
              </div>
            </div>
            {/* <div className="bg-red-main opacity-20 flex flex-row items-center gap-1 justify-center text-white text-center pt-2.5 pb-3  cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>

              <p className="text-lg fond-medium pt-0.5 ">
                No disponible todavia
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};
