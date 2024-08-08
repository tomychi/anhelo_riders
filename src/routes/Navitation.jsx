import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AnheloRiders } from '../components/pages/AnheloRiders';
import { AnheloRidersStats } from '../components/pages/AnheloRidersStats';

export const Navigation = () => {
  return (
    <Router>
      <div className="h-screen  overflow-x-hidden">
        <Routes>
          <Route path="/*" element={<AnheloRiders />} />
          <Route path="/anheloriders" element={<AnheloRiders />} />
          <Route path="anheloriders_stats" element={<AnheloRidersStats />} />
        </Routes>
      </div>
    </Router>
  );
};
