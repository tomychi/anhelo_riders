import React, { useState } from "react";
// import userLogin from "../../auth/userLogin";
// import { useLocation, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { loginSuccess } from "../../redux/auth/authAction";
import Sticker from "../../assets/anheloTMblack.png";

export const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState(null);

	// const navigate = useNavigate();
	// const location = useLocation();
	// const dispatch = useDispatch();

	// const from = location.state?.from?.pathname || "/dashboard";

	// const { error, login } = userLogin();

	const handleLogin = async (e) => {
		e.preventDefault();
		console.log("Formulario enviado", { email, password });

		// const res = await login(email, password);

		// if (!error && res) {
		// 	dispatch(
		// 		loginSuccess({
		// 			uid: res?.user?.uid || "",
		// 			email: res?.user?.email || "",
		// 		})
		// 	);

		// 	navigate(from, { replace: true });
		// 	setEmail("");
		// 	setPassword("");
		// 	return;
		// } else {
		// 	setErrorMessage(error);
		// }
	};

	return (
		<div className="bg-red-main min-h-screen flex items-center justify-center">
			<div className="w-full max-w-md p-6">
				<form
					className="font-antonio w-full text-black font-black"
					onSubmit={handleLogin}
				>
					<img
						src={Sticker}
						className="w-full mb-8 mx-auto"
						alt="anhelo Logo"
					/>
					<div className="mb-6">
						<label className="block mb-2 text-sm">
							BIENVENIDO, POR FAVOR TU CORREO
						</label>

						<input
							className="block py-2.5 w-full text-black bg-transparent border-0 border-b-2 border-black appearance-none focus:outline-none focus:ring-0 peer"
							required
							placeholder="name@gmail.com"
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
					<div className="mb-8">
						<label className="block mb-2 text-sm">TU CONTRASEÑA</label>

						<input
							className="block py-2.5 w-full text-black bg-transparent border-0 border-b-2 border-black appearance-none focus:outline-none focus:ring-0 peer"
							required
							type="password"
							placeholder="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					{errorMessage && <p className="mb-4 text-red-600">{errorMessage}</p>}

					<button
						type="submit"
						className="text-custom-red w-full p-4 bg-black font-black uppercase outline-none"
					>
						INGRESAR
					</button>
				</form>
			</div>
		</div>
	);
};
