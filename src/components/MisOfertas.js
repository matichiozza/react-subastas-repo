import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

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

const MisOfertas = () => {
  const { token, user } = useContext(AuthContext);
  const [ofertas, setOfertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMisOfertas = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('http://localhost:8080/ofertas/mis-ofertas', {
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
      return 'Ganadora';
    }
    
    return 'Activa';
  };

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Ganadora':
        return 'success';
      case 'Activa':
        return 'primary';
      case 'Finalizada':
        return 'secondary';
      default:
        return 'secondary';
    }
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
                <h2 className="mb-1">Mis Ofertas</h2>
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
                  💰
                </div>
                <h4 className="text-muted">No tienes ofertas</h4>
                <p className="text-muted">
                  Cuando hagas ofertas en publicaciones, aparecerán aquí.
                </p>
                <button 
                  className="btn btn-primary"
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
                      <div className="card h-100 shadow-sm" style={{ borderRadius: 12, border: 'none' }}>
                        {/* Imagen de la publicación */}
                        {oferta.publicacion.imagenes && oferta.publicacion.imagenes.length > 0 ? (
                          <div style={{ height: 200, overflow: 'hidden' }}>
                            <img 
                              src={`http://localhost:8080${oferta.publicacion.imagenes[0]}`} 
                              alt={oferta.publicacion.titulo}
                              className="w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div 
                            style={{ 
                              height: 200, 
                              backgroundColor: '#f8f9fa', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: '#ccc',
                              fontSize: '3rem'
                            }}
                          >
                            🖼️
                          </div>
                        )}
                        
                        <div className="card-body d-flex flex-column">
                          {/* Estado de la oferta */}
                          <div className="mb-2">
                            <span className={`badge bg-${colorEstado} fs-6`}>
                              {estado}
                            </span>
                          </div>
                          
                          {/* Título de la publicación */}
                          <h5 className="card-title mb-2" style={{ fontSize: '1.1rem' }}>
                            {oferta.publicacion.titulo}
                          </h5>
                          
                          {/* Información de la oferta */}
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted">Tu oferta:</span>
                              <span className="fw-bold text-primary fs-5">
                                ${formatearMonto(oferta.monto)}
                              </span>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="text-muted">Precio actual:</span>
                              <span className="fw-semibold">
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
                              <span className="badge bg-light text-dark">
                                {oferta.publicacion.categoria}
                              </span>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <small className="text-muted">Finaliza:</small>
                              <small className="text-muted">
                                {formatearFecha(oferta.publicacion.fechaFin)}
                              </small>
                            </div>
                            
                            {/* Botón para ver detalles */}
                            <button 
                              className="btn btn-outline-primary w-100"
                              onClick={() => navigate(`/publicaciones/${oferta.publicacion.id}`)}
                            >
                              Ver Publicación
                            </button>
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
      
      <Footer />
    </div>
  );
};

export default MisOfertas; 