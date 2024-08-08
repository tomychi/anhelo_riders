import { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import PropTypes from 'prop-types';

const APIKEY = import.meta.env.VITE_API_GOOGLE_MAPS;

const position = { lat: -33.117142, lng: -64.347756 };
const origen = { lat: -33.095809, lng: -64.33412 };

export const MapOrders = ({ orders }) => {
  return (
    <APIProvider apiKey={APIKEY}>
      <div className="w-full h-4/6 ">
        <Map
          defaultZoom={13}
          defaultCenter={position}
          mapId={'bf51a910020fa25a'}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          {orders.map((order, index) => (
            <AdvancedMarker
              key={index}
              position={{ lat: order.map[0], lng: order.map[1] }}
              draggable={false}
            />
          ))}
          <Directions orders={orders} />
        </Map>
      </div>
    </APIProvider>
  );
};

function Directions({ orders }) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');

  const [directionsService, setDirectionsService] = useState();
  const [directionsRenderer, setDirectionsRenderer] = useState();

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
        setRoutes(response.routes);
      });
  }, [directionsService, directionsRenderer, orders]);

  if (!leg) return null;

  return (
    <div className="directions">
      <h2>{selected.summary}</h2>
      <p>
        {leg.start_address.split(',')[0]} to {leg.end_address.split(',')[0]}
      </p>
      <p>Distance: {leg.distance?.text}</p>
      <p>Duration: {leg.duration?.text}</p>

      <h2>Other Routes</h2>
      <ul>
        {routes.map((route, index) => (
          <li key={route.summary}>
            <button onClick={() => setRouteIndex(index)}>
              {route.summary}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Definición de PropTypes para DetallePedidoItem
const detallePedidoItemPropTypes = PropTypes.shape({
  burger: PropTypes.string.isRequired,
  priceBurger: PropTypes.number.isRequired,
  priceToppings: PropTypes.number.isRequired,
  quantity: PropTypes.number.isRequired,
  subTotal: PropTypes.number.isRequired,
  toppings: PropTypes.arrayOf(PropTypes.string).isRequired,
  costoBurger: PropTypes.number.isRequired,
});

// Definición de PropTypes para PedidoProps
const pedidoPropTypes = PropTypes.shape({
  aclaraciones: PropTypes.string.isRequired,
  detallePedido: PropTypes.arrayOf(detallePedidoItemPropTypes).isRequired,
  direccion: PropTypes.string.isRequired,
  elaborado: PropTypes.bool.isRequired,
  envio: PropTypes.number.isRequired,
  fecha: PropTypes.string.isRequired,
  hora: PropTypes.string.isRequired,
  metodoPago: PropTypes.string.isRequired,
  subTotal: PropTypes.number.isRequired,
  telefono: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  referencias: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
  ubicacion: PropTypes.string.isRequired,
  cadete: PropTypes.string.isRequired,
  dislike: PropTypes.bool,
  delay: PropTypes.bool,
  tiempoElaborado: PropTypes.string,
  tiempoEntregado: PropTypes.string,
  entregado: PropTypes.bool,
  map: PropTypes.arrayOf(PropTypes.number).isRequired,
  kms: PropTypes.number,
  minutosDistancia: PropTypes.number,
});

MapOrders.propTypes = {
  orders: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};

Directions.propTypes = {
  orders: PropTypes.arrayOf(pedidoPropTypes).isRequired,
};
