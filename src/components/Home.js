import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
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

const heroBase = `${process.env.PUBLIC_URL || ''}/hero`;

/** Carrusel hero — imágenes en public/hero/ (la primera define el alto del viewport). */
const HERO_SLIDES = [
  {
    id: 'portada1',
    src: `${heroBase}/portada1.png`,
    alt: 'Salón de subastas — portada',
  },
  {
    id: 'portada2',
    src: `${heroBase}/portada2.png`,
    alt: 'Salón de subastas — destacado',
  },
];

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

  /** Índice en la cinta extendida (0..n-1 reales, n = clon de la 1ª para bucle siempre hacia la derecha) */
  const [heroTrackIndex, setHeroTrackIndex] = useState(0);
  const [heroNoTransition, setHeroNoTransition] = useState(false);
  const heroSkipSnapRef = useRef(false);
  const heroTrackIndexRef = useRef(0);
  heroTrackIndexRef.current = heroTrackIndex;
  /** Relación ancho/alto de la primera slide para fijar el alto del carrusel a ancho completo */
  const [heroPortadaAspect, setHeroPortadaAspect] = useState(null);

  const heroCount = HERO_SLIDES.length;
  const heroUseLoop = heroCount > 1;
  const heroSlidesTrack = heroUseLoop ? [...HERO_SLIDES, HERO_SLIDES[0]] : HERO_SLIDES;
  const heroExtCount = heroSlidesTrack.length;

  useEffect(() => {
    const portadaSrc = HERO_SLIDES[0]?.src;
    if (!portadaSrc) return undefined;
    const img = new Image();
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      if (w > 0 && h > 0) setHeroPortadaAspect(`${w} / ${h}`);
    };
    img.src = portadaSrc;
    return undefined;
  }, []);

  const heroAdvanceForward = useCallback(() => {
    if (heroCount < 2) return;
    setHeroTrackIndex((idx) => {
      if (idx === heroCount) return idx;
      if (idx === heroCount - 1) return heroCount;
      return idx + 1;
    });
  }, [heroCount]);

  useEffect(() => {
    if (heroCount <= 1) return undefined;
    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return undefined;
    const id = window.setInterval(heroAdvanceForward, 8000);
    return () => window.clearInterval(id);
  }, [heroCount, heroAdvanceForward]);

  const heroSnapTo = useCallback((index) => {
    setHeroNoTransition(true);
    heroSkipSnapRef.current = true;
    setHeroTrackIndex(index);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setHeroNoTransition(false);
        heroSkipSnapRef.current = false;
      });
    });
  }, []);

  const handleHeroTrackTransitionEnd = useCallback(
    (e) => {
      if (e.propertyName !== 'transform') return;
      if (heroSkipSnapRef.current) return;
      if (heroUseLoop && heroTrackIndexRef.current === heroCount) {
        heroSnapTo(0);
      }
    },
    [heroUseLoop, heroCount, heroSnapTo]
  );

  const subastasProximas = [...publicaciones]
    .filter((p) => p.fechaFin && new Date(p.fechaFin) > new Date())
    .sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin))
    .slice(0, 4);

  const precioMostrar = (pub) => pub.precioActual || pub.precioInicial;

  const heroTrackTransform =
    heroExtCount > 0 ? `translateX(-${(heroTrackIndex * 100) / heroExtCount}%)` : undefined;
  const heroTrackWidth = heroExtCount > 0 ? `${heroExtCount * 100}%` : '100%';

  /** Índice lógico 0..n-1 (para puntos y accesibilidad; en el clon cuenta como 0) */
  const heroLogicalSlide = heroUseLoop && heroTrackIndex === heroCount ? 0 : heroTrackIndex;

  const heroGoPrev = () => {
    if (heroCount < 2) return;
    if (heroTrackIndex === 0) {
      heroSnapTo(heroCount - 1);
      return;
    }
    if (heroTrackIndex === heroCount) {
      setHeroTrackIndex(heroCount - 1);
      return;
    }
    setHeroTrackIndex((i) => i - 1);
  };

  const heroGoNext = () => {
    if (heroCount < 2) return;
    if (heroTrackIndex === heroCount) {
      heroSnapTo(1);
      return;
    }
    heroAdvanceForward();
  };

  const heroGoToSlide = (i) => {
    if (i < 0 || i >= heroCount) return;
    if (heroTrackIndex === heroCount && i === 0) {
      heroSnapTo(0);
      return;
    }
    setHeroTrackIndex(i);
  };

  const handleHeroImageClick = (trackPositionIndex) => {
    const logical =
      heroUseLoop && trackPositionIndex === heroExtCount - 1 ? 0 : trackPositionIndex;
    if (logical === 0) navigate('/publicaciones');
    else if (logical === 1) navigate(token ? '/crear-publicacion' : '/login');
  };

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
        {/* —— Carrusel a ancho completo (banners tipo marketplace, tema subastas) —— */}
        <section className="home-hero-fullbleed" aria-label="Destacados">
          <div
            className="home-hero-carousel home-hero-carousel--full"
            role="region"
            aria-roledescription="carrusel"
            aria-label="Campañas del salón de subastas"
          >
            <div
              className="home-hero-carousel__viewport"
              style={
                heroPortadaAspect
                  ? { aspectRatio: heroPortadaAspect }
                  : { minHeight: '200px' }
              }
            >
              <div
                className={`home-hero-carousel__track${heroNoTransition ? ' home-hero-carousel__track--no-transition' : ''}`}
                style={{
                  width: heroTrackWidth,
                  transform: heroTrackTransform,
                }}
                onTransitionEnd={handleHeroTrackTransitionEnd}
              >
                {heroSlidesTrack.map((slide, i) => {
                  const isClone = heroUseLoop && i === heroExtCount - 1;
                  const key = isClone ? `${slide.id}-loop` : slide.id;
                  const logicalForLabel = isClone ? 0 : i;
                  return (
                    <div
                      key={key}
                      className="home-hero-carousel__slide"
                      style={{ flex: `0 0 ${100 / heroExtCount}%` }}
                      aria-hidden={i !== heroTrackIndex}
                    >
                      <button
                        type="button"
                        className="home-hero-carousel__slide-hit"
                        onClick={() => handleHeroImageClick(i)}
                        aria-label={
                          logicalForLabel === 0
                            ? 'Ir a comprar — ver publicaciones y pujar'
                            : 'Ir a vender — publicar un lote'
                        }
                      >
                        <img src={slide.src} alt={slide.alt} loading={i === 0 ? 'eager' : 'lazy'} />
                      </button>
                    </div>
                  );
                })}
              </div>
              {heroCount > 1 && (
                <>
                  <button
                    type="button"
                    className="home-hero-carousel__arrow home-hero-carousel__arrow--prev"
                    aria-label="Diapositiva anterior"
                    onClick={heroGoPrev}
                  >
                    <i className="fas fa-chevron-left" aria-hidden />
                  </button>
                  <button
                    type="button"
                    className="home-hero-carousel__arrow home-hero-carousel__arrow--next"
                    aria-label="Diapositiva siguiente"
                    onClick={heroGoNext}
                  >
                    <i className="fas fa-chevron-right" aria-hidden />
                  </button>
                </>
              )}
              <div className="home-hero-carousel__dots home-hero-carousel__dots--overlay" role="tablist" aria-label="Elegir diapositiva">
                {HERO_SLIDES.map((slide, i) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={i === heroLogicalSlide}
                    aria-label={`Diapositiva ${i + 1} de ${HERO_SLIDES.length}`}
                    className={`home-hero-carousel__dot${i === heroLogicalSlide ? ' home-hero-carousel__dot--active' : ''}`}
                    onClick={() => heroGoToSlide(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* —— Catálogo (vitrina · variante D) —— */}
        <section className="container px-3 px-lg-4 py-5 mb-2 home-animate-in">
          <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-end gap-3 mb-4">
            <header className="lotes-v-d__head lotes-v-d__head--flush">
              <span className="lotes-v-d__pill">Hoy en vitrina</span>
              <h2 className="lotes-v-d__title">Piezas que pasan frente a tu café</h2>
              <p className="lotes-v-d__lead">
                Tarjetas amplias y claras: tocás una ficha y abrís el detalle con fotos, condiciones y reglas de puja.
              </p>
            </header>
            <button type="button" className="btn home-btn-ghost d-none d-sm-inline-block flex-shrink-0" onClick={() => navigate('/publicaciones')}>
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
            <div className="lotes-v-d__grid">
              {publicaciones.slice(0, 12).map((pub) => (
                <article
                  key={pub.id}
                  className="lotes-v-d__card"
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/publicaciones/${pub.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') navigate(`/publicaciones/${pub.id}`);
                  }}
                >
                  <div className="lotes-v-d__fig">
                    {pub.imagenes?.length > 0 ? (
                      <img src={getImageUrl(pub.imagenes[0])} alt="" />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center h-100">
                        <i className="fas fa-image fa-3x" style={{ opacity: 0.15 }} />
                      </div>
                    )}
                    {pub.estado === 'ACTIVO' && <span className="lotes-v-d__badge">Abierto</span>}
                  </div>
                  <div className="lotes-v-d__body">
                    <div className="lotes-v-d__tags">
                      <span className="lotes-v-d__tag">Lote {pub.id}</span>
                      {pub.categoria && <span className="lotes-v-d__tag">{pub.categoria}</span>}
                    </div>
                    <h3 className="lotes-v-d__card-title">{pub.titulo}</h3>
                    <div className="lotes-v-d__foot">
                      <div>
                        <div className="lotes-v-d__price-lab">Mejor oferta</div>
                        <div className="lotes-v-d__price">${formatearMonto(precioMostrar(pub))}</div>
                      </div>
                      <div className="lotes-v-d__date">
                        {pub.fechaFin
                          ? new Date(pub.fechaFin).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
                          : '—'}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <button type="button" className="btn home-btn-ghost w-100 mt-4 d-sm-none" onClick={() => navigate('/publicaciones')}>
            Ver catálogo completo
          </button>
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
