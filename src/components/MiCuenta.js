import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const MiCuenta = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <div className="container d-flex align-items-center justify-content-center min-vh-100"><div className="card p-4 w-100 text-center" style={{ maxWidth: 400 }}>Cargando datos...</div></div>;
  }

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100">
      <div className="card shadow p-4 w-100" style={{ maxWidth: 500 }}>
        <h2 className="text-center mb-4">Mi Cuenta</h2>
        <ul className="list-group list-group-flush">
          <li className="list-group-item bg-transparent"><span className="fw-bold text-primary">Nombre:</span> {user.nombre}</li>
          <li className="list-group-item bg-transparent"><span className="fw-bold text-primary">Usuario:</span> {user.username}</li>
          {/* Agrega aquí más campos si los hay */}
        </ul>
      </div>
    </div>
  );
};

export default MiCuenta;
