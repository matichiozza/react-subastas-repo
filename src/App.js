import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import MiCuenta from './components/MiCuenta';
import MisPublicaciones from './components/MisPublicaciones';
import PrivateRoute from './components/PrivateRoute';

// Componente de inicio
const Home = () => (
  <div>
    <h1>Bienvenido a la App</h1>
    <p>Contenido públicoo</p>
  </div>
);

function App() {
  return (
    <Router>
      <Navbar /> {/* Agregamos el Navbar en la parte superior de la aplicación */}
      <Routes>
        {/* Ruta pública */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas */}
        <Route
          path="/cuenta"
          element={
            <PrivateRoute>
              <MiCuenta />
            </PrivateRoute>
          }
        />
        <Route
          path="/publicaciones"
          element={
            <PrivateRoute>
              <MisPublicaciones />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
