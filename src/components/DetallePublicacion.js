import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DetallePublicacion = () => {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const [publicacion, setPublicacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [oferta, setOferta] = useState('');
  const [ofertando, setOfertando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [imgSeleccionada, setImgSeleccionada] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublicacion = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8080/publicaciones/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('No se pudo cargar la publicación');
        const data = await res.json();
        setPublicacion(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicacion();
  }, [id, token]);

  useEffect(() => {
    const fetchOfertas = async () => {
      try {
        const res = await fetch(`http://localhost:8080/publicaciones/${id}/ofertas`);
        if (!res.ok) throw new Error('No se pudo cargar el historial de ofertas');
        const data = await res.json();
        setOfertas(data);
      } catch {
        setOfertas([]);
      }
    };
    fetchOfertas();
  }, [id, mensaje]); // Refresca historial tras ofertar

  if (loading) return <div className="container py-5 text-center">Cargando...</div>;
  if (error) return <div className="container py-5 text-center text-danger">{error}</div>;
  if (!publicacion) return <div className="container py-5 text-center">No encontrada</div>;

  const incremento = publicacion.incrementoMinimo || 1;
  const precioActual = publicacion.precioActual && publicacion.precioActual > 0 ? publicacion.precioActual : publicacion.precioInicial;
  const siguienteOferta = precioActual + incremento;

  const handleOfertar = async (e) => {
    e.preventDefault();
    setOfertando(true);
    setMensaje(null);
    try {
      const monto = parseFloat(oferta);
      if (isNaN(monto) || monto < siguienteOferta) {
        setMensaje(`La oferta debe ser al menos $${siguienteOferta}`);
        setOfertando(false);
        return;
      }
      const res = await fetch(`http://localhost:8080/ofertas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ publicacionId: publicacion.id, monto }),
      });
      if (!res.ok) throw new Error('No se pudo realizar la oferta');
      setMensaje('¡Oferta realizada con éxito!');
      setOferta('');
      // Refrescar datos
      const data = await res.json();
      setPublicacion(data.publicacionActualizada || { ...publicacion, precioActual: monto });
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setOfertando(false);
    }
  };

  // Breadcrumb
  const breadcrumb = (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb" style={{ background: 'none', padding: 0, marginBottom: 0 }}>
        <li className="breadcrumb-item"><span style={{ cursor: 'pointer', color: '#5a48f6' }} onClick={() => navigate('/publicaciones')}>Publicaciones</span></li>
        <li className="breadcrumb-item active" aria-current="page">{publicacion.categoria || 'Sin categoría'}</li>
      </ol>
    </nav>
  );

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <div className="mb-2">{breadcrumb}</div>
      <div className="row">
        {/* Miniaturas verticales */}
        <div className="col-md-1 d-none d-md-flex flex-column align-items-center gap-2" style={{ minWidth: 60 }}>
          {publicacion.imagenes && publicacion.imagenes.length > 0 && publicacion.imagenes.map((img, idx) => (
            <img
              key={img}
              src={`http://localhost:8080${img}`}
              alt={`Miniatura ${idx + 1}`}
              onMouseEnter={() => setImgSeleccionada(idx)}
              style={{
                width: 48,
                height: 48,
                objectFit: 'cover',
                borderRadius: 8,
                border: imgSeleccionada === idx ? '2px solid #5a48f6' : '2px solid #ececf3',
                cursor: 'pointer',
                boxShadow: imgSeleccionada === idx ? '0 2px 8px rgba(90,72,246,0.10)' : 'none',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}
            />
          ))}
        </div>
        {/* Imagen principal y descripción */}
        <div className="col-lg-6 mb-4 col-md-7">
          <div className="card p-3 mb-3" style={{ borderRadius: 16, minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {publicacion.imagenes && publicacion.imagenes.length > 0 ? (
              <img
                src={`http://localhost:8080${publicacion.imagenes[imgSeleccionada]}`}
                alt={`Imagen ${imgSeleccionada + 1}`}
                className="img-fluid"
                style={{ maxHeight: 340, objectFit: 'contain', borderRadius: 12, maxWidth: '100%' }}
              />
            ) : (
              <div className="d-flex align-items-center justify-content-center" style={{ height: 220, color: '#bbb', fontSize: 48 }}>
                <span role="img" aria-label="sin imagen">🖼️</span>
              </div>
            )}
          </div>
          {/* Descripción en tarjeta moderna */}
          <div className="card shadow-sm p-4" style={{ borderRadius: 18, background: 'linear-gradient(90deg, #f7f8fa 60%, #ececf3 100%)', border: '1.5px solid #ececf3' }}>
            <h5 className="fw-bold mb-2" style={{ color: '#5a48f6' }}>Descripción</h5>
            <div style={{ fontSize: '1.08em', color: '#444', lineHeight: 1.6 }}>{publicacion.descripcion}</div>
          </div>
        </div>
        {/* Datos y formulario + historial de ofertas */}
        <div className="col-lg-5">
          <div className="card p-4 mb-4" style={{ borderRadius: 16 }}>
            <div className="d-flex align-items-center mb-3 gap-3">
              {publicacion.usuario?.fotoPerfil ? (
                <img src={`http://localhost:8080${publicacion.usuario.fotoPerfil}`} alt={publicacion.usuario.username} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ececf3' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ececf3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 24 }}>
                  <span role="img" aria-label="user">👤</span>
                </div>
              )}
              <div>
                <div className="fw-bold" style={{ fontSize: '1.1em' }}>{publicacion.usuario?.nombre || publicacion.usuario?.username || 'Usuario'}</div>
                <div style={{ color: '#888', fontSize: '0.95em' }}>{[publicacion.usuario?.ciudad, publicacion.usuario?.pais].filter(Boolean).join(', ')}</div>
              </div>
              <span className={`badge ${publicacion.estado === 'ACTIVO' ? 'bg-primary' : 'bg-secondary'}`} style={{ fontSize: '0.95em', marginLeft: 'auto' }}>{publicacion.estado}</span>
            </div>
            <h3 className="fw-bold mb-2" style={{ color: '#5a48f6' }}>{publicacion.titulo}</h3>
            <div className="mb-2">
              <span className="badge bg-light text-dark border me-2" style={{ fontWeight: 500, fontSize: '0.95em' }}>{publicacion.categoria || 'Sin categoría'}</span>
              <span className={`badge ${publicacion.condicion === 'Nuevo' ? 'bg-success' : 'bg-secondary'}`} style={{ fontWeight: 500, fontSize: '0.95em' }}>{publicacion.condicion || 'Condición'}</span>
            </div>
            <div className="mb-2">
              <span style={{ fontWeight: 600, color: '#5a48f6', fontSize: '1.15em' }}>Precio actual: ${precioActual}</span>
              <span className="ms-3" style={{ color: '#888', fontSize: '0.98em' }}>Incremento mínimo: ${incremento}</span>
            </div>
            <div className="mb-2" style={{ color: '#222', fontSize: '1.05em' }}>
              <span role="img" aria-label="fin">⏰</span> Finaliza: {publicacion.fechaFin ? new Date(publicacion.fechaFin).toLocaleString() : 'Sin fecha'}
            </div>
            <div className="mb-2" style={{ color: '#222', fontSize: '1.05em' }}>
              <span role="img" aria-label="ofertas">💸</span> Ofertas totales: {publicacion.ofertasTotales || 0}
            </div>
            {/* Formulario de oferta */}
            {publicacion.estado === 'ACTIVO' ? (
              <form onSubmit={handleOfertar} className="mt-3">
                <div className="input-group mb-2">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control"
                    min={siguienteOferta}
                    step={incremento}
                    value={oferta}
                    onChange={e => setOferta(e.target.value)}
                    placeholder={`Mínimo $${siguienteOferta}`}
                    required
                    disabled={!user || ofertando}
                  />
                  <button className="btn btn-primary" type="submit" disabled={!user || ofertando} style={{ fontWeight: 600, minWidth: 110 }}>
                    {ofertando ? 'Ofertando...' : 'Ofertar'}
                  </button>
                </div>
                {!user && <div className="text-danger small">Debes iniciar sesión para ofertar.</div>}
                {mensaje && <div className={`mt-2 ${mensaje.includes('éxito') ? 'text-success' : 'text-danger'}`}>{mensaje}</div>}
              </form>
            ) : (
              <div className="alert alert-info mt-3">La subasta no está activa.</div>
            )}
          </div>
          {/* Historial de ofertas debajo de la tarjeta de datos */}
          <div className="card p-3" style={{ borderRadius: 14 }}>
            <h5 className="fw-bold mb-3" style={{ color: '#5a48f6' }}>Historial de ofertas</h5>
            {ofertas.length === 0 ? (
              <div className="text-muted">No hay ofertas aún.</div>
            ) : (
              <ul className="list-group list-group-flush">
                {ofertas.map((of, idx) => (
                  <li key={of.id} className="list-group-item d-flex align-items-center justify-content-between" style={{ background: 'none', border: 'none', borderBottom: '1px solid #ececf3' }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-semibold" style={{ color: '#222' }}>{of.usuario?.nombre || of.usuario?.username || 'Usuario'}</span>
                      <span className="badge bg-light text-dark border ms-2" style={{ fontSize: '0.92em' }}>{of.fecha}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: '#5a48f6', fontSize: '1.08em' }}>${of.monto}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePublicacion; 