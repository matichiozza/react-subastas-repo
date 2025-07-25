import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';

const MisPublicaciones = () => {
  const { token } = useContext(AuthContext);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('http://localhost:8080/publicaciones/mias', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Error al obtener publicaciones');
        const data = await res.json();
        setPublicaciones(data.reverse());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchPublicaciones();
  }, [token]);

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta publicación? Esta acción no se puede deshacer.')) return;
    try {
      const res = await fetch(`http://localhost:8080/publicaciones/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Error al eliminar la publicación');
      setPublicaciones(pubs => pubs.filter(pub => pub.id !== id));
    } catch (err) {
      alert('No se pudo eliminar la publicación.');
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="mb-0" style={{ color: '#1976d2', fontWeight: 700 }}>Mis publicaciones</h2>
        <button className="btn btn-primary" style={{ borderRadius: 10, fontWeight: 600, fontSize: '1em', padding: '0.55em 1.2em' }} onClick={() => window.location.href = '/crear-publicacion'}>
          + Nueva publicación
        </button>
      </div>
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : publicaciones.length === 0 ? (
        <div className="card p-4 text-center mx-auto" style={{ maxWidth: 400, borderRadius: 14, boxShadow: '0 2px 12px rgba(25,118,210,0.08)' }}>
          <div className="mb-2" style={{ fontSize: 32 }}>📦</div>
          <div className="mb-2">No tienes publicaciones aún.</div>
          <button className="btn btn-primary mt-2" style={{ borderRadius: 8, fontWeight: 600 }} onClick={() => window.location.href = '/crear-publicacion'}>
            Crear publicación
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {publicaciones.map((pub, idx) => (
            <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={pub.id || idx}>
              <div className="card h-100 shadow-sm p-0 border-0 d-flex flex-column" style={{ borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 12px rgba(25,118,210,0.08)', minHeight: 340, transition: 'box-shadow 0.2s' }}>
                {/* Imagen principal */}
                {pub.imagenes && pub.imagenes.length > 0 ? (
                  <div style={{ height: 160, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={`http://localhost:8080${pub.imagenes[0]}`} alt={pub.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ height: 160, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 38 }}>
                    <span role="img" aria-label="sin imagen">🖼️</span>
                  </div>
                )}
                <div className="p-3 d-flex flex-column flex-grow-1">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <span className={`badge ${pub.estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.92em', fontWeight: 500 }}>{pub.estado || 'Sin estado'}</span>
                    <span className="badge bg-light text-dark border" style={{ fontSize: '0.92em', fontWeight: 500, background: '#e3f2fd', color: '#1976d2' }}>{pub.categoria || 'Sin categoría'}</span>
                    <span style={{ color: '#888', fontSize: '0.93em', marginLeft: 'auto' }}>{pub.fechaFin ? new Date(pub.fechaFin).toLocaleDateString() : ''}</span>
                  </div>
                  <h6 className="fw-bold mb-1" style={{ color: '#1976d2', fontSize: '1.08em', minHeight: 28, lineHeight: 1.2 }}>{pub.titulo}</h6>
                  <div className="mb-1 text-truncate" style={{ fontSize: '0.97em', color: '#666', minHeight: 18 }}>{pub.descripcion}</div>
                  <div className="mb-2 d-flex align-items-center gap-2" style={{ fontWeight: 500 }}>
                    <span style={{ color: '#1565c0', fontSize: '1.05em' }}>Precio actual: ${pub.precioActual && pub.precioActual > 0 ? pub.precioActual : pub.precioInicial}</span>
                    <span className="badge bg-warning text-dark ms-auto" style={{ fontSize: '0.90em' }}>{pub.ofertasTotales || 0} ofertas</span>
                  </div>
                  <div className="d-flex gap-2 mt-auto pt-2 border-top" style={{ borderColor: '#ececf3' }}>
                    <button
                      className="btn d-flex align-items-center gap-1"
                      style={{
                        borderRadius: 8,
                        fontWeight: 600,
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        fontSize: '0.98em',
                        padding: '0.38em 1em',
                        boxShadow: '0 1px 4px rgba(25,118,210,0.08)',
                        transition: 'background 0.18s',
                      }}
                      title="Editar"
                      onClick={() => window.location.href = `/editar-publicacion/${pub.id}`}
                      onMouseOver={e => e.currentTarget.style.background = '#1251a3'}
                      onMouseOut={e => e.currentTarget.style.background = '#1976d2'}
                    >
                      <FaEdit /> Editar
                    </button>
                    <button
                      className="btn d-flex align-items-center gap-1"
                      style={{
                        borderRadius: 8,
                        fontWeight: 600,
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        fontSize: '0.98em',
                        padding: '0.38em 1em',
                        boxShadow: '0 1px 4px rgba(231,76,60,0.08)',
                        transition: 'background 0.18s',
                      }}
                      title="Eliminar"
                      onClick={() => handleEliminar(pub.id)}
                      onMouseOver={e => e.currentTarget.style.background = '#c0392b'}
                      onMouseOut={e => e.currentTarget.style.background = '#e74c3c'}
                    >
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisPublicaciones;