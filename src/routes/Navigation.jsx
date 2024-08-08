import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AnheloRiders } from "../components/pages/AnheloRiders";
import { AnheloRidersStats } from "../components/pages/AnheloRidersStats";
import { Login } from "../components/pages/LogIg";

export const Navigation = () => {
	return (
		<Router>
			<div className="h-screen  overflow-x-hidden">
				<Routes>
					{/* Por default vas aca */}
					<Route path="/authentication" element={<Login />} />

					{/* Estas rutas tengo que hacerlas privadas */}

					<Route path="/*" element={<AnheloRiders />} />
					<Route path="/anheloriders" element={<AnheloRiders />} />
					<Route path="anheloriders_stats" element={<AnheloRidersStats />} />
				</Routes>
			</div>
		</Router>
	);
};
