import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useNavigation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Ajustes from './components/Ajustes';
import MisPublicaciones, { misPublicacionesLoader } from './components/MisPublicaciones';
import MisOfertas, { misOfertasLoader } from './components/MisOfertas';
import CrearPublicacion from './components/CrearPublicacion';
import TodasPublicaciones, { publicacionesLoader } from './components/TodasPublicaciones';
import Home, { homeLoader } from './components/Home';
import Ayuda from './components/Ayuda';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';
import DetallePublicacion, { detalleLoader } from './components/DetallePublicacion';
import Chat from './components/Chat';
import SwiperTest from './components/SwiperTest';
import HomeHeroVariants from './components/HomeHeroVariants';

const Layout = () => {
  const navigation = useNavigation();
  const isLoading = navigation.state === 'loading';

  return (
    <>
      {isLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '3px', background: 'linear-gradient(90deg, #f59e0b, #ea580c)', zIndex: 9999, animation: 'loadingBar 1s infinite ease-in-out' }}>
          <style>{`@keyframes loadingBar { 0% { width: 0%; left: 0; } 50% { width: 50%; left: 25%; } 100% { width: 100%; left: 100%; } }`}</style>
        </div>
      )}
      <Navbar />
      <Outlet />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Home />, loader: homeLoader },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/ajustes", element: <PrivateRoute><Ajustes /></PrivateRoute> },
      { path: "/mispublicaciones", element: <PrivateRoute><MisPublicaciones /></PrivateRoute>, loader: misPublicacionesLoader }, 
      { path: "/misofertas", element: <PrivateRoute><MisOfertas /></PrivateRoute>, loader: misOfertasLoader },
      { path: "/crear-publicacion", element: <PrivateRoute><CrearPublicacion /></PrivateRoute> },
      { path: "/publicaciones", element: <TodasPublicaciones />, loader: publicacionesLoader },
      { path: "/publicaciones/:id", element: <DetallePublicacion />, loader: detalleLoader },
      { path: "/chat/:chatId", element: <PrivateRoute><Chat /></PrivateRoute> },
      { path: "/ayuda", element: <Ayuda /> },
      { path: "/pruebas", element: <SwiperTest /> },
      { path: "/dev/heroes", element: <HomeHeroVariants />, loader: homeLoader }
    ]
  }
]);

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  );
}

export default App;
