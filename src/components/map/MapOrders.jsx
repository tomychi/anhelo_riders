import { useState, useEffect } from "react";
import {
	APIProvider,
	Map,
	AdvancedMarker,
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
	const [vueltaIniciada, setVueltaIniciada] = useState(false);

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

				{!vueltaIniciada && (
					<div className="absolute inset-0 bg-black flex flex-row bg-opacity-50 p-4 gap-4 items-center justify-center">
						<button
							onClick={() => setVueltaIniciada(true)}
							className="bg-black text-gray-100 w-full  font-medium py-2 "
						>
							Confirmar salida
						</button>
						<button
							onClick={() => setVueltaIniciada(true)}
							className="bg-white text-xs text-black font-bold px-4 py-2 leading-none"
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
	const [totalDistance, setTotalDistance] = useState(0);
	const [totalDuration, setTotalDuration] = useState(0);

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
			});
	}, [directionsService, directionsRenderer, orders]);

	if (!leg) return null;

	// return (
	// 	<div className="directions">
	// 		<RideComponent
	// 			pedidosPorEntregar={orders}
	// 			totalDistance={totalDistance}
	// 			totalDuration={totalDuration}
	// 		/>
	// 		<p>Distancia total: {totalDistance.toFixed(2)} km</p>
	// 		<p>Duración total: {totalDuration.toFixed(2)} minutos</p>
	// 	</div>
	// );
}

MapOrders.propTypes = {
	orders: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};

Directions.propTypes = {
	orders: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};
