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
	aclaraciones,
}) => {
	// Modificación para mostrar solo la parte de la dirección antes de la primera coma
	const direccionCorta = direccion.split(",")[0];
	const bgColor = map[0] === 0 && map[1] === 0 ? "bg-red-500" : "bg-gray-100";
	const capitalizeFirstLetter = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	return (
		<div
			className={`flex flex-row border-black ${bgColor} p-4 mb-[-10px] gap-4 hover:bg-gray-300 transition-transform duration-300 ease-in-out ${
				isVisible ? "transform-none" : "transform -translate-y-full"
			}`}
			style={{ transitionDelay: `${index * 100}ms` }}
		>
			<div className="w-1 bg-black self-stretch"></div>

			<div className="flex flex-row flex-grow">
				<div className="flex flex-col mb-2 gap-2 mr-4">
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
											text: "No se pudo entregar el pedido.",
										});
									})
							}
							className="flex flex-col h-14 w-16 rounded-xl bg-black pt-2 justify-center items-center text-white font-coolvetica font-medium"
						>
							<img src={check} className="h-4" alt="" />
							<p className="text-xs">Entregar</p>
						</div>
					)}
					<a
						href={`tel:${telefono}`}
						className="flex flex-col h-14 w-16 rounded-xl bg-black pt-2 justify-center items-center text-white font-coolvetica font-medium"
					>
						<img src={call} className="h-4" alt="" />
						<p className="text-xs">Llamar</p>
					</a>
				</div>
				<div className="flex flex-col text-left  h-full flex-grow">
					<p className="text-black font-bold text-xl font-coolvetica">
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
						{referencias !== "no especificado" && (
							<div className="flex flex-row items-center">
								<div className="bg-black p-1 rounded-full mr-2"></div>
								<p className="text-black text-xs mb-[-2.5px] font-coolvetica font-medium">
									{capitalizeFirstLetter(referencias)}
								</p>
							</div>
						)}
					</div>
				</div>
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
