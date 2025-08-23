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
    todas: true,
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
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  
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

  // Estados para cambiar contraseña
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [formPassword, setFormPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorPassword, setErrorPassword] = useState(null);
  const [successPassword, setSuccessPassword] = useState(false);

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
    if (key === 'todas') {
      const newValue = !notificaciones.todas;
      setNotificaciones(prev => ({
        ...prev,
        todas: newValue,
        nuevasOfertas: newValue,
        superadoEnSubasta: newValue,
        ganeSubasta: newValue,
        actividadPublicaciones: newValue
      }));
    } else {
      setNotificaciones(prev => {
        const newState = {
          ...prev,
          [key]: !prev[key]
        };
        
        // Verificar si todas las notificaciones individuales están activadas
        const todasActivas = newState.nuevasOfertas && 
                           newState.superadoEnSubasta && 
                           newState.ganeSubasta && 
                           newState.actividadPublicaciones;
        
        return {
          ...newState,
          todas: todasActivas
        };
      });
    }
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

  const handleEliminarCuenta = async () => {
    if (deleteConfirmation !== 'ELIMINAR') {
      setDeleteError('Debes escribir "ELIMINAR" para confirmar la eliminación');
      return;
    }

    setLoadingDelete(true);
    setDeleteError(null);

    try {
      const response = await fetch(`http://localhost:8080/usuarios/eliminar-cuenta`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Cerrar sesión y redirigir al login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        const errorData = await response.text();
        setDeleteError(errorData || 'Error al eliminar la cuenta');
      }
    } catch (error) {
      setDeleteError('Error de conexión');
    } finally {
      setLoadingDelete(false);
    }
  };

  // Handlers para cambiar contraseña
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormPassword(prev => ({ ...prev, [name]: value }));
    setErrorPassword(null);
    setSuccessPassword(false);
  };

  const validarPassword = () => {
    if (!formPassword.currentPassword.trim()) {
      setErrorPassword('La contraseña actual es requerida');
      return false;
    }
    
    if (!formPassword.newPassword.trim()) {
      setErrorPassword('La nueva contraseña es requerida');
      return false;
    }
    
    if (formPassword.newPassword.length < 6) {
      setErrorPassword('La nueva contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    if (formPassword.newPassword !== formPassword.confirmPassword) {
      setErrorPassword('Las contraseñas nuevas no coinciden');
      return false;
    }
    
    if (formPassword.currentPassword === formPassword.newPassword) {
      setErrorPassword('La nueva contraseña debe ser diferente a la actual');
      return false;
    }
    
    return true;
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (!validarPassword()) return;
    
    setLoadingPassword(true);
    setErrorPassword(null);
    setSuccessPassword(false);
    
    try {
      const response = await fetch('http://localhost:8080/usuarios/cambiar-contrasena', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          contrasenaActual: formPassword.currentPassword,
          nuevaContrasena: formPassword.newPassword
        })
      });

      if (response.ok) {
        setSuccessPassword(true);
        setFormPassword({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setTimeout(() => {
          setShowModalPassword(false);
          setSuccessPassword(false);
        }, 2000);
      } else {
        const errorData = await response.text();
        setErrorPassword(errorData || 'Error al cambiar la contraseña');
      }
    } catch (error) {
      setErrorPassword('Error de conexión');
    } finally {
      setLoadingPassword(false);
    }
  };

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: 'fas fa-user' },
    { id: 'notificaciones', label: 'Notificaciones', icon: 'fas fa-bell' },
    { id: 'pagos', label: 'Métodos de Pago', icon: 'fas fa-credit-card' },
    { id: 'cuenta', label: 'Cuenta', icon: 'fas fa-cog' }
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
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => fileInputRef.current.click()}
                      style={{ marginTop: 8 }}
                    >
                      <i className="fas fa-pencil"></i>
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
                <div className="notification-item" style={{ borderBottom: '2px solid #e0e2e7', paddingBottom: '20px', marginBottom: '20px' }}>
                  <div className="notification-info">
                    <h4>Activar todas las notificaciones</h4>
                    <p>Activa o desactiva todas las notificaciones de una vez</p>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={notificaciones.todas}
                      onChange={() => handleNotificacionChange('todas')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

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
                            <i className="fas fa-trash"></i>
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
                  <div className="empty-icon">
                    <i className="fas fa-credit-card"></i>
                  </div>
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
                      {loadingCbu ? 'Eliminando...' : <><i className="fas fa-trash" style={{ marginRight: 8 }}></i>Eliminar</>}
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
              <h3>Gestión de cuenta</h3>
              <p>Administra tu cuenta y configuraciones de seguridad</p>
              
              <div className="account-actions">
                <div className="account-item">
                  <div className="account-info">
                    <h4>Cambiar contraseña</h4>
                    <p>Actualiza tu contraseña para mantener tu cuenta segura</p>
                  </div>
                  <button 
                    className="change-password-btn"
                    onClick={() => setShowModalPassword(true)}
                  >
                    Cambiar contraseña
                  </button>
                </div>

                <div className="account-item">
                  <div className="account-info">
                    <h4>Eliminar cuenta</h4>
                    <p>Elimina permanentemente tu cuenta y todos tus datos</p>
                  </div>
                  <button 
                    className="delete-account-btn"
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      backgroundColor: '#dc3545',
                      borderColor: '#dc3545',
                      color: 'white',
                      fontWeight: 600
                    }}
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
                  <span className="tab-icon"><i className={tab.icon}></i></span>
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
                      <span style={{ marginRight: 8 }}>
                        <i className="fas fa-user"></i>
                      </span>Nombre completo
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
                      <span style={{ marginRight: 8 }}>
                        <i className="fas fa-credit-card"></i>
                      </span>Número de tarjeta
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
                        <span style={{ marginRight: 8 }}>
                          <i className="fas fa-calendar-alt"></i>
                        </span>Vencimiento
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
                        <span style={{ marginRight: 8 }}>
                          <i className="fas fa-lock"></i>
                        </span>Código de seguridad
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
                      <span style={{ marginRight: 8 }}>
                        <i className="fas fa-id-card"></i>
                      </span>DNI del titular
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
                    <span style={{ marginRight: 8 }}>
                      <i className="fas fa-exclamation-triangle"></i>
                    </span>{errorTarjetas}
                  </div>
                )}
                {successTarjeta && (
                  <div className="alert alert-success mt-4" style={{ borderRadius: 10, border: 'none', background: '#d4edda', color: '#155724' }}>
                    <span style={{ marginRight: 8 }}>
                      <i className="fas fa-check"></i>
                    </span>¡Tarjeta guardada exitosamente!
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
                    <span style={{ marginRight: 8 }}>
                      <i className="fas fa-university"></i>
                    </span>CBU/CVU
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
                    <span style={{ marginRight: 8 }}>
                      <i className="fas fa-exclamation-triangle"></i>
                    </span>{errorCbu}
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

        {/* Modal para eliminar cuenta */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '95vw' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                  <h2 style={{ color: '#dc3545', fontWeight: 800, margin: 0 }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: 8 }}></i>Eliminar cuenta
                  </h2>
                <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '1.05em' }}>
                  Esta acción es irreversible. Todos tus datos serán eliminados permanentemente.
                </p>
              </div>
              
              <div style={{ marginBottom: 24 }}>
                <div style={{ 
                  background: '#fff3cd', 
                  border: '1px solid #ffeaa7', 
                  borderRadius: 10, 
                  padding: 16, 
                  marginBottom: 16 
                }}>
                  <h4 style={{ color: '#856404', margin: '0 0 8px 0', fontSize: '1.1em' }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: 8 }}></i>Advertencia importante
                  </h4>
                  <ul style={{ color: '#856404', margin: 0, paddingLeft: 20 }}>
                    <li>Se eliminarán todas tus publicaciones y ofertas</li>
                    <li>Se perderán todos tus datos personales</li>
                    <li>No podrás recuperar tu cuenta</li>
                    <li>Si tienes subastas activas, no podrás eliminar tu cuenta</li>
                  </ul>
                </div>
                
                <label className="form-label" style={{ fontWeight: 700, color: '#333', marginBottom: 8, display: 'block' }}>
                                      <span style={{ marginRight: 8 }}>
                      <i className="fas fa-edit"></i>
                    </span>Confirmación
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Escribe 'ELIMINAR' para confirmar"
                  style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #e0e2e7', fontSize: '1.05em' }}
                />
                <small style={{ color: '#666', marginTop: 4, display: 'block' }}>
                  Debes escribir exactamente "ELIMINAR" para proceder
                </small>
              </div>
              
              {deleteError && (
                <div className="alert alert-danger" style={{ borderRadius: 10, border: 'none', background: '#f8d7da', color: '#721c24' }}>
                  <span style={{ marginRight: 8 }}>
                    <i className="fas fa-exclamation-triangle"></i>
                  </span>{deleteError}
                </div>
              )}
              
              <div className="modal-actions" style={{ marginTop: 32 }}>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleEliminarCuenta}
                  disabled={loadingDelete || deleteConfirmation !== 'ELIMINAR'}
                  style={{ 
                    minWidth: 140, 
                    padding: '12px 24px', 
                    fontSize: '1.08em', 
                    fontWeight: 600,
                    backgroundColor: '#dc3545',
                    borderColor: '#dc3545'
                  }}
                >
                  {loadingDelete ? 'Eliminando...' : 'Eliminar cuenta'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmation('');
                    setDeleteError(null);
                  }}
                  disabled={loadingDelete}
                  style={{ minWidth: 140, padding: '12px 24px', fontSize: '1.08em', fontWeight: 600 }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para cambiar contraseña */}
        {showModalPassword && (
          <div className="modal-overlay" onClick={() => setShowModalPassword(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '95vw' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <h2 style={{ color: '#1976d2', fontWeight: 800, margin: 0 }}>
                  <i className="fas fa-lock" style={{ marginRight: 8 }}></i>Cambiar contraseña
                </h2>
                <p style={{ color: '#666', margin: '8px 0 0 0', fontSize: '1.05em' }}>Ingresa tu contraseña actual y la nueva contraseña</p>
              </div>
              
              <form onSubmit={handleSubmitPassword}>
                <div style={{ display: 'grid', gap: 20 }}>
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, color: '#333', marginBottom: 8, display: 'block' }}>
                      <span style={{ marginRight: 8 }}>
                        <i className="fas fa-key"></i>
                      </span>Contraseña actual
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="currentPassword"
                      value={formPassword.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Ingresa tu contraseña actual"
                      style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #e0e2e7', fontSize: '1.05em' }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, color: '#333', marginBottom: 8, display: 'block' }}>
                      <span style={{ marginRight: 8 }}>
                        <i className="fas fa-plus-circle"></i>
                      </span>Nueva contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="newPassword"
                      value={formPassword.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Ingresa tu nueva contraseña"
                      style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #e0e2e7', fontSize: '1.05em' }}
                      required
                    />
                    <small style={{ color: '#666', marginTop: 4, display: 'block' }}>
                      Mínimo 6 caracteres
                    </small>
                  </div>
                  
                  <div>
                    <label className="form-label" style={{ fontWeight: 700, color: '#333', marginBottom: 8, display: 'block' }}>
                      <span style={{ marginRight: 8 }}>
                        <i className="fas fa-check-circle"></i>
                      </span>Confirmar nueva contraseña
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formPassword.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirma tu nueva contraseña"
                      style={{ padding: '12px 16px', borderRadius: 10, border: '2px solid #e0e2e7', fontSize: '1.05em' }}
                      required
                    />
                  </div>
                </div>
                
                {errorPassword && (
                  <div className="alert alert-danger mt-4" style={{ borderRadius: 10, border: 'none', background: '#f8d7da', color: '#721c24' }}>
                    <span style={{ marginRight: 8 }}>
                      <i className="fas fa-exclamation-triangle"></i>
                    </span>{errorPassword}
                  </div>
                )}
                {successPassword && (
                  <div className="alert alert-success mt-4" style={{ borderRadius: 10, border: 'none', background: '#d4edda', color: '#155724' }}>
                    <span style={{ marginRight: 8 }}>
                      <i className="fas fa-check-circle"></i>
                    </span>¡Contraseña cambiada exitosamente!
                  </div>
                )}
                
                <div className="modal-actions" style={{ marginTop: 32 }}>
                  <button type="submit" className="btn btn-primary" disabled={loadingPassword} style={{ minWidth: 140, padding: '12px 24px', fontSize: '1.08em', fontWeight: 600 }}>
                    {loadingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowModalPassword(false);
                      setFormPassword({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                      setErrorPassword(null);
                      setSuccessPassword(false);
                    }} 
                    disabled={loadingPassword} 
                    style={{ minWidth: 140, padding: '12px 24px', fontSize: '1.08em', fontWeight: 600 }}
                  >
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