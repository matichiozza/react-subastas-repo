import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CancelarPublicacion from './CancelarPublicacion';
import Footer from './Footer';
import API_BASE_URL from '../config/api';

// Función para formatear montos con separadores de miles
function formatearMonto(valor) {
  if (!valor) return '0';
  return parseFloat(valor).toLocaleString('es-AR');
}

const MisPublicaciones = () => {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [publicacionACancelar, setPublicacionACancelar] = useState(null);
  const [sancionesInfo, setSancionesInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Obtener publicaciones
        const resPublicaciones = await fetch(`${API_BASE_URL}/publicaciones/mias`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!resPublicaciones.ok) throw new Error('Error al obtener publicaciones');
        const dataPublicaciones = await resPublicaciones.json();
        setPublicaciones(dataPublicaciones.reverse());

        // Obtener información de sanciones
        const resSanciones = await fetch(`${API_BASE_URL}/publicaciones/usuario/sanciones`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (resSanciones.ok) {
          const dataSanciones = await resSanciones.json();
          setSancionesInfo(dataSanciones);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchData();

    // WebSocket para actualizaciones en tiempo real
    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    
    const connectWebSocket = () => {
      try {
        socket = new WebSocket('ws://localhost:8080/ws');
        
        socket.onopen = () => {
          reconnectAttempts = 0;
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'oferta_actualizada') {
              setPublicaciones(prev => 
                prev.map(pub => 
                  pub.id === data.publicacion.id 
                    ? { ...pub, ofertasTotales: data.publicacion.ofertasTotales, precioActual: data.publicacion.precioActual }
                    : pub
                )
              );
            }
          } catch (error) {
            console.error('Error al procesar mensaje WebSocket:', error);
          }
        };

        socket.onerror = () => {
          // Silenciar errores de WebSocket
        };

        socket.onclose = (event) => {
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            setTimeout(connectWebSocket, 2000);
          }
        };
      } catch (error) {
        // Silenciar errores de conexión
      }
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close(1000);
      }
    };
  }, [token]);



  const handleCancelar = (publicacion) => {
    setPublicacionACancelar(publicacion);
    setShowCancelModal(true);
  };

  const handleCancelacionExitosa = async (resultado) => {
    // Eliminar la publicación de la lista
    setPublicaciones(pubs => 
      pubs.filter(pub => pub.id !== publicacionACancelar.id)
    );
    
    // Actualizar información de sanciones
    if (sancionesInfo) {
      setSancionesInfo(prev => ({
        ...prev,
        sancionesDisponibles: resultado.sancionesRestantes
      }));
    }
    
    // Verificar si la cuenta fue eliminada después de la cancelación
    try {
      const resSanciones = await fetch(`${API_BASE_URL}/publicaciones/usuario/sanciones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const dataSanciones = await resSanciones.json();
      
      if (!resSanciones.ok && resSanciones.status === 401 && dataSanciones.cuentaEliminada) {
        // Cuenta eliminada automáticamente después de la cancelación
        alert('Tu cuenta ha sido eliminada por tener 0 sanciones disponibles después de la cancelación.');
        logout();
        navigate('/login');
        return;
      }
    } catch (error) {
      console.error('Error al verificar sanciones:', error);
    }
    
    // Mostrar mensaje de éxito
    const mensaje = resultado.sancionAplicada 
      ? `Publicación cancelada y eliminada. Se aplicó una sanción. Te quedan ${resultado.sancionesRestantes} sanciones disponibles.`
      : 'Publicación cancelada y eliminada exitosamente.';
    
    alert(mensaje);
    setShowCancelModal(false);
    setPublicacionACancelar(null);
  };

  // Lógica de navegación para crear publicación
  const handleNuevaPublicacion = () => {
    if (user) navigate('/crear-publicacion');
    else navigate('/login');
  };

  return (
    <div>
      <div className="container py-5">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h2 className="mb-0" style={{ color: '#1976d2', fontWeight: 700 }}>Mis publicaciones</h2>
          <div className="d-flex align-items-center gap-3">
            {sancionesInfo && (
              <div className="d-flex align-items-center gap-2" style={{ 
                background: sancionesInfo.sancionesDisponibles === 0 ? '#ffebee' : '#e8f5e8', 
                padding: '8px 12px', 
                borderRadius: 8, 
                border: `1px solid ${sancionesInfo.sancionesDisponibles === 0 ? '#f44336' : '#4caf50'}` 
              }}>
                <span style={{ 
                  fontSize: '0.9em', 
                  fontWeight: 600, 
                  color: sancionesInfo.sancionesDisponibles === 0 ? '#d32f2f' : '#2e7d32' 
                }}>
                  ⚠️ Sanciones: {sancionesInfo.sancionesDisponibles}/{sancionesInfo.maximoSanciones}
                </span>
              </div>
            )}
            <button className="btn btn-primary" style={{ borderRadius: 10, fontWeight: 600, fontSize: '1em', padding: '0.55em 1.2em' }} onClick={handleNuevaPublicacion}>
              + Nueva publicación
            </button>
          </div>
        </div>
        {loading ? (
          <div className="text-center">Cargando...</div>
        ) : error ? (
          <div className="alert alert-danger text-center">{error}</div>
        ) : publicaciones.length === 0 ? (
          <div className="card p-4 text-center mx-auto" style={{ maxWidth: 400, borderRadius: 14, boxShadow: '0 2px 12px rgba(25,118,210,0.08)', marginTop: '3rem' }}>
            <div className="mb-2" style={{ fontSize: 32 }}>📦</div>
            <div className="mb-2">No tienes publicaciones aún.</div>
            <button className="btn btn-primary mt-2" style={{ borderRadius: 8, fontWeight: 600 }} onClick={handleNuevaPublicacion}>
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
                      <span style={{ color: '#1565c0', fontSize: '1.05em' }}>Precio actual: ${formatearMonto(pub.precioActual && pub.precioActual > 0 ? pub.precioActual : pub.precioInicial)}</span>
                      <span className="badge bg-warning text-dark ms-auto" style={{ fontSize: '0.90em' }}>{pub.ofertasTotales || 0} ofertas</span>
                    </div>
                    <div className="d-flex gap-2 mt-auto pt-2 border-top" style={{ borderColor: '#ececf3' }}>
                      {pub.estado === 'ACTIVO' && (
                        <button
                          className="btn d-flex align-items-center gap-1"
                          style={{
                            borderRadius: 8,
                            fontWeight: 600,
                            background: '#ff9800',
                            color: '#fff',
                            border: 'none',
                            fontSize: '0.98em',
                            padding: '0.38em 1em',
                            boxShadow: '0 1px 4px rgba(255,152,0,0.08)',
                            transition: 'background 0.18s',
                          }}
                          title="Cancelar"
                          onClick={() => handleCancelar(pub)}
                          onMouseOver={e => e.currentTarget.style.background = '#f57c00'}
                          onMouseOut={e => e.currentTarget.style.background = '#ff9800'}
                        >
                          <FaTimes /> Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Modal de cancelación */}
      {showCancelModal && publicacionACancelar && (
        <CancelarPublicacion
          publicacion={publicacionACancelar}
          onClose={() => {
            setShowCancelModal(false);
            setPublicacionACancelar(null);
          }}
          onCancelacionExitosa={handleCancelacionExitosa}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default MisPublicaciones;