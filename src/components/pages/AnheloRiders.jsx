import { useEffect, useState } from 'react';
import logo from '../../assets/anheloTMblack.png';
import { MapOrders } from '../map/MapOrders';
import { PedidoCard } from '../orders/PedidoCard';
import { ReadOrdersForToday } from '../../firebase/orders';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchUserNameByUid } from '../../firebase/users';

export const AnheloRiders = () => {
  const user = useSelector((state) => state.auth.user);
  const [userName, setUserName] = useState(null);
  const [orders, setOrders] = useState([]);

  const [isArrowRotated, setIsArrowRotated] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const getUserName = async () => {
      if (user?.uid) {
        const name = await fetchUserNameByUid(user.uid);
        setUserName(name);
      }
    };

    getUserName();
  }, [user?.uid]);

  useEffect(() => {
    if (userName) {
      const unsubscribe = ReadOrdersForToday(userName, setOrders);
      return () => unsubscribe(); // Limpia el suscriptor cuando el componente se desmonte
    }
  }, [userName]);

  const [visibleSection, setVisibleSection] = useState(null);

  const toggleSection = (section) => {
    setVisibleSection(visibleSection === section ? null : section);
  };

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

  const handleVolverClick = (e) => {
    e.preventDefault();
    setIsArrowRotated(true);
    setTimeout(() => {
      setIsArrowRotated(false);
      navigate('/anheloriders_stats');
    }, 500);
  };

  return (
    <div className="flex flex-col h-screen h-[calc(var(--vh,1vh)*100)]">
      {/* Parte de la ganancia */}
      {/* <button
        className="bg-green-600 h-full"
        onClick={() => {
          createUserProfile('fi1hxkhhOucFwXJchcGbMaqyJjv1', {
            nombre: 'mauri',
            rol: 'cadete',
            // Otros datos del cadete
          });
        }}
      >
        Agregar cadete{' '}
      </button> */}
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
          <NavLink
            to="/anheloriders_stats"
            className="flex flex-col items-end"
            onClick={handleVolverClick}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`w-6 h-6 mr-2 transition-transform duration-500 ${
                isArrowRotated ? 'rotate-180' : 'rotate-0'
              }`}
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
      {/* Parte de pedidos */}
      <div className="overflow-y-auto pb-safe">
        {/* Pedidos por entregar */}
        <div className="flex flex-col">
          <button
            onClick={() => toggleSection('porEntregar')}
            className="uppercase bg-yellow-400 px-4 py-2 font-black font-antonio text-left flex justify-between items-center"
          >
            <span className="text-xs">
              Pedidos por entregar ({pedidosPorEntregar.length})
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3 transition-transform duration-300 ${
                visibleSection === 'porEntregar' ? 'rotate-180' : ''
              }`}
            >
              <path d="M20 4L4 20M4 4v16h16" />
            </svg>
          </button>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              visibleSection === 'porEntregar' ? 'max-h-[1000px]' : 'max-h-0'
            }`}
          >
            {pedidosPorEntregar.map((pedido, index) => (
              <PedidoCard
                key={index}
                {...pedido}
                isVisible={visibleSection === 'porEntregar'}
                index={index}
              />
            ))}
          </div>
        </div>
        {/* Pedidos entregados */}
        <div className="flex flex-col">
          <button
            onClick={() => toggleSection('entregados')}
            className="uppercase bg-green-500 px-4 py-2 font-black font-antonio text-left flex justify-between items-center"
          >
            <span className="text-xs">
              Pedidos entregados ({pedidosEntregados.length})
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3 transition-transform duration-300 ${
                visibleSection === 'entregados' ? 'rotate-180' : ''
              }`}
            >
              <path d="M20 4L4 20M4 4v16h16" />
            </svg>
          </button>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              visibleSection === 'entregados' ? 'max-h-[1000px]' : 'max-h-0'
            }`}
          >
            {pedidosEntregados.map((pedido, index) => (
              <PedidoCard
                key={index}
                {...pedido}
                isVisible={visibleSection === 'entregados'}
                index={index}
              />
            ))}
          </div>
        </div>
        {/* Pedidos cancelados */}
        <div className="flex flex-col">
          <button
            onClick={() => toggleSection('cancelados')}
            className="uppercase bg-gray-700 px-4 py-2 font-black font-antonio text-left flex justify-between items-center"
          >
            <span className="text-xs">
              Pedidos cancelados ({pedidosHechos.length})
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-3 transition-transform duration-300 ${
                visibleSection === 'cancelados' ? 'rotate-180' : ''
              }`}
            >
              <path d="M20 4L4 20M4 4v16h16" />
            </svg>
          </button>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              visibleSection === 'cancelados' ? 'max-h-[1000px]' : 'max-h-0'
            }`}
          >
            {pedidosHechos.map((pedido, index) => (
              <PedidoCard
                key={index}
                {...pedido}
                isVisible={visibleSection === 'cancelados'}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
      {/* Parte del mapa */}
      <div className="flex-grow relative">
        <MapOrders orders={pedidosPorEntregar} />
      </div>
    </div>
  );
};
