import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { projectAuth } from '../firebase/config';

export const PrivateRoutesLayout = () => {
  const location = useLocation();
  return projectAuth.currentUser ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
