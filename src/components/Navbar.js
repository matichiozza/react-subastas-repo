import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import { FaExclamationTriangle } from 'react-icons/fa';
import API_BASE_URL, { getImageUrl } from '../config/api';
import TopTicker from './TopTicker';
import { categoriasCatalogo } from '../data/categoriasCatalogo';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sancionesInfo, setSancionesInfo] = useState(null);
  const [categoriasOpen, setCategoriasOpen] = useState(false);
  const menuRef = useRef();
  const categoriasDropdownRef = useRef(null);

  // Obtener información de sanciones del usuario
  useEffect(() => {
    const fetchSanciones = async () => {
      if (token && user) {
        try {
          const res = await fetch(`${API_BASE_URL}/publicaciones/usuario/sanciones`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          
          const data = await res.json();
          
          if (res.ok) {
            setSancionesInfo(data);
          } else if (res.status === 401 && data.cuentaEliminada) {
            // Cuenta eliminada automáticamente
            alert('Tu cuenta ha sido eliminada por tener 0 sanciones disponibles.');
            logout();
            window.location.href = '/login';
          }
        } catch (error) {
          console.error('Error al obtener sanciones:', error);
        }
      } else {
        // Limpiar sanciones cuando no hay usuario
        setSancionesInfo(null);
      }
    };

    fetchSanciones();
  }, [token, user, logout]);

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

  const irCategoria = (nombre) => {
    navigate(`/publicaciones?busqueda=${encodeURIComponent(nombre)}`);
    setCategoriasOpen(false);
    setMobileMenuOpen(false);
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
  const handleAyuda = () => {
    navigate('/ayuda');
    setMobileMenuOpen(false);
  };

  // Cerrar menús al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (categoriasDropdownRef.current && !categoriasDropdownRef.current.contains(event.target)) {
        setCategoriasOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed-top" style={{ zIndex: 1050, background: '#1a1210' }}>
      <TopTicker />
      <nav
        className="navbar navbar-expand-lg navbar-dark"
        style={{
          background: '#1a1210',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.18)',
          padding: '0.55em 0',
          minHeight: 80,
        }}
      >
      <div className="container-fluid" style={{ maxWidth: '1600px', padding: '0 clamp(8px, 1.5vw, 16px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Columna 1: Logo */}
        <div style={{ flex: '0 0 auto' }}>
          <Link className="navbar-brand fw-bold me-2 d-flex align-items-center" to="/" style={{ padding: 0 }}>
            <img src="/logo_transparent.png" alt="SubastasCorp Logo" style={{ height: '72px', objectFit: 'contain', margin: '-6px 8px 0 0', transform: 'scale(1.22)', transformOrigin: 'left center', filter: 'brightness(0) invert(1)' }} />
          </Link>
        </div>
        {/* Columna 2: Buscador centrado solo en desktop */}
        <div
          className="d-none d-lg-flex navbar-search-col navbar-search-h-margin"
          style={{
            flex: '1 1 0',
            justifyContent: 'center',
            minWidth: 0,
            paddingTop: 0,
            paddingBottom: 0,
          }}
        >
          <form className="navbar-search-shell navbar-search-shell--desktop d-flex w-100" onSubmit={handleBuscar}>
            <input
              className="form-control text-light border-0 shadow-none"
              type="search"
              placeholder="Buscar..."
              aria-label="Buscar"
              style={{ fontSize: '0.88em', background: 'transparent', color: '#fff7ed', padding: '0.48em 0.9rem', margin: 0 }}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <button
              className="btn navbar-search-btn"
              type="submit"
              style={{
                fontSize: '0.88em',
                padding: '0.48em 1.1em',
                margin: 0,
                zIndex: 2,
                background: 'linear-gradient(180deg, #f59e0b 0%, #ea580c 100%)',
                border: 'none',
                boxShadow: 'inset 0 1px 0 rgba(255,247,237,0.2)',
              }}
            >
              <i className="fas fa-search" style={{ fontSize: '1em', color: '#fff7ed' }}></i>
            </button>
          </form>
        </div>
        {/* Columna 3: Menú */}
        <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center' }}>
          <button
            className="navbar-toggler border-0"
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMobileMenuOpen(open => !open)}
            style={{ color: '#e7e5e4' }}
          >
            <i className="fas fa-bars" style={{ fontSize: '1.2em' }}></i>
          </button>
          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav align-items-lg-center gap-1 gap-lg-2 mb-0 flex-lg-row flex-column text-center" style={{ fontWeight: 500, fontSize: '0.82em' }}>
              {/* Buscador en mobile */}
              <li className="nav-item d-lg-none mb-2 navbar-search-h-margin">
                <form className="navbar-search-shell navbar-search-shell--mobile d-flex w-100" onSubmit={handleBuscar}>
                  <input
                    className="form-control text-light border-0 shadow-none"
                    type="search"
                    placeholder="Buscar productos, categorías..."
                    aria-label="Buscar"
                    style={{ fontSize: '0.98em', background: 'transparent', color: '#fff7ed', padding: '0.5em 1rem' }}
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                  />
                  <button
                    className="btn navbar-search-btn"
                    type="submit"
                    style={{
                      fontSize: '0.98em',
                      padding: '0.5em 1.15em',
                      marginLeft: -2,
                      zIndex: 2,
                      background: 'linear-gradient(180deg, #f59e0b 0%, #ea580c 100%)',
                      border: 'none',
                      boxShadow: 'inset 0 1px 0 rgba(255,247,237,0.2)',
                    }}
                  >
                    <i className="fas fa-search" style={{ fontSize: '1.05em' }}></i>
                  </button>
                </form>
              </li>
              <li className="nav-item mb-2 mb-lg-0 position-relative" ref={categoriasDropdownRef}>
                <button
                  className="nav-link btn d-inline-flex align-items-center gap-1"
                  type="button"
                  aria-expanded={categoriasOpen}
                  aria-haspopup="true"
                  style={{ color: '#e7e5e4', padding: '0.2em 0.7em', fontSize: '0.95em', background: 'none', border: 'none', textShadow: 'none', boxShadow: 'none', outline: 'none', transition: 'color 0.18s, background 0.18s', borderRadius: '8px' }}
                  onClick={() => setCategoriasOpen((o) => !o)}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(245,158,11,0.12)';
                    e.currentTarget.style.color = '#fbbf24';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#e7e5e4';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = 'rgba(245,158,11,0.12)';
                    e.currentTarget.style.color = '#fbbf24';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.color = '#e7e5e4';
                  }}
                >
                  Categorías
                  <i
                    className="fas fa-chevron-down"
                    style={{
                      fontSize: '0.62em',
                      opacity: 0.85,
                      transform: categoriasOpen ? 'rotate(-180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                    }}
                    aria-hidden
                  />
                </button>
                {categoriasOpen && (
                  <div className="navbar-cat-dropdown" role="menu" aria-label="Categorías">
                    {categoriasCatalogo.map((cat) => (
                      <button
                        key={cat.clave}
                        type="button"
                        className="navbar-cat-dropdown__btn"
                        role="menuitem"
                        onClick={() => irCategoria(cat.nombre)}
                      >
                        <i className={cat.emoji} aria-hidden />
                        <span>{cat.nombre}</span>
                      </button>
                    ))}
                  </div>
                )}
              </li>
              <li className="nav-item mb-2 mb-lg-0">
                <button
                  className="nav-link btn"
                  style={{ color: '#e7e5e4', padding: '0.2em 0.7em', fontSize: '0.95em', background: 'none', border: 'none', textShadow: 'none', boxShadow: 'none', outline: 'none', transition: 'color 0.18s, background 0.18s', borderRadius: '8px' }}
                  onClick={handleComprar}
                  type="button"
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.color = '#fbbf24'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#e7e5e4'; }}
                  onFocus={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.color = '#fbbf24'; }}
                  onBlur={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#e7e5e4'; }}
                >
                  Comprar
                </button>
              </li>
              <li className="nav-item mb-2 mb-lg-0">
                <button
                  className="nav-link btn"
                  style={{ color: '#e7e5e4', padding: '0.2em 0.7em', fontSize: '0.95em', background: 'none', border: 'none', textShadow: 'none', boxShadow: 'none', outline: 'none', transition: 'color 0.18s, background 0.18s', borderRadius: '8px' }}
                  onClick={handleVender}
                  type="button"
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.color = '#fbbf24'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#e7e5e4'; }}
                  onFocus={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.color = '#fbbf24'; }}
                  onBlur={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#e7e5e4'; }}
                >
                  Vender
                </button>
              </li>
              <li className="nav-item mb-2 mb-lg-0">
                <button
                  className="nav-link btn"
                  style={{ color: '#e7e5e4', padding: '0.2em 0.7em', fontSize: '0.95em', background: 'none', border: 'none', textShadow: 'none', boxShadow: 'none', outline: 'none', transition: 'color 0.18s, background 0.18s', borderRadius: '8px' }}
                  onClick={handleAyuda}
                  type="button"
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.color = '#fbbf24'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#e7e5e4'; }}
                  onFocus={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.12)'; e.currentTarget.style.color = '#fbbf24'; }}
                  onBlur={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#e7e5e4'; }}
                >
                  Ayuda
                </button>
              </li>
              {/* Botón de cuenta, igual para logueado y no logueado */}
              <li className="nav-item mb-2 mb-lg-0" style={{ position: 'relative' }}>
                <button
                  className="btn d-flex align-items-center justify-content-center mx-auto"
                  style={{ borderRadius: '50%', width: 40, height: 40, padding: 0, border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(41,37,36,0.95)', color: '#fff7ed', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
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
                  {user?.fotoPerfil ? (
                    <img 
                      src={getImageUrl(user.fotoPerfil)} 
                      alt="Foto de perfil" 
                      style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: '50%', 
                        objectFit: 'cover',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }} 
                    />
                  ) : (
                    <i className="fas fa-user" style={{ fontSize: '20px', color: '#f59e0b' }}></i>
                  )}
                </button>
                
                {/* Indicador de sanción */}
                {sancionesInfo && sancionesInfo.sancionesDisponibles === 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: '#ff9800',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                      cursor: 'pointer',
                      zIndex: 1001
                    }}
                    title="⚠️ Última sanción disponible. La próxima cancelación resultará en la baja de tu cuenta."
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('⚠️ ADVERTENCIA: Tienes 1 sanción disponible. Si cancelas otra publicación con ofertas activas, tu cuenta será dada de baja permanentemente.');
                    }}
                  >
                    <FaExclamationTriangle size={12} />
                  </div>
                )}
                {user && menuOpen && (
                  <div ref={menuRef} className="navbar-profile-dropdown">
                    <div className="navbar-profile-dropdown__accent" aria-hidden />
                    <div className="navbar-profile-dropdown__header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        {user?.fotoPerfil ? (
                          <img
                            src={getImageUrl(user.fotoPerfil)}
                            alt="Foto de perfil"
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: '2px solid rgba(245, 158, 11, 0.45)',
                              boxShadow: '0 4px 14px rgba(0,0,0,0.35)',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: '50%',
                              background: 'linear-gradient(145deg, rgba(234,88,12,0.2) 0%, rgba(41,37,36,0.95) 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '2px solid rgba(245, 158, 11, 0.35)',
                            }}
                          >
                            <i className="fas fa-user" style={{ fontSize: '20px', color: '#fbbf24' }}></i>
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, color: '#fff7ed', fontSize: '15px', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                            {user.nombre} {user.apellido}
                          </div>
                          <div style={{ color: '#a8a29e', fontSize: '12px', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="navbar-profile-dropdown__links">
                      <Link to="/ajustes" className="navbar-profile-dropdown__link" onClick={() => setMenuOpen(false)}>
                        <i className="fas fa-sliders-h" aria-hidden />
                        <span>Ajustes</span>
                      </Link>
                      <Link to="/mispublicaciones" className="navbar-profile-dropdown__link" onClick={() => setMenuOpen(false)}>
                        <i className="fas fa-layer-group" aria-hidden />
                        <span>Mis publicaciones</span>
                      </Link>
                      <Link to="/misofertas" className="navbar-profile-dropdown__link" onClick={() => setMenuOpen(false)}>
                        <i className="fas fa-hammer" aria-hidden />
                        <span>Mis ofertas</span>
                      </Link>
                    </div>

                    <div className="navbar-profile-dropdown__footer">
                      <button
                        type="button"
                        className="navbar-profile-dropdown__logout"
                        onClick={() => {
                          handleLogout();
                          setMenuOpen(false);
                        }}
                      >
                        <i className="fas fa-sign-out-alt" aria-hidden />
                        Cerrar sesión
                      </button>
                    </div>
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
          top: 76,
          left: 0,
          right: 0,
          background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 100%)',
          boxShadow: '0 8px 32px rgba(26,18,16,0.18)',
          zIndex: 2000,
          padding: '1.2em 1.2em 1em 1.2em',
          borderBottomLeftRadius: 18,
          borderBottomRightRadius: 18,
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1em',
          alignItems: 'stretch',
        }}>
          <form className="navbar-search-shell navbar-search-shell--mobile navbar-search-shell--on-light d-flex w-100 mb-2 navbar-search-h-margin" onSubmit={handleBuscar} style={{ maxWidth: 500, margin: '0 auto', boxSizing: 'border-box' }}>
            <input
              className="form-control border-0 shadow-none"
              type="search"
              placeholder="Buscar productos..."
              aria-label="Buscar"
              style={{ fontSize: '0.98em', background: 'transparent', padding: '0.5em 1rem' }}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <button
              className="btn navbar-search-btn"
              type="submit"
              style={{
                fontSize: '0.98em',
                padding: '0.5em 1.15em',
                marginLeft: -2,
                zIndex: 2,
                background: 'linear-gradient(180deg, #f59e0b 0%, #ea580c 100%)',
                border: 'none',
                boxShadow: 'inset 0 1px 0 rgba(255,247,237,0.2)',
              }}
            >
              <i className="fas fa-search" style={{ fontSize: '1.05em' }}></i>
            </button>
          </form>
          <details className="navbar-mobile-cats">
            <summary style={{ fontSize: '1.08em' }}>Categorías</summary>
            <div className="navbar-mobile-cats__list">
              {categoriasCatalogo.map((cat) => (
                <button
                  key={cat.clave}
                  type="button"
                  className="navbar-mobile-cats__btn"
                  onClick={() => irCategoria(cat.nombre)}
                >
                  <i className={cat.emoji} aria-hidden />
                  <span>{cat.nombre}</span>
                </button>
              ))}
            </div>
          </details>
          <Link className="nav-link py-2" to="/publicaciones" style={{ color: '#292524', fontSize: '1.08em' }} onClick={() => setMobileMenuOpen(false)}>
            <span role="img" aria-label="comprar">🛒</span> Comprar
          </Link>
          <Link className="nav-link py-2" to="/crear-publicacion" style={{ color: '#292524', fontSize: '1.08em' }} onClick={() => setMobileMenuOpen(false)}>
            <span role="img" aria-label="vender">📤</span> Vender
          </Link>
          <Link className="nav-link py-2" to="/ayuda" style={{ color: '#292524', fontSize: '1.08em' }} onClick={() => setMobileMenuOpen(false)}>
            <span role="img" aria-label="ayuda">❓</span> Ayuda
          </Link>
          {user ? (
            <>
              <Link to="/ajustes" className="nav-link py-2" style={{ color: '#292524', fontSize: '1.08em' }} onClick={() => setMobileMenuOpen(false)}>Ajustes</Link>
              <Link to="/mispublicaciones" className="nav-link py-2" style={{ color: '#292524', fontSize: '1.08em' }} onClick={() => setMobileMenuOpen(false)}>Mis publicaciones</Link>
              <Link to="/misofertas" className="nav-link py-2" style={{ color: '#292524', fontSize: '1.08em' }} onClick={() => setMobileMenuOpen(false)}>Mis ofertas</Link>
              <button className="btn btn-outline-danger mt-2" style={{ borderRadius: 8, fontWeight: 600 }} onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>Cerrar sesión</button>
              <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                                 <button
                   className="btn btn-light d-flex align-items-center justify-content-center mx-auto mt-2"
                   style={{ borderRadius: '50%', width: 40, height: 40, padding: 0, border: '1.5px solid #ececf3', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                   onClick={() => { setMenuOpen(open => !open); }}
                   type="button"
                   aria-label="Cuenta"
                 >
                   {user?.fotoPerfil ? (
                     <img 
                       src={getImageUrl(user.fotoPerfil)} 
                       alt="Foto de perfil" 
                       style={{ 
                         width: 32, 
                         height: 32, 
                         borderRadius: '50%', 
                         objectFit: 'cover',
                         border: '1px solid #ececf3'
                       }} 
                     />
                   ) : (
                     <i className="fas fa-user" style={{ fontSize: '20px', color: '#ea580c' }}></i>
                   )}
                 </button>
                
                {/* Indicador de sanción en móvil */}
                {sancionesInfo && sancionesInfo.sancionesDisponibles === 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: -8,
                      background: '#ff9800',
                      color: 'white',
                      borderRadius: '50%',
                      width: 24,
                      height: 24,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: '2px solid white',
                      boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                      cursor: 'pointer',
                      zIndex: 1001
                    }}
                    title="⚠️ Última sanción disponible. La próxima cancelación resultará en la baja de tu cuenta."
                    onClick={(e) => {
                      e.stopPropagation();
                      alert('⚠️ ADVERTENCIA: Tienes 1 sanción disponible. Si cancelas otra publicación con ofertas activas, tu cuenta será dada de baja permanentemente.');
                    }}
                  >
                    <FaExclamationTriangle size={12} />
                  </div>
                )}
              </div>
            </>
          ) : (
            <button
              className="btn btn-light d-flex align-items-center justify-content-center mx-auto mt-2"
              style={{ borderRadius: '50%', width: 40, height: 40, padding: 0, border: '1.5px solid #ececf3', background: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
              type="button"
              aria-label="Ingresar"
            >
              <i className="fas fa-user" style={{ fontSize: '20px', color: '#ea580c' }}></i>
            </button>
          )}
        </div>
      )}
    </nav>
    </header>
  );
};

export default Navbar;
