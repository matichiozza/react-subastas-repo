import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from './Footer';
import API_BASE_URL from '../config/api';

const categorias = [
  { nombre: 'Accesorios', emoji: 'fas fa-briefcase' },
  { nombre: 'Aire libre', emoji: 'fas fa-tree' },
  { nombre: 'Arte', emoji: 'fas fa-palette' },
  { nombre: 'Bebés', emoji: 'fas fa-baby' },
  { nombre: 'Calzado', emoji: 'fas fa-shoe-prints' },
  { nombre: 'Computación', emoji: 'fas fa-laptop' },
  { nombre: 'Cocina', emoji: 'fas fa-utensils' },
  { nombre: 'Deportes', emoji: 'fas fa-futbol' },
  { nombre: 'Electrónica', emoji: 'fas fa-bolt' },
  { nombre: 'Herramientas', emoji: 'fas fa-hammer' },
  { nombre: 'Hogar', emoji: 'fas fa-home' },
  { nombre: 'Joyería', emoji: 'fas fa-gem' },
  { nombre: 'Juguetes', emoji: 'fas fa-teddy-bear' },
  { nombre: 'Libros', emoji: 'fas fa-book' },
  { nombre: 'Mascotas', emoji: 'fas fa-paw' },
  { nombre: 'Moda', emoji: 'fas fa-tshirt' },
  { nombre: 'Muebles', emoji: 'fas fa-couch' },
  { nombre: 'Música', emoji: 'fas fa-music' },
  { nombre: 'Teléfonos', emoji: 'fas fa-mobile-alt' },
  { nombre: 'Vehículos', emoji: 'fas fa-car' },
];

// Función para normalizar tildes y minúsculas
function normalizar(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Función para formatear montos con separadores de miles
function formatearMonto(valor) {
  if (!valor) return '0';
  return parseFloat(valor).toLocaleString('es-AR');
}

// Función para formatear números con separadores de miles
function formatearNumero(valor) {
  if (!valor) return '';
  return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Función para limpiar formato de números
function limpiarFormato(valor) {
  return valor.toString().replace(/\./g, '');
}

const TodasPublicaciones = () => {
  const { token } = useContext(AuthContext);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    precioMin: '',
    precioMax: '',
    condicion: '',
    ordenarPor: 'fecha'
  });

  // Estados para el slider de precio
  const [precioRange, setPrecioRange] = useState([0, 100000]);
  const [isSliderActive, setIsSliderActive] = useState(false);
  
  // Calcular el precio máximo de todas las publicaciones
  const precioMaximo = publicaciones.length > 0 
    ? Math.max(...publicaciones.map(pub => {
        const precioActual = pub.precioActual > 0 ? pub.precioActual : pub.precioInicial;
        return precioActual;
      }))
    : 100000;

  // Estado para controlar el despliegue de categorías
  const [categoriasDesplegadas, setCategoriasDesplegadas] = useState(false);

  // Obtener parámetro de búsqueda de la URL
  const params = new URLSearchParams(location.search);
  const busquedaParam = params.get('busqueda') || '';
  const busqueda = busquedaParam.toLowerCase();

  // Función para manejar cambios en filtros
  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltros({
      precioMin: '',
      precioMax: '',
      condicion: '',
      ordenarPor: 'fecha'
    });
    setPrecioRange([0, precioMaximo]);
  };

  // Función para manejar el cambio del slider de precio
  const handlePrecioRangeChange = (values) => {
    setPrecioRange(values);
    setFiltros(prev => ({
      ...prev,
      precioMin: values[0].toString(),
      precioMax: values[1].toString()
    }));
  };

  // Función para manejar el arrastre del slider (solo para iniciar el arrastre)
  const handleSliderMouseMove = (e) => {
    // Esta función ya no se usa, la lógica está en el event listener global
  };



  // Función para manejar cambio de precio con formato
  const handlePrecioChange = (campo, valor) => {
    // Limpiar formato para obtener solo números
    const valorLimpio = limpiarFormato(valor);
    
    // Solo permitir números
    if (valorLimpio === '' || /^\d+$/.test(valorLimpio)) {
      setFiltros(prev => ({
        ...prev,
        [campo]: valorLimpio
      }));
    }
  };

  // Función para formatear precio para mostrar
  const formatearPrecioMostrar = (valor) => {
    if (!valor) return '';
    return formatearNumero(valor);
  };

  // Función para aplicar filtros
  const aplicarFiltros = (publicaciones) => {
    let filtradas = [...publicaciones];

    // Filtro por precio mínimo
    if (filtros.precioMin) {
      const precioMin = parseFloat(filtros.precioMin);
      filtradas = filtradas.filter(pub => {
        const precioActual = pub.precioActual > 0 ? pub.precioActual : pub.precioInicial;
        return precioActual >= precioMin;
      });
    }

    // Filtro por precio máximo
    if (filtros.precioMax) {
      const precioMax = parseFloat(filtros.precioMax);
      filtradas = filtradas.filter(pub => {
        const precioActual = pub.precioActual > 0 ? pub.precioActual : pub.precioInicial;
        return precioActual <= precioMax;
      });
    }

    // Filtro por condición
    if (filtros.condicion) {
      filtradas = filtradas.filter(pub => pub.condicion === filtros.condicion);
    }

    // Ordenamiento
    switch (filtros.ordenarPor) {
      case 'precio_asc':
        filtradas.sort((a, b) => {
          const precioA = a.precioActual > 0 ? a.precioActual : a.precioInicial;
          const precioB = b.precioActual > 0 ? b.precioActual : b.precioInicial;
          return precioA - precioB;
        });
        break;
      case 'precio_desc':
        filtradas.sort((a, b) => {
          const precioA = a.precioActual > 0 ? a.precioActual : a.precioInicial;
          const precioB = b.precioActual > 0 ? b.precioActual : b.precioInicial;
          return precioB - precioA;
        });
        break;
      case 'ofertas':
        filtradas.sort((a, b) => (b.ofertasTotales || 0) - (a.ofertasTotales || 0));
        break;
      case 'fecha':
      default:
        filtradas.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
        break;
    }

    return filtradas;
  };

  // Sincronizar filtro de categoría con el parámetro de la URL
  useEffect(() => {
    // Si el parámetro de búsqueda coincide exactamente con una categoría, activar el filtro de categoría
    const categoriaMatch = categorias.find(cat => normalizar(cat.nombre) === normalizar(busqueda));
    if (categoriaMatch) {
      setCategoriaSeleccionada(categoriaMatch.nombre);
    } else {
      setCategoriaSeleccionada('');
    }
    // eslint-disable-next-line
  }, [busquedaParam]);

  // Event listeners para el slider
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsSliderActive(false);
    };

    const handleGlobalMouseMove = (e) => {
      if (!isSliderActive) return;
      
      // Obtener el elemento del slider
      const sliderElement = document.querySelector('[data-slider="price-range"]');
      if (!sliderElement) return;
      
      const rect = sliderElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const value = Math.round((percentage / 100) * precioMaximo);
      
      // Determinar si estamos arrastrando el thumb mínimo o máximo
      const currentMin = precioRange[0];
      const currentMax = precioRange[1];
      const minDistance = Math.abs(value - currentMin);
      const maxDistance = Math.abs(value - currentMax);
      
      if (minDistance < maxDistance) {
        // Arrastrar thumb mínimo
        const newMin = Math.min(value, currentMax - 1000);
        const newRange = [newMin, currentMax];
        setPrecioRange(newRange);
        // Aplicar filtros en tiempo real
        setFiltros(prev => ({
          ...prev,
          precioMin: newMin.toString(),
          precioMax: currentMax.toString()
        }));
      } else {
        // Arrastrar thumb máximo
        const newMax = Math.max(value, currentMin + 1000);
        const newRange = [currentMin, newMax];
        setPrecioRange(newRange);
        // Aplicar filtros en tiempo real
        setFiltros(prev => ({
          ...prev,
          precioMin: currentMin.toString(),
          precioMax: newMax.toString()
        }));
      }
    };

    if (isSliderActive) {
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.addEventListener('mousemove', handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isSliderActive, precioRange, precioMaximo]);

  // Actualizar el rango de precio cuando cambien las publicaciones
  useEffect(() => {
    if (publicaciones.length > 0) {
      setPrecioRange([0, precioMaximo]);
    }
  }, [publicaciones, precioMaximo]);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/publicaciones`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPublicaciones(data.reverse());
      } catch {
        setPublicaciones([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicaciones();

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

  // Filtrado por categoría y búsqueda
  let publicacionesFiltradas = publicaciones;
  if (categoriaSeleccionada) {
    publicacionesFiltradas = publicacionesFiltradas.filter(pub => normalizar(pub.categoria) === normalizar(categoriaSeleccionada));
  }
  // Solo aplicar búsqueda textual si no hay filtro de categoría exacto
  if (busqueda && !categoriaSeleccionada) {
    publicacionesFiltradas = publicacionesFiltradas.filter(pub =>
      (pub.titulo && pub.titulo.toLowerCase().includes(busqueda)) ||
      (pub.descripcion && pub.descripcion.toLowerCase().includes(busqueda))
    );
  }

  // Aplicar filtros adicionales
  publicacionesFiltradas = aplicarFiltros(publicacionesFiltradas);

  return (
    <div>
      <div className="container py-4">
        <div className="row">
          {/* Filtros laterales */}
          <div className="col-lg-3 mb-4">
            {/* Filtros de Categorías */}
            <div className="mt-0 card p-3 mb-3" style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <div 
                className="d-flex align-items-center justify-content-between mb-3" 
                style={{ cursor: 'pointer' }}
                onClick={() => setCategoriasDesplegadas(!categoriasDesplegadas)}
              >
                <div>
                  <h6 style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.1em', margin: 0 }}>
                    <i className="fas fa-folder" style={{ marginRight: 8 }}></i>Categorías
                  </h6>
                  {!categoriasDesplegadas && categoriaSeleccionada && (
                    <small style={{ color: '#666', fontSize: '0.9em', display: 'block', marginTop: 2 }}>
                      Seleccionada: {categoriaSeleccionada}
                    </small>
                  )}
                </div>
                <span style={{ 
                  fontSize: '1.2em', 
                  transition: 'transform 0.3s ease',
                  transform: categoriasDesplegadas ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </div>
              {categoriasDesplegadas && (
                <ul className="list-unstyled mb-0" style={{ maxHeight: 300, overflowY: 'auto' }}>
                  <li className={`d-flex align-items-center mb-2 p-2 rounded${categoriaSeleccionada === '' ? ' fw-bold' : ''}`} 
                      style={{ fontSize: '1.05em', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: categoriaSeleccionada === '' ? '#e3f2fd' : 'transparent' }} 
                      onClick={() => {
                        setCategoriaSeleccionada('');
                        const params = new URLSearchParams(location.search);
                        if (params.has('busqueda')) {
                          params.delete('busqueda');
                          navigate({ pathname: '/publicaciones', search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
                        }
                      }}>
                    <i className="fas fa-search" style={{ marginRight: 8 }}></i>
                    <span>Todas las categorías</span>
                  </li>
                  {categorias.map(cat => (
                    <li
                      key={cat.nombre}
                      className={`d-flex align-items-center mb-2 p-2 rounded${categoriaSeleccionada === cat.nombre ? ' fw-bold' : ''}`}
                      style={{ 
                        fontSize: '1.05em', 
                        cursor: 'pointer', 
                        transition: 'all 0.2s',
                        backgroundColor: categoriaSeleccionada === cat.nombre ? '#e3f2fd' : 'transparent'
                      }}
                      onClick={() => {
                        setCategoriaSeleccionada(cat.nombre);
                        const params = new URLSearchParams(location.search);
                        params.set('busqueda', cat.nombre);
                        navigate({ pathname: '/publicaciones', search: `?${params.toString()}` }, { replace: true });
                      }}
                    >
                      <i className={cat.emoji} style={{ marginRight: 8 }}></i>
                      <span>{cat.nombre}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Filtro de Precio con Slider */}
            <div className="card p-3 mb-3" style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h6 className="mb-3" style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.1em' }}>
                <i className="fas fa-dollar-sign" style={{ marginRight: 8 }}></i>Rango de Precio
              </h6>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ fontSize: '0.9em', color: '#666' }}>
                    ${formatearNumero(precioRange[0])}
                  </span>
                  <span style={{ fontSize: '0.9em', color: '#666' }}>
                    ${formatearNumero(precioRange[1])}
                  </span>
                </div>
                <div 
                  data-slider="price-range"
                  style={{ position: 'relative', height: 40 }}
                >
                  {/* Track del slider */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: '#e0e2e7',
                    borderRadius: 2,
                    transform: 'translateY(-50%)'
                  }} />
                  {/* Track activo */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: `${(precioRange[0] / precioMaximo) * 100}%`,
                    right: `${100 - (precioRange[1] / precioMaximo) * 100}%`,
                    height: 4,
                    backgroundColor: '#1976d2',
                    borderRadius: 2,
                    transform: 'translateY(-50%)'
                  }} />
                  {/* Thumb mínimo */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${(precioRange[0] / precioMaximo) * 100}%`,
                      width: 20,
                      height: 20,
                      backgroundColor: '#1976d2',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(25,118,210,0.3)',
                      zIndex: 2
                    }}
                    onMouseDown={() => setIsSliderActive(true)}
                  />
                  {/* Thumb máximo */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: `${(precioRange[1] / precioMaximo) * 100}%`,
                      width: 20,
                      height: 20,
                      backgroundColor: '#1976d2',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(25,118,210,0.3)',
                      zIndex: 2
                    }}
                    onMouseDown={() => setIsSliderActive(true)}
                  />
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <small style={{ color: '#666', fontSize: '0.8em' }}>$0</small>
                  <small style={{ color: '#666', fontSize: '0.8em' }}>${formatearNumero(precioMaximo)}</small>
                </div>
              </div>
            </div>

            {/* Filtros de Condición */}
            <div className="card p-3 mb-3" style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
              <h6 className="mb-3" style={{ color: '#1976d2', fontWeight: 700, fontSize: '1.1em' }}>
                <i className="fas fa-tag" style={{ marginRight: 8 }}></i>Condición
              </h6>
              <div className="d-flex flex-column gap-2">
                <div 
                  className={`p-3 rounded border ${filtros.condicion === '' ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleFiltroChange('condicion', '')}
                >
                  <div className="d-flex align-items-center">
                    <div className={`me-3 ${filtros.condicion === '' ? 'text-primary' : 'text-muted'}`} style={{ fontSize: '1.2em' }}>
                      {filtros.condicion === '' ? '●' : '○'}
                    </div>
                    <div>
                      <div className="fw-semibold" style={{ fontSize: '1em' }}>Todas las condiciones</div>
                      <small className="text-muted">Mostrar productos nuevos y usados</small>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-3 rounded border ${filtros.condicion === 'Nuevo' ? 'border-success bg-success bg-opacity-10' : 'border-light'}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleFiltroChange('condicion', 'Nuevo')}
                >
                  <div className="d-flex align-items-center">
                    <div className={`me-3 ${filtros.condicion === 'Nuevo' ? 'text-success' : 'text-muted'}`} style={{ fontSize: '1.2em' }}>
                      {filtros.condicion === 'Nuevo' ? '●' : '○'}
                    </div>
                    <div>
                      <div className="fw-semibold" style={{ fontSize: '1em' }}>
                        <i className="fas fa-star" style={{ marginRight: 6 }}></i>Nuevo
                      </div>
                      <small className="text-muted">Solo productos sin usar</small>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-3 rounded border ${filtros.condicion === 'Usado' ? 'border-warning bg-warning bg-opacity-10' : 'border-light'}`}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={() => handleFiltroChange('condicion', 'Usado')}
                >
                  <div className="d-flex align-items-center">
                    <div className={`me-3 ${filtros.condicion === 'Usado' ? 'text-warning' : 'text-muted'}`} style={{ fontSize: '1.2em' }}>
                      {filtros.condicion === 'Usado' ? '●' : '○'}
                    </div>
                    <div>
                      <div className="fw-semibold" style={{ fontSize: '1em' }}>
                        <i className="fas fa-redo" style={{ marginRight: 6 }}></i>Usado
                      </div>
                      <small className="text-muted">Solo productos de segunda mano</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            {/* Botón limpiar filtros */}
            {(Boolean(filtros.precioMin) || Boolean(filtros.precioMax) || Boolean(filtros.condicion) || precioRange[0] > 0 || (precioMaximo > 0 && precioRange[1] < precioMaximo)) && (
              <div className="card p-3" style={{ borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <button
                  className="btn w-100"
                  onClick={limpiarFiltros}
                  style={{
                    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: '0.95em',
                    padding: '10px 16px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(231,76,60,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <i className="fas fa-trash" style={{ marginRight: 6 }}></i>Limpiar filtros
                </button>
              </div>
            )}
          </div>
          {/* Publicaciones */}
          <div className="col-lg-9">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="mb-0">Publicaciones</h4>
                <small className="text-muted">
                  Mostrando {publicacionesFiltradas.length} de {publicaciones.length} publicaciones
                  {(categoriaSeleccionada || filtros.precioMin || filtros.precioMax || filtros.condicion) && (
                    <span style={{ color: '#1976d2', fontWeight: 600, marginLeft: 8 }}>
                      (filtradas)
                    </span>
                  )}
                </small>
              </div>
              <div className="d-flex align-items-center gap-3">
                {/* Ordenamiento */}
                <div style={{ minWidth: 200 }}>
                  <select
                    className="form-select"
                    value={filtros.ordenarPor}
                    onChange={(e) => handleFiltroChange('ordenarPor', e.target.value)}
                    style={{ 
                      borderRadius: 8, 
                      border: '1px solid #e0e2e7', 
                      fontSize: '0.95em',
                      padding: '8px 12px',
                      background: '#fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <option value="fecha">Más recientes</option>
                    <option value="precio_asc">Precio: menor a mayor</option>
                    <option value="precio_desc">Precio: mayor a menor</option>
                    <option value="ofertas">Más ofertas</option>
                  </select>
                </div>
                {/* Filtro de categoría activo */}
                {categoriaSeleccionada && (
                  <span style={{ color: '#1976d2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10 }}>
                    Filtrando por: <span style={{ background: '#e3f2fd', color: '#1976d2', borderRadius: 8, padding: '2px 10px', fontWeight: 700, fontSize: '1em', marginLeft: 4 }}>{categoriaSeleccionada}</span>
                    <button
                      className="btn btn-sm ms-2"
                      style={{
                        background: '#e74c3c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        fontWeight: 600,
                        fontSize: '0.98em',
                        padding: '4px 14px',
                        boxShadow: '0 2px 8px rgba(231,76,60,0.08)',
                        transition: 'background 0.18s',
                        marginLeft: 8,
                      }}
                      onClick={() => {
                        setCategoriaSeleccionada('');
                        const params = new URLSearchParams(location.search);
                        if (params.has('busqueda')) {
                          params.delete('busqueda');
                          navigate({ pathname: '/publicaciones', search: params.toString() ? `?${params.toString()}` : '' }, { replace: true });
                        }
                      }}
                      onMouseOver={e => e.currentTarget.style.background = '#c0392b'}
                      onMouseOut={e => e.currentTarget.style.background = '#e74c3c'}
                    >
                      <span style={{ fontWeight: 700, fontSize: '1.1em', marginRight: 2 }}>×</span> Quitar filtro
                    </button>
                  </span>
                )}
              </div>
            </div>
            {loading ? (
              <div>Cargando...</div>
            ) : publicacionesFiltradas.length === 0 ? (
              <div className="alert alert-info">No hay publicaciones para esta categoría.</div>
            ) : (
              <div className="row g-4">
                {publicacionesFiltradas.slice(0, 8).map((pub, idx) => (
                  <div className="col-12 col-md-6 col-lg-4 col-xl-3" key={pub.id || idx}>
                    <div className="mt-0 card h-100 shadow-sm p-0 border-0" style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 12px rgba(90,72,246,0.06)', minHeight: 340, maxHeight: 370 }}>
                      {/* Imagen principal */}
                      {pub.imagenes && pub.imagenes.length > 0 ? (
                        <div style={{ height: 180, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          <img src={`${API_BASE_URL}${pub.imagenes[0]}`} alt={pub.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <div style={{ height: 180, background: '#f7f8fa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 32 }}>
                          <i className="fas fa-image"></i>
                        </div>
                      )}
                      <div className="p-2 d-flex flex-column justify-content-between h-100">
                        {/* Categoría y condición */}
                        <div className="d-flex align-items-center mb-1 gap-2">
                          <span className="badge bg-light text-dark border" style={{ fontWeight: 500, fontSize: '0.75em' }}>{pub.categoria || 'Sin categoría'}</span>
                          <span className={`badge ${pub.condicion === 'Nuevo' ? 'bg-success' : 'bg-secondary'}`} style={{ fontWeight: 500, fontSize: '0.75em' }}>{pub.condicion || 'Condición'}</span>
                        </div>
                        {/* Título */}
                        <h6 className="fw-bold mb-1" style={{ color: '#222', fontSize: '1em', minHeight: 28, lineHeight: 1.2 }}>{pub.titulo}</h6>
                        {/* Descripción corta */}
                        <div className="mb-1 text-truncate" style={{ fontSize: '0.92em', color: '#666', minHeight: 18 }}>{pub.descripcion}</div>
                        {/* Precio y ofertas */}
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <div style={{ fontWeight: 600, color: '#1976d2', fontSize: '0.98em' }}>
                            {pub.precioActual && pub.precioActual > 0 ? `Actual: $${formatearMonto(pub.precioActual)}` : `Inicial: $${formatearMonto(pub.precioInicial)}`}
                          </div>
                          <span className="badge bg-warning text-dark" style={{ fontSize: '0.82em' }}>{pub.ofertasTotales || 0} ofertas</span>
                        </div>
                        {/* Fecha de finalización */}
                        <div className="mb-1" style={{ fontSize: '0.85em', color: '#888' }}>
                          <i className="fas fa-clock" style={{ marginRight: 4 }}></i> {pub.fechaFin ? new Date(pub.fechaFin).toLocaleDateString() : 'Sin fecha'}
                        </div>
                        {/* Usuario */}
                        <div className="d-flex align-items-center gap-2 mt-auto pt-2 border-top" style={{ borderColor: '#ececf3' }}>
                          {pub.usuario?.fotoPerfil ? (
                            <img src={`${API_BASE_URL}${pub.usuario.fotoPerfil}`} alt={pub.usuario.username} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ececf3' }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#ececf3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 15 }}>
                              <i className="fas fa-user"></i>
                            </div>
                          )}
                          <div className="d-flex flex-column" style={{ fontSize: '0.90em' }}>
                            <span className="fw-semibold">{pub.usuario?.nombre || pub.usuario?.username || 'Usuario'}</span>
                            <span style={{ color: '#888', fontSize: '0.85em' }}>{[pub.usuario?.ciudad, pub.usuario?.pais].filter(Boolean).join(', ')}</span>
                          </div>
                        </div>
                        {/* Botón de ver detalles */}
                        <div className="d-grid mt-2">
                          <button className="btn" style={{ borderRadius: 8, fontWeight: 500, background: '#1976d2', color: '#fff', fontSize: '0.97em', padding: '0.45em 0.5em' }} onClick={() => navigate(`/publicaciones/${pub.id}`)}>Ver detalles</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default TodasPublicaciones; 