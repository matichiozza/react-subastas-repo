import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

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
      <h2 className="text-center mb-4">Mis Publicaciones</h2>
      {loading ? (
        <div className="text-center">Cargando...</div>
      ) : error ? (
        <div className="alert alert-danger text-center">{error}</div>
      ) : publicaciones.length === 0 ? (
        <div className="card p-4 text-center mx-auto" style={{ maxWidth: 400 }}>No tienes publicaciones aún.</div>
      ) : (
        <div className="row g-4">
          {publicaciones.map((pub, idx) => (
            <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={pub.id || idx}>
              <div className="card h-100 shadow-sm p-3" style={{ border: '1.5px solid #ececf3', minHeight: 220, transition: 'box-shadow 0.2s', cursor: 'pointer' }}>
                {pub.imagenes && pub.imagenes.length > 0 && (
                  <div className="mb-2 text-center">
                    <img src={`http://localhost:8080${pub.imagenes[0]}`} alt={pub.titulo} style={{ maxWidth: '100%', maxHeight: 120, borderRadius: 10, objectFit: 'cover' }} />
                  </div>
                )}
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className={`badge ${pub.estado === 'ACTIVO' ? 'bg-success' : 'bg-secondary'}`} style={{ fontSize: '0.9em' }}>{pub.estado || 'Sin estado'}</span>
                  <span style={{ fontSize: '0.95em', color: '#888' }}>{pub.fechaFin ? new Date(pub.fechaFin).toLocaleDateString() : ''}</span>
                </div>
                <h6 className="fw-bold mb-1" style={{ color: '#1976d2' }}>{pub.titulo}</h6>
                <div className="mb-1" style={{ fontSize: '0.98em' }}>{pub.descripcion}</div>
                <div className="mb-2" style={{ fontWeight: 500 }}>Precio inicial: <span style={{ color: '#1565c0' }}>${pub.precioInicial}</span></div>
                <div className="d-flex gap-2 mt-auto">
                  <button className="btn btn-outline-primary btn-sm" style={{ borderRadius: 8, fontWeight: 500 }}>Editar</button>
                  <button className="btn btn-outline-danger btn-sm" style={{ borderRadius: 8, fontWeight: 500 }} onClick={() => handleEliminar(pub.id)}>Eliminar</button>
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