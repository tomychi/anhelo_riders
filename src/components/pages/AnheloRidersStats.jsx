import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchUserVueltasByUid } from "../../firebase/users";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useSelector } from "react-redux";
import { currencyFormat } from "../../helpers/currencyFormat";
import logo from "../../assets/anheloTMblack.png";
import arrow from "../../assets/arrowIcon.png";
import levelUp from "../../assets/levelUpIcon.png";
import detail from "../../assets/detailIcon.png";
import invite from "../../assets/personIcon.png";

const formatearFecha = (timestamp) => {
	if (!timestamp) return "";

	const date = new Date(
		timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
	);

	const dia = date.getDate().toString().padStart(2, "0");
	const mes = (date.getMonth() + 1).toString().padStart(2, "0");
	const año = date.getFullYear().toString().slice(-2);
	const horas = date.getHours().toString().padStart(2, "0");
	const minutos = date.getMinutes().toString().padStart(2, "0");

	return `del ${dia}/${mes}/${año} a las ${horas}:${minutos} hs`;
};

export const AnheloRidersStats = () => {
	const navigate = useNavigate();
	const [isEstadisticasVisible, setIsEstadisticasVisible] = useState(false); // Cambiado a false
	const [isResumenVisible, setIsResumenVisible] = useState(false); // Cambiado a false
	const [isDesgloseVisible, setIsDesgloseVisible] = useState(false); // Cambiado a false

	const [vueltas, setVeultas] = useState([]);
	const [cadetesData, setCadetesData] = useState({
		precioPorKM: 0,
		precioPuntoEntrega: 0,
	});
	const user = useSelector((state) => state.auth.user);

	useEffect(() => {
		const getVueltas = async () => {
			if (user?.uid) {
				const name = await fetchUserVueltasByUid(user.uid);
				setVeultas(name || []);
			}
		};

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

		getVueltas();
		fetchConstants();
	}, [user.uid]);

	const toggleEstadisticas = () =>
		setIsEstadisticasVisible(!isEstadisticasVisible);
	const toggleResumen = () => setIsResumenVisible(!isResumenVisible);
	const toggleDesglose = () => setIsDesgloseVisible(!isDesgloseVisible);

	const calcularDesglosePaga = (vueltas) => {
		let totalPaga = 0;

		vueltas.forEach((vuelta) => {
			const puntosDeEntrega = vuelta.orders.length;
			const pagaPorPuntosDeEntrega =
				puntosDeEntrega * cadetesData.precioPuntoEntrega;
			const pagaPorKmRecorridos =
				vuelta.totalDistance * cadetesData?.precioPorKM;

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

	// Uso de la función
	const desglose = cadetesData ? calcularDesglosePaga(vueltas, cadetesData) : 0;
	const kmRecorridos = vueltas.reduce((total, vuelta) => {
		return total + vuelta.totalDistance;
	}, 0);

	const DireccionParcial = ({ direccion }) => {
		const direccionParcial = direccion.split(",")[0];

		return <p>{direccionParcial}</p>;
	};

	const obtenerDireccionParcial = (direccion) => {
		return direccion.split(",")[0].trim();
	};

	const renderDirecciones = (orders) => {
		if (orders.length === 0) return "No hay direcciones";
		const direcciones = orders.map((order) =>
			obtenerDireccionParcial(order.direccion)
		);
		return direcciones.join(", ");
	};

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
					<p className="text-sm mb-[-18px] text-white">Hoy</p>
					<h1 className="text-6xl mb-[-8px] text-white">$32.720</h1>
					<p className="text-green-500 text-sm">
						Como cadete nivel 4 hubieses ganado +$9170
					</p>
				</div>
				{/* Div de opciones */}
				<div className="absolute left-4 right-4 top-40  flex flex-col gap-4">
					{/* div 1 */}
					<div className="flex flex-col gap-2 shadow-lg bg-gray-300 rounded-md px-4 pt-2 pb-2">
						{/* card de la opcion 1 */}
						<div className="flex flex-row justify-between items-center">
							{/* Div de lo de la izquierda */}
							<div className="flex flex-row items-center gap-2">
								<img src={levelUp} className="h-9" alt="" />
								<div className="flex flex-col">
									<p className="text-xl mb-[-8px]">Cadete nivel 3</p>
									<p className="text-sm">Ver detalle de las estadisticas</p>
								</div>
							</div>
							<img src={arrow} className="h-2" alt="" />
						</div>
						{/* Card de la opcion 2 */}
						<div
							onClick={toggleDesglose}
							className="flex flex-row justify-between items-center"
						>
							{/* Div de lo de la izquierda */}
							<div className="flex flex-row items-center gap-2">
								<img src={detail} className="h-9" alt="" />
								<div className="flex flex-col">
									<p className="text-xl mb-[-8px]">Detalle de las ganancias</p>
									<p className="text-sm">Ver desgloce</p>
								</div>
							</div>
							<img src={arrow} className="h-2" alt="" />
						</div>

						{/* Aca las vueltas */}
						<div
							className={`transition-all duration-500 ease-in-out overflow-hidden ${
								isDesgloseVisible ? "max-h-[1000px]" : "max-h-0"
							}`}
						>
							<div className=" border-t border-black py-2">
								{vueltas.map((vuelta) => (
									<div key={vuelta.rideId} className="mt-1 last:mb-0">
										<h3 className="text-xl font-bold mb-2">
											Vuelta {formatearFecha(vuelta.startTime)}
										</h3>
										{/* datos */}

										<p>Direcciones: {renderDirecciones(vuelta.orders)}</p>

										<p>Recorrido: {vuelta.totalDistance.toFixed(2)} kms</p>
										<p>Velocidad: {vuelta.totalDistance.toFixed(2)} km/hr</p>
										<p>Ganancia: {currencyFormat(desglose)}</p>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* div 2 */}
					<div className="flex flex-col shadow-lg bg-gray-300 mb-4 rounded-md overflow-hidden">
						<div className="px-4 pt-2 pb-2">
							<div className="flex flex-row justify-between items-center">
								{/* Div de lo de la izquierda */}
								<div className="flex flex-row items-top gap-2">
									<img src={invite} className="h-9 mt-2" alt="" />
									<div className="flex flex-col">
										<p className="text-xl mb-[-5px]">Invita y gana</p>
										<p className="text-sm leading-4">
											Gana dinero extra por traer conocidos a trabajar a la app
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="bg-red-main text-white text-center py-3 font-medium cursor-pointer">
							Ver mas
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
