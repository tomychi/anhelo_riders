import { useEffect, useState } from 'react';
import logo from '../../assets/anheloTMblack.png';
import { MapOrders } from '../map/MapOrders';
import { PedidoCard } from '../orders/PedidoCard';
import { ReadOrdersForToday } from '../../firebase/orders';
import { NavLink } from 'react-router-dom';

export const AnheloRiders = () => {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    // Lee los pedidos para hoy y actualiza el estado
    const unsubscribe = ReadOrdersForToday(setOrders);
    return () => unsubscribe(); // Limpia el suscriptor cuando el componente se desmonte
  }, []);

  const [isPorEntregarVisible, setIsPorEntregarVisible] = useState(false);
  const [isEntregadosVisible, setIsEntregadosVisible] = useState(false);
  const [isCanceladosVisible, setIsCanceladosVisible] = useState(false);

  const togglePorEntregar = () =>
    setIsPorEntregarVisible(!isPorEntregarVisible);
  const toggleEntregados = () => setIsEntregadosVisible(!isEntregadosVisible);
  const toggleCancelados = () => setIsCanceladosVisible(!isCanceladosVisible);

  const filteredOrders = orders.sort((a, b) => {
    const [horaA, minutosA] = a.hora.split(':').map(Number);
    const [horaB, minutosB] = b.hora.split(':').map(Number);
    return horaA * 60 + minutosA - (horaB * 60 + minutosB);
  });

  const pedidosPorEntregar = filteredOrders.filter((o) => !o.entregado);

  const pedidosHechos = filteredOrders.filter(
    (o) => o.elaborado && !o.entregado
  );
  const pedidosEntregados = filteredOrders.filter((o) => o.entregado);

  useEffect(() => {
    const setVh = () => {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();

    window.addEventListener('resize', setVh);
    return () => window.removeEventListener('resize', setVh);
  }, []);

  return (
    <div className="flex flex-col h-screen h-[calc(var(--vh,1vh)*100)]">
      {/* Parte de la ganancia */}
      <div className="bg-red-main flex flex-row justify-between p-4 ">
        <div>
          <div className="flex flex-row gap-2 items-baseline">
            <p className="text-4xl font-black font-antonio">$7020</p>
            <p className="text-xs font-black font-antonio uppercase">
              ganancia
            </p>
          </div>
          <div className="flex flex-row gap-2 items-baseline">
            <p className="text-4xl font-black font-antonio">$280</p>
            <p className="text-xs font-black font-antonio uppercase">propina</p>
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <NavLink to="/anheloriders_stats" className="flex flex-col items-end">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <p className="text-xs font-black font-antonio uppercase">
              ver detalles
            </p>
          </NavLink>
          <img src={logo} alt="logo" className="h-4" />
        </div>
      </div>
      {/* Parte del mapa */}
      <div className="flex-grow relative">
        <MapOrders orders={pedidosPorEntregar} />
        {/* Parte de pedidos */}
        <div className="overflow-y-auto pb-safe">
          {/* Pedidos por entregar */}
          <div className="flex flex-col">
            <button
              onClick={togglePorEntregar}
              className="uppercase bg-yellow-400 p-4 font-black font-antonio text-left flex justify-between items-center"
            >
              <span>Pedidos por entregar ({pedidosPorEntregar.length})</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 transform transition-transform duration-300 ${
                  isPorEntregarVisible ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isPorEntregarVisible ? 'max-h-[1000px]' : 'max-h-0'
              }`}
            >
              {pedidosPorEntregar.map((pedido, index) => (
                <PedidoCard
                  key={index}
                  {...pedido}
                  isVisible={isPorEntregarVisible}
                  index={index}
                />
              ))}
            </div>
          </div>
          {/* Pedidos entregados */}
          <div className="flex flex-col">
            <button
              onClick={toggleEntregados}
              className="uppercase bg-green-500 p-4 font-black font-antonio text-left flex justify-between items-center"
            >
              <span>Pedidos entregados ({pedidosEntregados.length})</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 transform transition-transform duration-300 ${
                  isEntregadosVisible ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isEntregadosVisible ? 'max-h-[1000px]' : 'max-h-0'
              }`}
            >
              {pedidosEntregados.map((pedido, index) => (
                <PedidoCard
                  key={index}
                  {...pedido}
                  isVisible={isEntregadosVisible}
                  index={index}
                />
              ))}
            </div>
          </div>
          {/* Pedidos cancelados */}
          <div className="flex flex-col">
            <button
              onClick={toggleCancelados}
              className="uppercase bg-red-main p-4 font-black font-antonio text-left flex justify-between items-center"
            >
              <span>Pedidos cancelados ({pedidosHechos.length})</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 transform transition-transform duration-300 ${
                  isCanceladosVisible ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isCanceladosVisible ? 'max-h-[1000px]' : 'max-h-0'
              }`}
            >
              {pedidosHechos.map((pedido, index) => (
                <PedidoCard
                  key={index}
                  {...pedido}
                  isVisible={isCanceladosVisible}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
