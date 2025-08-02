import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import API_BASE_URL from '../config/api';

const categorias = [
  { nombre: 'Computación', icono: '🖥️', color: '#1976d2', grad: 'linear-gradient(135deg, #1976d2 60%, #64b5f6 100%)' },
  { nombre: 'Calzado', icono: '👟', color: '#e67e22', grad: 'linear-gradient(135deg, #e67e22 60%, #f6c16a 100%)' },
  { nombre: 'Moda', icono: '👗', color: '#8e24aa', grad: 'linear-gradient(135deg, #8e24aa 60%, #ce93d8 100%)' },
  { nombre: 'Vehículos', icono: '🚗', color: '#388e3c', grad: 'linear-gradient(135deg, #388e3c 60%, #81c784 100%)' },
];

const beneficios = [
  { icono: '🔒', titulo: 'Seguridad', desc: 'Tus datos y transacciones están protegidos.' },
  { icono: '⚡', titulo: 'Rapidez', desc: 'Encuentra y oferta en segundos.' },
  { icono: '💬', titulo: 'Soporte', desc: 'Atención personalizada ante cualquier duda.' },
  { icono: '🌎', titulo: 'Variedad', desc: 'Miles de productos y categorías.' },
];

const testimonios = [
  { nombre: 'Lucía', texto: '¡Vendí mi bici en menos de 24hs! Súper fácil y seguro.', avatar: '👩' },
  { nombre: 'Carlos', texto: 'Me encanta la variedad y la atención al cliente.', avatar: '🧔' },
  { nombre: 'Sofía', texto: 'Ofertar es adictivo, ya gané varias subastas.', avatar: '👩‍🦰' },
];

const preguntas = [
  { q: '¿Cómo participo en una subasta?', a: 'Solo debes registrarte, buscar un producto y hacer tu oferta.' },
  { q: '¿Es seguro pagar por la plataforma?', a: 'Sí, usamos métodos de pago protegidos y cifrado de datos.' },
  { q: '¿Puedo vender cualquier cosa?', a: 'Sí, siempre que cumpla con nuestras políticas y leyes vigentes.' },
];

// Función para formatear montos con separadores de miles
function formatearMonto(valor) {
  if (!valor) return '0';
  return parseFloat(valor).toLocaleString('es-AR');
}

const Home = () => {
  const { token } = useContext(AuthContext);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState(null);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/publicaciones`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPublicaciones(data.reverse());
      } catch {
        setPublicaciones([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicaciones();

    // WebSocket para actualizaciones en tiempo real
    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    
    const connectWebSocket = () => {
      try {
        socket = new WebSocket(`${API_BASE_URL.replace('http://', 'ws://')}/ws`);
        
        socket.onopen = () => {
          reconnectAttempts = 0;
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'oferta_actualizada') {
              setPublicaciones(prev => 
                prev.map(pub => 
                  pub.id === data.publicacion.id 
                    ? { ...pub, ofertasTotales: data.publicacion.ofertasTotales, precioActual: data.publicacion.precioActual }
                    : pub
                )
              );
            }
          } catch (error) {
            console.error('Error al procesar mensaje WebSocket:', error);
          }
        };

        socket.onerror = () => {
          // Silenciar errores de WebSocket
        };

        socket.onclose = (event) => {
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(connectWebSocket, 2000);
          }
        };
      } catch (error) {
        // Silenciar errores de conexión
      }
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close(1000);
      }
    };
  }, [token]);

  // Subastas destacadas: las 3 con más ofertas
  const subastasDestacadas = publicaciones
    .sort((a, b) => (b.ofertasTotales || 0) - (a.ofertasTotales || 0))
    .slice(0, 3);

  return (
    <div style={{ background: '#f7f8fa' }}>
      {/* HERO PRINCIPAL */}
      <section style={{ background: 'linear-gradient(90deg, #1976d2 60%, #5a48f6 100%)', color: '#fff', padding: '6em 0 5em 0', position: 'relative' }}>
        <div className="container text-center">
          <div style={{ maxWidth: 720, margin: '0 auto', marginTop: '-2em' }}>
            <h1 style={{ fontWeight: 800, fontSize: '2.7em', lineHeight: 1.1, marginBottom: 18 }}>¡Descubre, oferta y gana en <span style={{ fontWeight: 700, color: '#fff' }}>Subastas</span><span style={{ color: '#ffd54f', fontWeight: 400 }}>Corp</span>!</h1>
            <p style={{ fontSize: '1.25em', color: '#e3e3e3', marginBottom: 28 }}>La plataforma más moderna y segura para comprar y vender en subastas online.</p>
            <button 
              className="btn btn-lg fw-bold" 
              style={{ 
                borderRadius: 20, 
                fontSize: '1.2em', 
                padding: '0.8em 2em',
                background: 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)',
                color: '#1976d2',
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 8px 32px rgba(255,255,255,0.2), 0 4px 16px rgba(25,118,210,0.15)',
                transition: 'all 0.3s ease',
                textShadow: 'none',
                position: 'relative',
                overflow: 'hidden'
              }} 
              onClick={() => navigate('/publicaciones')}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,255,255,0.3), 0 6px 20px rgba(25,118,210,0.2)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #fff 0%, #ffffff 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,255,255,0.2), 0 4px 16px rgba(25,118,210,0.15)';
                e.currentTarget.style.background = 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)';
              }}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>VER SUBASTAS</span>
            </button>
          </div>
        </div>
      </section>

      {/* BÚSQUEDA RÁPIDA */}
      <section className="container" style={{ marginTop: -38, marginBottom: 32, zIndex: 2, position: 'relative' }}>
        <form className="shadow p-3 bg-white rounded-4 d-flex align-items-center gap-2" style={{ maxWidth: 520, margin: '0 auto', boxShadow: '0 2px 12px rgba(25,118,210,0.08)' }} onSubmit={e => { e.preventDefault(); navigate(`/publicaciones?busqueda=${encodeURIComponent(busqueda)}`); }}>
          <input className="form-control border-0" style={{ fontSize: '1.1em', borderRadius: 12, background: '#f7f8fa' }} type="search" placeholder="Buscar productos..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
          <button className="btn btn-primary px-4 py-2 fw-bold" style={{ borderRadius: 12 }} type="submit">Buscar</button>
        </form>
      </section>

      {/* CATEGORÍAS DESTACADAS */}
      <section className="container mb-5">
        <h3 className="fw-bold mb-4 text-center" style={{ color: '#1976d2' }}>Categorías destacadas</h3>
        <div className="row g-4 justify-content-center">
          {categorias.map(cat => (
            <div className="col-12 col-sm-6 col-lg-3" key={cat.nombre}>
              <div
                className="card text-center p-4 h-100 categoria-destacada"
                style={{
                  borderRadius: 22,
                  border: 'none',
                  background: cat.grad,
                  boxShadow: '0 4px 24px rgba(25,118,210,0.10)',
                  cursor: 'pointer',
                  transition: 'transform 0.18s, box-shadow 0.18s',
                  color: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: 170,
                  zIndex: 1,
                }}
                onClick={() => navigate(`/publicaciones?busqueda=${encodeURIComponent(cat.nombre)}`)}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-6px) scale(1.04)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(25,118,210,0.18)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(25,118,210,0.10)';
                }}
              >
                <div style={{
                  fontSize: 54,
                  marginBottom: 14,
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.10))',
                  textShadow: '0 2px 12px rgba(0,0,0,0.10)',
                }}>{cat.icono}</div>
                <div style={{ fontWeight: 700, fontSize: '1.18em', letterSpacing: '-0.5px', textShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>{cat.nombre}</div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, background: 'rgba(255,255,255,0.13)', borderBottomLeftRadius: 22, borderBottomRightRadius: 22 }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SUBASTAS DESTACADAS */}
      <section className="container mb-5">
        <h3 className="fw-bold mb-4 text-center" style={{ color: '#1976d2' }}>Subastas destacadas</h3>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : subastasDestacadas.length === 0 ? (
          <div className="alert alert-info text-center">No hay subastas activas en este momento.</div>
        ) : (
          <div className="row g-4 justify-content-center">
            {subastasDestacadas.map(pub => (
              <div className="col-12 col-md-6 col-lg-4" key={pub.id}>
                <div className="mt-0 card h-100 shadow-sm p-0 border-0" style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 12px rgba(90,72,246,0.06)', minHeight: 340, maxHeight: 370 }}>
                  {/* Imagen principal */}
                  {pub.imagenes && pub.imagenes.length > 0 ? (
                    <div style={{ height: 700, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <img src={`${API_BASE_URL}${pub.imagenes[0]}`} alt={pub.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ height: 700, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 32 }}>
                      <span role="img" aria-label="sin imagen">🖼️</span>
                    </div>
                  )}
                  <div className="p-2 d-flex flex-column justify-content-between h-100">
                    {/* Categoría y condición */}
                    <div className="d-flex align-items-center mb-1 gap-2">
                      <span className="badge bg-light text-dark border" style={{ fontWeight: 500, fontSize: '0.75em' }}>{pub.categoria || 'Sin categoría'}</span>
                      <span className={`badge ${pub.condicion === 'Nuevo' ? 'bg-success' : 'bg-secondary'}`} style={{ fontWeight: 500, fontSize: '0.75em' }}>{pub.condicion || 'Condición'}</span>
                      {pub.estado && <span className={`badge ${pub.estado === 'ACTIVO' ? 'bg-primary' : 'bg-secondary'}`} style={{ fontWeight: 500, fontSize: '0.75em' }}>{pub.estado}</span>}
                    </div>
                    {/* Título */}
                    <h6 className="fw-bold mb-1" style={{ color: '#222', fontSize: '1em', minHeight: 28, lineHeight: 1.2 }}>{pub.titulo}</h6>
                    {/* Descripción corta */}
                    <div className="mb-1 text-truncate" style={{ fontSize: '0.92em', color: '#666', minHeight: 18 }}>{pub.descripcion}</div>
                    {/* Precio y ofertas */}
                    <div className="d-flex align-items-center justify-content-between mb-1">
                                              <div style={{ fontWeight: 600, color: '#1976d2', fontSize: '0.98em' }}>
                          {pub.precioActual && pub.precioActual > 0 ? `Actual: $${formatearMonto(pub.precioActual)}` : `Inicial: $${formatearMonto(pub.precioInicial)}`}
                        </div>
                      <span className="badge bg-warning text-dark" style={{ fontSize: '0.82em' }}>{pub.ofertasTotales || 0} ofertas</span>
                    </div>
                    {/* Fecha de finalización */}
                    <div className="mb-1" style={{ fontSize: '0.85em', color: '#888' }}>
                      <span role="img" aria-label="fin">⏰</span> {pub.fechaFin ? new Date(pub.fechaFin).toLocaleDateString() : 'Sin fecha'}
                    </div>
                    {/* Usuario */}
                    <div className="d-flex align-items-center gap-2 mt-auto pt-2 border-top" style={{ borderColor: '#ececf3' }}>
                      {pub.usuario?.fotoPerfil ? (
                        <img src={`${API_BASE_URL}${pub.usuario.fotoPerfil}`} alt={pub.usuario.username} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ececf3' }} />
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ececf3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 15 }}>
                          <span role="img" aria-label="user">👤</span>
                        </div>
                      )}
                      <div className="d-flex flex-column" style={{ fontSize: '0.90em' }}>
                        <span className="fw-semibold">{pub.usuario?.nombre || pub.usuario?.username || 'Usuario'}</span>
                        <span style={{ color: '#888', fontSize: '0.85em' }}>{[pub.usuario?.ciudad, pub.usuario?.pais].filter(Boolean).join(', ')}</span>
                      </div>
                    </div>
                    {/* Botón de ver detalles */}
                    <div className="d-grid mt-2">
                      <button className="btn" style={{ borderRadius: 8, fontWeight: 500, background: '#1976d2', color: '#fff', fontSize: '0.97em', padding: '0.45em 0.5em' }} onClick={() => navigate(`/publicaciones/${pub.id}`)}>Ver detalles</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="container mb-5">
        <h3 className="fw-bold mb-4 text-center" style={{ color: '#1976d2' }}>¿Cómo funciona?</h3>
        <div className="row justify-content-center g-4">
          <div className="col-12 col-md-4">
            <div className="card text-center p-4 h-100" style={{ borderRadius: 16, border: 'none', background: '#fff', boxShadow: '0 2px 12px rgba(25,118,210,0.07)' }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>📝</div>
              <h6 className="fw-bold mb-2">1. Regístrate</h6>
              <div>Crea tu cuenta gratis y accede a todas las funciones.</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card text-center p-4 h-100" style={{ borderRadius: 16, border: 'none', background: '#fff', boxShadow: '0 2px 12px rgba(25,118,210,0.07)' }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>🔎</div>
              <h6 className="fw-bold mb-2">2. Encuentra y oferta</h6>
              <div>Busca productos, haz tu oferta y sigue la subasta en tiempo real.</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card text-center p-4 h-100" style={{ borderRadius: 16, border: 'none', background: '#fff', boxShadow: '0 2px 12px rgba(25,118,210,0.07)' }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>🏆</div>
              <h6 className="fw-bold mb-2">3. Gana y recibe</h6>
              <div>Si tu oferta es la más alta al finalizar, ¡ganaste! Coordina la entrega fácilmente.</div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="container mb-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold mb-3" style={{ color: '#1976d2', fontSize: '2.5em' }}>¿Por qué elegirnos?</h2>
          <p className="lead" style={{ color: '#666', fontSize: '1.2em', maxWidth: 600, margin: '0 auto' }}>
            Descubre las ventajas que hacen de SubastasCorp la plataforma líder en subastas online
          </p>
        </div>
        <div className="row g-4 justify-content-center">
          {beneficios.map((b, index) => (
            <div className="col-12 col-md-6 col-lg-3" key={b.titulo}>
              <div 
                className="card h-100 border-0 position-relative overflow-hidden"
                style={{ 
                  borderRadius: 24, 
                  background: 'linear-gradient(135deg, #fff 0%, #f8f9ff 100%)',
                  boxShadow: '0 8px 32px rgba(25,118,210,0.08)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  minHeight: 280
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 16px 48px rgba(25,118,210,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 32px rgba(25,118,210,0.08)';
                }}
              >
                {/* Fondo decorativo */}
                <div 
                  style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${['#1976d2', '#e67e22', '#8e24aa', '#388e3c'][index]}20, ${['#1976d2', '#e67e22', '#8e24aa', '#388e3c'][index]}10)`,
                    zIndex: 0
                  }}
                />
                
                <div className="p-3 d-flex flex-column align-items-center text-center position-relative" style={{ zIndex: 1 }}>
                  {/* Icono con fondo circular */}
                  <div 
                    className="mb-4 d-flex align-items-center justify-content-center"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${['#1976d2', '#e67e22', '#8e24aa', '#388e3c'][index]}, ${['#64b5f6', '#f6c16a', '#ce93d8', '#81c784'][index]})`,
                      boxShadow: `0 8px 24px ${['#1976d2', '#e67e22', '#8e24aa', '#388e3c'][index]}30`,
                      fontSize: 32,
                      color: '#fff'
                    }}
                  >
                    {b.icono}
                  </div>
                  
                  {/* Título */}
                  <h5 className="fw-bold mb-3" style={{ color: '#1976d2', fontSize: '1.3em' }}>
                    {b.titulo}
                  </h5>
                  
                  {/* Descripción */}
                  <p className="mb-0" style={{ color: '#666', fontSize: '1.05em', lineHeight: 1.6 }}>
                    {b.desc}
                  </p>
                  
                  {/* Línea decorativa */}
                  <div 
                    className="mt-3"
                    style={{
                      width: 40,
                      height: 3,
                      borderRadius: 2,
                      background: `linear-gradient(90deg, ${['#1976d2', '#e67e22', '#8e24aa', '#388e3c'][index]}, ${['#64b5f6', '#f6c16a', '#ce93d8', '#81c784'][index]})`
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Estadísticas adicionales */}
        <div className="row mt-5 g-4 justify-content-center">
          <div className="col-12 col-md-3 text-center">
            <div className="p-4">
              <div className="fw-bold" style={{ color: '#1976d2', fontSize: '2.5em', marginBottom: 8 }}>10K+</div>
              <div style={{ color: '#666', fontSize: '1.1em' }}>Usuarios activos</div>
            </div>
          </div>
          <div className="col-12 col-md-3 text-center">
            <div className="p-4">
              <div className="fw-bold" style={{ color: '#1976d2', fontSize: '2.5em', marginBottom: 8 }}>50K+</div>
              <div style={{ color: '#666', fontSize: '1.1em' }}>Subastas completadas</div>
            </div>
          </div>
          <div className="col-12 col-md-3 text-center">
            <div className="p-4">
              <div className="fw-bold" style={{ color: '#1976d2', fontSize: '2.5em', marginBottom: 8 }}>99%</div>
              <div style={{ color: '#666', fontSize: '1.1em' }}>Satisfacción</div>
            </div>
          </div>
          <div className="col-12 col-md-3 text-center">
            <div className="p-4">
              <div className="fw-bold" style={{ color: '#1976d2', fontSize: '2.5em', marginBottom: 8 }}>24/7</div>
              <div style={{ color: '#666', fontSize: '1.1em' }}>Soporte disponible</div>
            </div>
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES */}
      <section className="container mb-5">
        <div className="text-center mb-4">
          <h3 className="fw-bold mb-3" style={{ color: '#1976d2' }}>Preguntas frecuentes</h3>
          <p className="text-muted" style={{ fontSize: '1.1em' }}>Las dudas más comunes de nuestros usuarios</p>
        </div>
        <div className="accordion" id="faqAccordion">
          {preguntas.map((p, idx) => (
            <div className="accordion-item mb-2" key={p.q} style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 12px rgba(25,118,210,0.04)' }}>
              <h2 className="accordion-header" id={`heading${idx}`}>
                <button
                  className={`accordion-button${faqOpen === idx ? '' : ' collapsed'}`}
                  type="button"
                  style={{ borderRadius: 12, fontWeight: 600, color: '#1976d2', background: '#f7f8fa' }}
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                >
                  {p.q}
                </button>
              </h2>
              <div className={`accordion-collapse collapse${faqOpen === idx ? ' show' : ''}`}
                style={{ background: '#fff' }}>
                <div className="accordion-body" style={{ color: '#444', fontSize: '1.05em' }}>{p.a}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Acceso directo a Ayuda */}
        <div className="text-center mt-4">
          <div className="card border-0" style={{ 
            background: '#e3f2fd', 
            borderRadius: 12, 
            padding: '1.8rem',
            border: '1px solid #bbdefb',
            boxShadow: '0 2px 8px rgba(25,118,210,0.08)'
          }}>
            <div>
              <h6 className="fw-semibold mb-2" style={{ color: '#1976d2' }}>
                ¿Necesitas más información?
              </h6>
              <p className="mb-3" style={{ fontSize: '1em', color: '#666' }}>
                Tenemos una sección completa de ayuda con todas las preguntas y respuestas
              </p>
              <a 
                href="/ayuda"
                className="d-inline-flex align-items-center text-decoration-none px-3 py-2 rounded"
                style={{ 
                  background: '#1976d2',
                  color: '#fff',
                  fontSize: '0.95em',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1565c0';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#1976d2';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Ver Ayuda
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER AMPLIADO */}
      <Footer />
    </div>
  );
};

export default Home; 