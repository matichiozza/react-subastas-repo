import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">Inicio</Link> | {' '}
      
      {token ? (
        <>
          <Link to="/account">Mi Cuenta</Link> | {' '}
          <Link to="/publications">Mis Publicaciones</Link> | {' '}
          <button onClick={handleLogout}>Cerrar Sesión</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link> | {' '}
          <Link to="/register">Registro</Link>
        </>
      )}
    </nav>
  );
};

export default Navbar;
