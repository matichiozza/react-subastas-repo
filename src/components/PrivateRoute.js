// src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);

  // Si el usuario está autenticado (tiene un token), renderizamos los hijos
  // Si no está autenticado, lo redirigimos a la página de login
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
