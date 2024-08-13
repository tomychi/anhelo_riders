import { pedidoPropTypes } from "../../helpers/propTypes";
import PropTypes from "prop-types";
import { endRide, startRide } from "../../firebase/users";
import { useDispatch, useSelector } from "react-redux";
import { setRideStatus } from "../../redux/riders/riderAction";
import clock from "../../assets/clockIcon.png";
import logo from "../../assets/anheloTMblack.png";
import Swal from "sweetalert2";
const RideComponent = ({
	pedidosPorEntregar,
	totalDuration,
	totalDistance,
}) => {
	const user = useSelector((state) => state.auth.user);
	const cadeteId = user.uid;

	const dispatch = useDispatch();
	const { rideId, isAvailable } = useSelector((state) => state.ride);
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
				totalDuration
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
				<div className="flex flex-row w-full gap-4">
					<button
						onClick={handleStartRide}
						className="bg-black h-14 text-gray-100 text-xl items-center w-full font-medium p-4"
					>
						Confirmar salida
					</button>
					<div className="h-14 bg-gray-100 relative">
						<img
							src={clock}
							className="h-2 absolute top-0 right-0 m-2"
							alt=""
						/>
						<p className="text-xs text-black lowercase flex items-center text-center justify-center font-bold p-4 leading-none">
							{Math.floor(totalDuration)} Minutos
						</p>
					</div>
				</div>
			)}

			{/* Mostrar botón de finalizar vuelta solo si hay una vuelta en curso y todos los pedidos en vuelta están entregados */}
			{!isAvailable && pedidosPorEntregar.length === 0 && (
				<div className="flex flex-row w-full gap-4">
					<button onClick={handleEndRide} className="bg-black p-4 w-full">
						<p className="text-gray-100 mb-[-5px] text-xs font-medium text-">
							Vuelta casi terminada:
						</p>
						<div className="flex flex-row items-baseline justify-center gap-2 ">
							<p className="text-gray-100 h-14 text-lg items-center  font-medium ">
								Clickea aca cuando llegues a
							</p>
							<img
								src={logo}
								className="h-4 mt-2 invert"
								style={{ filter: "invert(100%)" }}
								alt=""
							/>
						</div>
						<p className="text-green-500 text-lg  font-medium mt-[-30px]">
							y $7.890 se agregaran a tu ganancia.
						</p>
					</button>
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
