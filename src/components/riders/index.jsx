import { pedidoPropTypes } from "../../helpers/propTypes";
import PropTypes from "prop-types";
import {
	endRide,
	fetchUserVueltasByUid,
	startRide,
} from "../../firebase/users";
import { useDispatch, useSelector } from "react-redux";
import { setRideStatus } from "../../redux/riders/riderAction";
import clock from "../../assets/clockIcon.png";
import logo from "../../assets/anheloTMblack.png";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import {
	calcularPagaPorUnaVuelta,
	calcularPagaPorVuelta,
} from "../../helpers/desgloseGanancia";
import { currencyFormat } from "../../helpers/currencyFormat";
const RideComponent = ({
	pedidosPorEntregar,
	totalDuration,
	totalDistance,
}) => {
	const user = useSelector((state) => state.auth.user);
	const cadeteId = user.uid;

	const dispatch = useDispatch();
	const { rideId, isAvailable } = useSelector((state) => state.ride);
	const [paga, setPaga] = useState(0);

	useEffect(() => {
		const getPaga = async () => {
			if (pedidosPorEntregar) {
				const pagaVuelta = await calcularPagaPorVuelta(
					pedidosPorEntregar,
					totalDistance
				);
				setPaga(pagaVuelta);
			}
		};

		const getLastVuelta = async () => {
			if (pedidosPorEntregar.length === 0) {
				const vuelta = await fetchUserVueltasByUid(cadeteId);
				const pagaVuelta = await calcularPagaPorUnaVuelta(
					vuelta[vuelta.length - 1]
				);
				setPaga(pagaVuelta);
			}
		};

		getPaga();
		getLastVuelta();
	}, [pedidosPorEntregar, totalDistance, cadeteId]);

	const handleStartRide = async () => {
		try {
			if (pedidosPorEntregar.length === 0) {
				console.error("No hay pedidos por entregar.");
				return;
			}

			const newRideId = await startRide(
				cadeteId,
				pedidosPorEntregar,
				totalDistance,
				totalDuration,
				paga
			);
			if (newRideId) {
				dispatch(setRideStatus(newRideId, false, pedidosPorEntregar));
			} else {
				console.error("No se pudo iniciar la vuelta.");
			}
		} catch (error) {
			console.error("Error al iniciar la vuelta", error);
		}
	};

	const handleEndRide = async () => {
		if (!rideId) {
			console.error("El ID de la vuelta no está definido");
			return;
		}

		// Verifica si todos los pedidos en vuelta están marcados como 'delivered'
		const allDelivered = pedidosPorEntregar.every(
			(order) => order.status === "delivered"
		);

		if (!allDelivered) {
			console.error("No todos los pedidos están marcados como entregados.");

			Swal.fire({
				icon: "warning",
				title: "Pedidos Incompletos",
				text: "No todos los pedidos están marcados como entregados. Por favor, verifica los pedidos restantes.",
				confirmButtonText: "Entendido",
				confirmButtonColor: "#3085d6",
			});

			return;
		}

		try {
			await endRide(rideId, cadeteId);
			dispatch(setRideStatus(null, true, []));
		} catch (error) {
			console.error("Error al finalizar la vuelta", error);
		}
	};
	return (
		<div
			className={`absolute bg-black ${
				(isAvailable && pedidosPorEntregar.length > 0) ||
				(!isAvailable && pedidosPorEntregar.length === 0)
					? "inset-0 bg-opacity-50"
					: "hidden"
			} flex flex-col items-center justify-center p-4 gap-4`}
		>
			{/* Mostrar botón de iniciar vuelta solo si no hay vuelta en curso y hay pedidos por entregar */}
			{isAvailable && pedidosPorEntregar.length > 0 && (
				<div className="flex flex-col w-full items-center gap-2">
					<button
						onClick={handleStartRide}
						className="bg-black h-14 text-gray-100 hover:text-green-500  uppercase text-xl items-center w-full rounded-full font-medium p-4"
					>
						COMENZAR VUELTA
					</button>

					<div className="flex flex-row w-full gap-2 justify-center">
						<div className="h-5 rounded-full flex flex-row items-center bg-green-500 w-1/2 p-4 gap-2 text-center justify-center ">
							<img src={clock} className="h-2 mb-1" alt="" />
							<p className="text-xs text-black lowercase  flex  text-center justify-center font-bold  leading-none">
								{Math.floor(totalDuration)} Minutos aprox.
							</p>
						</div>
						<div className="h-5 rounded-full flex flex-row items-center bg-green-500 w-1/2 p-4 gap-2 text-center justify-center ">
							<p className="text-xs text-black lowercase  flex  text-center justify-center font-bold  leading-none">
								{currencyFormat(paga)} de ganancia
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Mostrar botón de finalizar vuelta solo si hay una vuelta en curso y todos los pedidos en vuelta están entregados */}
			{!isAvailable && pedidosPorEntregar.length === 0 && (
				<div className="flex flex-col  bg-gray-300 rounded-md ">
					<div className="px-4 pt-2 pb-2">
						<div className="flex flex-col items-center text-center">
							<p className="text-xl mb-[-5px] ">Vuelta casi terminada</p>
							<p className="text-sm leading-4">
								Cuando regreses a Anhelo podrás apretar el siguiente boton y se
								te acreditara {currencyFormat(paga)}
							</p>
						</div>
					</div>
					<div className="border-t border-black text-xl text-black text-center  py-3 font-medium cursor-pointer">
						Llegue a Anhelo
					</div>
				</div>
			)}
		</div>
	);
};

export default RideComponent;

RideComponent.propTypes = {
	pedidosPorEntregar: PropTypes.arrayOf(pedidoPropTypes).isRequired,
	totalDistance: PropTypes.number,
	totalDuration: PropTypes.number,
};
