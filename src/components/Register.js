import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icono personalizado para el marcador
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

// Componente auxiliar para centrar el mapa al cambiar lat/lng
function FlyToLocation({ lat, lng }) {
  const map = useMap();
  React.useEffect(() => {
    if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
      map.setView([parseFloat(lat), parseFloat(lng)], 15, { animate: true });
    }
  }, [lat, lng, map]);
  return null;
}

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    dni: '',
    direccion: '',
    latitud: '',
    longitud: ''
  });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [direccionQuery, setDireccionQuery] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [showSugerencias, setShowSugerencias] = useState(false);
  const [searching, setSearching] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const sugerenciasRef = useRef();
  const searchTimeoutRef = useRef();

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Formatear DNI con puntos cada 3 dígitos desde la derecha
    if (name === 'dni') {
      const numeros = value.replace(/\D/g, '').slice(0, 8);
      processedValue = numeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    setFormData({ ...formData, [name]: processedValue });
  };

  // Autocomplete de dirección optimizado con debounce
  const handleDireccionInput = async (e) => {
    const value = e.target.value;
    setDireccionQuery(value);
    setFormData({ ...formData, direccion: value });
    
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Reducir el mínimo de caracteres para mostrar sugerencias
    if (value.length < 3) {
      setSugerencias([]);
      setShowSugerencias(false);
      return;
    }
    
    // Mostrar sugerencias inmediatamente si ya tenemos datos similares
    if (sugerencias.length > 0 && value.length >= 3) {
      setShowSugerencias(true);
    }
    
    // Debounce: esperar 300ms antes de hacer la búsqueda
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5&countrycodes=ar&bounded=1`);
        const data = await res.json();
        setSugerencias(data);
        setShowSugerencias(true);
      } catch {
        setSugerencias([]);
        setShowSugerencias(false);
      } finally {
        setSearching(false);
      }
    }, 300);
  };

  const handleSugerenciaClick = (sug) => {
    setFormData({
      ...formData,
      direccion: sug.display_name,
      latitud: sug.lat,
      longitud: sug.lon,
    });
    setDireccionQuery(sug.display_name);
    setSugerencias([]);
    setShowSugerencias(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Remover puntos del DNI antes de enviar
    const dataToSend = {
      ...formData,
      dni: formData.dni.replace(/\./g, '')
    };
    const success = await register(dataToSend);
    if (success) {
      navigate('/');
    } else {
      setError('No se pudo registrar. Intente con otro usuario o correo.');
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && formData.username && formData.password) {
      setCurrentStep(2);
    } else if (currentStep === 2 && formData.nombre && formData.dni) {
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.username && formData.password;
    if (currentStep === 2) return formData.nombre && formData.dni;
    return true;
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #90caf9 100%)',
      minHeight: '100vh',
      padding: '20px 0'
    }}>
      {/* Header decorativo */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '30px',
        color: 'white'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          <i className="fas fa-user-plus"></i>
        </div>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '700', 
          margin: '0',
          textShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}>
          ¡Únete a SubastasCorp!
        </h1>
        <p style={{ 
          fontSize: '1.1rem', 
          opacity: '0.9',
          margin: '10px 0 0 0'
        }}>
          Crea tu cuenta y comienza a subastar
        </p>
      </div>

      <div className="container d-flex align-items-center justify-content-center">
        <div className="card shadow-lg" style={{ 
          maxWidth: 600, 
          width: '100%',
          borderRadius: '24px',
          border: 'none',
          overflow: 'hidden',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}>
          {/* Indicador de progreso */}
          <div style={{ 
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
            padding: '20px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
              {[1, 2, 3].map((step) => (
                                 <div key={step} style={{
                   width: '40px',
                   height: '40px',
                   borderRadius: '50%',
                   background: currentStep >= step ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                   color: currentStep >= step ? '#1976d2' : 'rgba(255,255,255,0.7)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontWeight: 'bold',
                   fontSize: '18px',
                   transition: 'all 0.3s ease'
                 }}>
                  {currentStep > step ? <i className="fas fa-check"></i> : step}
                </div>
              ))}
            </div>
            <div style={{ fontSize: '16px', opacity: '0.9', fontWeight: '500' }}>
              {currentStep === 1 && 'Paso 1 de 3'}
              {currentStep === 2 && 'Paso 2 de 3'}
              {currentStep === 3 && 'Paso 3 de 3'}
            </div>
          </div>

          <div className="card-body p-4">
            <form onSubmit={handleSubmit}>
                             {/* Paso 1: Cuenta de usuario */}
               {currentStep === 1 && (
                 <div style={{ textAlign: 'center' }}>
                   <h3 style={{ color: '#1976d2', marginBottom: '30px', fontWeight: '600', fontSize: '28px' }}>
                     Crea tu cuenta de usuario
                   </h3>
                  <div className="row g-3">
                    <div className="col-12">
                                           <div className="input-group" style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                       <span className="input-group-text" style={{ background: '#1976d2', border: 'none', color: 'white' }}>
                         <i className="fas fa-user"></i>
                       </span>
                        <input 
                          type="text" 
                          name="username" 
                          className="form-control border-0" 
                          placeholder="Nombre de usuario"
                          value={formData.username} 
                          onChange={handleChange} 
                          required 
                          style={{ padding: '15px', fontSize: '16px' }}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                                           <div className="input-group" style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                       <span className="input-group-text" style={{ background: '#1976d2', border: 'none', color: 'white' }}>
                         <i className="fas fa-lock"></i>
                         </span>
                        <input 
                          type="password" 
                          name="password" 
                          className="form-control border-0" 
                          placeholder="Contraseña"
                          value={formData.password} 
                          onChange={handleChange} 
                          required 
                          style={{ padding: '15px', fontSize: '16px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

                             {/* Paso 2: Información personal */}
               {currentStep === 2 && (
                 <div style={{ textAlign: 'center' }}>
                   <h3 style={{ color: '#1976d2', marginBottom: '30px', fontWeight: '600', fontSize: '28px' }}>
                     Información personal
                   </h3>
                  <div className="row g-3">
                    <div className="col-12">
                                           <div className="input-group" style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                       <span className="input-group-text" style={{ background: '#1976d2', border: 'none', color: 'white' }}>
                         <i className="fas fa-user-circle"></i>
                       </span>
                        <input 
                          type="text" 
                          name="nombre" 
                          className="form-control border-0" 
                          placeholder="Nombre completo"
                          value={formData.nombre} 
                          onChange={handleChange} 
                          required 
                          style={{ padding: '15px', fontSize: '16px' }}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                                           <div className="input-group" style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                       <span className="input-group-text" style={{ background: '#1976d2', border: 'none', color: 'white' }}>
                         <i className="fas fa-id-badge"></i>
                       </span>
                        <input 
                          type="text" 
                          name="dni" 
                          className="form-control border-0" 
                          placeholder="DNI (solo números)"
                          value={formData.dni} 
                          onChange={handleChange} 
                          style={{ padding: '15px', fontSize: '16px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

                             {/* Paso 3: Ubicación */}
               {currentStep === 3 && (
                 <div style={{ textAlign: 'center' }}>
                   <h3 style={{ color: '#1976d2', marginBottom: '30px', fontWeight: '600', fontSize: '28px' }}>
                     ¿Dónde te encuentras?
                   </h3>
                  <div className="row g-3">
                    <div className="col-12 position-relative">
                                           <div className="input-group" style={{ borderRadius: '15px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                       <span className="input-group-text" style={{ background: '#1976d2', border: 'none', color: 'white' }}>
                         <i className="fas fa-search"></i>
                       </span>
                        <input
                          className="form-control border-0"
                          name="direccion"
                          type="text"
                          placeholder="Busca tu dirección..."
                          value={direccionQuery || formData.direccion}
                          onChange={handleDireccionInput}
                          required
                          style={{ padding: '15px', fontSize: '16px' }}
                          autoComplete="off"
                          onFocus={() => { if (sugerencias.length > 0) setShowSugerencias(true); }}
                          onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}
                        />
                      </div>
                      {showSugerencias && (
                        <ul className="list-group position-absolute w-100" style={{ 
                          zIndex: 2000, 
                          top: '100%', 
                          left: 0, 
                          maxHeight: 180, 
                          overflowY: 'auto',
                          borderRadius: '15px',
                          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                          border: 'none'
                        }} ref={sugerenciasRef}>
                          {searching ? (
                            <li className="list-group-item list-group-item-action" style={{ border: 'none' }}>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Buscando direcciones...
                            </li>
                          ) : sugerencias.length > 0 ? (
                            sugerencias.map(sug => (
                              <li
                                key={sug.place_id}
                                className="list-group-item list-group-item-action"
                                style={{ 
                                  cursor: 'pointer', 
                                  fontSize: '0.98em',
                                  border: 'none',
                                  borderBottom: '1px solid #f0f0f0'
                                }}
                                onMouseDown={() => handleSugerenciaClick(sug)}
                              >
                                {sug.display_name}
                              </li>
                            ))
                          ) : direccionQuery.length >= 3 && (
                            <li className="list-group-item list-group-item-action" style={{ border: 'none' }}>
                              No se encontraron direcciones
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                    
                    {/* Mapa con marcador si hay lat/lng */}
                    {formData.latitud && formData.longitud && !isNaN(Number(formData.latitud)) && !isNaN(Number(formData.longitud)) && (
                      <div className="col-12">
                                                 <div style={{ 
                           borderRadius: '20px', 
                           overflow: 'hidden',
                           boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                           border: '3px solid #1976d2'
                         }}>
                          <MapContainer
                            center={[parseFloat(formData.latitud), parseFloat(formData.longitud)]}
                            zoom={15}
                            scrollWheelZoom={false}
                            style={{ height: 300, width: '100%' }}
                            dragging={true}
                            doubleClickZoom={false}
                            attributionControl={false}
                          >
                            <FlyToLocation lat={formData.latitud} lng={formData.longitud} />
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution="&copy; OpenStreetMap contributors"
                            />
                            <Marker position={[parseFloat(formData.latitud), parseFloat(formData.longitud)]} icon={markerIcon} />
                          </MapContainer>
                        </div>
                        <div style={{ 
                          marginTop: '15px', 
                          padding: '10px', 
                          background: '#e3f2fd', 
                          borderRadius: '10px',
                          color: '#1976d2',
                          fontSize: '14px'
                        }}>
                          <i className="fas fa-check-circle me-2"></i>
                          Ubicación confirmada
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botones de navegación */}
              <div className="d-flex justify-content-between mt-4">
                {currentStep > 1 && (
                                                        <button 
                     type="button" 
                     onClick={prevStep}
                     className="btn btn-outline-secondary" 
                     style={{ 
                       borderRadius: '15px', 
                       padding: '12px 25px',
                       border: '2px solid white',
                       color: 'white',
                       fontWeight: '600'
                     }}
                   >
                     <i className="fas fa-arrow-left me-2"></i>
                     Anterior
                   </button>
                )}
                
                {currentStep < 3 ? (
                                     <button 
                     type="button" 
                     onClick={nextStep}
                     disabled={!canProceed()}
                     className="btn" 
                     style={{ 
                       borderRadius: '15px', 
                       padding: '12px 30px',
                       background: canProceed() ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)' : '#ccc',
                       border: 'none',
                       color: 'white',
                       fontWeight: '600',
                       marginLeft: 'auto'
                     }}
                   >
                    Siguiente
                    <i className="fas fa-arrow-right ms-2"></i>
                  </button>
                ) : (
                                     <button 
                     type="submit" 
                     className="btn" 
                     style={{ 
                       borderRadius: '15px', 
                       padding: '15px 40px',
                       background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                       border: 'none',
                       color: 'white',
                       fontWeight: '700',
                       fontSize: '18px',
                       marginLeft: 'auto',
                       boxShadow: '0 4px 15px rgba(25, 118, 210, 0.4)'
                     }}
                   >
                    <i className="fas fa-rocket me-2"></i>
                    ¡Crear cuenta!
                  </button>
                )}
              </div>

              {error && (
                <div className="alert alert-danger mt-3" style={{ 
                  borderRadius: '15px', 
                  border: 'none',
                  background: '#ffebee',
                  color: '#c62828'
                }}>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;