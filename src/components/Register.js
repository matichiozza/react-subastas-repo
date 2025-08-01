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

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100" style={{ background: '#f7f8fa' }}>
      <div className="card shadow p-4 w-100" style={{ maxWidth: 540, borderRadius: 18 }}>
        <h2 className="text-center mb-4" style={{ color: '#1976d2', fontWeight: 700 }}>Registro de Usuario</h2>
        <form onSubmit={handleSubmit}>
          <div className="row g-3 mb-2">
            <div className="col-12">
              <label className="form-label fw-bold">Usuario</label>
              <input 
                type="text" 
                name="username" 
                className="form-control" 
                value={formData.username} 
                onChange={handleChange} 
                required 
                style={{ background: '#f7f8fa' }}
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-bold">Contraseña</label>
              <input 
                type="password" 
                name="password" 
                className="form-control" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                style={{ background: '#f7f8fa' }}
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-bold">Nombre Completo</label>
              <input 
                type="text" 
                name="nombre" 
                className="form-control" 
                value={formData.nombre} 
                onChange={handleChange} 
                required 
                style={{ background: '#f7f8fa' }}
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-bold">DNI</label>
              <input 
                type="text" 
                name="dni" 
                className="form-control" 
                value={formData.dni} 
                onChange={handleChange} 
                style={{ background: '#f7f8fa' }}
              />
            </div>
            {/* Campo de dirección con autocomplete optimizado */}
            <div className="col-12 position-relative mb-3">
              <label className="form-label fw-bold">Dirección</label>
              <input
                className="form-control"
                name="direccion"
                type="text"
                value={direccionQuery || formData.direccion}
                onChange={handleDireccionInput}
                required
                style={{ background: '#f7f8fa' }}
                autoComplete="off"
                onFocus={() => { if (sugerencias.length > 0) setShowSugerencias(true); }}
                onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}
              />
              {showSugerencias && (
                <ul className="list-group position-absolute w-100" style={{ zIndex: 2000, top: '100%', left: 0, maxHeight: 180, overflowY: 'auto' }} ref={sugerenciasRef}>
                  {searching ? (
                    <li className="list-group-item list-group-item-action">
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Buscando direcciones...
                    </li>
                  ) : sugerencias.length > 0 ? (
                    sugerencias.map(sug => (
                      <li
                        key={sug.place_id}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: 'pointer', fontSize: '0.98em' }}
                        onMouseDown={() => handleSugerenciaClick(sug)}
                      >
                        {sug.display_name}
                      </li>
                    ))
                  ) : direccionQuery.length >= 3 && (
                    <li className="list-group-item list-group-item-action">
                      No se encontraron direcciones
                    </li>
                  )}
                </ul>
              )}
            </div>
            {/* Mapa con marcador si hay lat/lng */}
            {formData.latitud && formData.longitud && !isNaN(Number(formData.latitud)) && !isNaN(Number(formData.longitud)) && (
              <div className="col-12 mb-3">
                <MapContainer
                  center={[parseFloat(formData.latitud), parseFloat(formData.longitud)]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: 260, width: '100%', borderRadius: 14, boxShadow: '0 2px 12px rgba(25,118,210,0.08)' }}
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
            )}
          </div>
          {error && <div className="alert alert-danger mt-2 py-2">{error}</div>}
          <button type="submit" className="btn btn-primary w-100 mt-3" style={{ borderRadius: 10, fontWeight: 600, fontSize: '1.08em', padding: '0.7em 0' }}>
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;