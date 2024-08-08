import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnheloRiders } from '../components/pages/AnheloRiders';
import { AnheloRidersStats } from '../components/pages/AnheloRidersStats';
import { Login } from '../components/pages/LogIg';
import { PrivateRoutesLayout } from '../layouts/PrivateRoutesLayout';

export const Navigation = () => {
  return (
    <Router>
      <div className="h-screen  overflow-x-hidden">
        <Routes>
          {/* Por default vas aca */}
          <Route path="/login" element={<Login />} />

          {/* Estas rutas tengo que hacerlas privadas */}

          {/* Rutas para el dashboard */}
          <Route element={<PrivateRoutesLayout />}>
            <Route path="/*" element={<AnheloRiders />} />
            <Route path="/anheloriders" element={<AnheloRiders />} />
            <Route path="anheloriders_stats" element={<AnheloRidersStats />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};
