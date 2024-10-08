import { useEffect, useState, useRef } from "react";
import logo from "../../assets/anheloTMblack.png";
import { MapOrders } from "../map/MapOrders";
import { PedidoCard } from "../orders/PedidoCard";
import { ReadOrdersForToday } from "../../firebase/orders";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserNameByUid, updateCercaForOrder } from "../../firebase/users";
import { updateAvailableRide } from "../../redux/riders/riderAction";
import arrow from "../../assets/arrowIcon.png";
import money from "../../assets/moneyIcon.png";
import { ChevronDown, CloudCog } from "lucide-react";

export const AnheloRiders = () => {
  const user = useSelector((state) => state.auth.user);
  const [userName, setUserName] = useState({
    available: false,
    name: "",
  });
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isArrowRotated, setIsArrowRotated] = useState(false);
  const [visibleSection, setVisibleSection] = useState(null);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const scrollTimeout = useRef(null);

  useEffect(() => {
    const getUserName = async () => {
      if (user?.uid) {
        setIsLoading(true);
        const datos = await fetchUserNameByUid(user.uid);
        const { name } = datos;
        const { available } = datos;
        dispatch(updateAvailableRide(available));
        setUserName({ name, available });
        setIsLoading(false);
      }
    };

    getUserName();
  }, [user?.uid, dispatch]);

  useEffect(() => {
    if (userName.name) {
      const unsubscribe = ReadOrdersForToday(userName.name, setOrders);
      return () => unsubscribe();
    }
  }, [userName]);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const toggleSection = (section) => {
    setVisibleSection(visibleSection === section ? null : section);
    setShowScrollIndicator(true); // Mostrar el indicador cuando se abre la sección
  };

  const filteredOrders = orders.sort((a, b) => {
    const [horaA, minutosA] = a.hora.split(":").map(Number);
    const [horaB, minutosB] = b.hora.split(":").map(Number);
    return horaA * 60 + minutosA - (horaB * 60 + minutosB);
  });

  const pedidosPorEntregar = filteredOrders.filter((o) => !o.entregado);

  const handleVolverClick = (e) => {
    e.preventDefault();
    setIsArrowRotated(true);
    setTimeout(() => {
      setIsArrowRotated(false);
      navigate("/anheloriders_stats");
    }, 500);
  };

  const handleScroll = (e) => {
    setShowScrollIndicator(false); // Ocultar el indicador al hacer scroll

    // Limpiar el timeout existente si lo hay
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Configurar un nuevo timeout
    scrollTimeout.current = setTimeout(() => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      setShowScrollIndicator(
        scrollHeight > clientHeight && scrollTop < scrollHeight - clientHeight,
      );
    }, 500); // Esperar 500ms después de que el scroll se detenga
  };

  // -33.120227, -64.348986 sebastian vera 160 cadete
  //  sebastian vera 338 pedido
  // -33.108982, -64.339921 avenida marcelo t de alvear

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const cadeteLatitude = position.coords.latitude;
        const cadeteLongitude = position.coords.longitude;

        console.log(cadeteLatitude, cadeteLongitude);

        pedidosPorEntregar.forEach((pedido) => {
          const distancia = calcularDistancia(
            cadeteLatitude,
            cadeteLongitude,
            pedido.map[0],
            pedido.map[1],
          );

          if (distancia < 0.5 && !pedido.cerca) {
            // Si la distancia es menor a 0.5 y "cerca" es false, actualizar el pedido
            updateCercaForOrder(pedido.fecha, pedido.id)
              .then(() => {
                console.log(`Pedido ${pedido.id} actualizado con cerca: true`);
                // Opcional: Actualizar el estado local o notificar al cliente aquí
                notificarCliente(
                  pedido.clienteId,
                  "El cadete está cerca de su ubicación",
                );
              })
              .catch((error) => {
                console.error("Error al actualizar el pedido:", error);
              });
          }
        });
      },
      (error) => {
        console.error("Error obteniendo la ubicación del cadete:", error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [pedidosPorEntregar]); // Asegúrate de que "pedidosPorEntregar" esté en las dependencias

  // Función para calcular la distancia entre dos puntos geográficos
  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c; // Distancia en km
    return distancia;
  };

  // Función para notificar al cliente (esto dependerá de tu implementación específica)
  const notificarCliente = (clienteId, mensaje) => {
    // Aquí deberías implementar la lógica para notificar al cliente
    // Por ejemplo, enviar una notificación push o un mensaje de texto
    console.log(`Notificando al cliente ${clienteId}: ${mensaje}`);
  };

  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: `${windowHeight}px` }}
    >
      {isLoading ? (
        <div className="flex justify-center items-center h-full bg-white">
          <span>Cargando...</span>
        </div>
      ) : (
        <>
          <div
            className={`flex-shrink-0 overflow-y-auto transition-all duration-500 ease-in-out relative ${
              visibleSection === "porEntregar"
                ? "max-h-[50vh] opacity-100"
                : "max-h-0 opacity-0"
            }`}
            onScroll={handleScroll}
          >
            {pedidosPorEntregar.map((pedido, index) => (
              <PedidoCard
                key={index}
                {...pedido}
                isVisible={visibleSection === "porEntregar"}
                index={index}
              />
            ))}
            {showScrollIndicator && visibleSection === "porEntregar" && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pb-4">
                <div className=" w-6 h-6 opacity-20 bg-black border border-1 border-white rounded-full flex items-center justify-center animate-bounce">
                  <img
                    src={arrow}
                    alt="Scroll down"
                    className="w-2 transform rotate-90"
                    style={{ filter: "invert(1)" }}
                  />
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => toggleSection("porEntregar")}
            className="p-4 border border-black border-opacity-20  bg-gray-100 font-black font-antonio flex items-center relative w-full flex-shrink-0"
          >
            <div className="absolute left-4">
              <img src={logo} className="h-1.5" alt="" />
            </div>
            <div className="flex-grow flex flex-col items-center">
              <span className="text-xs font-coolvetica font-medium mb-1.5">
                Pedidos por entregar ({pedidosPorEntregar.length}). Clickea para
                ver.
              </span>
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            <NavLink
              to="/anheloriders_stats"
              className="absolute right-4 flex flex-row gap-2 items-center"
            >
              <img src={money} className="h-2.5 " alt="" />
              <img src={arrow} className="h-2 opacity-20" alt="" />
            </NavLink>
          </button>
          <div className="flex-grow relative">
            <MapOrders orders={pedidosPorEntregar} />
          </div>
        </>
      )}
    </div>
  );
};
