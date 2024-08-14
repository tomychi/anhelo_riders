import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import arrow from "../../assets/arrowIcon.png";

export const FechaSelect = ({ onFechaChange }) => {
	const [selectedFecha, setSelectedFecha] = useState("HOY");
	const [selectWidth, setSelectWidth] = useState("auto");
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef(null);
	const containerRef = useRef(null);

	const handleFechaChange = (value) => {
		setSelectedFecha(value);
		onFechaChange(value);
		setIsOpen(false);
		updateSelectWidth(getOptionText(value));
	};

	const updateSelectWidth = (text) => {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		context.font = getComputedStyle(selectRef.current).font;
		const width = context.measureText(text).width;
		setSelectWidth(`${width + 40}px`); // Add some padding
	};

	const getOptionText = (value) => {
		switch (value) {
			case "HOY":
				return "Hoy";
			case "SEMANA":
				return "Últimos 7 días";
			case "MES":
				return "Este mes";
			default:
				return "";
		}
	};

	useEffect(() => {
		if (selectRef.current) {
			updateSelectWidth(getOptionText(selectedFecha));
		}

		const handleClickOutside = (event) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [selectedFecha]);

	return (
		<div ref={containerRef} className="relative text-sm mb-[-5px] text-white">
			<div
				ref={selectRef}
				className="p-2 border border-gray-300 bg-black rounded-md cursor-pointer flex justify-between items-center"
				style={{ width: selectWidth }}
				onClick={() => setIsOpen(!isOpen)}
			>
				<span>{getOptionText(selectedFecha)}</span>
				<img
					src={arrow}
					alt="arrow"
					className={`w-1.5  transition-transform duration-300 ${
						isOpen ? "-rotate-90" : "rotate-90"
					}`}
					style={{ filter: "invert(100%)" }}
				/>
			</div>
			{isOpen && (
				<div className="absolute top-full left-0 w-full bg-black border border-gray-300 rounded-md mt-1">
					{["HOY", "SEMANA", "MES"].map((option) => (
						<div
							key={option}
							className="p-2 hover:bg-gray-700 cursor-pointer"
							onClick={() => handleFechaChange(option)}
						>
							{getOptionText(option)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

FechaSelect.propTypes = {
	onFechaChange: PropTypes.func.isRequired,
};
