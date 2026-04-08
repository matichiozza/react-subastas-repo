import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLoaderData } from 'react-router-dom';
import Footer from './Footer';
import API_BASE_URL, { getImageUrl } from '../config/api';
import './Home.css';

export const homeLoader = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await fetch(`${API_BASE_URL}/publicaciones`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Error fetching');
    const data = await res.json();
    return data.reverse();
  } catch (e) {
    return [];
  }
};

/** Búsqueda compatible con categorías existentes en publicaciones */
const CATEGORIAS_SALON = [
  { busqueda: 'Coleccionables', titulo: 'Coleccionables', desc: 'Piezas singulares, curiosidades y objetos de vitrina.', icono: 'fas fa-gem' },
  { busqueda: 'Arte', titulo: 'Arte y papel', desc: 'Grabados, marcos y documentos gráficos con carácter.', icono: 'fas fa-palette' },
  { busqueda: 'Moda', titulo: 'Moda y textiles', desc: 'Prendas, tejidos y accesorios con oficio antiguo.', icono: 'fas fa-scroll' },
  { busqueda: 'Computación', titulo: 'Tecnología vintage', desc: 'Equipos y objetos de época con valor nostálgico.', icono: 'fas fa-keyboard' },
  { busqueda: 'Inmuebles', titulo: 'Hogar y espacios', desc: 'Mobiliario, lámparas y piezas para el entorno doméstico.', icono: 'fas fa-archway' },
  { busqueda: 'Vehículos', titulo: 'Vehículos clásicos', desc: 'Automóviles y piezas catalogadas para entusiastas.', icono: 'fas fa-car-side' },
];

function formatearMonto(valor) {
  if (!valor) return '0';
  return parseFloat(valor).toLocaleString('es-AR');
}

function fechaCierreLegible(fechaFin) {
  if (!fechaFin) return '—';
  try {
    return new Date(fechaFin).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '—';
  }
}

const Home = () => {
  const { token } = useContext(AuthContext);
  const initialData = useLoaderData();
  const [publicaciones, setPublicaciones] = useState(initialData || []);
  const navigate = useNavigate();

  useEffect(() => {
    setPublicaciones(initialData || []);
  }, [initialData]);

  useEffect(() => {
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
              setPublicaciones((prev) =>
                prev.map((pub) =>
                  pub.id === data.publicacion.id
                    ? {
                        ...pub,
                        ofertasTotales: data.publicacion.ofertasTotales,
                        precioActual: data.publicacion.precioActual,
                      }
                    : pub
                )
              );
            }
          } catch {
            /* ignore */
          }
        };
        socket.onerror = () => {};
        socket.onclose = (event) => {
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(connectWebSocket, 2000);
          }
        };
      } catch {
        /* ignore */
      }
    };

    connectWebSocket();
    return () => {
      if (socket) socket.close(1000);
    };
  }, [token]);

  const ordenOfertas = [...publicaciones].sort((a, b) => (b.ofertasTotales || 0) - (a.ofertasTotales || 0));
  const destacada = ordenOfertas[0] || null;

  const subastasProximas = [...publicaciones]
    .filter((p) => p.fechaFin && new Date(p.fechaFin) > new Date())
    .sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin))
    .slice(0, 4);

  const precioMostrar = (pub) => pub.precioActual || pub.precioInicial;

  return (
    <>
      <style>{`
        @keyframes homeFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .home-salon .home-animate-in {
          animation: homeFadeIn 0.6s ease forwards;
        }
      `}</style>

      <div className="home-salon position-relative">
        <div
          aria-hidden
          className="position-absolute top-0 start-0 end-0"
          style={{
            height: '120px',
            background: 'linear-gradient(180deg, rgba(245,158,11,0.05) 0%, transparent 100%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* —— Hero: manifiesto + ficha lote —— */}
        <section className="position-relative pt-5 pb-5" style={{ zIndex: 1, paddingTop: 'clamp(5rem, 12vw, 7rem)' }}>
          <div className="container px-3 px-lg-4">
            <div className="row g-4 g-xl-5 align-items-stretch home-animate-in">
              <div className="col-lg-6 d-flex flex-column justify-content-center py-3 py-lg-4">
                <p className="home-kicker mb-0">Salón de subastas</p>
                <h1 className="home-hero-title">
                  Objetos con historia, <em>valor propio</em>
                </h1>
                <div className="home-frame-line" />
                <p className="home-hero-lead">
                  Aquí se subastan reliquias y piezas cotidianas: cosas que el mercado masivo no cotiza, pero que
                  merecen un precio acordado entre quienes las entienden. Un espacio sobrio, moderno y respetuoso
                  con el oficio de coleccionar.
                </p>
                <div className="d-flex flex-wrap gap-3 mt-4">
                  <button type="button" className="btn home-btn-primary" onClick={() => navigate('/publicaciones')}>
                    Explorar lotes
                  </button>
                  <button
                    type="button"
                    className="btn home-btn-ghost"
                    onClick={() => (token ? navigate('/crear-publicacion') : navigate('/login'))}
                  >
                    Ofrecer una pieza
                  </button>
                </div>
              </div>

              <div className="col-lg-6">
                {destacada ? (
                  <article className="home-featured-lot h-100 d-flex flex-column">
                    <div className="home-featured-lot__breadcrumb">
                      Inicio <span>/</span> Lotes <span>/</span> destacado
                    </div>
                    <div className="home-featured-lot__media flex-grow-1 position-relative">
                      {destacada.imagenes?.length > 0 ? (
                        <img src={getImageUrl(destacada.imagenes[0])} alt="" />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center h-100 text-muted"
                          style={{ minHeight: 220 }}
                        >
                          <i className="fas fa-image fa-3x" style={{ opacity: 0.2 }} />
                        </div>
                      )}
                    </div>
                    <div className="home-featured-lot__body">
                      <p className="home-featured-lot__num">Lote sugerido · N.º {destacada.id}</p>
                      <h2 className="home-featured-lot__title">{destacada.titulo}</h2>
                      <p className="home-featured-lot__price-label mt-2">Puja actual</p>
                      <p className="home-featured-lot__price mb-0">${formatearMonto(precioMostrar(destacada))}</p>
                      <p className="home-featured-lot__meta">
                        {destacada.categoria ? `${destacada.categoria} · ` : ''}
                        Cierre: {fechaCierreLegible(destacada.fechaFin)}
                        {destacada.ofertasTotales != null ? ` · ${destacada.ofertasTotales} pujas registradas` : ''}
                      </p>
                      <button
                        type="button"
                        className="btn home-btn-primary w-100 mt-3"
                        onClick={() => navigate(`/publicaciones/${destacada.id}`)}
                      >
                        Ver ficha del lote
                      </button>
                    </div>
                  </article>
                ) : (
                  <div className="home-featured-lot d-flex flex-column align-items-center justify-content-center text-center p-5">
                    <div className="home-frame-line w-75 mb-4" style={{ marginTop: 0 }} />
                    <p className="text-muted mb-2" style={{ maxWidth: 280 }}>
                      Aún no hay lotes en el salón. Sé el primero en ofrecer una pieza con historia.
                    </p>
                    <button
                      type="button"
                      className="btn home-btn-primary mt-2"
                      onClick={() => (token ? navigate('/crear-publicacion') : navigate('/login'))}
                    >
                      Publicar un lote
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* —— Tres pilares / categorías —— */}
        <section className="py-5 border-top border-bottom" style={{ borderColor: 'rgba(245,158,11,0.1) !important' }}>
          <div className="container px-3 px-lg-4">
            <header className="text-center mb-5">
              <p className="home-section-eyebrow">Cómo navegamos el catálogo</p>
              <h2 className="home-section-heading">Ejes para encontrar tu próximo hallazgo</h2>
            </header>
            <div className="row g-4">
              {CATEGORIAS_SALON.map((cat) => (
                <div key={cat.busqueda} className="col-md-6 col-xl-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/publicaciones?busqueda=${encodeURIComponent(cat.busqueda)}`)}
                    className="home-salon-block w-100 text-start h-100 border-0 bg-transparent"
                  >
                    <div className="home-salon-block__icon">
                      <i className={cat.icono} aria-hidden />
                    </div>
                    <h3>{cat.titulo}</h3>
                    <p>{cat.desc}</p>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* —— Catálogo —— */}
        <section className="container px-3 px-lg-4 py-5 mb-2">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-end gap-3 mb-4">
            <div>
              <p className="home-section-eyebrow">Catálogo</p>
              <h2 className="home-section-heading">Lotes en exhibición</h2>
              <p className="text-muted small mt-2 mb-0" style={{ maxWidth: 420 }}>
                Vista resumida; cada ficha abre el detalle completo con imágenes y condiciones de venta.
              </p>
            </div>
            <button type="button" className="btn home-btn-ghost d-none d-sm-inline-block" onClick={() => navigate('/publicaciones')}>
              Ver todo el catálogo
            </button>
          </div>

          {publicaciones.length === 0 ? (
            <div className="home-salon-block text-center py-5">
              <p className="mb-2" style={{ color: '#a8a29e' }}>
                No hay lotes publicados por el momento.
              </p>
              <button type="button" className="btn home-btn-primary btn-sm" onClick={() => navigate('/crear-publicacion')}>
                Ser el primero en ofrecer
              </button>
            </div>
          ) : (
            <div className="row g-4">
              {publicaciones.slice(0, 12).map((pub) => (
                <div key={pub.id} className="col-12 col-md-6 col-xl-3">
                  <article
                    className="home-lot-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/publicaciones/${pub.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(`/publicaciones/${pub.id}`);
                    }}
                  >
                    <div className="home-lot-card__fig">
                      {pub.imagenes?.length > 0 ? (
                        <img src={getImageUrl(pub.imagenes[0])} alt="" />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 bg-dark">
                          <i className="fas fa-image fa-2x" style={{ opacity: 0.15 }} />
                        </div>
                      )}
                      <span className="home-lot-card__lotnum">Lote {pub.id}</span>
                      {pub.estado === 'ACTIVO' && <span className="home-lot-card__status">Subasta abierta</span>}
                    </div>
                    <div className="home-lot-card__body">
                      <h3 className="home-lot-card__title">{pub.titulo}</h3>
                      <div className="d-flex gap-2 flex-wrap mb-1">
                        {pub.categoria && (
                          <span
                            className="badge rounded-0"
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 500,
                              background: 'transparent',
                              color: '#a8a29e',
                              border: '1px solid rgba(245,158,11,0.22)',
                            }}
                          >
                            {pub.categoria}
                          </span>
                        )}
                      </div>
                      <div className="home-lot-card__foot">
                        <div>
                          <div className="home-lot-card__price-label">Puja actual</div>
                          <div className="home-lot-card__price">${formatearMonto(precioMostrar(pub))}</div>
                        </div>
                        <div className="home-lot-card__date">
                          {pub.fechaFin ? (
                            <>
                              Cierre
                              <br />
                              {new Date(pub.fechaFin).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                            </>
                          ) : (
                            '—'
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}

          <button type="button" className="btn home-btn-ghost w-100 mt-4 d-sm-none" onClick={() => navigate('/publicaciones')}>
            Ver catálogo completo
          </button>
        </section>

        {/* —— Próximos cierres —— */}
        {subastasProximas.length > 0 && (
          <section className="container px-3 px-lg-4 pb-5">
            <header className="mb-4 pt-4 border-top" style={{ borderColor: 'rgba(245,158,11,0.12) !important' }}>
              <p className="home-section-eyebrow">Agenda</p>
              <h2 className="home-section-heading">Próximos cierres</h2>
            </header>
            <div className="row g-4">
              {subastasProximas.map((pub) => (
                <div key={`prox-${pub.id}`} className="col-12 col-md-6 col-xl-3">
                  <article
                    className="home-lot-card"
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/publicaciones/${pub.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') navigate(`/publicaciones/${pub.id}`);
                    }}
                  >
                    <div className="home-lot-card__fig">
                      {pub.imagenes?.length > 0 ? (
                        <img src={getImageUrl(pub.imagenes[0])} alt="" style={{ opacity: 0.92 }} />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center h-100 bg-dark">
                          <i className="fas fa-image fa-2x" style={{ opacity: 0.15 }} />
                        </div>
                      )}
                      <span className="home-lot-card__lotnum">Lote {pub.id}</span>
                    </div>
                    <div className="home-lot-card__body">
                      <h3 className="home-lot-card__title">{pub.titulo}</h3>
                      <div className="home-lot-card__foot">
                        <div>
                          <div className="home-lot-card__price-label">Puja actual</div>
                          <div className="home-lot-card__price">${formatearMonto(precioMostrar(pub))}</div>
                        </div>
                        <div className="home-lot-card__date text-end">
                          Cierra el
                          <br />
                          <strong style={{ color: '#fff7ed', fontWeight: 600 }}>
                            {new Date(pub.fechaFin).toLocaleDateString('es-AR', {
                              day: 'numeric',
                              month: 'long',
                            })}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* —— Métricas (tono coleccionista, no trading) —— */}
        <section className="container px-3 px-lg-4 pb-5">
          <div className="row g-3 g-md-4">
            <div className="col-md-4">
              <div className="home-stat">
                <div className="home-stat__n">+50K</div>
                <div className="home-stat__label">Personas en la comunidad</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="home-stat">
                <div className="home-stat__n">+$2M</div>
                <div className="home-stat__label">En transacciones coordinadas</div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="home-stat">
                <div className="home-stat__n">100%</div>
                <div className="home-stat__label">Normas claras por lote</div>
              </div>
            </div>
          </div>
        </section>

        {/* —— Ayuda —— */}
        <section className="container px-3 px-lg-4 pb-5">
          <div className="home-help-panel">
            <div className="row align-items-center">
              <div className="col-lg-8 mb-4 mb-lg-0">
                <p className="home-section-eyebrow mb-2">Guía y soporte</p>
                <h3 className="home-section-heading mb-3" style={{ fontSize: '1.75rem' }}>
                  Reglas de puja, envíos y responsabilidades
                </h3>
                <p className="mb-0" style={{ color: '#a8a29e', maxWidth: 540, lineHeight: 1.7 }}>
                  Cómo funciona el cierre de una subasta, qué esperar del vendedor y cómo resolver dudas antes de
                  ofertar.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end">
                <button type="button" className="btn home-btn-primary" onClick={() => navigate('/ayuda')}>
                  Centro de ayuda
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Home;
