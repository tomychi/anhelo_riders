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
  }, [directionsService, directionsRenderer, orders]);

  if (!leg) return null;
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
