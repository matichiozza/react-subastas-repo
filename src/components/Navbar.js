import React, { useContext, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BsPersonCircle } from 'react-icons/bs';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef();

  // LOGS DE DEPURACIÓN
  React.useEffect(() => {
  
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBuscar = (e) => {
    e.preventDefault();
    if (!busqueda.trim()) {
      navigate('/publicaciones');
    } else {
      navigate(`/publicaciones?busqueda=${encodeURIComponent(busqueda)}`);
    }
  };

  // Funciones de navegación unificadas
  const handleVender = () => {
    if (user) navigate('/crear-publicacion');
    else navigate('/login');
    setMobileMenuOpen(false);
  };
  const handleComprar = () => {
    navigate('/publicaciones');
    setMobileMenuOpen(false);
  };
  const handleCategorias = () => {
    navigate('/categorias');
    setMobileMenuOpen(false);
  };

  // Cerrar menú al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg fixed-top" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(90,72,246,0.04)', borderBottom: '1px solid #ececf3', padding: '0.5em 0', minHeight: 68, zIndex: 1050 }}>
      <div className="container-fluid" style={{ maxWidth: 1300, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Columna 1: Logo */}
        <div style={{ flex: '0 0 auto' }}>
          <Link className="navbar-brand fw-bold me-3" to="/" style={{ color: '#1976d2', fontSize: '1.3em', letterSpacing: '-1px', padding: 0 }}>
            <span style={{ fontWeight: 700 }}>Subastas</span><span style={{ color: '#222', fontWeight: 400 }}>Corp</span>
          </Link>
        </div>
        {/* Columna 2: Buscador centrado solo en desktop */}
        <div className="d-none d-lg-flex" style={{ flex: '1 1 0', justifyContent: 'center', minWidth: 0 }}>
          <form className="d-flex w-100" onSubmit={handleBuscar} style={{ maxWidth: 340 }}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar productos..."
              aria-label="Buscar"
              style={{ borderRadius: 20, fontSize: '0.98em', background: '#f7f8fa', border: '1.5px solid #ececf3', boxShadow: 'none', paddingLeft: 18 }}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" style={{ borderRadius: 20, fontSize: '0.98em', padding: '0.45em 1.2em', marginLeft: -38, zIndex: 2, background: '#1976d2', border: 'none', boxShadow: 'none' }}>
              <span className="bi bi-search" style={{ fontSize: '1.1em' }}>🔍</span>
            </button>
          </form>
        </div>
        {/* Columna 3: Menú */}
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
          <button
            className="navbar-toggler"
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen(open => !open)}
            style={{ border: 'none', background: 'none', boxShadow: 'none' }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav align-items-lg-center gap-2 mb-0 flex-lg-row flex-column text-center" style={{ fontWeight: 500, fontSize: '0.89em' }}>
              {/* Buscador en mobile */}
              <li className="nav-item d-lg-none mb-2">
                <form className="d-flex w-100" onSubmit={handleBuscar} style={{ maxWidth: 340, margin: '0 auto' }}>
                  <input
                    className="form-control me-2"
                    type="search"
                    placeholder="Buscar productos, categorías..."
                    aria-label="Buscar"
                    style={{ borderRadius: 20, fontSize: '0.98em', background: '#f7f8fa', border: '1.5px solid #ececf3', boxShadow: 'none', paddingLeft: 18 }}
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit" style={{ borderRadius: 20, fontSize: '0.98em', padding: '0.45em 1.2em', marginLeft: -38, zIndex: 2, background: '#1976d2', border: 'none', boxShadow: 'none' }}>
                    <span className="bi bi-search" style={{ fontSize: '1.1em' }}>🔍</span>
                  </button>
                </form>
              </li>
              <li className="nav-item mb-2 mb-lg-0">
                <button
                  className="nav-link btn"
                  style={{ color: '#222', padding: '0.2em 0.7em', fontSize: '0.95em', background: 'none', border: 'none', textShadow: 'none', boxShadow: 'none', outline: 'none', transition: 'color 0.18s, background 0.18s' }}
                  onClick={handleVender}
                  type="button"
                  onMouseOver={e => { e.currentTarget.style.background = '#e3f2fd'; e.currentTarget.style.color = '#1976d2'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#222'; }}
                  onFocus={e => { e.currentTarget.style.background = '#e3f2fd'; e.currentTarget.style.color = '#1976d2'; }}
                  onBlur={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#222'; }}
                >
                  Vender
                </button>
              </li>
              <li className="nav-item mb-2 mb-lg-0">
                <button
                  className="nav-link btn"
                  style={{ color: '#222', padding: '0.2em 0.7em', fontSize: '0.95em', background: 'none', border: 'none', textShadow: 'none', boxShadow: 'none', outline: 'none', transition: 'color 0.18s, background 0.18s' }}
                  onClick={handleComprar}
                  type="button"
                  onMouseOver={e => { e.currentTarget.style.background = '#e3f2fd'; e.currentTarget.style.color = '#1976d2'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#222'; }}
                  onFocus={e => { e.currentTarget.style.background = '#e3f2fd'; e.currentTarget.style.color = '#1976d2'; }}
                  onBlur={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#222'; }}
                >
                  Comprar
                </button>
              </li>
              <li className="nav-item mb-2 mb-lg-0">
                <button
                  className="nav-link btn"
                  style={{ color: '#222', padding: '0.2em 0.7em', fontSize: '0.95em', background: 'none', border: 'none', textShadow: 'none', boxShadow: 'none', outline: 'none', transition: 'color 0.18s, background 0.18s' }}
                  onClick={handleCategorias}
                  type="button"
                  onMouseOver={e => { e.currentTarget.style.background = '#e3f2fd'; e.currentTarget.style.color = '#1976d2'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#222'; }}
                  onFocus={e => { e.currentTarget.style.background = '#e3f2fd'; e.currentTarget.style.color = '#1976d2'; }}
                  onBlur={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#222'; }}
                >
                  Categorías
                </button>
              </li>
              {/* Botón de cuenta, igual para logueado y no logueado */}
              <li className="nav-item mb-2 mb-lg-0">
                <button
                  className="btn btn-light d-flex align-items-center justify-content-center mx-auto"
                  style={{ borderRadius: '50%', width: 40, height: 40, padding: 0, border: '1.5px solid #ececf3', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  onClick={() => {
                    if (user) {
                      setMenuOpen(open => !open);
                    } else {
                      navigate('/login');
                    }
                    setMobileMenuOpen(false);
                  }}
                  type="button"
                  aria-label={user ? 'Cuenta' : 'Ingresar'}
                >
                  <BsPersonCircle size={26} color="#2196f3" />
                </button>
                {/* Menú desplegable solo si está logueado */}
                {user && menuOpen && (
                  <div ref={menuRef} style={{ position: 'absolute', right: 0, top: 44, minWidth: 180, background: '#fff', border: '1.5px solid #ececf3', borderRadius: 12, boxShadow: '0 4px 24px rgba(25,118,210,0.08)', zIndex: 1000 }}>
                    <Link to="/micuenta" className="dropdown-item" style={{ fontSize: '0.97em', padding: '0.7em 1.2em', color: '#222' }}>Mi cuenta</Link>
                    <Link to="/mispublicaciones" className="dropdown-item" style={{ fontSize: '0.97em', padding: '0.7em 1.2em', color: '#222' }}>Mis publicaciones</Link>
                    <div className="dropdown-divider" style={{ borderTop: '1px solid #ececf3', margin: 0 }}></div>
                    <button className="dropdown-item text-danger" style={{ fontSize: '0.97em', padding: '0.7em 1.2em', color: '#e74c3c', background: 'none', border: 'none', textAlign: 'left' }} onClick={() => { handleLogout(); setMenuOpen(false); }}>Cerrar sesión</button>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Menú hamburguesa flotante en mobile */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: 68,
          left: 0,
          right: 0,
          background: '#fff',
          boxShadow: '0 8px 32px rgba(25,118,210,0.10)',
          zIndex: 2000,
          padding: '1.2em 1.2em 1em 1.2em',
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1em',
          alignItems: 'stretch',
        }}>
          <form className="d-flex w-100 mb-2" onSubmit={handleBuscar} style={{ maxWidth: 340, margin: '0 auto' }}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar productos..."
              aria-label="Buscar"
              style={{ borderRadius: 20, fontSize: '0.98em', background: '#f7f8fa', border: '1.5px solid #ececf3', boxShadow: 'none', paddingLeft: 18 }}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <button className="btn btn-primary" type="submit" style={{ borderRadius: 20, fontSize: '0.98em', padding: '0.45em 1.2em', marginLeft: -38, zIndex: 2, background: '#1976d2', border: 'none', boxShadow: 'none' }}>
              <span className="bi bi-search" style={{ fontSize: '1.1em' }}>🔍</span>
            </button>
          </form>
          <Link className="nav-link py-2" to="/crear-publicacion" style={{ color: '#222', fontSize: '1.08em' }} onClick={() => setMobileMenuOpen(false)}>
            <span role="img" aria-label="vender">📤</span> Vender
          </Link>
          <Link className="nav-link py-2" to="/publicaciones" style={{ color: '#222', fontSize: '1.08em' }} onClick={() => setMobileMenuOpen(false)}>
            <span role="img" aria-label="comprar">🛒</span> Comprar
          </Link>
          <Link className="nav-link py-2" to="/categorias" style={{ color: '#222', fontSize: '1.08em' }} onClick={() => setMobileMenuOpen(false)}>
            <span role="img" aria-label="categorias">📂</span> Categorías
          </Link>
          {user ? (
            <>
              <Link to="/micuenta" className="nav-link py-2" style={{ color: '#222', fontSize: '1.08em' }} onClick={() => setMobileMenuOpen(false)}>Mi cuenta</Link>
              <Link to="/mispublicaciones" className="nav-link py-2" style={{ color: '#222', fontSize: '1.08em' }} onClick={() => setMobileMenuOpen(false)}>Mis publicaciones</Link>
              <button className="btn btn-outline-danger mt-2" style={{ borderRadius: 8, fontWeight: 600 }} onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Cerrar sesión</button>
              <button
                className="btn btn-light d-flex align-items-center justify-content-center mx-auto mt-2"
                style={{ borderRadius: '50%', width: 40, height: 40, padding: 0, border: '1.5px solid #ececf3', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                onClick={() => { setMenuOpen(open => !open); }}
                type="button"
                aria-label="Cuenta"
              >
                <BsPersonCircle size={26} color="#2196f3" />
              </button>
            </>
          ) : (
            <button
              className="btn btn-light d-flex align-items-center justify-content-center mx-auto mt-2"
              style={{ borderRadius: '50%', width: 40, height: 40, padding: 0, border: '1.5px solid #ececf3', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
              type="button"
              aria-label="Ingresar"
            >
              <BsPersonCircle size={26} color="#2196f3" />
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
