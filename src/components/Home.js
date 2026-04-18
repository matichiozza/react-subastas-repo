import React, { useEffect, useLayoutEffect, useState, useContext, useCallback, useRef, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLoaderData } from 'react-router-dom';
import Footer from './Footer';
import API_BASE_URL, { getImageUrl } from '../config/api';
import { categoriasCatalogo } from '../data/categoriasCatalogo';
import './Home.css';

export const homeLoader = async () => {
  const token = localStorage.getItem('token');
  const controller = new AbortController();
  const tid = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${API_BASE_URL}/publicaciones`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    });
    if (!res.ok) throw new Error('Error fetching');
    const data = await res.json();
    return data.reverse();
  } catch {
    return [];
  } finally {
    clearTimeout(tid);
  }
};

const heroBase = `${process.env.PUBLIC_URL || ''}/hero`;

/** Carrusel de categorías en home: 4 columnas × 3 filas (12 ítems por página). */
const HOME_CAT_COLS = 4;
const HOME_CAT_ROWS = 3;
const HOME_CAT_PAGE_SIZE = HOME_CAT_COLS * HOME_CAT_ROWS;

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

function formatearMonto(valor) {
  if (!valor) return '0';
  return parseFloat(valor).toLocaleString('es-AR');
}

function chunkArray(arr, size) {
  if (!Array.isArray(arr) || size <= 0) return [];
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function formatFinCierre(fechaFin) {
  if (!fechaFin) return null;
  const d = new Date(fechaFin);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Cuenta regresiva hasta fechaFin: solo días, horas y minutos (sin segundos). */
function formatCountdown(fechaFin, nowMs) {
  if (!fechaFin) return { expired: false, main: '—', detail: '' };
  const end = new Date(fechaFin).getTime();
  if (Number.isNaN(end)) return { expired: false, main: '—', detail: '' };
  const diff = end - nowMs;
  if (diff <= 0) return { expired: true, main: 'Cierre', detail: 'Finalizada' };
  const totalSec = Math.floor(diff / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (days >= 1) {
    return { expired: false, main: `${days}d ${h}h ${m}m`, detail: '' };
  }
  if (h >= 1) {
    return { expired: false, main: `${h}h ${m}m`, detail: '' };
  }
  return { expired: false, main: `${m}m`, detail: '' };
}

/** Monto de la última oferta aceptada; si aún no hay ofertas, precio inicial. */
function precioUltimaOferta(pub) {
  const ofertas = Number(pub.ofertasTotales) || 0;
  const act = Number(pub.precioActual);
  if (ofertas > 0 && !Number.isNaN(act) && act > 0) return act;
  const ini = Number(pub.precioInicial);
  return Number.isNaN(ini) ? 0 : ini;
}

const Home = () => {
  const { token } = useContext(AuthContext);
  const initialData = useLoaderData();
  const [publicaciones, setPublicaciones] = useState(initialData ?? []);
  const navigate = useNavigate();

  useEffect(() => {
    setPublicaciones(initialData ?? []);
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

  /** Catálogo home: reloj para cuenta regresiva + carrusel por páginas */
  const [catalogNow, setCatalogNow] = useState(() => Date.now());
  const [catalogPerPage, setCatalogPerPage] = useState(1);
  const [catalogPage, setCatalogPage] = useState(0);
  const [catalogPaused, setCatalogPaused] = useState(false);
  const catalogCarouselRef = useRef(null);

  useEffect(() => {
    if (!publicaciones.length) return undefined;
    const id = window.setInterval(() => setCatalogNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [publicaciones.length]);

  useLayoutEffect(() => {
    const el = catalogCarouselRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const CARD = 180;
    const GAP = 8;
    const listLen = Math.min(12, publicaciones.length);
    const read = () => {
      if (!listLen) return;
      const w = el.getBoundingClientRect().width || el.offsetWidth || el.clientWidth;
      const fit = Math.max(1, Math.floor((w + GAP) / (CARD + GAP)));
      const n = Math.min(fit, listLen, 8);
      setCatalogPerPage(n);
    };
    const scheduleRead = () => requestAnimationFrame(read);
    scheduleRead();
    const ro = new ResizeObserver(scheduleRead);
    ro.observe(el);
    window.addEventListener('resize', scheduleRead);
    const t = window.setTimeout(read, 100);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', scheduleRead);
      window.clearTimeout(t);
    };
  }, [publicaciones.length]);

  const catalogList = useMemo(() => publicaciones.slice(0, 12), [publicaciones]);
  const catalogChunks = useMemo(() => chunkArray(catalogList, catalogPerPage), [catalogList, catalogPerPage]);

  useEffect(() => {
    setCatalogPage(0);
  }, [catalogPerPage, catalogList.length]);

  useEffect(() => {
    if (catalogChunks.length <= 1) return undefined;
    if (catalogPaused) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const id = window.setInterval(() => {
      setCatalogPage((p) => (p + 1) % catalogChunks.length);
    }, 10000);
    return () => window.clearInterval(id);
  }, [catalogChunks.length, catalogPaused]);

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
    let intervalId;
    const tick = () => heroAdvanceForward();
    const start = () => {
      intervalId = window.setInterval(tick, 8000);
    };
    const stop = () => {
      if (intervalId != null) window.clearInterval(intervalId);
      intervalId = undefined;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    if (typeof document !== 'undefined' && !document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
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

  /** Sin transition (p. ej. prefers-reduced-motion), transitionend no corre: cerrar el bucle al llegar al clon */
  useEffect(() => {
    if (!heroUseLoop || heroTrackIndex !== heroCount) return undefined;
    const reduced =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) return undefined;
    const t = window.setTimeout(() => {
      if (heroTrackIndexRef.current === heroCount) heroSnapTo(0);
    }, 0);
    return () => window.clearTimeout(t);
  }, [heroTrackIndex, heroUseLoop, heroCount, heroSnapTo]);

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

  const homeCatPages = useMemo(() => {
    const list = categoriasCatalogo;
    const pages = [];
    for (let i = 0; i < list.length; i += HOME_CAT_PAGE_SIZE) {
      pages.push(list.slice(i, i + HOME_CAT_PAGE_SIZE));
    }
    return pages;
  }, []);

  const [homeCatPage, setHomeCatPage] = useState(0);

  useEffect(() => {
    if (homeCatPage >= homeCatPages.length) setHomeCatPage(0);
  }, [homeCatPage, homeCatPages.length]);

  const homeCatGoPrev = () => {
    if (homeCatPages.length <= 1) return;
    setHomeCatPage((p) => (p - 1 + homeCatPages.length) % homeCatPages.length);
  };

  const homeCatGoNext = () => {
    if (homeCatPages.length <= 1) return;
    setHomeCatPage((p) => (p + 1) % homeCatPages.length);
  };

  const subastasProximas = [...publicaciones]
    .filter((p) => p.fechaFin && new Date(p.fechaFin) > new Date())
    .sort((a, b) => new Date(a.fechaFin) - new Date(b.fechaFin))
    .slice(0, 4);

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

        {/* —— Subastas relevantes —— */}
        <section className="container px-3 px-lg-4 py-3 py-lg-4 mb-2 home-animate-in">
          <h2 className="visually-hidden">Subastas relevantes</h2>
          <div className="home-relevant-head mb-3">
            <div className="home-relevant-head__band">
              <span className="home-relevant-head__logo" aria-hidden>
                <i className="fas fa-gavel" />
              </span>
              <p className="home-relevant-head__title">Subastas relevantes</p>
            </div>
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
            <div ref={catalogCarouselRef} className="home-lotes-carousel-observe">
              <div
                className="home-lotes-carousel"
                onMouseEnter={() => setCatalogPaused(true)}
                onMouseLeave={() => setCatalogPaused(false)}
                onFocusCapture={() => setCatalogPaused(true)}
                onBlurCapture={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setCatalogPaused(false);
                }}
              >
              <div
                className="home-lotes-carousel__track"
                style={{ transform: `translateX(-${catalogPage * 100}%)` }}
              >
                {catalogChunks.map((chunk, pageIdx) => (
                  <div key={`cat-page-${pageIdx}`} className="home-lotes-carousel__page">
                    {chunk.map((pub) => {
                      const cd = formatCountdown(pub.fechaFin, catalogNow);
                      const finTxt = formatFinCierre(pub.fechaFin);
                      return (
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
                                <i className="fas fa-image fa-lg" style={{ opacity: 0.2 }} />
                              </div>
                            )}
                            <span className="home-lotes-carousel__offers-badge" title="Cantidad de ofertas">
                              <i className="fas fa-user" aria-hidden />
                              <span>{Number(pub.ofertasTotales) || 0}</span>
                            </span>
                          </div>
                          <div className="lotes-v-d__body">
                            <div className="home-lotes-carousel__head">
                              <h3 className="home-lotes-carousel__title">{pub.titulo}</h3>
                              <div className="home-lotes-carousel__price-block">
                                <div className="home-lotes-carousel__price-lab">Última oferta</div>
                                <div className="home-lotes-carousel__price-val">
                                  ${formatearMonto(precioUltimaOferta(pub))}
                                </div>
                              </div>
                            </div>
                            {pub.fechaFin && (
                              <div className="home-lote-countdown">
                                <div className="home-lote-countdown__row">
                                  <i className="fas fa-hourglass-end home-lote-countdown__ico" aria-hidden />
                                  <span className="home-lote-countdown__fin">{finTxt}</span>
                                </div>
                                <div
                                  className={`home-lote-countdown__chip${cd.expired ? ' home-lote-countdown__chip--done' : ''}`}
                                  aria-live="polite"
                                >
                                  <span className="home-lote-countdown__chip-main">{cd.expired ? cd.detail : cd.main}</span>
                                  {!cd.expired && cd.detail ? (
                                    <span className="home-lote-countdown__chip-sub">{cd.detail}</span>
                                  ) : null}
                                </div>
                              </div>
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ))}
              </div>
              {catalogChunks.length > 1 && (
                <div className="home-lotes-carousel__dots" role="tablist" aria-label="Páginas del catálogo">
                  {catalogChunks.map((_, i) => (
                    <button
                      key={`cat-dot-${i}`}
                      type="button"
                      role="tab"
                      aria-selected={i === catalogPage}
                      className={`home-lotes-carousel__dot${i === catalogPage ? ' home-lotes-carousel__dot--active' : ''}`}
                      onClick={() => setCatalogPage(i)}
                      aria-label={`Grupo ${i + 1} de ${catalogChunks.length}`}
                    />
                  ))}
                </div>
              )}
              </div>
            </div>
          )}

        </section>

        <section className="home-cat-grid-section container px-3 px-lg-4 py-3 mb-3">
          <header className="home-cat-section-head mb-3">
            <p className="home-section-eyebrow mb-1">Explorar</p>
            <h2 className="home-section-heading mb-0" style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.65rem)' }}>
              Categorías
            </h2>
          </header>
          <div
            className={`home-cat-carousel${homeCatPages.length <= 1 ? ' home-cat-carousel--single' : ''}`}
            role="region"
            aria-roledescription="carrusel"
            aria-label="Categorías"
          >
            {homeCatPages.length > 1 && (
              <button
                type="button"
                className="home-cat-carousel__arrow home-cat-carousel__arrow--prev"
                aria-label="Categorías anteriores"
                onClick={homeCatGoPrev}
              >
                <i className="fas fa-chevron-left" aria-hidden />
              </button>
            )}
            <div className="home-cat-carousel__viewport">
              <div
                className="home-cat-carousel__track"
                style={{
                  transform: `translateX(-${homeCatPage * (100 / Math.max(1, homeCatPages.length))}%)`,
                  width: `${homeCatPages.length * 100}%`,
                }}
              >
                {homeCatPages.map((page, pageIdx) => (
                  <div
                    key={`home-cat-page-${pageIdx}`}
                    className="home-cat-carousel__page"
                    style={{
                      flex: `0 0 ${100 / Math.max(1, homeCatPages.length)}%`,
                      maxWidth: `${100 / Math.max(1, homeCatPages.length)}%`,
                    }}
                    aria-hidden={pageIdx !== homeCatPage}
                  >
                    <div
                      className="home-cat-carousel__grid"
                      style={{
                        gridTemplateColumns: `repeat(${HOME_CAT_COLS}, minmax(0, 1fr))`,
                        gridTemplateRows: `repeat(${HOME_CAT_ROWS}, minmax(0, 1fr))`,
                      }}
                    >
                      {page.map((cat) => (
                        <button
                          key={cat.nombre}
                          type="button"
                          className="home-cat-chip"
                          onClick={() => navigate(`/publicaciones?busqueda=${encodeURIComponent(cat.nombre)}`)}
                        >
                          <i className={cat.emoji} aria-hidden />
                          <span className="home-cat-chip__label">{cat.nombre}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {homeCatPages.length > 1 && (
              <button
                type="button"
                className="home-cat-carousel__arrow home-cat-carousel__arrow--next"
                aria-label="Categorías siguientes"
                onClick={homeCatGoNext}
              >
                <i className="fas fa-chevron-right" aria-hidden />
              </button>
            )}
          </div>
          {homeCatPages.length > 1 && (
            <div className="home-cat-carousel__dots" role="tablist" aria-label="Página de categorías">
              {homeCatPages.map((_, i) => (
                <button
                  key={`home-cat-dot-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={i === homeCatPage}
                  className={`home-cat-carousel__dot${i === homeCatPage ? ' home-cat-carousel__dot--active' : ''}`}
                  onClick={() => setHomeCatPage(i)}
                  aria-label={`Página ${i + 1} de ${homeCatPages.length}`}
                />
              ))}
            </div>
          )}
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
                          <div className="home-lot-card__price">${formatearMonto(precioUltimaOferta(pub))}</div>
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
