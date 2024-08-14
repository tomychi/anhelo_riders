import { useState } from "react";
import PropTypes from "prop-types"; // Importa PropTypes

export const FechaSelect = ({ onFechaChange }) => {
	const [selectedFecha, setSelectedFecha] = useState("HOY");

	const handleFechaChange = (e) => {
		setSelectedFecha(e.target.value);
		onFechaChange(e.target.value);
	};

	return (
		<div className="text-sm mb-[-5px]  text-white">
			<select
				id="fechaSelect"
				value={selectedFecha}
				onChange={handleFechaChange}
				className="p-2 w-16 border border-gray-300 bg-black rounded-md"
			>
				<option value="HOY">Hoy</option>
				<option value="SEMANA">Últimos 7 días</option>
				<option value="MES">Este mes</option>
			</select>
		</div>
	);
};
FechaSelect.propTypes = {
	onFechaChange: PropTypes.func.isRequired,
};
