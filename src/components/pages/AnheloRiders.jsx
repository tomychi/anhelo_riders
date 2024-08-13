import { useEffect, useState } from "react";
import logo from "../../assets/anheloTMblack.png";
import { MapOrders } from "../map/MapOrders";
import { PedidoCard } from "../orders/PedidoCard";
import { ReadOrdersForToday } from "../../firebase/orders";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { fetchUserNameByUid } from "../../firebase/users";

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
		const [horaA, minutosA] = a.hora.split(":").map(Number);
		const [horaB, minutosB] = b.hora.split(":").map(Number);
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
			document.documentElement.style.setProperty("--vh", `${vh}px`);
		};

		setVh();

		window.addEventListener("resize", setVh);
		return () => window.removeEventListener("resize", setVh);
	}, []);

	const handleVolverClick = (e) => {
		e.preventDefault();
		setIsArrowRotated(true);
		setTimeout(() => {
			setIsArrowRotated(false);
			navigate("/anheloriders_stats");
		}, 500);
	};

	return (
		<div className="flex flex-col h-screen h-[calc(var(--vh,1vh)*100)]">
			{/* Parte de pedidos */}
			{/* Pedidos por entregar */}
			<div className="flex flex-col ">
				<div
					className={`transition-all duration-500 ease-in-out  overflow-hidden ${
						visibleSection === "porEntregar" ? "max-h-[1000px]" : "max-h-0"
					}`}
				>
					{pedidosPorEntregar.map((pedido, index) => (
						<PedidoCard
							key={index}
							{...pedido}
							isVisible={visibleSection === "porEntregar"}
							index={index}
						/>
					))}
				</div>
				<button
					onClick={() => toggleSection("porEntregar")}
					className="p-4 bg-gray-200 font-black font-antonio flex items-center relative w-full"
				>
					{/* Logo a la izquierda */}
					<div className="absolute left-4">
						<img src={logo} className="h-1.5" alt="" />
						{/* Ajusta el tamaño según necesites */}
					</div>

					{/* Contenido central */}
					<div className="flex-grow flex flex-col items-center">
						<span className="text-xs font-coolvetica font-medium mb-1">
							Pedidos por entregar ({pedidosPorEntregar.length}). Clickea para
							ver.
						</span>
						<div className="w-12 h-1 bg-gray-400 rounded-full"></div>
					</div>

					{/* SVG a la derecha */}
					<div className="absolute right-4">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6"
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
					</div>
				</button>
			</div>
			{/* Parte del mapa */}
			<div className="flex-grow relative">
				<MapOrders orders={pedidosPorEntregar} />
			</div>
		</div>
	);
};
