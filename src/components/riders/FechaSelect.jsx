import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types"; // Importa PropTypes

export const FechaSelect = ({ onFechaChange }) => {
	const [selectedFecha, setSelectedFecha] = useState("HOY");

	const [selectWidth, setSelectWidth] = useState("auto");
	const selectRef = useRef(null);

	const handleFechaChange = (e) => {
		setSelectedFecha(e.target.value);
		onFechaChange(e.target.value);

		updateSelectWidth(e.target.options[e.target.selectedIndex].text);
	};

	const updateSelectWidth = (text) => {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		context.font = getComputedStyle(selectRef.current).font;
		const width = context.measureText(text).width;
		setSelectWidth(`${width + 40}px`); // Add some padding
	};

	useEffect(() => {
		if (selectRef.current) {
			updateSelectWidth(
				selectRef.current.options[selectRef.current.selectedIndex].text
			);
		}
	}, []);

	return (
		<div className="text-sm mb-[-5px] text-white">
			<select
				ref={selectRef}
				id="fechaSelect"
				value={selectedFecha}
				onChange={handleFechaChange}
				className="p-2 border border-gray-300 bg-black rounded-md"
				style={{ width: selectWidth }}
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
