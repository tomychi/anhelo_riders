import { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useSelector } from "react-redux";
import { fetchUserNameByUid } from "../../firebase/users";

const NivelesComponent = () => {
  const [niveles, setNiveles] = useState(null); // Estado para almacenar los niveles
  const [velocidadPromedio, setVelocidadPromedio] = useState(0); // Estado para almacenar la velocidad promedio del cadete
  const [nivelcadete, setNivelCadete] = useState(0);

  const user = useSelector((state) => state.auth.user);
  const db = getFirestore();

  // Función para obtener los datos de niveles desde Firestore
  const obtenerNiveles = async () => {
    try {
      const docRef = doc(db, "constantes", "niveles");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setNiveles(docSnap.data()); // Guardar los datos de niveles en el estado
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error obteniendo los niveles:", error);
    }
  };

  const obtenerVelocidadPromedio = async (uid) => {
    try {
      const cadeteData = await fetchUserNameByUid(uid);
      if (cadeteData) {
        setVelocidadPromedio(cadeteData.velocidadPromedio || 0); // Guardar la velocidad promedio
        setNivelCadete(cadeteData.nivelCadete || 0); // Guardar la velocidad promedio
      }
    } catch (error) {
      console.error("Error obteniendo los datos del cadete:", error);
    }
  };

  // Llamar a la función al montar el componente
  useEffect(() => {
    obtenerNiveles();
    if (user && user.uid) {
      obtenerVelocidadPromedio(user.uid); // Suponiendo que el uid del cadete está en el estado auth
    }
  }, [user]);

  return (
    <div className="border border-1 mt-2 mb-2 border-black rounded-md">
      <div className=" border-t border-black pt-2">
        <p className="text-xl mb-[-8px]">Cadete nivel {nivelcadete}</p>

        <p className="text-xl font-bold ">
          {" "}
          Velocidad promedio: {velocidadPromedio.toFixed(2) ||
            "Cargando..."}{" "}
          km/hr
        </p>
      </div>
      <p className="text-left text-black border-b border-black border-1 px-4 py-2">
        Los niveles se actualizan semanalmente según tu rendimiento de la semana
        previa.
      </p>
      <div className="px-4 py-2 text-left text-black">
        {niveles ? (
          <>
            <p className=" ">
              -Nivel 1: Velocidad promedio: {niveles.nivel1.velocidadMinima} -{" "}
              {niveles.nivel1.velocidadMaxima} km/h, Pedidos a llevar:{" "}
              {niveles.nivel1.pedidosPorKM}
            </p>
            <p className=" ">
              -Nivel 2: Velocidad promedio: {niveles.nivel2.velocidadMinima} -{" "}
              {niveles.nivel2.velocidadMaxima} km/h, Pedidos a llevar:{" "}
              {niveles.nivel2.pedidosPorKM}
            </p>
            <p className=" ">
              -Nivel 3: Velocidad promedio: {niveles.nivel3.velocidadMinima} -{" "}
              {niveles.nivel3.velocidadMaxima} km/h, Pedidos a llevar:{" "}
              {niveles.nivel3.pedidosPorKM}
            </p>
            <p className=" ">
              -Nivel 4: Velocidad promedio: {niveles.nivel4.velocidadMinima} -{" "}
              {niveles.nivel4.velocidadMaxima} km/h, Pedidos a llevar:{" "}
              {niveles.nivel4.pedidosPorKM}
            </p>
            <p className=" ">
              -Nivel 5: Velocidad promedio: {niveles.nivel5.velocidadMinima}{" "}
              km/h o más, Pedidos a llevar: {niveles.nivel5.pedidosPorKM}
            </p>
          </>
        ) : (
          <p>Cargando niveles...</p>
        )}
      </div>
    </div>
  );
};

export default NivelesComponent;
