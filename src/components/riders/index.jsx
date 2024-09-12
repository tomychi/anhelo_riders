import { pedidoPropTypes } from '../../helpers/propTypes';
import PropTypes from 'prop-types';
import {
  deleteRide,
  endRide,
  fetchUserVueltasByUid,
  startRide,
} from '../../firebase/users';
import { updateCadeteForOrder } from '../../firebase/orders';
import { useDispatch, useSelector } from 'react-redux';
import { setRideStatus } from '../../redux/riders/riderAction';
import clock from '../../assets/clockIcon.png';
import Swal from 'sweetalert2';
import { useEffect, useState } from 'react';
import {
  calcularPagaPorUnaVuelta,
  calcularPagaPorVuelta,
} from '../../helpers/desgloseGanancia';
import { currencyFormat } from '../../helpers/currencyFormat';

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
  const [lastVuelta, setLastVuelta] = useState(0);

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
        const vuelta = await fetchUserVueltasByUid(cadeteId, 'HOY');
        setLastVuelta(vuelta[vuelta.length - 1]);
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
        console.error('No hay pedidos por entregar.');
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
        dispatch(setRideStatus(newRideId, false, pedidosPorEntregar, true));
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

      Swal.fire({
        icon: 'warning',
        title: 'Pedidos Incompletos',
        text: 'No todos los pedidos están marcados como entregados. Por favor, verifica los pedidos restantes.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3085d6',
      });

      return;
    }

    try {
      await endRide(rideId, cadeteId);
      dispatch(setRideStatus(null, true, [], false));
    } catch (error) {
      console.error('Error al finalizar la vuelta', error);
    }
  };

  const handleCancelRide = async () => {
    if (!rideId) {
      console.error('El ID de la vuelta no está definido');
      return;
    }

    // Mostrar diálogo de confirmación
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Confirmar Cancelación',
      text: '¿Estás seguro de que deseas cancelar esta vuelta?',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    });

    // Si el usuario confirma, proceder con la eliminación
    if (result.isConfirmed) {
      try {
        // Itera sobre los pedidos actualizados y actualiza el cadete en Firestore
        for (const pedido of pedidosPorEntregar) {
          const { id, fecha } = pedido; // Asegúrate de tener el id y la fecha del pedido
          await updateCadeteForOrder(fecha, id, 'NO ASIGNADO');
        }
        await deleteRide(cadeteId, rideId); // Elimina la vuelta
        dispatch(setRideStatus(null, true, [], false)); // Actualiza el estado

        Swal.fire({
          icon: 'success',
          title: 'Vuelta Cancelada',
          text: 'La vuelta ha sido cancelada correctamente.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#3085d6',
        });
      } catch (error) {
        console.error('Error al cancelar la vuelta', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al intentar cancelar la vuelta. Intenta nuevamente.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#d33',
        });
      }
    } else {
      console.log('Cancelación de vuelta cancelada por el usuario.');
    }
  };

  if (!isAvailable) {
    return (
      <>
        <button
          onClick={handleCancelRide}
          className="fixed bottom-4 right-4 bg-red-500 h-12 w-12 text-gray-100 hover:text-white uppercase text-xl rounded-full flex items-center justify-center font-medium p-2 z-50"
        >
          X
        </button>
        {pedidosPorEntregar.length === 0 && (
          <div className="fixed inset-0 flex items-center justify-center z-40">
            <div className="bg-gray-100 text-black rounded-md shadow-lg max-w-sm w-full mx-4">
              <div className="px-4 py-6">
                <div className="flex flex-col items-center text-center">
                  <p className="text-xl font-bold mb-2">
                    Vuelta casi terminada
                  </p>
                  <p className="text-sm font-medium leading-5 mb-4">
                    Cuando regreses a Anhelo podrás apretar el siguiente botón y
                    se te acreditará {currencyFormat(paga)}.
                  </p>
                </div>
              </div>
              <button
                onClick={handleEndRide}
                className="w-full border-t border-black rounded-b-md text-xl bg-black text-gray-100 text-center py-4 font-medium cursor-pointer hover:bg-gray-900 transition-colors"
              >
                Llegue a Anhelo
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-black ${
        isAvailable && pedidosPorEntregar.length > 0
          ? 'bg-opacity-50'
          : 'hidden'
      } flex flex-col items-center justify-center p-4 gap-4 z-30`}
    >
      {/* Mostrar botón de iniciar vuelta solo si no hay vuelta en curso y hay pedidos por entregar */}
      {isAvailable && pedidosPorEntregar.length > 0 && (
        <div className="flex flex-col w-full items-center gap-2 max-w-sm">
          <button
            onClick={handleStartRide}
            className="bg-black h-14 text-gray-100 hover:text-green-500 uppercase text-xl items-center w-full rounded-md font-medium p-4"
          >
            COMENZAR VUELTA
          </button>

          <div className="flex flex-row w-full gap-2 justify-center">
            <div className="h-5 rounded-md flex flex-row items-center bg-gray-100 w-1/2 p-4 gap-2 text-center justify-center">
              <img src={clock} className="h-2" alt="" />
              <p className="text-xs text-black lowercase mb-[-4px] flex text-center justify-center font-medium">
                {Math.floor(totalDuration)} Minutos aprox.
              </p>
            </div>
            <div className="h-5 rounded-md flex flex-row items-center bg-gray-100 w-1/2 p-4 gap-2 text-center justify-center">
              <p className="text-xs text-black lowercase mb-[-4px] flex text-center justify-center font-medium leading-none">
                {currencyFormat(paga)} de ganancia
              </p>
            </div>
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
