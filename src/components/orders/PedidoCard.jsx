import PropTypes from "prop-types";
import { currencyFormat } from "../../helpers/currencyFormat";
import { marcarPedidoComoEntregado } from "../../firebase/orders";
import Swal from "sweetalert2";
import { calcularDemora } from "../../helpers/calcularDemora";

export const PedidoCard = ({
	direccion,
	hora,
	total,
	id,
	fecha,
	telefono,
	isVisible,
	entregado,
	metodoPago,
	index,
}) => {
	// Modificación para mostrar solo la parte de la dirección antes de la primera coma
	const direccionCorta = direccion.split(",")[0];

	return (
		<div
			className={`flex flex-row justify-between bg-gray-200 p-4  hover:bg-gray-300 transition-transform duration-300 ease-in-out ${
				isVisible ? "transform-none" : "transform -translate-y-full"
			}`}
			style={{ transitionDelay: `${index * 100}ms` }}
		>
			<div className="flex flex-col text-left justify-between h-full ">
				<p className=" text-black  text-xl font-coolvetica font-semibold">
					{direccionCorta}
				</p>
				<div>
					<p className="text-black text-xs mb-[-6px] font-coolvetica font-medium">
						Demora: {calcularDemora(hora)}
					</p>
					<p className="text-black text-xs font-medium font-coolvetica">
						{metodoPago === "efectivo"
							? `Cobrar: ${currencyFormat(total)}`
							: `Cobrar: PAGADO`}
					</p>
				</div>
			</div>
			<div className="flex flex-row gap-2">
				{!entregado && (
					<div
						onClick={() =>
							marcarPedidoComoEntregado(id, fecha)
								.then(() => {
									Swal.fire({
										icon: "success",
										title: "ENTREGADOOOOOOOOOOOOOOOO",
										text: `El pedido con ID ${id} ha sido entregado.`,
									});
								})
								.catch(() => {
									Swal.fire({
										icon: "error",
										title: "Error",
										text: "No se pudo entrerga el pedido.",
									});
								})
						}
						className="
         flex flex-col h-full w-20 bg-black pt-2  justify-center items-center  text-white font-coolvetica font-medium gap-2"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth="1.5"
							stroke="currentColor"
							className="h-5"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
							/>
						</svg>
						<p>Entregar</p>
					</div>
				)}
				<a
					href={`tel:${telefono}`}
					className="
         flex flex-col h-full w-20 bg-black pt-2  justify-center items-center  text-white font-coolvetica font-medium gap-2"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
						className="h-4"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M20.25 3.75v4.5m0-4.5h-4.5m4.5 0-6 6m3 12c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z"
						/>
					</svg>
					<p>Llamar</p>
				</a>
			</div>
		</div>
	);
};

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
	metodoPago: PropTypes.string,
};
