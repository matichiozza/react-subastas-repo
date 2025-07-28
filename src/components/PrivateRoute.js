// src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // Si el usuario aún no está cargado completamente, muestra loader
  if (!user || !user.username || typeof user.nombre === 'undefined') {
    return (
      <div className="container d-flex align-items-center justify-content-center min-vh-100">
        <div className="card p-4 w-100 text-center" style={{ maxWidth: 400 }}>
          <h4>🔄 Cargando...</h4>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }
  
  // Si el usuario es null después de la carga, redirige a login
  if (user === null) {
    return <Navigate to="/login" replace />;
  }
  
  // Si el usuario es válido, muestra el contenido
  return children;
};

export default PrivateRoute;
