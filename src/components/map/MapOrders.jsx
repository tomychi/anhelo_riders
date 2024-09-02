import { useState, useEffect } from "react";
import {
	APIProvider,
	Map,
	useMap,
	useMapsLibrary,
	Marker,
} from "@vis.gl/react-google-maps";
import PropTypes from "prop-types";
import { pedidoPropTypes } from "../../helpers/propTypes";
import RideComponent from "../riders";
import { useSelector } from "react-redux";

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
	const [isCalculating, setIsCalculating] = useState(true);
	const [orderedWaypoints, setOrderedWaypoints] = useState([]);

	const [routes, setRoutes] = useState([]);
	const [routeIndex, setRouteIndex] = useState(0);
	const selected = routes[routeIndex];
	const leg = selected?.legs[0];

	const { vueltaEstablecida, orders: ordersVuelta } = useSelector(
		(state) => state.ride
	);

	useEffect(() => {
		if (!routesLibrary || !map) return;

		setDirectionsService(new routesLibrary.DirectionsService());
		setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
	}, [routesLibrary, map]);

	useEffect(() => {
		if (!directionsService || !directionsRenderer) return;

		setIsCalculating(true);

		const validOrders = orders.filter(
			(order) => order.map[0] !== 0 || order.map[1] !== 0
		);
		const validOrdersVuelta = vueltaEstablecida
			? ordersVuelta.filter((order) => order.map[0] !== 0 || order.map[1] !== 0)
			: null;

		const waypoints = vueltaEstablecida
			? validOrdersVuelta.map((order) => ({
					location: { lat: order.map[0], lng: order.map[1] },
					stopover: true,
			  }))
			: validOrders.map((order) => ({
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
					scale: 1,
					strokeColor: "#f3f4f6", // gray-100
				};

				directionsRenderer.setOptions({
					polylineOptions: {
						strokeColor: "#000000",
						strokeOpacity: 0.5,
						strokeWeight: 14,
						icons: [
							{
								icon: lineSymbol,
								offset: "100%",
								repeat: "20px",
							},
						],
					},
					suppressMarkers: true, // Suprimimos los marcadores por defecto
				});

				// Guardamos los waypoints ordenados
				setOrderedWaypoints(
					route.waypoint_order.map((index) => waypoints[index])
				);

				setRoutes(response.routes);
				setIsCalculating(false);
			});
	}, [
		directionsService,
		directionsRenderer,
		orders,
		vueltaEstablecida,
		ordersVuelta,
	]);

	if (isCalculating || !leg) {
		return <div>Cargando ruta...</div>;
	}

	return (
		<>
			{orderedWaypoints.map((waypoint, index) => (
				<Marker
					key={index}
					position={waypoint.location}
					label={{
						text: (index + 1).toString(),
						color: "white",
						fontWeight: "bold",
					}}
				/>
			))}
			<RideComponent
				pedidosPorEntregar={orders}
				totalDistance={totalDistance}
				totalDuration={totalDuration}
			/>
		</>
	);
}

MapOrders.propTypes = {
	orders: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};

Directions.propTypes = {
	orders: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};

export default MapOrders;
