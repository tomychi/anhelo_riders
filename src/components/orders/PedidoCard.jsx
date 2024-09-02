import PropTypes from "prop-types";
import { currencyFormat } from "../../helpers/currencyFormat";
import { marcarPedidoComoEntregado } from "../../firebase/orders";
import Swal from "sweetalert2";
import { calcularDemora } from "../../helpers/calcularDemora";
import check from "../../assets/entregadoIcon.png";
import call from "../../assets/callIcon.png";

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
	map,
	referencias,
	index,
}) => {
	// Modificación para mostrar solo la parte de la dirección antes de la primera coma
	const direccionCorta = direccion.split(",")[0];
	const bgColor = map[0] === 0 && map[1] === 0 ? "bg-red-500" : "bg-gray-100";

	return (
		<div
			className={`flex flex-row justify-between ${bgColor} p-4 mb-[-10px] gap-4 hover:bg-gray-300 transition-transform duration-300 ease-in-out ${
				isVisible ? "transform-none" : "transform -translate-y-full"
			}`}
			style={{ transitionDelay: `${index * 100}ms` }}
		>
			<div className="flex flex-col text-left justify-between h-full ">
				<p className=" text-black  text-xl font-coolvetica font-medium mt-[-8px]">
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
					<p className="text-black text-xs mb-[-6px] font-coolvetica font-medium">
						{referencias}
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
         flex flex-col h-[50px] w-16 rounded-md  bg-black pt-2  justify-center items-center  text-white font-coolvetica font-medium gap-"
					>
						<img src={check} className="h-4" alt="" />
						<p>Entregar</p>
					</div>
				)}
				<a
					href={`tel:${telefono}`}
					className="
         flex flex-col h-[50px] w-16 rounded-md  bg-black pt-2  justify-center items-center  text-white font-coolvetica font-medium gap-"
				>
					<img src={call} className="h-4" alt="" />

					<p>Llamar</p>
				</a>
			</div>
		</div>
	);
};

PedidoCard.propTypes = {
	direccion: PropTypes.string.isRequired,
	hora: PropTypes.string.isRequired,
	referencias: PropTypes.string.isRequired,
	total: PropTypes.number.isRequired,
	isVisible: PropTypes.bool,
	index: PropTypes.number,
	entregado: PropTypes.bool,
	fecha: PropTypes.string,
	id: PropTypes.string,
	telefono: PropTypes.string,
	metodoPago: PropTypes.string,
	map: PropTypes.arrayOf(PropTypes.number).isRequired, // Asegura que map es un array de números
};
