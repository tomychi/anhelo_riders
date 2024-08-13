import { useState, useEffect } from "react";
import {
	APIProvider,
	Map,
	useMap,
	useMapsLibrary,
} from "@vis.gl/react-google-maps";
import PropTypes from "prop-types";
import { pedidoPropTypes } from "../../helpers/propTypes";

const APIKEY = import.meta.env.VITE_API_GOOGLE_MAPS;

const position = { lat: -33.117142, lng: -64.347756 };
const origen = { lat: -33.095809, lng: -64.33412 };

export const MapOrders = ({ orders }) => {
	const [vueltaIniciada, setVueltaIniciada] = useState(false);

	return (
		<APIProvider apiKey={APIKEY}>
			<div className="relative w-full h-full">
				<div
					className={`w-full h-full transition-filter duration-500 ease-in-out ${
						!vueltaIniciada ? "filter blur-md brightness-50" : "filter-none"
					}`}
				>
					<Map
						defaultZoom={13}
						defaultCenter={position}
						mapId={"bf51a910020fa25a"}
						gestureHandling={"greedy"}
						disableDefaultUI={true}
					>
						<Directions orders={orders} />
					</Map>
				</div>

				{!vueltaIniciada && (
					<div className="absolute inset-0 flex  flex-row p-4 gap-4 items-center justify-center">
						<button
							onClick={() => setVueltaIniciada(true)}
							className="bg-black text-gray-100 w-full font-medium py-4"
						>
							Confirmar salida
						</button>
						<button
							onClick={() => setVueltaIniciada(true)}
							className="bg-white text-xs text-black font-bold px-4 py-4 leading-none"
						>
							28 minutos
						</button>
					</div>
				)}
			</div>
		</APIProvider>
	);
};

function Directions({ orders }) {
	const map = useMap();
	const routesLibrary = useMapsLibrary("routes");

	const [directionsService, setDirectionsService] = useState();
	const [directionsRenderer, setDirectionsRenderer] = useState();

	useEffect(() => {
		if (!routesLibrary || !map) return;

		setDirectionsService(new routesLibrary.DirectionsService());
		setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
	}, [routesLibrary, map]);

	useEffect(() => {
		if (!directionsService || !directionsRenderer) return;

		const waypoints = orders.map((order) => ({
			location: { lat: order.map[0], lng: order.map[1] },
			stopover: true,
		}));

		directionsService
			.route({
				origin: origen,
				destination: origen,
				waypoints: waypoints,
				optimizeWaypoints: true,
				travelMode: window.google.maps.TravelMode.DRIVING,
				provideRouteAlternatives: true,
			})
			.then((response) => {
				directionsRenderer.setDirections(response);
				// Configuración adicional si es necesaria
			});
	}, [directionsService, directionsRenderer, orders]);

	return null;
}

MapOrders.propTypes = {
	orders: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};

Directions.propTypes = {
	orders: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};
