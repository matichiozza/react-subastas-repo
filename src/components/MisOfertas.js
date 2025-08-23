import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import API_BASE_URL from '../config/api';

// Función para formatear montos con separadores de miles
function formatearMonto(valor) {
  if (!valor) return '0';
  return parseFloat(valor).toLocaleString('es-AR');
}

// Función para formatear fechas
function formatearFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Función para calcular la seña pagada
function calcularSenaPagada(montoOferta) {
  return parseFloat(montoOferta || 0) * 0.10;
}

const MisOfertas = () => {
  const { token, user } = useContext(AuthContext);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Estados para el modal de pago
  const [showModalPago, setShowModalPago] = useState(false);
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null);

  useEffect(() => {
    const fetchMisOfertas = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/ofertas/mis-ofertas`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            navigate('/login');
            return;
          }
          throw new Error('Error al cargar las ofertas');
        }
        
        const data = await res.json();
        setOfertas(data);
      } catch (error) {
        console.error('Error:', error);
        setOfertas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMisOfertas();
  }, [token, navigate]);

  const getEstadoOferta = (oferta) => {
    const ahora = new Date();
    const fechaFin = new Date(oferta.publicacion.fechaFin);
    
    if (fechaFin < ahora) {
      return 'Finalizada';
    }
    
    if (oferta.publicacion.precioActual === oferta.monto) {
      return 'Mayor oferta';
    }
    
    return 'Activa';
  };

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Mayor oferta':
        return { bg: '#28a745', text: 'white' };
      case 'Activa':
        return { bg: '#007bff', text: 'white' };
      case 'Finalizada':
        return { bg: '#6c757d', text: 'white' };
      default:
        return { bg: '#6c757d', text: 'white' };
    }
  };

  const handleVerPago = (oferta) => {
    setOfertaSeleccionada(oferta);
    setShowModalPago(true);
  };

  const handleCloseModalPago = () => {
    setShowModalPago(false);
    setOfertaSeleccionada(null);
  };

  if (loading) {
    return (
      <div className="container py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Cargando tus ofertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="mb-1 fw-bold" style={{ color: '#2c3e50' }}>Mis Ofertas</h2>
                <p className="text-muted mb-0">
                  {ofertas.length === 0 
                    ? 'No tienes ofertas realizadas'
                    : `Tienes ${ofertas.length} oferta${ofertas.length !== 1 ? 's' : ''}`
                  }
                </p>
              </div>
            </div>

            {ofertas.length === 0 ? (
              <div className="text-center py-5">
                <div style={{ fontSize: '4rem', color: '#ccc', marginBottom: '1rem' }}>
                  <i className="fas fa-coins"></i>
                </div>
                <h4 className="text-muted">No tienes ofertas</h4>
                <p className="text-muted">
                  Cuando hagas ofertas en publicaciones, aparecerán aquí.
                </p>
                <button 
                  className="btn btn-primary px-4 py-2"
                  onClick={() => navigate('/publicaciones')}
                >
                  Ver Publicaciones
                </button>
              </div>
            ) : (
              <div className="row g-4">
                {ofertas.map((oferta) => {
                  const estado = getEstadoOferta(oferta);
                  const colorEstado = getColorEstado(estado);
                  
                  return (
                    <div key={oferta.id} className="col-12 col-md-6 col-lg-4">
                      <div 
                        className="card h-100"
                        style={{ 
                          borderRadius: '12px', 
                          border: 'none',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          overflow: 'hidden'
                        }}
                      >
                        {/* Imagen de la publicación */}
                        {oferta.publicacion.imagenes && oferta.publicacion.imagenes.length > 0 ? (
                          <div style={{ height: 180, overflow: 'hidden', position: 'relative' }}>
                            <img 
                              src={`http://localhost:8080${oferta.publicacion.imagenes[0]}`} 
                              alt={oferta.publicacion.titulo}
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                            {/* Overlay con estado */}
                            <div 
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: colorEstado.bg,
                                color: colorEstado.text,
                                padding: '6px 12px',
                                borderRadius: '15px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}
                            >
                              {estado}
                            </div>
                          </div>
                        ) : (
                          <div 
                            style={{ 
                              height: 180, 
                              backgroundColor: '#f8f9fa', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: '#adb5bd',
                              fontSize: '3rem',
                              position: 'relative'
                            }}
                          >
                            <i className="fas fa-image"></i>
                            <div 
                              style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: colorEstado.bg,
                                color: colorEstado.text,
                                padding: '6px 12px',
                                borderRadius: '15px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}
                            >
                              {estado}
                            </div>
                          </div>
                        )}
                        
                        <div className="card-body d-flex flex-column p-3">
                          {/* Título de la publicación */}
                          <h5 className="card-title mb-3 fw-bold" style={{ 
                            fontSize: '1.1rem',
                            color: '#2c3e50',
                            lineHeight: '1.3'
                          }}>
                            {oferta.publicacion.titulo}
                          </h5>
                          
                          {/* Información de la oferta */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2 p-2" style={{
                              backgroundColor: '#e3f2fd',
                              borderRadius: '8px',
                              border: '1px solid #bbdefb'
                            }}>
                              <span className="text-muted fw-semibold">Tu oferta:  </span>
                              <span className="fw-bold" style={{ 
                                fontSize: '1.2rem',
                                color: '#1976d2'
                              }}>
                                ${formatearMonto(oferta.monto)}
                              </span>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted">Precio actual:</span>
                              <span className="fw-semibold" style={{ color: '#2c3e50' }}>
                                ${formatearMonto(oferta.publicacion.precioActual || oferta.publicacion.precioInicial)}
                              </span>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="text-muted">Fecha de oferta:</span>
                              <small className="text-muted">
                                {formatearFecha(oferta.fecha)}
                              </small>
                            </div>
                          </div>
                          
                          {/* Información de la publicación */}
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">Categoría:</small>
                              <span className="badge bg-secondary text-white" style={{
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '0.75rem'
                              }}>
                                {oferta.publicacion.categoria}
                              </span>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <small className="text-muted">Finaliza:</small>
                              <small className="text-muted">
                                {formatearFecha(oferta.publicacion.fechaFin)}
                              </small>
                            </div>
                            
                            {/* Indicador si ganó la subasta */}
                            {oferta.publicacion?.estado === 'FINALIZADO' && oferta.publicacion?.ganador?.id === user?.id && (
                              <div className="mb-3">
                                <div className="alert alert-success py-2 px-3 mb-0" style={{ fontSize: '0.85em', border: '1px solid #c3e6cb', background: '#d4edda' }}>
                                  <div style={{ fontWeight: 600, color: '#155724', marginBottom: '4px' }}>
                                    <i className="fas fa-trophy" style={{ marginRight: 8 }}></i>¡Ganaste esta subasta!
                                  </div>
                                  <div style={{ color: '#155724', fontSize: '0.8em', marginBottom: '8px' }}>
                                    Precio final: ${formatearMonto(oferta.publicacion.precioActual)}
                                  </div>
                                  <button
                                    className="btn btn-primary btn-sm w-100"
                                    style={{ fontSize: '0.75em', padding: '0.25rem 0.75rem', borderRadius: 6 }}
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`${API_BASE_URL}/chats/publicacion/${oferta.publicacion.id}`, {
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
                                  >
                                    <i className="fas fa-comments" style={{ marginRight: 8 }}></i>Chat con vendedor
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {/* Botones */}
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-primary flex-fill py-2"
                                style={{
                                  borderRadius: '8px',
                                  fontWeight: '600',
                                  fontSize: '0.9rem'
                                }}
                                onClick={() => navigate(`/publicaciones/${oferta.publicacion.id}`)}
                              >
                                Ver Publicación
                              </button>
                              <button 
                                className="btn btn-primary py-2"
                                style={{
                                  borderRadius: '8px',
                                  fontWeight: '600',
                                  fontSize: '0.9rem',
                                  minWidth: '80px'
                                }}
                                onClick={() => handleVerPago(oferta)}
                              >
                                Ver Pago
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Pago */}
      {showModalPago && ofertaSeleccionada && (
        <div 
          className="modal-overlay" 
          onClick={handleCloseModalPago}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050
          }}
        >
          <div 
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '500px',
              width: '90vw',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="mb-0 fw-bold" style={{ color: '#2c3e50' }}>Desglose de Pago</h3>
            </div>

            {/* Información de la publicación */}
            <div className="mb-4 p-3" style={{
              backgroundColor: '#f8f9fa',
              borderRadius: '12px',
              border: '1px solid #e9ecef'
            }}>
              <h6 className="fw-bold mb-2" style={{ color: '#2c3e50' }}>
                {ofertaSeleccionada.publicacion.titulo}
              </h6>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Tu oferta:</span>
                <span className="fw-bold fs-5" style={{ color: '#1976d2' }}>
                  ${formatearMonto(ofertaSeleccionada.monto)}
                </span>
              </div>
            </div>

            {/* Desglose de pago */}
            <div className="mb-4">
              <h6 className="fw-bold mb-3" style={{ color: '#2c3e50' }}>Detalle del pago realizado:</h6>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500, marginBottom: '12px' }}>
                <span>Monto ofertado:</span>
                <span>${formatearMonto(ofertaSeleccionada.monto)}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b26a00', fontWeight: 500, marginBottom: '12px' }}>
                <span>Seña pagada (10%):</span>
                <span>${formatearMonto(calcularSenaPagada(ofertaSeleccionada.monto).toFixed(2))}</span>
              </div>
              
              <div style={{ 
                borderTop: '1.5px solid #ececf3', 
                margin: '16px 0 0 0', 
                paddingTop: '12px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontWeight: 700, 
                color: '#28a745',
                fontSize: '1.1rem'
              }}>
                <span>Resto a pagar si ganas:</span>                <span>${formatearMonto((parseFloat(ofertaSeleccionada.monto) * 0.90).toFixed(2))}</span>
              </div>
            </div>

            {/* Información adicional */}
            <div className="p-3" style={{
              backgroundColor: '#e3f2fd',
              borderRadius: '12px',
              border: '1px solid #bbdefb'
            }}>
              <div className="d-flex align-items-start mb-2">
                <div>
                  <div className="fw-semibold mb-1" style={{ color: '#1976d2' }}>Información importante:</div>
                  <div style={{ fontSize: '0.95rem', color: '#2c3e50' }}>
                    • Ya pagaste la seña del 10% de tu oferta<br/>
                    • Si ganas la subasta, coordinarás el pago del 90% restante con el vendedor<br/>
                    • La seña es no reembolsable si ganas la subasta
                  </div>
                </div>
              </div>
            </div>

            {/* Botón de cerrar */}
            <div className="text-center mt-4">
              <button 
                className="btn btn-primary px-4 py-2"
                onClick={handleCloseModalPago}
                style={{
                  borderRadius: '8px',
                  fontWeight: '600'
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default MisOfertas; 