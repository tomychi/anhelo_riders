import { useState, useEffect } from "react";
import {
	APIProvider,
	Map,
	useMap,
	useMapsLibrary,
} from "@vis.gl/react-google-maps";
import PropTypes from "prop-types";
import { pedidoPropTypes } from "../../helpers/propTypes";
import RideComponent from "../riders";

const APIKEY = import.meta.env.VITE_API_GOOGLE_MAPS;

const position = { lat: -33.117142, lng: -64.347756 };
const origen = { lat: -33.095809, lng: -64.33412 };

export const MapOrders = ({ orders }) => {
	return (
		<APIProvider apiKey={APIKEY}>
			<div className="relative w-full h-full">
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
		</APIProvider>
	);
};

function Directions({ orders }) {
	const map = useMap();
	const routesLibrary = useMapsLibrary("routes");

	const [directionsService, setDirectionsService] = useState();
	const [directionsRenderer, setDirectionsRenderer] = useState();
	const [totalDistance, setTotalDistance] = useState(0);
	const [totalDuration, setTotalDuration] = useState(0);
	const [isCalculating, setIsCalculating] = useState(true); // Nuevo estado para la carga

	const [routes, setRoutes] = useState([]);
	const [routeIndex, setRouteIndex] = useState(0);
	const selected = routes[routeIndex];
	const leg = selected?.legs[0];

	useEffect(() => {
		if (!routesLibrary || !map) return;

		setDirectionsService(new routesLibrary.DirectionsService());
		setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
	}, [routesLibrary, map]);

	useEffect(() => {
		if (!directionsService || !directionsRenderer) return;

		setIsCalculating(true); // Inicia la carga

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

				const route = response.routes[0];
				const totalDistance = route.legs.reduce((acc, leg) => {
					return acc + leg.distance.value;
				}, 0);
				const totalDuration = route.legs.reduce(
					(acc, leg) => acc + leg.duration.value,
					0
				);

				setTotalDistance(totalDistance / 1000);
				setTotalDuration(totalDuration / 60);

				const lineSymbol = {
					path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
					scale: 2,
					strokeColor: "#FF0000",
				};

				directionsRenderer.setOptions({
					polylineOptions: {
						strokeColor: "#00AAFF",
						strokeOpacity: 0.7,
						strokeWeight: 4,
						icons: [
							{
								icon: lineSymbol,
								offset: "100%",
								repeat: "20px",
							},
						],
					},
				});

				setRoutes(response.routes);
				setIsCalculating(false); // Termina la carga
			});
	}, [directionsService, directionsRenderer, orders]);

	if (isCalculating || !leg) {
		return <div>Cargando ruta...</div>; // O cualquier otro indicador de carga
	}

	return (
		<RideComponent
			pedidosPorEntregar={orders}
			totalDistance={totalDistance}
			totalDuration={totalDuration}
		/>
	);
}

MapOrders.propTypes = {
	orders: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};

Directions.propTypes = {
	orders: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};
