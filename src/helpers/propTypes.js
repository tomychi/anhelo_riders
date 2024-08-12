import PropTypes from 'prop-types';

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
export const pedidoPropTypes = PropTypes.shape({
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
