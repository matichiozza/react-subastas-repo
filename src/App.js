import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import MiCuenta from './components/MiCuenta';
import MisPublicaciones from './components/MisPublicaciones';
import CrearPublicacion from './components/CrearPublicacion';
import TodasPublicaciones from './components/TodasPublicaciones';
import Home from './components/Home';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

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
            <Route path="/mispublicaciones" element={<MisPublicaciones />} />
            <Route path="/crear-publicacion" element={<PrivateRoute><CrearPublicacion /></PrivateRoute>} />
            <Route path="/publicaciones" element={<TodasPublicaciones />} />
            {/* Agrega aquí más rutas si es necesario */}
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
