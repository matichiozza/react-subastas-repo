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
  const [showFinalizarModal, setShowFinalizarModal] = useState(false);
  const [publicacionAFinalizar, setPublicacionAFinalizar] = useState(null);
  const [finalizando, setFinalizando] = useState(false);
  const [resultadoFinalizacion, setResultadoFinalizacion] = useState(null);

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
        socket = new WebSocket(`${API_BASE_URL.replace('http://', 'ws://')}/ws`);
        
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

  const handleFinalizar = (publicacion) => {
    setPublicacionAFinalizar(publicacion);
    setShowFinalizarModal(true);
    setResultadoFinalizacion(null);
  };

  const confirmarFinalizacion = async () => {
    if (!publicacionAFinalizar) return;
    
    setFinalizando(true);
    try {
      const res = await fetch(`${API_BASE_URL}/publicaciones/${publicacionAFinalizar.id}/finalizar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al finalizar la publicación');
      }
      
      const resultado = await res.json();
      setResultadoFinalizacion(resultado);
      
      // Actualizar la publicación en la lista
      setPublicaciones(prev => 
        prev.map(pub => 
          pub.id === publicacionAFinalizar.id 
            ? { ...pub, estado: resultado.publicacion.estado, ganador: resultado.publicacion.ganador }
            : pub
        )
      );
      
    } catch (err) {
      alert('Error: ' + err.message);
      setShowFinalizarModal(false);
      setPublicacionAFinalizar(null);
    } finally {
      setFinalizando(false);
    }
  };

  const cerrarModalFinalizacion = () => {
    setShowFinalizarModal(false);
    setPublicacionAFinalizar(null);
    setResultadoFinalizacion(null);
  };

  const abrirChat = (chatId) => {
    navigate(`/chat/${chatId}`);
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
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: 8 }}></i>Sanciones: {sancionesInfo.sancionesDisponibles}/{sancionesInfo.maximoSanciones}
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
                            <div className="mb-2" style={{ fontSize: 32 }}>
                  <i className="fas fa-box"></i>
                </div>
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
                      <span role="img" aria-label="sin imagen">
                  <i className="fas fa-image"></i>
                </span>
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
                        <>
                          <button
                            className="btn d-flex align-items-center gap-1"
                            style={{
                              borderRadius: 8,
                              fontWeight: 600,
                              background: '#4caf50',
                              color: '#fff',
                              border: 'none',
                              fontSize: '0.90em',
                              padding: '0.38em 0.8em',
                              boxShadow: '0 1px 4px rgba(76,175,80,0.08)',
                              transition: 'background 0.18s',
                              flex: 1
                            }}
                            title="Finalizar subasta"
                            onClick={() => handleFinalizar(pub)}
                            onMouseOver={e => e.currentTarget.style.background = '#45a049'}
                            onMouseOut={e => e.currentTarget.style.background = '#4caf50'}
                          >
                                                         <i className="fas fa-flag-checkered" style={{ marginRight: 8 }}></i>Finalizar
                          </button>
                          <button
                            className="btn d-flex align-items-center gap-1"
                            style={{
                              borderRadius: 8,
                              fontWeight: 600,
                              background: '#ff9800',
                              color: '#fff',
                              border: 'none',
                              fontSize: '0.90em',
                              padding: '0.38em 0.8em',
                              boxShadow: '0 1px 4px rgba(255,152,0,0.08)',
                              transition: 'background 0.18s',
                              flex: 1
                            }}
                            title="Cancelar"
                            onClick={() => handleCancelar(pub)}
                            onMouseOver={e => e.currentTarget.style.background = '#f57c00'}
                            onMouseOut={e => e.currentTarget.style.background = '#ff9800'}
                          >
                            <FaTimes /> Cancelar
                          </button>
                        </>
                      )}
                      {pub.estado === 'FINALIZADO' && pub.ganador && (
                        <button
                          className="btn d-flex align-items-center gap-1 w-100"
                          style={{
                            borderRadius: 8,
                            fontWeight: 600,
                            background: '#2196f3',
                            color: '#fff',
                            border: 'none',
                            fontSize: '0.95em',
                            padding: '0.45em 1em',
                            boxShadow: '0 1px 4px rgba(33,150,243,0.08)',
                            transition: 'background 0.18s',
                          }}
                          title="Chatear con ganador"
                          onClick={async () => {
                            try {
                              const res = await fetch(`${API_BASE_URL}/chats/publicacion/${pub.id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                              });
                              if (res.ok) {
                                const chat = await res.json();
                                navigate(`/chat/${chat.id}`);
                              } else {
                                alert('No se pudo acceder al chat');
                              }
                            } catch (err) {
                              alert('Error al abrir chat: ' + err.message);
                            }
                          }}
                          onMouseOver={e => e.currentTarget.style.background = '#1976d2'}
                          onMouseOut={e => e.currentTarget.style.background = '#2196f3'}
                        >
                          <i className="fas fa-comments" style={{ marginRight: 8 }}></i>Chat con ganador
                        </button>
                      )}
                      {pub.estado === 'FINALIZADO_SIN_OFERTAS' && (
                        <div className="w-100 text-center py-2" style={{ color: '#666', fontSize: '0.9em', fontStyle: 'italic' }}>
                          Finalizada sin ofertas
                        </div>
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

      {/* Modal de finalización */}
      {showFinalizarModal && publicacionAFinalizar && (
        <div className="modal-overlay" onClick={cerrarModalFinalizacion}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 600, width: '95vw' }}>
            {!resultadoFinalizacion ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                     <div style={{ fontSize: 48, marginBottom: 16 }}>
                     <i className="fas fa-flag-checkered"></i>
                   </div>
                  <h2 style={{ color: '#1976d2', fontWeight: 800, margin: 0 }}>Finalizar subasta</h2>
                  <p style={{ color: '#666', margin: '12px 0 0 0', fontSize: '1.05em' }}>
                    ¿Estás seguro de que quieres finalizar esta subasta?
                  </p>
                </div>
                
                <div className="alert alert-info" style={{ fontSize: '0.95em', border: '1px solid #bee5eb', background: '#d1ecf1' }}>
                  <div style={{ fontWeight: 600, color: '#0c5460', marginBottom: '8px' }}>
                    <i className="fas fa-clipboard-list" style={{ marginRight: 8 }}></i>Información de la subasta:
                  </div>
                  <div style={{ color: '#0c5460', fontSize: '0.9em' }}>
                    <div><strong>Producto:</strong> {publicacionAFinalizar.titulo}</div>
                    <div><strong>Ofertas totales:</strong> {publicacionAFinalizar.ofertasTotales || 0}</div>
                    <div><strong>Precio actual:</strong> ${formatearMonto(publicacionAFinalizar.precioActual || publicacionAFinalizar.precioInicial)}</div>
                    <div><strong>Fecha programada:</strong> {publicacionAFinalizar.fechaFin ? new Date(publicacionAFinalizar.fechaFin).toLocaleDateString() : 'Sin fecha'}</div>
                  </div>
                </div>

                <div className="alert alert-warning" style={{ fontSize: '0.95em', border: '1px solid #ffeaa7', background: '#fff3cd' }}>
                  <div style={{ fontWeight: 600, color: '#856404', marginBottom: '8px' }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: 8 }}></i>Al finalizar la subasta:
                  </div>
                  <div style={{ color: '#856404', fontSize: '0.9em' }}>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      <li>Se determinará automáticamente el ganador (mayor oferta)</li>
                      <li>Se creará un chat para coordinar la entrega</li>
                      <li>La subasta cambiará a estado "FINALIZADO"</li>
                      <li>Esta acción es <strong>irreversible</strong></li>
                    </ul>
                  </div>
                </div>
                
                <div className="modal-actions">
                  <button 
                    className="btn btn-success" 
                    onClick={confirmarFinalizacion}
                    disabled={finalizando}
                    style={{ minWidth: 120, fontWeight: 600 }}
                  >
                                         {finalizando ? 'Finalizando...' : 
                       <>
                         <i className="fas fa-flag-checkered" style={{ marginRight: 8 }}></i>Finalizar subasta
                       </>
                     }
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={cerrarModalFinalizacion}
                    disabled={finalizando}
                    style={{ minWidth: 120, marginLeft: 12 }}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>
                    {resultadoFinalizacion.ganador ? 
                  <i className="fas fa-trophy"></i> : 
                  <i className="fas fa-box"></i>
                }
                  </div>
                  <h2 style={{ color: '#4caf50', fontWeight: 800, margin: 0 }}>
                    {resultadoFinalizacion.ganador ? '¡Subasta finalizada!' : 'Subasta cerrada'}
                  </h2>
                  <p style={{ color: '#666', margin: '12px 0 0 0', fontSize: '1.05em' }}>
                    {resultadoFinalizacion.mensaje}
                  </p>
                </div>

                {resultadoFinalizacion.ganador ? (
                  <>
                    <div className="alert alert-success" style={{ fontSize: '0.95em', border: '1px solid #c3e6cb', background: '#d4edda' }}>
                      <div style={{ fontWeight: 600, color: '#155724', marginBottom: '12px' }}>
                                                 <i className="fas fa-trophy" style={{ marginRight: 8 }}></i>Ganador de la subasta:
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        {resultadoFinalizacion.ganador.fotoPerfil ? (
                          <img 
                            src={`${API_BASE_URL}${resultadoFinalizacion.ganador.fotoPerfil}`} 
                            alt="Ganador" 
                            style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24 }}>
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 600, color: '#155724' }}>{resultadoFinalizacion.ganador.nombre}</div>
                          <div style={{ color: '#155724', fontSize: '0.9em' }}>@{resultadoFinalizacion.ganador.username}</div>
                          <div style={{ color: '#155724', fontSize: '0.9em' }}>
                            {[resultadoFinalizacion.ganador.ciudad, resultadoFinalizacion.ganador.pais].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </div>
                      <div style={{ color: '#155724' }}>
                        <div><strong>Oferta ganadora:</strong> ${formatearMonto(resultadoFinalizacion.ofertaGanadora.monto)}</div>
                        <div><strong>Fecha de oferta:</strong> {new Date(resultadoFinalizacion.ofertaGanadora.fecha).toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="alert alert-info" style={{ fontSize: '0.95em', border: '1px solid #bee5eb', background: '#d1ecf1' }}>
                      <div style={{ fontWeight: 600, color: '#0c5460', marginBottom: '8px' }}>
                        <i className="fas fa-comments" style={{ marginRight: 8 }}></i>Próximos pasos:
                      </div>
                      <div style={{ color: '#0c5460', fontSize: '0.9em' }}>
                        <ul style={{ margin: 0, paddingLeft: 20 }}>
                          <li>Se ha creado un chat automáticamente para coordinar la entrega</li>
                          <li>Podrás contactar al ganador desde "Mis publicaciones"</li>
                          <li>Coordina el pago del resto y la entrega del producto</li>
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="alert alert-info" style={{ fontSize: '0.95em', border: '1px solid #bee5eb', background: '#d1ecf1' }}>
                    <div style={{ color: '#0c5460' }}>
                      La subasta ha sido cerrada sin ofertas. El producto no se ha vendido.
                    </div>
                  </div>
                )}
                
                <div className="modal-actions">
                  <button 
                    className="btn btn-primary" 
                    onClick={cerrarModalFinalizacion}
                    style={{ minWidth: 120, fontWeight: 600 }}
                  >
                    Entendido
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default MisPublicaciones;