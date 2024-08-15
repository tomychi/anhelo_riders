import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import arrow from "../../assets/arrowIcon.png";

export const FechaSelect = ({ onFechaChange }) => {
	const [selectedFecha, setSelectedFecha] = useState("HOY");
	const [isOpen, setIsOpen] = useState(false);
	const selectRef = useRef(null);

	const options = [
		{ value: "HOY", label: "Hoy" },
		{ value: "SEMANA", label: "Últimos 7 días" },
		{ value: "MES", label: "Este mes" },
	];

	const handleFechaChange = (value) => {
		setSelectedFecha(value);
		onFechaChange(value);
		setIsOpen(false);
	};

	const toggleDropdown = () => {
		setIsOpen(!isOpen);
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (selectRef.current && !selectRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<div ref={selectRef} className="relative text-sm mb-[-5px] text-white">
			<div
				className="px-2 py-0.5 border border-gray-100 bg-black rounded-md cursor-pointer flex justify-center flex-row gap-2 items-center"
				onClick={toggleDropdown}
			>
				<span>{options.find((opt) => opt.value === selectedFecha)?.label}</span>
				<img
					src={arrow}
					alt="arrow"
					className={`w-1.5 transition-transform duration-300 ${
						isOpen ? "-rotate-90" : "rotate-90"
					}`}
					style={{ filter: "invert(100%)" }}
				/>
			</div>
			{isOpen && (
				<div className="absolute top-full left-0 w-full bg-black border border-gray-300 rounded-md mt-1 z-50">
					{options.map((option) => (
						<div
							key={option.value}
							className="p-2 hover:bg-gray-700 cursor-pointer text-center"
							onClick={() => handleFechaChange(option.value)}
						>
							{option.label}
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
