import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

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
  const stompClientRef = useRef(null);
  const [zoom, setZoom] = useState({ visible: false, x: 0, y: 0 });
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const imgContainerRef = useRef(null);

  useEffect(() => {
    const fetchPublicacion = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Token usado en fetch publicación:", token);
        const res = await fetch(`http://localhost:8080/publicaciones/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        console.log("Respuesta de detalle:", res);
        console.log("Status:", res.status);
        const data = await res.json().catch(() => null);
        console.log("Data publicación:", data);
        if (!res.ok) throw new Error('No se pudo cargar la publicación');
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
        console.log("Token usado en fetch ofertas:", token);
        const res = await fetch(`http://localhost:8080/publicaciones/${id}/ofertas`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        console.log("Respuesta de ofertas:", res);
        console.log("Status:", res.status);
        const data = await res.json().catch(() => null);
        console.log("Data ofertas:", data);
        setOfertas(data);
      } catch {
        setOfertas([]);
      }
    };
    fetchOfertas();
  }, [id, mensaje, token]); // Refresca historial tras ofertar

  useEffect(() => {
    // Conexión WebSocket solo cuando hay id
    if (!id) return;
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/publicacion.${id}`, (msg) => {
          const data = JSON.parse(msg.body);
          setPublicacion(data.publicacionActualizada);
          setOfertas(data.ofertas);
        });
      },
    });
    stompClient.activate();
    stompClientRef.current = stompClient;
    return () => {
      stompClient.deactivate();
    };
  }, [id]);

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
      const res = await fetch(`http://localhost:8080/publicaciones/ofertas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ publicacionId: publicacion.id, monto }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'No se pudo realizar la oferta');
      }
      const data = await res.json();
      setMensaje('¡Oferta realizada con éxito!');
      setOferta('');
      setPublicacion(data.publicacionActualizada);
      setOfertas(data.ofertas);
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
        <li className="breadcrumb-item"><span style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => navigate('/publicaciones')}>Publicaciones</span></li>
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
          <div
            className="card p-3 mb-3 mt-0 position-relative"
            style={{ borderRadius: 16, minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}
            ref={imgContainerRef}
          >
            {/* Icono de lupa en la esquina superior derecha */}
            <button
              type="button"
              aria-label={zoomEnabled ? 'Desactivar lupa' : 'Activar lupa'}
              onClick={() => {
                setZoomEnabled(z => !z);
                setZoom(z => ({ ...z, visible: false }));
              }}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                zIndex: 99,
                background: zoomEnabled ? 'rgba(25,118,210,0.95)' : 'rgba(255,255,255,0.92)',
                color: zoomEnabled ? '#fff' : '#1976d2',
                border: '2px solid #1976d2',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(25,118,210,0.18)',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
                fontSize: 16,
              }}
            >
              {zoomEnabled ? (
                <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>×</span>
              ) : (
                <span style={{ fontSize: 16, lineHeight: 1 }}>🔍</span>
              )}
            </button>
            {publicacion.imagenes && publicacion.imagenes.length > 0 ? (
              <div
                style={{ position: 'relative', display: 'inline-block' }}
                onMouseMove={e => {
                  if (!zoomEnabled) return;
                  const rect = imgContainerRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  setZoom({ visible: true, x, y });
                }}
                onMouseLeave={() => setZoom(z => ({ ...z, visible: false }))}
                className={zoom.visible && zoomEnabled ? 'lupa-activa' : ''}
              >
                <img
                  src={`http://localhost:8080${publicacion.imagenes[imgSeleccionada]}`}
                  alt={`Imagen ${imgSeleccionada + 1}`}
                  className="img-fluid"
                  style={{ maxHeight: 340, objectFit: 'contain', borderRadius: 12, maxWidth: '100%', display: 'block' }}
                />
                {/* Lupa de zoom */}
                {zoomEnabled && zoom.visible && (
                  <div
                    style={{
                      position: 'absolute',
                      pointerEvents: 'none',
                      left: zoom.x - 90,
                      top: zoom.y - 90,
                      width: 180,
                      height: 180,
                      borderRadius: '50%',
                      border: '2.5px solid #1976d2',
                      boxShadow: '0 4px 16px rgba(25,118,210,0.18)',
                      backgroundImage: `url(http://localhost:8080${publicacion.imagenes[imgSeleccionada]})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '320% 320%',
                      backgroundPosition: `${((zoom.x / rectWidth(imgContainerRef)) * 100).toFixed(2)}% ${((zoom.y / rectHeight(imgContainerRef)) * 100).toFixed(2)}%`,
                      zIndex: 10,
                      borderColor: '#1976d2',
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center" style={{ height: 220, color: '#bbb', fontSize: 48 }}>
                <span role="img" aria-label="sin imagen">🖼️</span>
              </div>
            )}
          </div>
          {/* Descripción en tarjeta sutil */}
          <div style={{ border: '1px solid #ececf3', borderRadius: 12, background: '#fff', padding: '1.1em 1.3em', marginTop: 8, marginBottom: 0 }}>
            <div style={{ fontSize: '1.05em', color: '#444', lineHeight: 1.7, fontWeight: 400 }}>{publicacion.descripcion}</div>
          </div>
        </div>
        {/* Datos y formulario + historial de ofertas */}
        <div className="col-lg-5">
          <div className="card p-4 mb-4 mt-0" style={{ borderRadius: 16 }}>
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
            <h3 className="fw-bold mb-2" style={{ color: '#1976d2' }}>{publicacion.titulo}</h3>
            <div className="mb-2">
              <span className="badge bg-light text-dark border me-2" style={{ fontWeight: 500, fontSize: '0.95em', background: '#e3f2fd', color: '#1976d2' }}>{publicacion.categoria || 'Sin categoría'}</span>
              <span className={`badge ${publicacion.condicion === 'Nuevo' ? 'bg-success' : 'bg-secondary'}`} style={{ fontWeight: 500, fontSize: '0.95em' }}>{publicacion.condicion || 'Condición'}</span>
            </div>
            <div className="mb-2">
              <span style={{ fontWeight: 600, color: '#1976d2', fontSize: '1.15em' }}>Precio actual: ${precioActual}</span>
              <span className="ms-3" style={{ color: '#1565c0', fontSize: '0.98em' }}>Incremento mínimo: ${incremento}</span>
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
          <div className="card p-3 mt-0" style={{ borderRadius: 14 }}>
            <h5 className="fw-bold mb-3" style={{ color: '#1976d2' }}>Historial de ofertas</h5>
            {ofertas.length === 0 ? (
              <div className="text-muted">No hay ofertas aún.</div>
            ) : (
              <ul className="list-group list-group-flush">
                {ofertas
                  .slice()
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .map((of) => {
                    let fecha = '';
                    let hora = '';
                    if (of.fecha) {
                      const d = new Date(of.fecha);
                      if (!isNaN(d)) {
                        fecha = d.toLocaleDateString();
                        hora = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } else {
                        fecha = of.fecha;
                      }
                    }
                    return (
                      <li
                        key={of.id}
                        className="list-group-item px-3 py-3"
                        style={{ background: 'none', border: 'none', borderBottom: '1px solid #ececf3' }}
                      >
                        <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ rowGap: 6 }}>
                          <span className="fw-semibold" style={{ color: '#1976d2', fontSize: '1.04em', maxWidth: '60vw', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{of.usuario?.nombre || of.usuario?.username || 'Usuario'}</span>
                          <span style={{ fontWeight: 600, color: '#1976d2', fontSize: '1.13em', minWidth: 80, textAlign: 'right' }}>${of.monto}</span>
                        </div>
                        <div className="mt-1" style={{ color: '#888', fontSize: '0.97em', letterSpacing: 0.2 }}>
                          {fecha} {hora && <span style={{ marginLeft: 10 }}>{hora}</span>}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helpers para obtener el tamaño del contenedor de la imagen
function rectWidth(ref) {
  return ref.current ? ref.current.offsetWidth : 1;
}
function rectHeight(ref) {
  return ref.current ? ref.current.offsetHeight : 1;
}

// CSS para ocultar el cursor cuando la lupa está activa
const style = document.createElement('style');
style.innerHTML = `.lupa-activa { cursor: none !important; }`;
document.head.appendChild(style);

export default DetallePublicacion; 