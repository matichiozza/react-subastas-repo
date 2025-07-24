import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const categorias = [
  'Electrónica',
  'Computación',
  'Teléfonos',
  'Hogar',
  'Muebles',
  'Cocina',
  'Moda',
  'Calzado',
  'Accesorios',
  'Joyería',
  'Deportes',
  'Aire libre',
  'Vehículos',
  'Herramientas',
  'Juguetes',
  'Bebés',
  'Mascotas',
  'Libros',
  'Música',
  'Arte',
];

const TodasPublicaciones = () => {
  const { token } = useContext(AuthContext);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener parámetro de búsqueda de la URL
  const params = new URLSearchParams(location.search);
  const busqueda = params.get('busqueda')?.toLowerCase() || '';

  useEffect(() => {
    const fetchPublicaciones = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:8080/publicaciones', {
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
  }, [token]);

  // Filtrado por categoría y búsqueda
  let publicacionesFiltradas = publicaciones;
  if (categoriaSeleccionada) {
    publicacionesFiltradas = publicacionesFiltradas.filter(pub => (pub.categoria || '').toLowerCase() === categoriaSeleccionada.toLowerCase());
  }
  if (busqueda) {
    publicacionesFiltradas = publicacionesFiltradas.filter(pub =>
      (pub.titulo && pub.titulo.toLowerCase().includes(busqueda)) ||
      (pub.descripcion && pub.descripcion.toLowerCase().includes(busqueda))
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        {/* Filtros laterales */}
        <div className="col-lg-3 mb-4">
          <div className="card p-3">
            <h6 className="mb-3" style={{ color: '#1976d2', fontWeight: 700 }}>Categorías</h6>
            <ul className="list-unstyled mb-0">
              <li className={`d-flex align-items-center mb-2${categoriaSeleccionada === '' ? ' fw-bold' : ''}`} style={{ fontSize: '1.05em', cursor: 'pointer' }} onClick={() => setCategoriaSeleccionada('')}>
                <span style={{ marginRight: 8 }}>🔎</span>
                <span>Todas</span>
              </li>
              {categorias.map(cat => (
                <li
                  key={cat}
                  className={`d-flex align-items-center mb-2${categoriaSeleccionada === cat ? ' fw-bold' : ''}`}
                  style={{ fontSize: '1.05em', cursor: 'pointer' }}
                  onClick={() => setCategoriaSeleccionada(cat)}
                >
                  <span style={{ marginRight: 8 }}>📦</span>
                  <span>{cat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Publicaciones */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Publicaciones</h4>
            {categoriaSeleccionada && (
              <span style={{ color: '#5a48f6', fontWeight: 500 }}>
                Filtrando por: {categoriaSeleccionada}
                <button className="btn btn-link btn-sm ms-2" style={{ color: '#e74c3c', textDecoration: 'none' }} onClick={() => setCategoriaSeleccionada('')}>
                  Quitar filtro
                </button>
              </span>
            )}
          </div>
          {loading ? (
            <div>Cargando...</div>
          ) : publicacionesFiltradas.length === 0 ? (
            <div className="alert alert-info">No hay publicaciones para esta categoría.</div>
          ) : (
            <div className="row g-4">
              {publicacionesFiltradas.slice(0, 8).map((pub, idx) => (
                <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={pub.id || idx}>
                  <div className="card h-100 shadow-sm p-0 border-0" style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 12px rgba(90,72,246,0.06)', minHeight: 340, maxHeight: 370 }}>
                    {/* Imagen principal */}
                    {pub.imagenes && pub.imagenes.length > 0 ? (
                      <div style={{ height: 120, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={`http://localhost:8080${pub.imagenes[0]}`} alt={pub.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ) : (
                      <div style={{ height: 120, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 32 }}>
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
                          {pub.precioActual && pub.precioActual > 0 ? `Actual: $${pub.precioActual}` : `Inicial: $${pub.precioInicial}`}
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
                          <img src={`http://localhost:8080${pub.usuario.fotoPerfil}`} alt={pub.usuario.username} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ececf3' }} />
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
        </div>
      </div>
      {/* Info proyecto */}
      <div className="row mt-5 mb-2">
        <div className="col-12 col-lg-10 mx-auto text-center">
          <h5 className="mb-3" style={{ color: '#1976d2', fontWeight: 700 }}>¿Qué es SubastasCorp?</h5>
          <p className="lead">SubastasCorp es una plataforma moderna y profesional para gestionar subastas online. Regístrate, publica tus productos, haz ofertas y encuentra oportunidades únicas. ¡Disfruta de una experiencia segura y fácil de usar!</p>
        </div>
      </div>
    </div>
  );
};

export default TodasPublicaciones; 