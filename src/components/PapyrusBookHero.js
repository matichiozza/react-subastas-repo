import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import 'page-flip/src/Style/stPageFlip.css';
import { getImageUrl } from '../config/api';
import './PapyrusBookHero.css';

const MAX_LOTES = 12;
const AUTO_INTERVAL_MS = 2000;
const RESUME_AUTO_MS = 22000;
const FLIP_ANIMATION_MS = 900;

function formatearMonto(valor) {
  if (valor == null || valor === '') return '0';
  return parseFloat(valor).toLocaleString('es-AR');
}

function fechaCierreLegible(fechaFin) {
  if (!fechaFin) return '\u2014';
  try {
    return new Date(fechaFin).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '\u2014';
  }
}

function precioMostrar(pub) {
  return pub.precioActual ?? pub.precioInicial;
}

function esSubastaActiva(pub) {
  if (!pub?.fechaFin) return true;
  try {
    return new Date(pub.fechaFin) > new Date();
  } catch {
    return true;
  }
}

function preloadImages(urls) {
  urls.forEach((u) => {
    const img = new Image();
    img.src = u;
  });
}

const FlipPage = React.forwardRef(function FlipPage({ children }, ref) {
  return (
    <div className="pb-flip-page" ref={ref}>
      <div className="pb-flip-page__inner">{children}</div>
    </div>
  );
});

export default function PapyrusBookHero({ publicaciones = [], fullBleed = false }) {
  const lots = useMemo(() => {
    if (!Array.isArray(publicaciones)) return [];
    const porCierre = (a, b) => {
      const ta = a.fechaFin ? new Date(a.fechaFin).getTime() : Infinity;
      const tb = b.fechaFin ? new Date(b.fechaFin).getTime() : Infinity;
      return ta - tb;
    };
    const sorted = [...publicaciones].sort(porCierre);
    const activas = sorted.filter(esSubastaActiva);
    const pool = activas.length >= 2 ? activas : sorted;
    return pool.slice(0, MAX_LOTES);
  }, [publicaciones]);

  const shellRef = useRef(null);
  const bookRef = useRef(null);
  const autoPausedRef = useRef(false);
  const resumeTimerRef = useRef(null);
  const [measured, setMeasured] = useState(false);
  const [dims, setDims] = useState({ w: 600, h: 480 });
  const [bookReady, setBookReady] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);

  const imageUrls = useMemo(
    () =>
      lots
        .map((p) => (p.imagenes?.length > 0 ? getImageUrl(p.imagenes[0]) : null))
        .filter(Boolean),
    [lots]
  );

  useEffect(() => {
    preloadImages(imageUrls);
  }, [imageUrls]);

  useLayoutEffect(() => {
    const el = shellRef.current;
    if (!el) return undefined;
    const measure = () => {
      const cw = Math.floor(el.getBoundingClientRect().width);
      if (cw < 240) return;
      const pageW = Math.min(720, Math.max(320, cw));
      const h = Math.min(560, Math.max(420, Math.round(pageW * 0.72)));
      setDims({ w: pageW, h });
      setMeasured(true);
    };
    measure();
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pauseAuto = useCallback(() => {
    autoPausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      autoPausedRef.current = false;
      resumeTimerRef.current = null;
    }, RESUME_AUTO_MS);
  }, []);

  useEffect(
    () => () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    },
    []
  );

  const handleInit = useCallback(() => {
    setBookReady(true);
  }, []);

  const handleFlip = useCallback((e) => {
    const n = typeof e?.data === 'number' ? e.data : 0;
    setPageIndex(n);
  }, []);

  useEffect(() => {
    if (!bookReady || lots.length <= 1) return undefined;
    const tick = () => {
      if (autoPausedRef.current) return;
      const api = bookRef.current?.pageFlip?.();
      if (!api) return;
      try {
        const i = api.getCurrentPageIndex();
        const n = api.getPageCount();
        if (n <= 1) return;
        if (i >= n - 1) {
          api.flip(0, 'top');
        } else {
          api.flipNext('top');
        }
      } catch {
        /* ignore */
      }
    };
    const id = setInterval(tick, AUTO_INTERVAL_MS);
    return () => clearInterval(id);
  }, [bookReady, lots.length, dims.w, dims.h]);

  useEffect(() => {
    const onKey = (e) => {
      const api = bookRef.current?.pageFlip?.();
      if (!api) return;
      if (e.key === 'ArrowRight') {
        pauseAuto();
        try {
          api.flipNext('top');
        } catch {
          /* ignore */
        }
      }
      if (e.key === 'ArrowLeft') {
        pauseAuto();
        try {
          api.flipPrev('top');
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pauseAuto]);

  const goToPage = useCallback(
    (i) => {
      const api = bookRef.current?.pageFlip?.();
      if (!api) return;
      pauseAuto();
      try {
        api.flip(i, 'top');
      } catch {
        /* ignore */
      }
    },
    [pauseAuto]
  );

  const goPrev = useCallback(() => {
    const api = bookRef.current?.pageFlip?.();
    if (!api) return;
    pauseAuto();
    try {
      api.flipPrev('top');
    } catch {
      /* ignore */
    }
  }, [pauseAuto]);

  const goNext = useCallback(() => {
    const api = bookRef.current?.pageFlip?.();
    if (!api) return;
    pauseAuto();
    try {
      api.flipNext('top');
    } catch {
      /* ignore */
    }
  }, [pauseAuto]);

  const carousel = fullBleed;
  const totalPages = lots.length;

  return (
    <div className={`pb-root pb-root--full pb-root--carousel pb-root--stf`}>
      <div className="pb-preload" aria-hidden>
        {imageUrls.map((src) => (
          <img key={src} src={src} alt="" decoding="async" />
        ))}
      </div>

      <div className="pb-flip-shell" ref={shellRef}>
        {totalPages === 0 && (
          <div className="pb-sheet pb-sheet--static pb-sheet--empty">
            <div className="pb-content">
              <EmptyCatalogPage />
            </div>
          </div>
        )}

        {totalPages > 0 && measured && (
          <div className="pb-flip-wrapper" style={{ maxWidth: dims.w }}>
            <HTMLFlipBook
              key={`book-${dims.w}`}
              ref={bookRef}
              width={dims.w}
              height={dims.h}
              size="stretch"
              minWidth={280}
              maxWidth={dims.w}
              minHeight={380}
              maxHeight={dims.h}
              drawShadow
              flippingTime={FLIP_ANIMATION_MS}
              maxShadowOpacity={0.65}
              showCover={false}
              usePortrait
              startZIndex={0}
              autoSize
              mobileScrollSupport={false}
              swipeDistance={24}
              clickEventForward
              useMouseEvents
              showPageCorners
              className="pb-stf-book"
              onInit={handleInit}
              onFlip={handleFlip}
            >
              {lots.map((lot) => (
                <FlipPage key={lot.id}>
                  <LotePage pub={lot} fullBleed={fullBleed} carousel={carousel} eager />
                </FlipPage>
              ))}
            </HTMLFlipBook>
          </div>
        )}
      </div>

      {totalPages > 0 && (
        <div className="pb-footer pb-footer--stf">
          <div className="pb-nav-group">
            <button type="button" className="pb-icon-btn" onClick={goPrev} disabled={pageIndex <= 0} aria-label="Anterior">
              <i className="fas fa-chevron-left" aria-hidden />
            </button>
            <span className="pb-counter" aria-live="polite">
              {pageIndex + 1} / {totalPages}
            </span>
            <button
              type="button"
              className="pb-icon-btn"
              onClick={goNext}
              disabled={pageIndex >= totalPages - 1}
              aria-label="Siguiente"
            >
              <i className="fas fa-chevron-right" aria-hidden />
            </button>
          </div>

          <div className="pb-dots" role="tablist" aria-label="Ir a p\u00e1gina">
            {lots.map((lot, i) => (
              <button
                key={lot.id}
                type="button"
                role="tab"
                aria-selected={i === pageIndex}
                className={`pb-dot ${i === pageIndex ? 'pb-dot--active' : ''}`}
                onClick={() => goToPage(i)}
                aria-label={`P\u00e1gina ${i + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyCatalogPage() {
  return (
    <>
      <p className="pb-kicker">Cat\u00e1logo vac\u00edo</p>
      <h2 className="pb-title" style={{ marginBottom: '0.75rem' }}>
        No hay publicaciones para mostrar
      </h2>
      <p className="pb-extra">Cuando haya lotes, aparecer\u00e1n aqu\u00ed como p\u00e1ginas.</p>
      <div className="pb-actions">
        <Link className="pb-btn" to="/publicaciones">
          Ver cat\u00e1logo
        </Link>
        <Link className="pb-btn pb-btn--ghost" to="/crear-publicacion">
          Publicar
        </Link>
      </div>
    </>
  );
}

function LotePage({ pub, fullBleed, eager, carousel }) {
  const img = pub.imagenes?.length > 0 ? getImageUrl(pub.imagenes[0]) : null;

  const media = (
    <div className={`pb-media ${fullBleed && !carousel ? 'pb-media--grow' : ''} ${carousel ? 'pb-media--carousel' : ''}`}>
      {img ? (
        <img
          src={img}
          alt={pub.titulo ? `Imagen: ${pub.titulo}` : 'Imagen del lote'}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={eager ? 'high' : 'auto'}
        />
      ) : (
        <div className="pb-media--empty" aria-hidden>
          <i className="fas fa-image" />
        </div>
      )}
    </div>
  );

  const metaBlock = (
    <>
      <div className="pb-meta-row">
        <span className="pb-cat">{pub.categoria || 'Sin categor\u00eda'}</span>
        <div>
          <p className="pb-price-label">Puja actual</p>
          <p className="pb-price">${formatearMonto(precioMostrar(pub))}</p>
        </div>
      </div>
      <p className="pb-extra">
        Cierre: {fechaCierreLegible(pub.fechaFin)}
        {pub.ofertasTotales != null ? ` \u00b7 ${pub.ofertasTotales} pujas` : ''}
      </p>
      <div className="pb-actions">
        <Link className="pb-btn" to={`/publicaciones/${pub.id}`}>
          Ver ficha completa
        </Link>
        <Link className="pb-btn pb-btn--ghost" to="/publicaciones">
          M\u00e1s lotes
        </Link>
      </div>
    </>
  );

  const metaCarousel = (
    <>
      <div className="pb-meta-stack">
        <span className="pb-cat">{pub.categoria || 'Sin categor\u00eda'}</span>
        <div className="pb-price-block">
          <p className="pb-price-label">Puja actual</p>
          <p className="pb-price">${formatearMonto(precioMostrar(pub))}</p>
        </div>
      </div>
      <p className="pb-extra pb-extra--tight">
        Cierre: {fechaCierreLegible(pub.fechaFin)}
        {pub.ofertasTotales != null ? ` \u00b7 ${pub.ofertasTotales} pujas` : ''}
      </p>
      <div className="pb-actions pb-actions--tight">
        <Link className="pb-btn" to={`/publicaciones/${pub.id}`}>
          Ver ficha completa
        </Link>
        <Link className="pb-btn pb-btn--ghost" to="/publicaciones">
          M\u00e1s lotes
        </Link>
      </div>
    </>
  );

  if (carousel) {
    return (
      <div className="pb-carousel">
        <div className="pb-carousel__media">
          <p className="pb-kicker">En subasta</p>
          {media}
        </div>
        <div className="pb-carousel__info">
          <p className="pb-lote-num">Lote n.\u00ba {pub.id}</p>
          <h2 className="pb-title pb-title--carousel">{pub.titulo || 'Sin t\u00edtulo'}</h2>
          {metaCarousel}
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="pb-kicker">En subasta ahora</p>
      <p className="pb-lote-num">Lote n.\u00ba {pub.id}</p>
      <h2 className={`pb-title ${fullBleed ? 'pb-title--compact' : ''}`}>{pub.titulo || 'Sin t\u00edtulo'}</h2>
      {media}
      {metaBlock}
    </>
  );
}
