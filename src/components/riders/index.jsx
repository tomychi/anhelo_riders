import { pedidoPropTypes } from '../../helpers/propTypes';
import PropTypes from 'prop-types';
import { endRide, startRide } from '../../firebase/users';
import { useDispatch, useSelector } from 'react-redux';
import { setRideStatus } from '../../redux/riders/riderAction';
const RideComponent = ({
  pedidosPorEntregar,
  totalDuration,
  totalDistance,
}) => {
  const user = useSelector((state) => state.auth.user);
  const cadeteId = user.uid;

  const dispatch = useDispatch();
  const { rideId, isRideOngoing } = useSelector((state) => state.ride);
  const handleStartRide = async () => {
    try {
      if (pedidosPorEntregar.length === 0) {
        console.error('No hay pedidos por entregar.');
        return;
      }

      const newRideId = await startRide(
        cadeteId,
        pedidosPorEntregar,
        totalDistance,
        totalDuration
      );
      if (newRideId) {
        dispatch(setRideStatus(newRideId, true, pedidosPorEntregar));
      } else {
        console.error('No se pudo iniciar la vuelta.');
      }
    } catch (error) {
      console.error('Error al iniciar la vuelta', error);
    }
  };

  const handleEndRide = async () => {
    if (!rideId) {
      console.error('El ID de la vuelta no está definido');
      return;
    }

    // Verifica si todos los pedidos en vuelta están marcados como 'delivered'
    const allDelivered = pedidosPorEntregar.every(
      (order) => order.status === 'delivered'
    );

    if (!allDelivered) {
      console.error('No todos los pedidos están marcados como entregados.');
      return;
    }

    try {
      await endRide(rideId, cadeteId);
      dispatch(setRideStatus(null, false, []));
    } catch (error) {
      console.error('Error al finalizar la vuelta', error);
    }
  };

  return (
    <>
      {/* Mostrar botón de iniciar vuelta solo si no hay vuelta en curso y hay pedidos por entregar */}
      {!isRideOngoing && pedidosPorEntregar.length > 0 && (
        <button
          onClick={handleStartRide}
          className="bg-black text-gray-100 w-full   font-medium py-4"
        >
          Confirmar salida{' '}
        </button>
      )}
      <p className="bg-white text-xs text-black font-bold px-4 py-4 leading-none">
        {totalDuration.toFixed(2)} Min.
      </p>

      {/* Mostrar botón de finalizar vuelta solo si hay una vuelta en curso y todos los pedidos en vuelta están entregados */}
      {isRideOngoing && (
        <button
          onClick={handleEndRide}
          className="bg-black text-gray-100 w-full   font-medium py-4"
        >
          Finalizar vuelta
        </button>
      )}
    </>
  );
};

export default RideComponent;

RideComponent.propTypes = {
  pedidosPorEntregar: PropTypes.arrayOf(pedidoPropTypes).isRequired,
  totalDistance: PropTypes.number,
  totalDuration: PropTypes.number,
};
