import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import './Ajustes.css';

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

const Ajustes = () => {
  const { user, token, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('perfil');
  
  // Estados para el perfil
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
  const [searching, setSearching] = useState(false);
  const sugerenciasRef = useRef();
  const searchTimeoutRef = useRef();

  // Estados para notificaciones
  const [notificaciones, setNotificaciones] = useState({
    nuevasOfertas: true,
    superadoEnSubasta: true,
    ganeSubasta: true,
    actividadPublicaciones: true
  });

  // Estados para métodos de pago
  const [tarjetas, setTarjetas] = useState([]);
  const [loadingTarjetas, setLoadingTarjetas] = useState(false);

  // Estados para cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Estados para el modal de tarjeta
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
  const [errorTarjetas, setErrorTarjetas] = useState(null);

  // Estados para CBU
  const [showModalCbu, setShowModalCbu] = useState(false);
  const [cbuInput, setCbuInput] = useState('');
  const [loadingCbu, setLoadingCbu] = useState(false);
  const [errorCbu, setErrorCbu] = useState(null);
  const [successCbu, setSuccessCbu] = useState(false);

  useEffect(() => {
    if (user === null) return;
    if (!user || !user.username) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
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

  // Cargar tarjetas del usuario
  useEffect(() => {
    if (user && user.id) {
      const cargarTarjetas = async () => {
        try {
          setLoadingTarjetas(true);
          const res = await fetch(`http://localhost:8080/tarjetas/usuario/${user.id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const tarjetasData = await res.json();
            setTarjetas(tarjetasData);
          }
        } catch (error) {
          console.error('Error cargando tarjetas:', error);
          setErrorTarjetas('Error al cargar las tarjetas');
        } finally {
          setLoadingTarjetas(false);
        }
      };
      
      cargarTarjetas();
    }
  }, [user, token]);

  useEffect(() => {
    if (user && user.fotoPerfil && !fotoFile) {
      setFotoPreview(`http://localhost:8080${user.fotoPerfil}`);
    }
    if (user && !user.fotoPerfil && !fotoFile) {
      setFotoPreview(null);
    }
  }, [user, fotoFile]);

  // Cleanup del timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  if (!user || !user.username || typeof user.nombre === 'undefined') {
    return <div className="container d-flex align-items-center justify-content-center min-vh-100"><div className="card p-4 w-100 text-center" style={{ maxWidth: 400 }}>Cargando datos...</div></div>;
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
    setError(null);
  };

  const handleFotoChange = async e => {
    const file = e.target.files[0];
    if (file) {
      console.log('Archivo seleccionado:', file.name, file.type, file.size);
      setFotoFile(file);
      setFotoPreview(URL.createObjectURL(file));
      setSuccess(false);
      setError(null);
      
      // Guardar la foto automáticamente
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append('fotoPerfil', file);
        console.log('Enviando archivo al servidor...');
        const res = await fetch('http://localhost:8080/usuarios/foto-perfil', {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        console.log('Respuesta del servidor:', res.status, res.statusText);
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Error del servidor:', errorText);
          throw new Error(`Error al subir la foto: ${res.status} ${res.statusText}`);
        }
        
        // Obtener el usuario actualizado del response
        const updatedUser = await res.json();
        console.log('Usuario actualizado:', updatedUser);
        
        // Actualizar el estado global del usuario
        updateUser(updatedUser);
        
        // Actualizar el preview con la nueva URL
        setFotoPreview(`http://localhost:8080${updatedUser.fotoPerfil}`);
        
        setSuccess(true);
        setFotoFile(null);
      } catch (err) {
        console.error('Error en handleFotoChange:', err);
        setError(`No se pudo subir la foto: ${err.message}`);
        // Revertir el preview en caso de error
        if (user?.fotoPerfil) {
          setFotoPreview(`http://localhost:8080${user.fotoPerfil}`);
        } else {
          setFotoPreview(null);
        }
      } finally {
        setLoading(false);
      }
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
      
      // Obtener el usuario actualizado del response
      const updatedUser = await res.json();
      
      // Actualizar el estado global del usuario
      updateUser(updatedUser);
      
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

  const handleNotificacionChange = (key) => {
    setNotificaciones(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEliminarTarjeta = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarjeta?')) {
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:8080/tarjetas/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        // Recargar tarjetas
        const tarjetasRes = await fetch(`http://localhost:8080/tarjetas/usuario/${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (tarjetasRes.ok) {
          const nuevasTarjetas = await tarjetasRes.json();
          setTarjetas(nuevasTarjetas);
        }
      } else {
        throw new Error('No se pudo eliminar la tarjeta');
      }
    } catch (error) {
      console.error('Error eliminando tarjeta:', error);
      alert('Error al eliminar la tarjeta');
    }
  };

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

  // Handlers para CBU
  const handleCbuChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 22) {
      setCbuInput(value);
    }
  };

  const handleAgregarCbu = async (e) => {
    e.preventDefault();
    if (cbuInput.length !== 22) {
      setErrorCbu('El CBU debe tener exactamente 22 dígitos');
      return;
    }

    try {
      setLoadingCbu(true);
      setErrorCbu(null);
      
      const res = await fetch('http://localhost:8080/usuarios/cbu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ cbu: cbuInput })
      });

      if (res.ok) {
        const usuarioActualizado = await res.json();
        updateUser(usuarioActualizado);
        setSuccessCbu(true);
        setCbuInput('');
        setShowModalCbu(false);
        setTimeout(() => setSuccessCbu(false), 3000);
      } else {
        const errorData = await res.text();
        setErrorCbu(errorData || 'Error al agregar el CBU');
      }
    } catch (err) {
      setErrorCbu('Error de conexión');
    } finally {
      setLoadingCbu(false);
    }
  };

  const handleEliminarCbu = async () => {
    try {
      setLoadingCbu(true);
      setErrorCbu(null);
      
      const res = await fetch('http://localhost:8080/usuarios/cbu', {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      if (res.ok) {
        const usuarioActualizado = await res.json();
        updateUser(usuarioActualizado);
        setSuccessCbu(true);
        setTimeout(() => setSuccessCbu(false), 3000);
      } else {
        const errorData = await res.text();
        setErrorCbu(errorData || 'Error al eliminar el CBU');
      }
    } catch (err) {
      setErrorCbu('Error de conexión');
    } finally {
      setLoadingCbu(false);
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: '👤' },
    { id: 'notificaciones', label: 'Notificaciones', icon: '🔔' },
    { id: 'pagos', label: 'Métodos de pago', icon: '💳' },
    { id: 'cuenta', label: 'Cuenta', icon: '⚙️' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'perfil':
        return (
          <div className="tab-content">
            <div className="profile-section">
              <h3>Información personal</h3>
              
              <div className="profile-photo-section">
                <div className="profile-photo-container">
                  <img
                    src={fotoPreview || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.nombre || user.username)}
                    alt="Foto de perfil"
                    className="profile-photo"
                  />
                  <div className="photo-overlay">
                    <button
                      type="button"
                      className="change-photo-btn"
                      onClick={() => fileInputRef.current.click()}
                      aria-label="Cambiar foto de perfil"
                    >
                      <span role="img" aria-label="cambiar foto">📷</span>
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    onChange={handleFotoChange}
                    disabled={loading}
                  />
                </div>
                <div className="photo-info">
                  <h4>Foto de perfil</h4>
                  <p>Sube una imagen para personalizar tu perfil</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Usuario</label>
                    <input className="form-control disabled" value={user.username} disabled />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">DNI</label>
                    <input className="form-control disabled" value={user.dni || 'No especificado'} disabled />
                  </div>
                  
                  <div className="form-group full-width">
                    <label className="form-label">Nombre completo</label>
                    <input
                      className="form-control"
                      name="nombre"
                      type="text"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group full-width position-relative">
                    <label className="form-label">Dirección</label>
                    <input
                      className="form-control"
                      name="direccion"
                      type="text"
                      value={direccionQuery || form.direccion}
                      onChange={handleDireccionInput}
                      required
                      onFocus={() => { if (sugerencias.length > 0) setShowSugerencias(true); }}
                      onBlur={() => setTimeout(() => setShowSugerencias(false), 150)}
                    />
                    {showSugerencias && (
                      <ul className="suggestions-list" ref={sugerenciasRef}>
                        {searching ? (
                          <li className="suggestion-item loading">
                            <span className="loading-spinner"></span>
                            Buscando direcciones...
                          </li>
                        ) : sugerencias.length > 0 ? (
                          sugerencias.map(sug => (
                            <li
                              key={sug.place_id}
                              className="suggestion-item"
                              onMouseDown={() => handleSugerenciaClick(sug)}
                            >
                              {sug.display_name}
                            </li>
                          ))
                        ) : direccionQuery.length >= 3 && (
                          <li className="suggestion-item no-results">
                            No se encontraron direcciones
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Mapa con marcador si hay lat/lng */}
                {form.latitud && form.longitud && !isNaN(Number(form.latitud)) && !isNaN(Number(form.longitud)) && (
                  <div className="map-container">
                    <MapContainer
                      center={[parseFloat(form.latitud), parseFloat(form.longitud)]}
                      zoom={15}
                      scrollWheelZoom={false}
                      className="map"
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

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">¡Datos guardados!</div>}
                
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </form>
            </div>
          </div>
        );

      case 'notificaciones':
        return (
          <div className="tab-content">
            <div className="notifications-section">
              <h3>Configuración de notificaciones</h3>
              <p className="section-description">
                Personaliza qué notificaciones quieres recibir por correo electrónico
              </p>
              
              <div className="notifications-list">
                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Nuevas ofertas en subastas que sigo</h4>
                    <p>Recibe alertas cuando alguien haga una oferta en subastas que estás siguiendo</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificaciones.nuevasOfertas}
                      onChange={() => handleNotificacionChange('nuevasOfertas')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>He sido superado en una subasta</h4>
                    <p>Te avisamos cuando alguien supere tu oferta en una subasta</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificaciones.superadoEnSubasta}
                      onChange={() => handleNotificacionChange('superadoEnSubasta')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Gané una subasta</h4>
                    <p>Celebra con nosotros cuando ganes una subasta</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificaciones.ganeSubasta}
                      onChange={() => handleNotificacionChange('ganeSubasta')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <h4>Actividad en mis publicaciones</h4>
                    <p>Mantente informado sobre la actividad en tus publicaciones como vendedor</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificaciones.actividadPublicaciones}
                      onChange={() => handleNotificacionChange('actividadPublicaciones')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'pagos':
        return (
          <div className="tab-content">
            <div className="payments-section">
              <div className="section-header">
                <h3>Métodos de pago y cobro</h3>
                <button className="add-card-btn" onClick={() => setShowModalTarjeta(true)}>
                  + Agregar tarjeta
                </button>
              </div>

              {loadingTarjetas ? (
                <div className="empty-state">
                  <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
                  <p>Cargando tarjetas...</p>
                </div>
              ) : tarjetas.length > 0 ? (
                <>
                  <div className="cards-wrapper">
                    <div className="cards-container">
                      {tarjetas.map((tarjeta, index) => (
                        <div key={tarjeta.id} className="card-item">
                          <div className="card-info">
                            <div className="card-number">
                              •••• •••• •••• {tarjeta.numero.slice(-4)}
                            </div>
                            <div className="card-details">
                              <span className="card-name">{tarjeta.nombreCompleto}</span>
                              <span className="card-expiry">{tarjeta.fechaVencimiento}</span>
                            </div>
                          </div>
                          <button 
                            className="delete-card-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEliminarTarjeta(tarjeta.id);
                            }}
                            title="Eliminar tarjeta"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="cards-scroll-indicator">
                      ← Desliza para ver más tarjetas →
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">💳</div>
                  <h4>No tienes tarjetas guardadas</h4>
                  <p>Agrega una tarjeta para realizar pagos más rápido</p>
                </div>
              )}

              <div className="cbu-section">
                <h4>Información bancaria</h4>
                <p>Agrega tu CBU/CVU para recibir señas y pagos finales</p>
                
                {user.cbu ? (
                  <div className="cbu-display">
                    <div className="cbu-info">
                      <span className="cbu-label">CBU:</span>
                      <span className="cbu-value">{user.cbu}</span>
                    </div>
                    <button 
                      className="remove-cbu-btn"
                      onClick={handleEliminarCbu}
                      disabled={loadingCbu}
                    >
                      {loadingCbu ? 'Eliminando...' : '🗑️ Eliminar'}
                    </button>
                  </div>
                ) : (
                  <button 
                    className="add-cbu-btn"
                    onClick={() => setShowModalCbu(true)}
                  >
                    + Agregar CBU/CVU
                  </button>
                )}
                
                {errorCbu && <div className="alert alert-danger">{errorCbu}</div>}
                {successCbu && <div className="alert alert-success">¡CBU actualizado correctamente!</div>}
              </div>

              <div className="transactions-section">
                <h4>Historial de transacciones</h4>
                <p>Revisa tu historial de pagos y cobros</p>
                <button className="view-transactions-btn">
                  Ver historial
                </button>
              </div>
            </div>
          </div>
        );

      case 'cuenta':
        return (
          <div className="tab-content">
            <div className="account-section">
              <div className="danger-zone">
                <h3>Zona de peligro</h3>
                <p>Estas acciones son irreversibles</p>
                
                <div className="danger-item">
                  <div className="danger-info">
                    <h4>Cambiar contraseña</h4>
                    <p>Actualiza tu contraseña para mantener tu cuenta segura</p>
                  </div>
                  <button className="change-password-btn">
                    Cambiar contraseña
                  </button>
                </div>

                <div className="danger-item">
                  <div className="danger-info">
                    <h4>Eliminar cuenta</h4>
                    <p>Elimina permanentemente tu cuenta y todos tus datos</p>
                  </div>
                  <button 
                    className="delete-account-btn"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="ajustes-container">
        <div className="ajustes-content">
          <div className="ajustes-header">
            <h1>Ajustes</h1>
            <p>Gestiona tu cuenta y preferencias</p>
          </div>

          <div className="tabs-container">
            <div className="tabs-header">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className="tab-icon">{tab.icon}</span>
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>

            <div className="tab-content-container">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>

                    {/* Modal para agregar tarjeta */}
        {showModalTarjeta && (
          <div className="modal-overlay" onClick={() => setShowModalTarjeta(false)}>
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
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModalTarjeta(false)} disabled={loadingTarjeta} style={{ minWidth: 140, padding: '12px 24px', fontSize: '1.08em', fontWeight: 600 }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para agregar CBU */}
        {showModalCbu && (
          <div className="modal-overlay" onClick={() => setShowModalCbu(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '95vw' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{ color: '#1976d2', fontWeight: 800, margin: 0 }}>Agregar CBU/CVU</h2>
                <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '1.05em' }}>Ingresa tu Clave Bancaria Uniforme para recibir pagos</p>
              </div>
              
              <form onSubmit={handleAgregarCbu}>
                <div style={{ marginBottom: 24 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: '#333', marginBottom: 8, display: 'block' }}>
                    <span style={{ marginRight: 8 }}>🏦</span>CBU/CVU
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={cbuInput}
                    onChange={handleCbuChange}
                    placeholder="1234567890123456789012"
                    style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #e0e2e7', fontSize: '1.05em' }}
                    maxLength={22}
                  />
                  <small style={{ color: '#666', marginTop: 4, display: 'block' }}>
                    El CBU debe tener exactamente 22 dígitos numéricos
                  </small>
                </div>
                
                {errorCbu && (
                  <div className="alert alert-danger" style={{ borderRadius: 10, border: 'none', background: '#f8d7da', color: '#721c24' }}>
                    <span style={{ marginRight: 8 }}>⚠️</span>{errorCbu}
                  </div>
                )}
                
                <div className="modal-actions" style={{ marginTop: 32 }}>
                  <button type="submit" className="btn btn-primary" disabled={loadingCbu} style={{ minWidth: 140, padding: '12px 24px', fontSize: '1.08em', fontWeight: 600 }}>
                    {loadingCbu ? 'Guardando...' : 'Guardar CBU'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModalCbu(false)} disabled={loadingCbu} style={{ minWidth: 140, padding: '12px 24px', fontSize: '1.08em', fontWeight: 600 }}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

       <Footer />
     </div>
   );
 };

export default Ajustes; 