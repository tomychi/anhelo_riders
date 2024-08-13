import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { fetchUserVueltasByUid } from "../../firebase/users";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { useSelector } from "react-redux";
import { currencyFormat } from "../../helpers/currencyFormat";
import logo from "../../assets/anheloTMblack.png";

const formatearFecha = (timestamp) => {
	if (!timestamp) return "";

	const date = new Date(
		timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000
	);
	return date.toLocaleString(); // Formatea la fecha y hora a un string legible
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

	const handleVolverClick = (e) => {
		e.preventDefault();
		setIsArrowRotated(true);
		setTimeout(() => {
			setIsArrowRotated(false);
			navigate("/anheloriders");
		}, 500);
	};

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
	const puntosEntrega = vueltas.reduce((total, vuelta) => {
		return total + vuelta.orders.length;
	}, 0);

	return (
		<div className="bg-gray-100 min-h-screen  text-black font-coolvetica">
			<div className="bg-black p-4">
				{/* Div del header */}
				<div className="flex flex-row  justify-between mt-[-6px]">
					<NavLink
						to="/anheloriders"
						className="flex items-center mb-6 flex-row gap-1 text-black"
						onClick={handleVolverClick}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							className="h-3 text-white"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15.75 19.5 8.25 12l7.5-7.5"
							/>
						</svg>

						<span className="text-xl font-medium text-white ">Volver</span>
					</NavLink>
					<img src={logo} className="h-3 mt-2" alt="" />
				</div>

				{/* Div de cash collected */}
				<div className="flex flex-col items-center">
					<p className="text-sm mb-[-18px] text-white">Hoy</p>
					<h1 className="text-7xl mb-[-8px] text-white">$32.720</h1>
					<p className="text-green-500">
						Como cadete nivel 4 hubieses ganado +$9170
					</p>
				</div>
			</div>

			{/* Estadisticas principales */}
			<div className="bg-black text-red-main mb-4">
				<div
					className="flex flex-row items-center gap-2 cursor-pointer"
					onClick={toggleEstadisticas}
				>
					<div className="flex flex-row items-baseline gap-1 pl-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
							className={`h-3 transition-transform duration-300 ${
								isEstadisticasVisible ? "rotate-180" : ""
							}`}
						>
							<path d="M20 4L4 20M4 4v16h16" />
						</svg>
						<h2 className="text-2xl font-bold uppercase pr-4 py-4">
							Estadísticas Principales
						</h2>
					</div>
					<div className="bg-red-main h-0.5 flex-grow" />
				</div>
				<div
					className={`transition-all duration-500 ease-in-out overflow-hidden ${
						isEstadisticasVisible ? "max-h-[1000px]" : "max-h-0"
					}`}
				>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4 pb-4">
						<div>
							<p className="text-sm uppercase">Velocidad promedio</p>
							<p className="text-xl font-bold">40 km/hr</p>
							<div className="flex flex-row items-center gap-1 text-green-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-3"
								>
									<path
										fillRule="evenodd"
										d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
										clipRule="evenodd"
									/>
								</svg>

								<p className="text-xs ">
									Los cadetes nivel 3 andan en promedio a 60 km/hr
								</p>
							</div>
						</div>
						<div>
							<p className="text-sm uppercase">Horas conectado promedio</p>
							<p className="text-xl font-bold">3:32 hs</p>
							<div className="flex flex-row items-center gap-1 text-green-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-3"
								>
									<path
										fillRule="evenodd"
										d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
										clipRule="evenodd"
									/>
								</svg>

								<p className="text-xs ">
									Los cadetes nivel 3 se conectan en promedio 3:50 hs
								</p>
							</div>
						</div>
						<div>
							<p className="text-sm uppercase">Paga promedio por hora</p>
							<p className="text-xl font-bold">$8000</p>
							<div className="flex flex-row items-center gap-1 text-green-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									fill="currentColor"
									className="h-3"
								>
									<path d="M21 6.375c0 2.692-4.03 4.875-9 4.875S3 9.067 3 6.375 7.03 1.5 12 1.5s9 2.183 9 4.875Z" />
									<path d="M12 12.75c2.685 0 5.19-.586 7.078-1.609a8.283 8.283 0 0 0 1.897-1.384c.016.121.025.244.025.368C21 12.817 16.97 15 12 15s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.285 8.285 0 0 0 1.897 1.384C6.809 12.164 9.315 12.75 12 12.75Z" />
									<path d="M12 16.5c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 15.914 9.315 16.5 12 16.5Z" />
									<path d="M12 20.25c2.685 0 5.19-.586 7.078-1.609a8.282 8.282 0 0 0 1.897-1.384c.016.121.025.244.025.368 0 2.692-4.03 4.875-9 4.875s-9-2.183-9-4.875c0-.124.009-.247.025-.368a8.284 8.284 0 0 0 1.897 1.384C6.809 19.664 9.315 20.25 12 20.25Z" />
								</svg>

								<p className="text-xs ">
									Los cadetes nivel 3 ganan en promedio $10.000 por hora
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Resumen de la actividad */}
			<div className="bg-black text-red-main mb-4">
				<div
					className="flex flex-row items-center gap-2 cursor-pointer"
					onClick={toggleResumen}
				>
					<div className="bg-red-main h-0.5 flex-grow"></div>
					<div className="flex flex-row items-baseline gap-1 p-4">
						<h2 className="text-2xl font-bold uppercase">
							Resumen de la actividad
						</h2>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
							className={`h-3 transition-transform duration-300 ${
								isResumenVisible ? "rotate-90" : "-rotate-90"
							}`}
						>
							<path d="M20 4L4 20M4 4v16h16" />
						</svg>
					</div>
				</div>
				<div
					className={`transition-all duration-500 ease-in-out overflow-hidden ${
						isResumenVisible ? "max-h-[1000px]" : "max-h-0"
					}`}
				>
					<div className="grid grid-cols-1 md:grid-cols-2 px-4 pb-4 gap-4">
						<div>
							<p className="text-sm uppercase">Km recorridos</p>
							<p className="text-xl font-bold">
								{kmRecorridos.toFixed(2)} km ={" "}
								{currencyFormat(kmRecorridos * cadetesData.precioPorKM)}
							</p>

							<div className="flex flex-row items-center gap-1 text-green-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 24 24"
									className="h-3"
								>
									<path
										fill="#22c55e"
										stroke="currentColor"
										strokeWidth="2"
										d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3V6z"
									/>
									<path
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										d="M9 3v15"
									/>
									<path
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										d="M15 6v15"
									/>
									<path
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										d="M5 10l2-1 2 1 2-1 2 1 2-1 2 1"
									/>
								</svg>

								<p className="text-xs ">
									Los cadetes nivel 3 recorren en promedio a 72 kms
								</p>
							</div>
						</div>
						<div>
							<p className="text-sm uppercase">Puntos de entrega</p>
							<p className="text-xl font-bold">
								{puntosEntrega} ={" "}
								{currencyFormat(puntosEntrega * cadetesData.precioPuntoEntrega)}
							</p>
							<div className="flex flex-row items-center gap-1 text-green-500">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 384 512"
									className="h-3"
								>
									<path
										fill="#22c55e"
										d="M384 192c0 77.47-64 184-192 320-128-136-192-242.53-192-320C0 86 86 0 192 0s192 86 192 192zM192 256c35.35 0 64-28.65 64-64s-28.65-64-64-64-64 28.65-64 64 28.65 64 64 64z"
									/>
								</svg>

								<p className="text-xs ">
									Los cadetes nivel 3 en promedio tienen 30 puntos de entrega
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Desglose de la paga */}
			<div className="bg-black text-red-main">
				<div
					className="flex flex-row items-center gap-2 cursor-pointer"
					onClick={toggleDesglose}
				>
					<div className="flex flex-row items-baseline gap-1 pl-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
							className={`h-3 transition-transform duration-300 ${
								isDesgloseVisible ? "rotate-180" : ""
							}`}
						>
							<path d="M20 4L4 20M4 4v16h16" />
						</svg>
						<h2 className="text-2xl font-bold uppercase pr-4 py-4">
							Desglose de la paga
						</h2>
					</div>
					<div className="bg-red-main h-0.5 flex-grow" />
				</div>
				<div
					className={`transition-all duration-500 ease-in-out overflow-hidden ${
						isDesgloseVisible ? "max-h-[1000px]" : "max-h-0"
					}`}
				>
					<div className="px-4 pb-4">
						{vueltas.map((vuelta) => (
							<div key={vuelta.rideId} className="mb-4 last:mb-0">
								<h3 className="text-xl font-bold mb-2">
									Inicio vuelta {formatearFecha(vuelta.startTime)}
								</h3>
								<div>
									{vuelta.orders.map((o, index) => (
										<p key={o.orderId}>
											{index + 1}. {o.direccion}
										</p>
									))}
								</div>
								<p>
									puntos de entrega:{" "}
									{currencyFormat(cadetesData.precioPuntoEntrega)} (
									{vuelta.orders.length})
								</p>
								<p>
									Km recorridos: {currencyFormat(cadetesData.precioPorKM)} (
									{vuelta.totalDistance.toFixed(2)} km)
								</p>
								<h3 className="text-xl font-bold mb-2">
									Final vuelta {formatearFecha(vuelta.endTime)}
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-2"></div>
							</div>
						))}

						<p className="text-xl font-bold mt-2">
							TOTAL DE LA VUELTA: {currencyFormat(desglose)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};
