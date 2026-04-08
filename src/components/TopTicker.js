import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../config/api';

const TopTicker = () => {
  const [publicaciones, setPublicaciones] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/publicaciones`)
      .then(res => res.json())
      .then(data => {
        // Obtenemos solo publicaciones activas
        const activas = data.filter(p => p.fechaFin && new Date(p.fechaFin) > new Date());
        setPublicaciones(activas);
      })
      .catch(console.error);
  }, []);

  // Retornamos SIEMPRE la franja negra para no desajustar el diseño, 
  // incluso si carga vacío, mostraremos un esqueleto
  const itemsAMostrar = publicaciones.length > 0 ? publicaciones : [{
    id: 'skeleton',
    titulo: 'Cargando transacciones en vivo...',
    precioActual: null,
    precioInicial: 0
  }];

  const formatearMonto = (monto) => {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0 }).format(monto || 0);
  };

  return (
    <div style={{ width: '100%', overflow: 'hidden', background: '#120d0c', borderBottom: '1px solid rgba(245, 158, 11, 0.12)', padding: '6px 0', position: 'relative', zIndex: 1100 }}>
      {/* Sombras difuminadas en los bordes para dar efecto continuo */}
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '120px', background: 'linear-gradient(to right, #120d0c 0%, transparent 100%)', zIndex: 1 }}></div>
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '120px', background: 'linear-gradient(to left, #120d0c 0%, transparent 100%)', zIndex: 1 }}></div>
      
      <div style={{ display: 'flex', whiteSpace: 'nowrap', animation: 'ticker 40s linear infinite' }}>
        {/* Duplicamos la lista para simular el loop infinito del ticker */}
        {[...itemsAMostrar.slice(0, 10), ...itemsAMostrar.slice(0, 10)].map((pub, idx) => (
          <span key={`${pub.id}-${idx}`} style={{ margin: '0 40px', color: '#a8a29e', fontSize: '0.85em', letterSpacing: '0.5px' }}>
            <i className="fas fa-bolt px-2" style={{ color: '#f59e0b', fontSize: '0.9em' }}></i>
            En el mercado: <b style={{ color: '#e7e5e4' }}>{pub.titulo?.substring(0,30)}{pub.titulo?.length > 30 ? '...' : ''}</b> por <span style={{ color: '#fbbf24', fontWeight: 600 }}>${formatearMonto(pub.precioActual || pub.precioInicial)}</span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default TopTicker;
