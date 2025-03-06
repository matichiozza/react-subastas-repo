import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Importa el proveedor de contexto

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App /> {/* Ahora todo el árbol de componentes tiene acceso al contexto */}
    </AuthProvider>
  </React.StrictMode>
);
