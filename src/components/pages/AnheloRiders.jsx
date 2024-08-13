import { useEffect, useState } from "react";
import logo from "../../assets/anheloTMblack.png";
import { MapOrders } from "../map/MapOrders";
import { PedidoCard } from "../orders/PedidoCard";
import { ReadOrdersForToday } from "../../firebase/orders";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserNameByUid } from "../../firebase/users";
import { updateAvailableRide } from "../../redux/riders/riderAction";
import arrow from "../../assets/arrowIcon.png";
import money from "../../assets/moneyIcon.png";

export const AnheloRiders = () => {
	const user = useSelector((state) => state.auth.user);
	const [userName, setUserName] = useState({
		available: false,
		name: "",
	});
	const [orders, setOrders] = useState([]);
	const [isLoading, setIsLoading] = useState(true); // Estado de carga

	const [isArrowRotated, setIsArrowRotated] = useState(false);
	const [visibleSection, setVisibleSection] = useState(null);
	const [windowHeight, setWindowHeight] = useState(window.innerHeight);
	const dispatch = useDispatch();

	const navigate = useNavigate();

	useEffect(() => {
		const getUserName = async () => {
			if (user?.uid) {
				setIsLoading(true); // Empieza la carga

				const datos = await fetchUserNameByUid(user.uid);
				const { name } = datos;
				const { available } = datos;
				dispatch(updateAvailableRide(available, user.uid));
				setUserName({ name, available });
				setIsLoading(false); // Termina la carga
			}
		};

		getUserName();
	}, [user?.uid, dispatch]);

	useEffect(() => {
		if (userName.name) {
			const unsubscribe = ReadOrdersForToday(userName.name, setOrders);

			return () => unsubscribe();
		}
	}, [userName]);

	useEffect(() => {
		const handleResize = () => {
			setWindowHeight(window.innerHeight);
		};

		window.addEventListener("resize", handleResize);
		window.addEventListener("orientationchange", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("orientationchange", handleResize);
		};
	}, []);

	const toggleSection = (section) => {
		setVisibleSection(visibleSection === section ? null : section);
	};

	const filteredOrders = orders.sort((a, b) => {
		const [horaA, minutosA] = a.hora.split(":").map(Number);
		const [horaB, minutosB] = b.hora.split(":").map(Number);
		return horaA * 60 + minutosA - (horaB * 60 + minutosB);
	});

	const pedidosPorEntregar = filteredOrders.filter((o) => !o.entregado);

	const handleVolverClick = (e) => {
		e.preventDefault();
		setIsArrowRotated(true);
		setTimeout(() => {
			setIsArrowRotated(false);
			navigate("/anheloriders_stats");
		}, 500);
	};

	return (
		<div
			className="flex flex-col overflow-hidden"
			style={{ height: `${windowHeight}px` }}
		>
			{isLoading ? (
				<div className="flex justify-center items-center h-full bg-white">
					<span>Cargando...</span> {/* Puedes reemplazar esto con un spinner */}
				</div>
			) : (
				<>
					<div className="flex flex-col flex-shrink-0">
						<div
							className={`overflow-hidden transition-all duration-500 ease-in-out ${
								visibleSection === "porEntregar"
									? "max-h-[500px] opacity-100"
									: "max-h-0 opacity-0"
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
					</div>
					<button
						onClick={() => toggleSection("porEntregar")}
						className="p-4 bg-gray-100 font-black font-antonio flex items-center relative w-full"
					>
						<div className="absolute left-4">
							<img src={logo} className="h-1.5" alt="" />
						</div>
						<div className="flex-grow flex flex-col items-center">
							<span className="text-xs font-coolvetica font-medium mb-1.5">
								Pedidos por entregar ({pedidosPorEntregar.length}). Clickea para
								ver.
							</span>
							<div className="w-12 h-1 bg-gray-300 rounded-full"></div>
						</div>
						<NavLink
							to="/anheloriders_stats"
							className="absolute right-4 flex flex-row gap-2 items-center"
						>
							<img src={money} className="h-2.5 " alt="" />

							<img src={arrow} className="h-2 opacity-20" alt="" />
						</NavLink>
					</button>
					<div className="flex-grow relative">
						<MapOrders orders={pedidosPorEntregar} />
					</div>
				</>
			)}
		</div>
	);
};
