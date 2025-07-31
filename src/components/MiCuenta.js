import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

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
  const [tarjetas, setTarjetas] = useState([]);
  const [loadingTarjetas, setLoadingTarjetas] = useState(false);
  const [errorTarjetas, setErrorTarjetas] = useState(null);
  const [showModalTarjeta, setShowModalTarjeta] = useState(false);
  const [formTarjeta, setFormTarjeta] = useState({
    nombreCompleto: '',
    numero: '',
    fechaVencimiento: '',
    codigoSeguridad: '',
    dniTitular: ''
  });
  const [erroresTarjeta, setErroresTarjeta] = useState({});
  const [loadingTarjeta, setLoadingTarjeta] = useState(false);
  const [successTarjeta, setSuccessTarjeta] = useState(false);
  const [tarjetaActiva, setTarjetaActiva] = useState(0);

  // Validaciones
  const validarTarjeta = () => {
    const errores = {};
    
    // Nombre completo
    if (!formTarjeta.nombreCompleto.trim()) {
      errores.nombreCompleto = 'El nombre completo es requerido';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(formTarjeta.nombreCompleto)) {
      errores.nombreCompleto = 'Solo se permiten letras y espacios';
    }
    
    // Número de tarjeta
    if (!formTarjeta.numero.trim()) {
      errores.numero = 'El número de tarjeta es requerido';
    } else if (!/^\d{16}$/.test(formTarjeta.numero.replace(/\s/g, ''))) {
      errores.numero = 'Debe tener exactamente 16 dígitos';
    }
    
    // Fecha de vencimiento
    if (!formTarjeta.fechaVencimiento.trim()) {
      errores.fechaVencimiento = 'La fecha de vencimiento es requerida';
    } else {
      const fecha = formTarjeta.fechaVencimiento;
      const formato = /^(0[1-9]|1[0-2])\/\d{2}$/.test(fecha);
      if (!formato) {
        errores.fechaVencimiento = 'Formato: MM/AA (ej: 04/27)';
      } else {
        const [mes, año] = fecha.split('/');
        const mesNum = parseInt(mes);
        const añoNum = parseInt(año);
        const añoActual = new Date().getFullYear() % 100; // Solo los últimos 2 dígitos
        
        if (mesNum < 1 || mesNum > 12) {
          errores.fechaVencimiento = 'Mes inválido';
        } else if (añoNum < añoActual) {
          errores.fechaVencimiento = 'La tarjeta ya venció';
        }
      }
    }
    
    // CVV
    if (!formTarjeta.codigoSeguridad.trim()) {
      errores.codigoSeguridad = 'El código de seguridad es requerido';
    } else if (!/^\d{3}$/.test(formTarjeta.codigoSeguridad)) {
      errores.codigoSeguridad = 'Debe tener exactamente 3 dígitos';
    }
    
    // DNI
    if (!formTarjeta.dniTitular.trim()) {
      errores.dniTitular = 'El DNI es requerido';
    } else if (!/^\d{7,8}$/.test(formTarjeta.dniTitular.replace(/\./g, ''))) {
      errores.dniTitular = 'Debe tener 7 u 8 dígitos';
    }
    
    setErroresTarjeta(errores);
    return Object.keys(errores).length === 0;
  };

  const handleChangeTarjeta = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Formatear número de tarjeta
    if (name === 'numero') {
      // Remover todos los caracteres no numéricos y limitar a 16 dígitos
      const numeros = value.replace(/\D/g, '').slice(0, 16);
      // Formatear con espacios cada 4 dígitos
      processedValue = numeros.replace(/(\d{4})(?=\d)/g, '$1 ');
    }
    
    // Formatear fecha de vencimiento
    if (name === 'fechaVencimiento') {
      processedValue = value.replace(/\D/g, '').slice(0, 4);
      if (processedValue.length >= 2) {
        processedValue = processedValue.slice(0, 2) + '/' + processedValue.slice(2);
      }
    }
    
    // Formatear CVV
    if (name === 'codigoSeguridad') {
      processedValue = value.replace(/\D/g, '').slice(0, 3);
    }
    
    // Formatear DNI
    if (name === 'dniTitular') {
      const numeros = value.replace(/\D/g, '').slice(0, 8);
      // Formatear con puntos cada 3 dígitos desde la derecha
      processedValue = numeros.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    
    setFormTarjeta(prev => ({ ...prev, [name]: processedValue }));
    
    // Validar en tiempo real
    if (erroresTarjeta[name]) {
      const nuevosErrores = { ...erroresTarjeta };
      delete nuevosErrores[name];
      setErroresTarjeta(nuevosErrores);
    }
  };

  const handleSubmitTarjeta = async (e) => {
    e.preventDefault();
    if (!validarTarjeta()) return;
    
    setLoadingTarjeta(true);
    setSuccessTarjeta(false);
    
    try {
      const res = await fetch('http://localhost:8080/tarjetas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombreCompleto: formTarjeta.nombreCompleto,
          numero: formTarjeta.numero.replace(/\s/g, ''), // Remover espacios antes de enviar
          fechaVencimiento: formTarjeta.fechaVencimiento,
          codigoSeguridad: formTarjeta.codigoSeguridad,
          dniTitular: formTarjeta.dniTitular.replace(/\./g, ''), // Remover puntos antes de enviar
          usuario: { id: user.id }
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'No se pudo guardar la tarjeta');
      }
      
      setSuccessTarjeta(true);
      setFormTarjeta({
        nombreCompleto: '',
        numero: '',
        fechaVencimiento: '',
        codigoSeguridad: '',
        dniTitular: ''
      });
      setShowModalTarjeta(false);
      
      // Recargar tarjetas
      const tarjetasRes = await fetch(`http://localhost:8080/tarjetas/usuario/${user.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (tarjetasRes.ok) {
        const nuevasTarjetas = await tarjetasRes.json();
        setTarjetas(nuevasTarjetas);
      }
    } catch (err) {
      setErrorTarjetas(err.message);
    } finally {
      setLoadingTarjeta(false);
    }
  };

  const handleAbrirModalAgregar = () => {
    setShowModalTarjeta(true);
    setSuccessTarjeta(false);
    setErrorTarjetas(null);
    setErroresTarjeta({});
  };

  const handleCerrarModalTarjeta = () => {
    setShowModalTarjeta(false);
    setFormTarjeta({
      nombreCompleto: '',
      numero: '',
      fechaVencimiento: '',
      codigoSeguridad: '',
      dniTitular: ''
    });
    setErroresTarjeta({});
  };

  const handleEliminarTarjeta = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8080/tarjetas/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Error al eliminar la tarjeta');
      
      // Actualizar la lista de tarjetas
      setTarjetas(prev => prev.filter(t => t.id !== id));
      
      // Si la tarjeta eliminada era la seleccionada, seleccionar otra
      if (tarjetaActiva === id) {
        const tarjetasRestantes = tarjetas.filter(t => t.id !== id);
        if (tarjetasRestantes.length > 0) {
          setTarjetaActiva(tarjetasRestantes[0].id);
        } else {
          setTarjetaActiva(0);
        }
      }
      
    } catch (err) {
      alert('No se pudo eliminar la tarjeta');
    }
  };

  const handlePuntitoClick = (index) => {
    setTarjetaActiva(index);
    const container = document.querySelector('.tarjetas-carrusel');
    if (container) {
      const tarjetaWidth = 280; // ancho de la tarjeta
      const gap = 16; // gap entre tarjetas
      const scrollPosition = index * (tarjetaWidth + gap);
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  };

  const handleScrollCarrusel = () => {
    const container = document.querySelector('.tarjetas-carrusel');
    if (container) {
      const tarjetaWidth = 280; // ancho de la tarjeta
      const gap = 16; // gap entre tarjetas
      const scrollLeft = container.scrollLeft;
      const index = Math.round(scrollLeft / (tarjetaWidth + gap));
      setTarjetaActiva(index);
    }
  };

  // Fetch tarjetas del usuario
  useEffect(() => {
    if (!user || !user.id) return;
    setLoadingTarjetas(true);
    setErrorTarjetas(null);
    fetch(`http://localhost:8080/tarjetas/usuario/${user.id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => {
        if (!res.ok) throw new Error('No se pudieron obtener las tarjetas');
        return res.json();
      })
      .then(data => setTarjetas(data))
      .catch(err => setErrorTarjetas(err.message))
      .finally(() => setLoadingTarjetas(false));
  }, [user, token]);

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
    <div>
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
          {/* Después del formulario de datos personales */}
          <div className="mt-5">
            <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 18 }}>Mis tarjetas</h3>
            {loadingTarjetas ? (
              <div className="text-center">Cargando tarjetas...</div>
            ) : errorTarjetas ? (
              <div className="alert alert-danger text-center">{errorTarjetas}</div>
            ) : tarjetas.length === 0 ? (
              <div className="text-muted mb-3">No tienes tarjetas guardadas.</div>
            ) : (
              <div className="tarjetas-carrusel-container mb-3" style={{ position: 'relative' }}>
                {/* Flecha izquierda */}
                {tarjetas.length > 1 && (
                  <button 
                    className="btn btn-light position-absolute" 
                    style={{ 
                      left: -15, 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      zIndex: 10,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '2px solid #e0e2e7',
                      background: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: '#666',
                      fontWeight: 'bold'
                    }}
                    onClick={() => {
                      const container = document.querySelector('.tarjetas-carrusel');
                      if (container) {
                        container.scrollBy({ left: -280, behavior: 'smooth' });
                      }
                    }}
                  >
                    ‹
                  </button>
                )}
                
                <div 
                  className="tarjetas-carrusel" 
                  style={{ display: 'flex', gap: 16, overflowX: 'auto', padding: '10px 0', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  onScroll={handleScrollCarrusel}
                >
                  {tarjetas.map(t => (
                    <div key={t.id} className="tarjeta-item-carrusel" style={{ 
                      minWidth: 260, 
                      maxWidth: 280, 
                      flex: '0 0 auto',
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                      borderRadius: 16,
                      padding: '18px 16px',
                      color: '#333',
                      position: 'relative',
                      border: '1px solid #e0e2e7'
                    }}>
                      <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        right: 0, 
                        left: 0, 
                        height: '32px', 
                        background: 'rgba(25,118,210,0.05)', 
                        borderRadius: '16px 16px 0 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        padding: '0 16px'
                      }}>
                        <div style={{ 
                          width: '32px', 
                          height: '20px', 
                          background: 'rgba(25,118,210,0.1)', 
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{ 
                            width: '24px', 
                            height: '14px', 
                            background: 'rgba(25,118,210,0.2)', 
                            borderRadius: '2px'
                          }}></div>
                        </div>
                      </div>
                      
                      <div style={{ marginTop: 40 }}>
                        <div style={{ 
                          fontSize: '1.1em', 
                          fontWeight: 700, 
                          marginBottom: '6px',
                          color: '#1976d2'
                        }}>
                          {t.nombreCompleto}
                        </div>
                        <div style={{ 
                          fontSize: '0.95em', 
                          marginBottom: '10px',
                          letterSpacing: '1.5px',
                          fontFamily: 'monospace',
                          color: '#555'
                        }}>
                          •••• •••• •••• {t.numero.slice(-4)}
                        </div>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.85em',
                          color: '#666'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.75em', opacity: 0.7, color: '#888' }}>VENCE</div>
                            <div>{t.fechaVencimiento}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '0.75em', opacity: 0.7, color: '#888' }}>DNI</div>
                            <div>{t.dniTitular}</div>
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        className="btn btn-danger btn-sm position-absolute" 
                        style={{ 
                          top: 8, 
                          right: 8, 
                          borderRadius: 6, 
                          fontWeight: 600,
                          background: '#dc3545',
                          border: 'none',
                          color: 'white',
                          fontSize: '0.75em',
                          padding: '4px 8px'
                        }} 
                        onClick={() => handleEliminarTarjeta(t.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Flecha derecha */}
                {tarjetas.length > 1 && (
                  <button 
                    className="btn btn-light position-absolute" 
                    style={{ 
                      right: -15, 
                      top: '50%', 
                      transform: 'translateY(-50%)', 
                      zIndex: 10,
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: '2px solid #e0e2e7',
                      background: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      color: '#666',
                      fontWeight: 'bold'
                    }}
                    onClick={() => {
                      const container = document.querySelector('.tarjetas-carrusel');
                      if (container) {
                        container.scrollBy({ left: 280, behavior: 'smooth' });
                      }
                    }}
                  >
                    ›
                  </button>
                )}
                
                {/* Indicadores de navegación */}
                {tarjetas.length > 1 && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 6, 
                    marginTop: 12 
                  }}>
                    {tarjetas.map((_, index) => (
                      <div 
                        key={index}
                        onClick={() => handlePuntitoClick(index)}
                        style={{ 
                          width: '6px', 
                          height: '6px', 
                          borderRadius: '50%', 
                          background: '#1976d2',
                          opacity: index === tarjetaActiva ? 1 : 0.4,
                          cursor: 'pointer',
                          transition: 'opacity 0.3s ease'
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button className="btn btn-primary" style={{ borderRadius: 10, fontWeight: 600, fontSize: '1.08em', padding: '0.7em 2em' }} onClick={handleAbrirModalAgregar}>
              + Agregar nueva tarjeta
            </button>
          </div>
        </div>
        {/* Modal para agregar tarjeta */}
        {showModalTarjeta && (
          <div className="modal-overlay" onClick={handleCerrarModalTarjeta}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '95vw' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{ color: '#1976d2', fontWeight: 800, margin: 0 }}>Agregar nueva tarjeta</h2>
                <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '1.05em' }}>Completa los datos de tu tarjeta de crédito o débito</p>
              </div>
              
              <form onSubmit={handleSubmitTarjeta}>
                <div style={{ display: 'grid', gap: 20 }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, color: '#333', marginBottom: 8, display: 'block' }}>
                      <span style={{ marginRight: 8 }}>👤</span>Nombre completo
                    </label>
                    <input
                      type="text"
                      className={`form-control ${erroresTarjeta.nombreCompleto ? 'is-invalid' : ''}`}
                      name="nombreCompleto"
                      value={formTarjeta.nombreCompleto}
                      onChange={handleChangeTarjeta}
                      placeholder="Juan Pérez"
                      style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #e0e2e7', fontSize: '1.05em' }}
                    />
                    {erroresTarjeta.nombreCompleto && (
                      <div className="invalid-feedback" style={{ color: '#dc3545', fontSize: '0.95em', marginTop: 4 }}>{erroresTarjeta.nombreCompleto}</div>
                    )}
                  </div>
                  
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, color: '#333', marginBottom: 8, display: 'block' }}>
                      <span style={{ marginRight: 8 }}>🔢</span>Número de tarjeta
                    </label>
                    <input
                      type="text"
                      className={`form-control ${erroresTarjeta.numero ? 'is-invalid' : ''}`}
                      name="numero"
                      value={formTarjeta.numero}
                      onChange={handleChangeTarjeta}
                      placeholder="1234 5678 9012 3456"
                      style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #e0e2e7', fontSize: '1.05em' }}
                    />
                    {erroresTarjeta.numero && (
                      <div className="invalid-feedback" style={{ color: '#dc3545', fontSize: '0.95em', marginTop: 4 }}>{erroresTarjeta.numero}</div>
                    )}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                      <label className="form-label" style={{ fontWeight: 700, color: '#333', marginBottom: 8, display: 'block' }}>
                        <span style={{ marginRight: 8 }}>📅</span>Vencimiento
                      </label>
                      <input
                        type="text"
                        className={`form-control ${erroresTarjeta.fechaVencimiento ? 'is-invalid' : ''}`}
                        name="fechaVencimiento"
                        value={formTarjeta.fechaVencimiento}
                        onChange={handleChangeTarjeta}
                        placeholder="MM/AA"
                        style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #e0e2e7', fontSize: '1.05em' }}
                      />
                      {erroresTarjeta.fechaVencimiento && (
                        <div className="invalid-feedback" style={{ color: '#dc3545', fontSize: '0.95em', marginTop: 4 }}>{erroresTarjeta.fechaVencimiento}</div>
                      )}
                    </div>
                    
                    <div>
                      <label className="form-label" style={{ fontWeight: 700, color: '#333', marginBottom: 8, display: 'block' }}>
                        <span style={{ marginRight: 8 }}>🔒</span>Código de seguridad
                      </label>
                      <input
                        type="text"
                        className={`form-control ${erroresTarjeta.codigoSeguridad ? 'is-invalid' : ''}`}
                        name="codigoSeguridad"
                        value={formTarjeta.codigoSeguridad}
                        onChange={handleChangeTarjeta}
                        placeholder="123"
                        style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #e0e2e7', fontSize: '1.05em' }}
                      />
                      {erroresTarjeta.codigoSeguridad && (
                        <div className="invalid-feedback" style={{ color: '#dc3545', fontSize: '0.95em', marginTop: 4 }}>{erroresTarjeta.codigoSeguridad}</div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, color: '#333', marginBottom: 8, display: 'block' }}>
                      <span style={{ marginRight: 8 }}>🆔</span>DNI del titular
                    </label>
                    <input
                      type="text"
                      className={`form-control ${erroresTarjeta.dniTitular ? 'is-invalid' : ''}`}
                      name="dniTitular"
                      value={formTarjeta.dniTitular}
                      onChange={handleChangeTarjeta}
                      placeholder="12345678"
                      style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #e0e2e7', fontSize: '1.05em' }}
                    />
                    {erroresTarjeta.dniTitular && (
                      <div className="invalid-feedback" style={{ color: '#dc3545', fontSize: '0.95em', marginTop: 4 }}>{erroresTarjeta.dniTitular}</div>
                    )}
                  </div>
                </div>
                
                {errorTarjetas && (
                  <div className="alert alert-danger mt-4" style={{ borderRadius: 10, border: 'none', background: '#f8d7da', color: '#721c24' }}>
                    <span style={{ marginRight: 8 }}>⚠️</span>{errorTarjetas}
                  </div>
                )}
                {successTarjeta && (
                  <div className="alert alert-success mt-4" style={{ borderRadius: 10, border: 'none', background: '#d4edda', color: '#155724' }}>
                    <span style={{ marginRight: 8 }}>✅</span>¡Tarjeta guardada exitosamente!
                  </div>
                )}
                
                <div className="modal-actions" style={{ marginTop: 32 }}>
                  <button type="submit" className="btn btn-primary" disabled={loadingTarjeta} style={{ minWidth: 140, padding: '12px 24px', fontSize: '1.08em', fontWeight: 600 }}>
                    {loadingTarjeta ? 'Guardando...' : 'Guardar tarjeta'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={handleCerrarModalTarjeta} disabled={loadingTarjeta} style={{ minWidth: 140, padding: '12px 24px', fontSize: '1.08em', fontWeight: 600 }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
      </div>
      <Footer />
    </div>
  );
};

export default MiCuenta;