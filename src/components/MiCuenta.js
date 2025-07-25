import React, { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

// Icono personalizado para el marcador
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

const campos = [
  { label: 'Nombre', name: 'nombre', type: 'text', required: true },
  { label: 'Dirección', name: 'direccion', type: 'text' },
  { label: 'Ciudad', name: 'ciudad', type: 'text' },
  { label: 'Código Postal', name: 'codigoPostal', type: 'text' },
  { label: 'País', name: 'pais', type: 'text' },
];

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

const MiCuenta = () => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState(user ? {
    nombre: user.nombre || '',
    direccion: user.direccion || '',
    ciudad: user.ciudad || '',
    codigoPostal: user.codigoPostal || '',
    pais: user.pais || '',
    latitud: user.latitud || '',
    longitud: user.longitud || '',
  } : {});
  const [fotoPreview, setFotoPreview] = useState(user?.fotoPerfil ? `http://localhost:8080${user.fotoPerfil}` : null);
  const [fotoFile, setFotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef();
  const [direccionQuery, setDireccionQuery] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [showSugerencias, setShowSugerencias] = useState(false);
  const sugerenciasRef = useRef();

  React.useEffect(() => {
    if (user === null) return; // Espera a que el contexto se inicialice
    if (!user || !user.username) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Actualiza el formulario cuando user cambia y tiene datos completos
  React.useEffect(() => {
    if (user && user.nombre !== undefined) {
      setForm({
        nombre: user.nombre || '',
        direccion: user.direccion || '',
        ciudad: user.ciudad || '',
        codigoPostal: user.codigoPostal || '',
        pais: user.pais || '',
        latitud: user.latitud || '',
        longitud: user.longitud || '',
      });
      setDireccionQuery(user.direccion || '');
    }
  }, [user]);

  // Actualiza la foto de perfil cuando user cambia y no hay una foto seleccionada manualmente
  React.useEffect(() => {
    if (user && user.fotoPerfil && !fotoFile) {
      setFotoPreview(`http://localhost:8080${user.fotoPerfil}`);
    }
    if (user && !user.fotoPerfil && !fotoFile) {
      setFotoPreview(null);
    }
  }, [user, fotoFile]);

  // Si el usuario aún no está cargado completamente, muestra loader
  if (!user || !user.username || typeof user.nombre === 'undefined') {
    return <div className="container d-flex align-items-center justify-content-center min-vh-100"><div className="card p-4 w-100 text-center" style={{ maxWidth: 400 }}>Cargando datos...</div></div>;
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
    setError(null);
  };

  const handleFotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
      setSuccess(false);
      setError(null);
    }
  };

  const handleFotoUpload = async () => {
    if (!fotoFile) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('fotoPerfil', fotoFile);
      const res = await fetch('http://localhost:8080/usuarios/foto-perfil', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error('Error al subir la foto');
      setSuccess(true);
      setFotoFile(null);
    } catch (err) {
      setError('No se pudo subir la foto.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch('http://localhost:8080/usuarios/mis-datos', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Error al guardar los datos');
      setSuccess(true);
    } catch (err) {
      setError('No se pudo guardar los datos.');
    } finally {
      setLoading(false);
    }
  };

  // Autocomplete de dirección con Nominatim
  const handleDireccionInput = async (e) => {
    const value = e.target.value;
    setDireccionQuery(value);
    setForm({ ...form, direccion: value });
    setSuccess(false);
    setError(null);
    if (value.length < 4) {
      setSugerencias([]);
      setShowSugerencias(false);
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&addressdetails=1&limit=5`);
      const data = await res.json();
      setSugerencias(data);
      setShowSugerencias(true);
    } catch {
      setSugerencias([]);
      setShowSugerencias(false);
    }
  };

  const handleSugerenciaClick = (sug) => {
    setForm({
      ...form,
      direccion: sug.display_name,
      ciudad: sug.address.city || sug.address.town || sug.address.village || '',
      codigoPostal: sug.address.postcode || '',
      pais: sug.address.country || '',
      latitud: sug.lat,
      longitud: sug.lon,
    });
    setDireccionQuery(sug.display_name);
    setSugerencias([]);
    setShowSugerencias(false);
  };

  return (
    <div className="container d-flex align-items-center justify-content-center min-vh-100" style={{ background: '#f7f8fa' }}>
      <div className="card shadow p-4 w-100" style={{ maxWidth: 540, borderRadius: 18 }}>
        <h2 className="text-center mb-4" style={{ color: '#1976d2', fontWeight: 700 }}>Mis datos personales</h2>
        <div className="d-flex flex-column align-items-center mb-4">
          <div style={{ position: 'relative', width: 110, height: 110, marginBottom: 10 }}>
            <img
              src={fotoPreview || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.nombre || user.username)}
              alt="Foto de perfil"
              style={{ width: 110, height: 110, borderRadius: '50%', objectFit: 'cover', border: '3px solid #ececf3', background: '#f7f8fa' }}
            />
            <button
              type="button"
              className="btn btn-light"
              style={{ position: 'absolute', bottom: 0, right: 0, borderRadius: '50%', border: '2px solid #1976d2', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(25,118,210,0.10)', color: '#1976d2', fontSize: 18, background: '#fff' }}
              onClick={() => fileInputRef.current.click()}
              tabIndex={0}
              aria-label="Cambiar foto de perfil"
            >
              <span role="img" aria-label="cambiar foto">📷</span>
            </button>
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFotoChange}
              disabled={loading}
            />
          </div>
          {fotoFile && (
            <button className="btn btn-primary btn-sm mt-2" style={{ borderRadius: 8, fontWeight: 600 }} onClick={handleFotoUpload} disabled={loading}>
              {loading ? 'Subiendo...' : 'Guardar foto'}
            </button>
          )}
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className="row g-3 mb-2">
            <div className="col-12">
              <label className="form-label fw-bold">Usuario</label>
              <input className="form-control" value={user.username} disabled style={{ background: '#f7f8fa', color: '#888' }} />
            </div>
            {/* Campo de nombre editable */}
            <div className="col-12">
              <label className="form-label fw-bold">Nombre</label>
              <input
                className="form-control"
                name="nombre"
                type="text"
                value={form.nombre}
                onChange={handleChange}
                required
                style={{ background: '#f7f8fa' }}
                autoComplete="off"
              />
            </div>
            {/* Campo de dirección con autocomplete */}
            <div className="col-12 position-relative mb-3">
              <label className="form-label fw-bold">Dirección</label>
              <input
                className="form-control"
                name="direccion"
                type="text"
                value={direccionQuery || form.direccion}
                onChange={handleDireccionInput}
                required
                style={{ background: '#f7f8fa' }}
                autoComplete="off"
                onFocus={() => { if (sugerencias.length > 0) setShowSugerencias(true); }}
                onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}
              />
              {showSugerencias && sugerencias.length > 0 && (
                <ul className="list-group position-absolute w-100" style={{ zIndex: 2000, top: '100%', left: 0, maxHeight: 180, overflowY: 'auto' }} ref={sugerenciasRef}>
                  {sugerencias.map(sug => (
                    <li
                      key={sug.place_id}
                      className="list-group-item list-group-item-action"
                      style={{ cursor: 'pointer', fontSize: '0.98em' }}
                      onMouseDown={() => handleSugerenciaClick(sug)}
                    >
                      {sug.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Mapa con marcador si hay lat/lng */}
            {form.latitud && form.longitud && !isNaN(Number(form.latitud)) && !isNaN(Number(form.longitud)) && (
              <div className="col-12 mb-3">
                <MapContainer
                  center={[parseFloat(form.latitud), parseFloat(form.longitud)]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: 260, width: '100%', borderRadius: 14, boxShadow: '0 2px 12px rgba(25,118,210,0.08)' }}
                  dragging={true}
                  doubleClickZoom={false}
                  attributionControl={false}
                >
                  <FlyToLocation lat={form.latitud} lng={form.longitud} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker position={[parseFloat(form.latitud), parseFloat(form.longitud)]} icon={markerIcon} />
                </MapContainer>
              </div>
            )}
          </div>
          {error && <div className="alert alert-danger mt-2 py-2">{error}</div>}
          {success && <div className="alert alert-success mt-2 py-2">¡Datos guardados!</div>}
          <button type="submit" className="btn btn-primary w-100 mt-3" style={{ borderRadius: 10, fontWeight: 600, fontSize: '1.08em', padding: '0.7em 0' }} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MiCuenta;
