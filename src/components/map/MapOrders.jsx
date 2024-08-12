import { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import PropTypes from 'prop-types';
import { pedidoPropTypes } from '../../helpers/propTypes';
import RideComponent from '../riders';

const APIKEY = import.meta.env.VITE_API_GOOGLE_MAPS;

const position = { lat: -33.117142, lng: -64.347756 };
const origen = { lat: -33.095809, lng: -64.33412 };

// const origen = { lat: -33.122869792517136, lng: -64.3548615327737 };

export const MapOrders = ({ pedidosenVuelta, pedidosPorEntregar }) => {
  return (
    <APIProvider apiKey={APIKEY}>
      <div className="absolute inset-0 w-full h-full object-cover">
        <Map
          defaultZoom={13}
          defaultCenter={position}
          mapId={'bf51a910020fa25a'}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          {/* {orders.map((order, index) => (
						<AdvancedMarker
							key={index}
							position={{ lat: order.map[0], lng: order.map[1] }}
							draggable={false}
						/>
					))} */}
          <Directions
            pedidosenVuelta={pedidosenVuelta}
            pedidosPorEntregar={pedidosPorEntregar}
          />
        </Map>
      </div>
    </APIProvider>
  );
};

function Directions({ pedidosenVuelta, pedidosPorEntregar }) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');

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

    const waypoints = pedidosPorEntregar.map((order) => ({
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

        // Calcular la distancia total
        const route = response.routes[0];
        const totalDistance = route.legs.reduce((acc, leg) => {
          return acc + leg.distance.value; // Sumar las distancias en metros
        }, 0);
        const totalDuration = route.legs.reduce(
          (acc, leg) => acc + leg.duration.value,
          0
        );

        setTotalDistance(totalDistance / 1000);
        setTotalDuration(totalDuration / 60); // Convertir a minutos

        const lineSymbol = {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, // Define una flecha cerrada como símbolo
          scale: 2, // Escala del símbolo
          strokeColor: '#FF0000', // Color de la flecha
        };

        // Configurar la Polyline con flechas
        directionsRenderer.setOptions({
          polylineOptions: {
            strokeColor: '#00AAFF',
            strokeOpacity: 0.7,
            strokeWeight: 4,
            icons: [
              {
                icon: lineSymbol,
                offset: '100%', // Desplazamiento de las flechas
                repeat: '20px', // Espaciado entre las flechas
              },
            ],
          },
        });

        setRoutes(response.routes);
      });
  }, [directionsService, directionsRenderer, pedidosenVuelta]);
  if (!leg) return null;

  return (
    <div className="directions">
      <RideComponent
        pedidosPorEntregar={pedidosPorEntregar}
        pedidosenVuelta={pedidosenVuelta}
        totalDistance={totalDistance}
        totalDuration={totalDuration}
      />
      {/* <h2>{selected.summary}</h2> */}
      <p>
        {/* {leg.start_address.split(',')[0]} to {leg.end_address.split(',')[0]} */}
      </p>
      <p>Distancia total: {totalDistance.toFixed(2)} km</p>
      <p>Duración total: {totalDuration.toFixed(2)} minutos</p>

      {/* 
      <h2>Other Routes</h2>
      <ul>
        {routes.map((route, index) => (
          <li key={route.summary}>
            <button onClick={() => setRouteIndex(index)}>
              {route.summary}
            </button>
          </li>
        ))}
      </ul> */}
    </div>
  );
}

MapOrders.propTypes = {
  pedidosenVuelta: PropTypes.arrayOf(pedidoPropTypes).isRequired,
  pedidosPorEntregar: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};

Directions.propTypes = {
  pedidosenVuelta: PropTypes.arrayOf(pedidoPropTypes).isRequired,
  pedidosPorEntregar: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};
