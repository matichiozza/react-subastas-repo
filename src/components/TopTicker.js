import React, { useEffect, useMemo, useState } from 'react';
import API_BASE_URL from '../config/api';
import './TopTicker.css';

const SEP = { __tickerSep: true, id: '__sep' };

const SKELETON_ROW = [
  {
    id: 'skeleton',
    titulo: 'Cargando transacciones en vivo...',
    precioActual: null,
    precioInicial: 0,
  },
];

/** Orden para el ticker: sin el mismo producto dos veces seguidas (n ≥ 2); con 1 ítem, intercala separadores. */
function buildTickerSequence(items) {
  if (!items?.length) return [];
  if (items.length === 1) {
    const a = items[0];
    return [a, SEP, a, SEP, a, SEP, a, SEP];
  }
  const n = items.length;
  const cycles = Math.max(28, Math.ceil(120 / n));
  const out = [];
  for (let i = 0; i < n * cycles; i += 1) {
    out.push(items[i % n]);
  }
  return out;
}

const TopTicker = () => {
  const [publicaciones, setPublicaciones] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/publicaciones`)
      .then((res) => res.json())
      .then((data) => {
        const activas = data.filter((p) => p.fechaFin && new Date(p.fechaFin) > new Date());
        setPublicaciones(activas);
      })
      .catch(console.error);
  }, []);

  const sequence = useMemo(() => {
    const raw = publicaciones.length > 0 ? publicaciones : SKELETON_ROW;
    return buildTickerSequence(raw.slice(0, 20));
  }, [publicaciones]);

  const formatearMonto = (monto) =>
    new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(monto || 0);

  const precioLinea = (pub) => {
    const ofertas = Number(pub.ofertasTotales) || 0;
    const act = Number(pub.precioActual);
    if (ofertas > 0 && !Number.isNaN(act) && act > 0) return act;
    const ini = Number(pub.precioInicial);
    return Number.isNaN(ini) ? 0 : ini;
  };

  const renderChunk = (prefix) =>
    sequence.map((pub, idx) => {
      if (pub.__tickerSep) {
        return (
          <span key={`${prefix}-sep-${idx}`} className="top-ticker__sep" aria-hidden>
            ···
          </span>
        );
      }
      const titulo = (pub.titulo || '').substring(0, 36);
      const dots = pub.titulo?.length > 36 ? '…' : '';
      return (
        <span key={`${prefix}-${pub.id}-${idx}`} className="top-ticker__item">
          <i className="fas fa-bolt" style={{ color: '#f59e0b', fontSize: '0.95em', marginRight: '0.35em' }} aria-hidden />
          En el mercado:{' '}
          <b style={{ color: '#e7e5e4', fontWeight: 600 }}>{titulo}
            {dots}
          </b>{' '}
          por{' '}
          <span style={{ color: '#fbbf24', fontWeight: 600 }}>${formatearMonto(precioLinea(pub))}</span>
        </span>
      );
    });

  return (
    <div className="top-ticker">
      <div className="top-ticker__fade top-ticker__fade--left" aria-hidden />
      <div className="top-ticker__fade top-ticker__fade--right" aria-hidden />
      <div className="top-ticker__viewport">
        <div className="top-ticker__track">
          <div className="top-ticker__segment">{renderChunk('a')}</div>
          <div className="top-ticker__segment" aria-hidden>
            {renderChunk('b')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopTicker;
