import PropTypes from 'prop-types';
import { currencyFormat } from '../../helpers/currencyFormat';
import { marcarPedidoComoEntregado } from '../../firebase/orders';
import Swal from 'sweetalert2';
import { calcularDemora } from '../../helpers/calcularDemora';
export const PedidoCard = ({
  direccion,
  hora,
  total,
  id,
  fecha,
  telefono,
  isVisible,
  entregado,
  index,
}) => (
  <div
    className={`flex flex-row justify-between border-b border-b-red-main transition-transform duration-300 ease-in-out ${
      isVisible ? 'transform-none' : 'transform -translate-y-full'
    }`}
    style={{ transitionDelay: `${index * 100}ms` }}
  >
    <div className="flex flex-col p-4">
      <p className="uppercase mb-2 mt-2 bg-black font-black text-red-main font-antonio">
        {direccion}
      </p>
      <p className="text-red-main text-xs font-black font-antonio">
        Demora: {calcularDemora(hora)}
      </p>
      <p className="text-red-main text-xs font-black font-antonio">
        {total === 'PAGADO' || total === 'CANCELADO'
          ? `Cobrar: ${total}`
          : `Cobrar: ${currencyFormat(total)}`}
      </p>
    </div>
    <div className="flex flex-col justify-between">
      <a
        href={`tel:${telefono}`}
        className="
        cursor-pointer hover:bg-red-400 
        uppercase p-2 flex flex-row items-center h-1/2 bg-white font-black justify-center text-black font-antonio gap-2"
      >
        <div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className=" h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 3.75v4.5m0-4.5h-4.5m4.5 0-6 6m3 12c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z"
            />
          </svg>

          <p>LLAMAR</p>
        </div>
      </a>

      {!entregado && (
        <div
          onClick={() =>
            marcarPedidoComoEntregado(id, fecha)
              .then(() => {
                Swal.fire({
                  icon: 'success',
                  title: 'ENTREGADOOOOOOOOOOOOOOOO',
                  text: `El pedido con ID ${id} ha sido entregado.`,
                });
              })
              .catch(() => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se pudo entrerga el pedido.',
                });
              })
          }
          className="cursor-pointer uppercase p-2 flex flex-row items-center h-1/2 bg-green-500 font-black justify-center text-black font-antonio gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className=" h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>

          <p>ENTREGAR</p>
        </div>
      )}
    </div>
  </div>
);

PedidoCard.propTypes = {
  direccion: PropTypes.string.isRequired,
  hora: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  isVisible: PropTypes.bool,
  index: PropTypes.number,
  entregado: PropTypes.bool,
  fecha: PropTypes.string,
  id: PropTypes.string,
  telefono: PropTypes.string,
};
