import React from 'react';
import { Link, useLoaderData } from 'react-router-dom';
import PapyrusBookHero from './PapyrusBookHero';
import './HomeHeroVariants.css';

const mockLote = {
  id: 124,
  titulo: 'Cámara de fuelle — principios del siglo XX',
  categoria: 'Fotografía',
  precioActual: 45000,
  ofertasTotales: 3,
  fechaFin: '2026-05-15T18:00:00',
};

function formatearMonto(v) {
  if (!v) return '0';
  return parseFloat(v).toLocaleString('es-AR');
}

function FichaMini({ invert }) {
  return (
    <div className="hl-ficha" style={invert ? { maxWidth: 420, marginLeft: 'auto' } : { maxWidth: 420 }}>
      <div className="hl-ficha__img">Imagen de ejemplo (lote destacado)</div>
      <div className="hl-ficha__body">
        <div className="hl-ficha__num">Lote n.º {mockLote.id}</div>
        <h3 className="hl-ficha__h">{mockLote.titulo}</h3>
        <div className="hl-rule" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{mockLote.categoria}</span>
          <span className="hl-ficha__price">${formatearMonto(mockLote.precioActual)}</span>
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '0.75rem' }}>
          {mockLote.ofertasTotales} ofertas · cierra 15 may. 2026
        </p>
        <button type="button" className="hl-btn" style={{ marginTop: '1rem', width: '100%' }}>
          Ver catálogo
        </button>
      </div>
    </div>
  );
}

/**
 * Página de laboratorio: varias composiciones de hero para elegir sin tocar Home.js.
 * Ruta: /dev/heroes
 */
export default function HomeHeroVariants() {
  const loaderData = useLoaderData();
  const publicaciones = Array.isArray(loaderData) ? loaderData : [];

  return (
    <div className="hero-lab">
      <nav className="hero-lab__nav" aria-label="Saltar a variante">
        <a href="#v-papyrus">Libro · Papiro</a>
        <a href="#v-a">A · Actual</a>
        <a href="#v-b">B · Cita</a>
        <a href="#v-c">C · Ficha arriba</a>
        <a href="#v-d">D · Invertido</a>
        <a href="#v-e">E · Mínimo</a>
        <a href="#v-f">F · Bandeau</a>
      </nav>

      <p className="hero-lab__intro">
        Vista previa de heroes —{' '}
        <Link to="/" style={{ color: 'var(--gold)' }}>
          volver al inicio
        </Link>
      </p>

      {/* Libro 3D (StPageFlip / react-pageflip) */}
      <section id="v-papyrus" className="hero-lab__block hero-lab__block--papyrus-full">
        <div className="hero-lab__papyrus-book-wrap">
          <PapyrusBookHero publicaciones={publicaciones} fullBleed />
        </div>
      </section>

      {/* A — Estilo actual: manifiesto + ficha */}
      <section id="v-a" className="hero-lab__block">
        <div className="hero-lab__label">Variante A</div>
        <h2 className="hero-lab__title">Manifiesto editorial + ficha destacada (como Home actual)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'start', maxWidth: 1100, margin: '0 auto' }}>
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '0.75rem' }}>
              Salón de subastas
            </p>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', lineHeight: 1.15, margin: '0 0 1rem' }}>
              Objetos con historia. Puja con criterio.
            </h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              Catálogo curado de piezas singulares. Cada lote lleva contexto y transparencia en la oferta.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="hl-btn">Explorar lotes</button>
              <button type="button" className="hl-btn hl-btn-ghost">Cómo funciona</button>
            </div>
          </div>
          <FichaMini />
        </div>
      </section>

      {/* B — Cita dramática */}
      <section id="v-b" className="hero-lab__block">
        <div className="hero-lab__label">Variante B</div>
        <h2 className="hero-lab__title">Cita central + líneas finas</h2>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <div className="hl-rule" style={{ marginBottom: '2rem' }} />
          <blockquote
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
              lineHeight: 1.35,
              margin: 0,
              fontStyle: 'italic',
              color: '#e7e5e4',
            }}
          >
            «Lo que se subasta no es solo un objeto: es el derecho a custodiar un fragmento de tiempo.»
          </blockquote>
          <div className="hl-rule" style={{ marginTop: '2rem', marginBottom: '1.5rem' }} />
          <button type="button" className="hl-btn">
            Entrar al salón
          </button>
        </div>
      </section>

      {/* C — Ficha primero (catálogo) */}
      <section id="v-c" className="hero-lab__block">
        <div className="hero-lab__label">Variante C</div>
        <h2 className="hero-lab__title">Ficha a ancho completo arriba, texto debajo</h2>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div className="hl-ficha" style={{ maxWidth: 'none' }}>
            <div className="hl-ficha__img" style={{ minHeight: 220 }}>
              Imagen hero / lote estrella
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--amber)' }}>En sala ahora</p>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '2rem', margin: '0.5rem 0 1rem' }}>{mockLote.titulo}</h3>
            <p style={{ color: 'var(--muted)', maxWidth: 560, margin: '0 auto 1.25rem' }}>
              Narrativa breve del lote y por qué importa. Ideal si querés priorizar la pieza sobre el manifiesto.
            </p>
            <button type="button" className="hl-btn">
              Ver ficha completa
            </button>
          </div>
        </div>
      </section>

      {/* D — Columnas invertidas */}
      <section id="v-d" className="hero-lab__block">
        <div className="hero-lab__label">Variante D</div>
        <h2 className="hero-lab__title">Ficha a la izquierda, texto a la derecha</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem', alignItems: 'center', maxWidth: 1100, margin: '0 auto' }}>
          <FichaMini invert />
          <div>
            <p style={{ fontSize: '0.7rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '0.75rem' }}>
              Subasta en curso
            </p>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', lineHeight: 1.2, margin: '0 0 1rem' }}>
              Primero el objeto, después la historia.
            </h3>
            <p style={{ color: 'var(--muted)', lineHeight: 1.65 }}>
              Útil si el tráfico llega por imagen (redes, ads) y querés que el lote lidere la conversión.
            </p>
          </div>
        </div>
      </section>

      {/* E — Mínimo */}
      <section id="v-e" className="hero-lab__block">
        <div className="hero-lab__label">Variante E</div>
        <h2 className="hero-lab__title">Una columna estrecha, mucho aire</h2>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '2rem 0' }}>
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: '1rem' }}>
            Reliquias · edición 2026
          </p>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 3rem)', lineHeight: 1.08, margin: '0 0 1rem', fontWeight: 500 }}>
            Subasta
            <br />
            de salón
          </h3>
          <p style={{ color: 'var(--muted)', lineHeight: 1.7, fontSize: '1.05rem', marginBottom: '1.75rem' }}>
            Menos ruido visual, más tipografía. Pensado para audiencias que ya conocen la marca.
          </p>
          <button type="button" className="hl-btn">
            Ver lotes
          </button>
        </div>
      </section>

      {/* F — Bandeau */}
      <section id="v-f" className="hero-lab__block">
        <div className="hero-lab__label">Variante F</div>
        <h2 className="hero-lab__title">Franja superior + rejilla abajo</h2>
        <div
          style={{
            background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 88, 12, 0.12) 50%, rgba(26, 18, 16, 0.9) 100%)',
            borderTop: '1px solid rgba(245, 158, 11, 0.25)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.2)',
            padding: '2.5rem 1.5rem',
            marginBottom: '2rem',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.65rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--amber)', margin: '0 0 0.5rem' }}>
            Próximo cierre
          </p>
          <h3 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', margin: 0 }}>
            {mockLote.titulo}
          </h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', maxWidth: 900, margin: '0 auto' }}>
          <div style={{ padding: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 2 }}>
            <strong style={{ color: 'var(--gold)' }}>${formatearMonto(mockLote.precioActual)}</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0.5rem 0 0' }}>Puja actual</p>
          </div>
          <div style={{ padding: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 2 }}>
            <strong style={{ color: 'var(--cream)' }}>{mockLote.ofertasTotales}</strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0.5rem 0 0' }}>Ofertas registradas</p>
          </div>
          <div style={{ padding: '1.25rem', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: 2 }}>
            <button type="button" className="hl-btn" style={{ width: '100%' }}>
              Pujar ahora
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
