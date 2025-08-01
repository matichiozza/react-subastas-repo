import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import MiCuenta from './components/MiCuenta';
import Ajustes from './components/Ajustes';
import MisPublicaciones from './components/MisPublicaciones';
import MisOfertas from './components/MisOfertas';
import CrearPublicacion from './components/CrearPublicacion';
import TodasPublicaciones from './components/TodasPublicaciones';
import Home from './components/Home';
import Ayuda from './components/Ayuda';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import DetallePublicacion from './components/DetallePublicacion';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/micuenta" element={<MiCuenta />} />
            <Route path="/ajustes" element={<PrivateRoute><Ajustes /></PrivateRoute>} />
            <Route path="/mispublicaciones" element={<MisPublicaciones />} />
            <Route path="/misofertas" element={<PrivateRoute><MisOfertas /></PrivateRoute>} />
            <Route path="/crear-publicacion" element={<PrivateRoute><CrearPublicacion /></PrivateRoute>} />
            <Route path="/publicaciones" element={<TodasPublicaciones />} />
            <Route path="/publicaciones/:id" element={<DetallePublicacion />} />
            <Route path="/ayuda" element={<Ayuda />} />
            {/* Agrega aquí más rutas si es necesario */}
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
