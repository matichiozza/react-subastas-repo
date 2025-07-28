import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const DetallePublicacion = () => {
  const { id } = useParams();
  const { token, user } = useContext(AuthContext);
  const [publicacion, setPublicacion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [oferta, setOferta] = useState('');
  const [ofertaFormateada, setOfertaFormateada] = useState('');
  const [ofertando, setOfertando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [imgSeleccionada, setImgSeleccionada] = useState(0);
  const navigate = useNavigate();
  const stompClientRef = useRef(null);
  const [zoom, setZoom] = useState({ visible: false, x: 0, y: 0 });
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const imgContainerRef = useRef(null);
  // Estado para el modal y método de pago
  const [showModal, setShowModal] = useState(false);
  const [modalClosing, setModalClosing] = useState(false);
  const [tarjetaSeleccionada, setTarjetaSeleccionada] = useState(null);
  
  // Estados para las tarjetas del usuario
  const [tarjetasUsuario, setTarjetasUsuario] = useState([]);
  const [loadingTarjetas, setLoadingTarjetas] = useState(false);
  const [errorTarjetas, setErrorTarjetas] = useState(null);
  
  // Estados para el modal de agregar tarjeta
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
  
  // Estado para la oferta anterior del usuario
  const [ofertaAnterior, setOfertaAnterior] = useState(null);
  const [loadingOfertaAnterior, setLoadingOfertaAnterior] = useState(false);
  const fetchingOfertaAnterior = useRef(false);
  
  // Estado para el valor de oferta en el modal
  const [ofertaModal, setOfertaModal] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pasoPago, setPasoPago] = useState(1); // 1: procesando, 2: confirmado
  const [showModalBajarse, setShowModalBajarse] = useState(false);
  const [procesandoBajarse, setProcesandoBajarse] = useState(false);

  // Funciones para cargar datos
  const fetchPublicacion = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8080/publicaciones/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error('No se pudo cargar la publicación');
      setPublicacion(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfertas = async () => {
    try {
      const res = await fetch(`http://localhost:8080/publicaciones/${id}/ofertas`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json().catch(() => null);
      setOfertas(data);
    } catch {
      setOfertas([]);
    }
  };

  useEffect(() => {
    fetchPublicacion();
  }, [id, token]);

  // Cargar tarjetas del usuario
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchTarjetas = async () => {
      setLoadingTarjetas(true);
      setErrorTarjetas(null);
      try {
        const res = await fetch(`http://localhost:8080/tarjetas/usuario/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Error al cargar las tarjetas');
        const data = await res.json();
        setTarjetasUsuario(data);
        // Seleccionar la primera tarjeta por defecto si hay tarjetas
        if (data.length > 0 && !tarjetaSeleccionada) {
          setTarjetaSeleccionada(data[0].id);
        }
      } catch (err) {
        setErrorTarjetas('No se pudieron cargar las tarjetas');
      } finally {
        setLoadingTarjetas(false);
      }
    };
    
    fetchTarjetas();
  }, [user?.id, token]);

  // Cargar oferta anterior del usuario
  useEffect(() => {
    if (!user?.id || !id || !token || !showModal || fetchingOfertaAnterior.current) return;
    
    const fetchOfertaAnterior = async () => {
      fetchingOfertaAnterior.current = true;
      setLoadingOfertaAnterior(true);
      try {
        const res = await fetch(`http://localhost:8080/publicaciones/${id}/ofertas/usuario/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOfertaAnterior(data);
        } else if (res.status === 404) {
          // No hay oferta anterior
          setOfertaAnterior(null);
        } else {
          setOfertaAnterior(null);
        }
      } catch (err) {
        console.error('Error al cargar oferta anterior:', err);
        setOfertaAnterior(null);
      } finally {
        setLoadingOfertaAnterior(false);
        fetchingOfertaAnterior.current = false;
      }
    };
    
    fetchOfertaAnterior();
  }, [user?.id, id, token, showModal]);

  // Actualizar el valor de oferta en el modal cuando se abra
  useEffect(() => {
    if (showModal) {
      setOfertaModal(oferta);
    }
  }, [showModal, oferta]);

  useEffect(() => {
    fetchOfertas();
  }, [id, mensaje, token]); // Refresca historial tras ofertar

  useEffect(() => {
    // Conexión WebSocket solo cuando hay id
    if (!id) return;
    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe(`/topic/publicacion.${id}`, (msg) => {
          const data = JSON.parse(msg.body);
          setPublicacion(data.publicacionActualizada);
          setOfertas(data.ofertas);
        });
      },
    });
    stompClient.activate();
    stompClientRef.current = stompClient;
    return () => {
      stompClient.deactivate();
    };
  }, [id]);

  if (loading) return <div className="container py-5 text-center">Cargando...</div>;
  if (error) return <div className="container py-5 text-center text-danger">{error}</div>;
  if (!publicacion) return <div className="container py-5 text-center">No encontrada</div>;

  const incremento = publicacion.incrementoMinimo || 1;
  const precioActual = publicacion.precioActual && publicacion.precioActual > 0 ? publicacion.precioActual : publicacion.precioInicial;
  const siguienteOferta = precioActual + incremento;

  // Modificar handleOfertar para que solo envíe si viene del modal
  const handleOfertar = async (e, desdeModal = false) => {
    e.preventDefault();
    if (!desdeModal) {
      setShowModal(true);
      return;
    }
    setOfertando(true);
    setMensaje(null);
    try {
      const monto = parseFloat(oferta);
      if (isNaN(monto) || monto < siguienteOferta) {
        setMensaje(`La oferta debe ser al menos $${siguienteOferta}`);
        setOfertando(false);
        return;
      }
      const res = await fetch(`http://localhost:8080/publicaciones/ofertas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ publicacionId: publicacion.id, monto }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'No se pudo realizar la oferta');
      }
      const data = await res.json();
      setMensaje('¡Oferta realizada con éxito!');
      setOferta('');
      setOfertaFormateada('');
      setPublicacion(data.publicacionActualizada);
      setOfertas(data.ofertas);
      setShowModal(false);
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setOfertando(false);
    }
  };

  const handleCloseModal = () => {
    setModalClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setModalClosing(false);
      fetchingOfertaAnterior.current = false;
      setProcesandoPago(false);
      setPasoPago(1);
    }, 220); // igual a la duración de la animación
  };

  // Verificar si el usuario ya ofertó en esta publicación
  const usuarioYaOferto = ofertas.some(oferta => oferta.usuario?.id === user?.id);

  const handleOfertaChange = (e) => {
    const valor = e.target.value;
    // Remover todos los caracteres no numéricos
    const soloNumeros = valor.replace(/\D/g, '');
    
    // Actualizar el valor numérico para cálculos
    setOferta(soloNumeros);
    
    // Formatear para mostrar al usuario
    if (soloNumeros) {
      const formateado = parseFloat(soloNumeros).toLocaleString('es-AR');
      setOfertaFormateada(formateado);
    } else {
      setOfertaFormateada('');
    }
  };

  // Funciones para incrementar y decrementar el valor de la oferta
  const incrementarOferta = () => {
    const valorActual = parseFloat(oferta) || siguienteOferta;
    const nuevoValor = valorActual + 1000; // Incremento de $1.000
    setOferta(nuevoValor.toString());
    setOfertaFormateada(nuevoValor.toLocaleString('es-AR'));
  };

  const decrementarOferta = () => {
    const valorActual = parseFloat(oferta) || siguienteOferta;
    const nuevoValor = Math.max(siguienteOferta, valorActual - 1000); // Decremento de $1.000, pero no menor al mínimo
    setOferta(nuevoValor.toString());
    setOfertaFormateada(nuevoValor.toLocaleString('es-AR'));
  };

  const handleBajarseDeSubasta = async () => {
    if (!user?.id) return;
    
    setProcesandoBajarse(true);
    try {
      const res = await fetch(`http://localhost:8080/publicaciones/${publicacion.id}/ofertas/usuario/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('No se pudo procesar la solicitud');
      }

      // Recargar los datos
      await fetchOfertas();
      await fetchPublicacion();
      setShowModalBajarse(false);
      setMensaje('Te has bajado de la subasta. Has perdido tu seña.');
      
    } catch (err) {
      setMensaje(err.message);
    } finally {
      setProcesandoBajarse(false);
    }
  };

  const handleConfirmarOferta = async () => {
    if (!tarjetaSeleccionada) {
      alert('Por favor selecciona una tarjeta para continuar');
      return;
    }

    setProcesandoPago(true);
    setPasoPago(1);

    // Simular procesamiento de pago
    setTimeout(async () => {
      try {
        const monto = parseFloat(ofertaModal);
        if (isNaN(monto) || monto < siguienteOferta) {
          setMensaje(`La oferta debe ser al menos $${siguienteOferta}`);
          setProcesandoPago(false);
          return;
        }

        const res = await fetch(`http://localhost:8080/publicaciones/ofertas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ publicacionId: publicacion.id, monto }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || 'No se pudo realizar la oferta');
        }

        const data = await res.json();
        
        // Simular confirmación de pago
        setPasoPago(2);
        setTimeout(() => {
          setMensaje('¡Oferta realizada con éxito!');
          setOferta('');
          setOfertaFormateada('');
          setPublicacion(data.publicacionActualizada);
          setOfertas(data.ofertas);
          setShowModal(false);
          setProcesandoPago(false);
          setPasoPago(1);
        }, 2000);

      } catch (err) {
        setMensaje(err.message);
        setProcesandoPago(false);
        setPasoPago(1);
      }
    }, 4000); // Simular 4 segundos de procesamiento
  };

  // Funciones para manejar tarjetas
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
    } else if (!/^\d{7,8}$/.test(formTarjeta.dniTitular)) {
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
      processedValue = value.replace(/\D/g, '').slice(0, 16);
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
      processedValue = value.replace(/\D/g, '').slice(0, 8);
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
    setErrorTarjetas(null);
    try {
      const res = await fetch('http://localhost:8080/tarjetas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formTarjeta,
          usuario: { id: user.id }
        }),
      });
      
      if (!res.ok) throw new Error('Error al guardar la tarjeta');
      
      const nuevaTarjeta = await res.json();
      setTarjetasUsuario(prev => [...prev, nuevaTarjeta]);
      setTarjetaSeleccionada(nuevaTarjeta.id);
      setSuccessTarjeta(true);
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        handleCerrarModalTarjeta();
      }, 1500);
      
    } catch (err) {
      setErrorTarjetas('No se pudo guardar la tarjeta');
    } finally {
      setLoadingTarjeta(false);
    }
  };

  const handleAbrirModalAgregar = () => {
    setShowModalTarjeta(true);
    setSuccessTarjeta(false);
    setErrorTarjetas(null);
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
    setSuccessTarjeta(false);
  };

  // Breadcrumb
  const breadcrumb = (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb" style={{ background: 'none', padding: 0, marginBottom: 0 }}>
        <li className="breadcrumb-item"><span style={{ cursor: 'pointer', color: '#1976d2' }} onClick={() => navigate('/publicaciones')}>Publicaciones</span></li>
        <li className="breadcrumb-item active" aria-current="page">{publicacion.categoria || 'Sin categoría'}</li>
      </ol>
    </nav>
  );

  // Función para formatear montos con separador de miles
  function formatearMonto(valor) {
    if (isNaN(valor)) return valor;
    return Number(valor).toLocaleString('es-AR');
  }

  // Calcular la seña a pagar (diferencia si ya ofertó antes)
  function calcularSenaAPagar(montoOferta) {
    if (!ofertaAnterior || !montoOferta) {
      // Primera oferta o sin oferta: paga 10% completo
      return parseFloat(montoOferta || 0) * 0.10;
    } else {
      // Oferta posterior: paga solo la diferencia de seña
      const señaAnterior = parseFloat(ofertaAnterior.monto) * 0.10;
      const señaNueva = parseFloat(montoOferta) * 0.10;
      const diferencia = señaNueva - señaAnterior;
      return Math.max(0, diferencia); // No puede ser negativo
    }
  }

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <div className="mb-2">{breadcrumb}</div>
      <div className="row">
        {/* Miniaturas verticales */}
        <div className="col-md-1 d-none d-md-flex flex-column align-items-center gap-2" style={{ minWidth: 60 }}>
          {publicacion.imagenes && publicacion.imagenes.length > 0 && publicacion.imagenes.map((img, idx) => (
            <img
              key={img}
              src={`http://localhost:8080${img}`}
              alt={`Miniatura ${idx + 1}`}
              onMouseEnter={() => setImgSeleccionada(idx)}
              style={{
                width: 48,
                height: 48,
                objectFit: 'cover',
                borderRadius: 8,
                border: imgSeleccionada === idx ? '2px solid #5a48f6' : '2px solid #ececf3',
                cursor: 'pointer',
                boxShadow: imgSeleccionada === idx ? '0 2px 8px rgba(90,72,246,0.10)' : 'none',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}
            />
          ))}
        </div>
        {/* Imagen principal y descripción */}
        <div className="col-lg-6 mb-4 col-md-7">
          <div
            className="card p-3 mb-3 mt-0 position-relative"
            style={{ borderRadius: 16, minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}
            ref={imgContainerRef}
          >
            {/* Icono de lupa en la esquina superior derecha */}
            <button
              type="button"
              aria-label={zoomEnabled ? 'Desactivar lupa' : 'Activar lupa'}
              onClick={() => {
                setZoomEnabled(z => !z);
                setZoom(z => ({ ...z, visible: false }));
              }}
              style={{
                position: 'absolute',
                top: 12,
                right: 16,
                zIndex: 99,
                background: zoomEnabled ? 'rgba(25,118,210,0.95)' : 'rgba(255,255,255,0.92)',
                color: zoomEnabled ? '#fff' : '#1976d2',
                border: '2px solid #1976d2',
                borderRadius: '50%',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(25,118,210,0.18)',
                cursor: 'pointer',
                transition: 'background 0.2s, color 0.2s',
                fontSize: 16,
              }}
            >
              {zoomEnabled ? (
                <span style={{ fontSize: 18, fontWeight: 700, lineHeight: 1 }}>×</span>
              ) : (
                <span style={{ fontSize: 16, lineHeight: 1 }}>🔍</span>
              )}
            </button>
            {publicacion.imagenes && publicacion.imagenes.length > 0 ? (
              <div
                style={{ position: 'relative', display: 'inline-block' }}
                onMouseMove={e => {
                  if (!zoomEnabled) return;
                  const rect = imgContainerRef.current.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  setZoom({ visible: true, x, y });
                }}
                onMouseLeave={() => setZoom(z => ({ ...z, visible: false }))}
                className={zoom.visible && zoomEnabled ? 'lupa-activa' : ''}
              >
                <img
                  src={`http://localhost:8080${publicacion.imagenes[imgSeleccionada]}`}
                  alt={`Imagen ${imgSeleccionada + 1}`}
                  className="img-fluid"
                  style={{ maxHeight: 340, objectFit: 'contain', borderRadius: 12, maxWidth: '100%', display: 'block' }}
                />
                {/* Lupa de zoom */}
                {zoomEnabled && zoom.visible && (
                  <div
                    style={{
                      position: 'absolute',
                      pointerEvents: 'none',
                      left: zoom.x - 90,
                      top: zoom.y - 90,
                      width: 180,
                      height: 180,
                      borderRadius: '50%',
                      border: '2.5px solid #1976d2',
                      boxShadow: '0 4px 16px rgba(25,118,210,0.18)',
                      backgroundImage: `url(http://localhost:8080${publicacion.imagenes[imgSeleccionada]})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '320% 320%',
                      backgroundPosition: `${((zoom.x / rectWidth(imgContainerRef)) * 100).toFixed(2)}% ${((zoom.y / rectHeight(imgContainerRef)) * 100).toFixed(2)}%`,
                      zIndex: 10,
                      borderColor: '#1976d2',
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="d-flex align-items-center justify-content-center" style={{ height: 220, color: '#bbb', fontSize: 48 }}>
                <span role="img" aria-label="sin imagen">🖼️</span>
              </div>
            )}
          </div>
          {/* Descripción en tarjeta sutil */}
          <div style={{ border: '1px solid #ececf3', borderRadius: 12, background: '#fff', padding: '1.1em 1.3em', marginTop: 8, marginBottom: 0 }}>
            <div style={{ fontSize: '1.05em', color: '#444', lineHeight: 1.7, fontWeight: 400 }}>{publicacion.descripcion}</div>
          </div>
        </div>
        {/* Datos y formulario + historial de ofertas */}
        <div className="col-lg-5">
          <div className="card p-4 mb-4 mt-0" style={{ borderRadius: 16 }}>
            <div className="d-flex align-items-center mb-3 gap-3">
              {publicacion.usuario?.fotoPerfil ? (
                <img src={`http://localhost:8080${publicacion.usuario.fotoPerfil}`} alt={publicacion.usuario.username} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid #ececf3' }} />
              ) : (
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#ececf3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 24 }}>
                  <span role="img" aria-label="user">👤</span>
                </div>
              )}
              <div>
                <div className="fw-bold" style={{ fontSize: '1.1em' }}>{publicacion.usuario?.nombre || publicacion.usuario?.username || 'Usuario'}</div>
                <div style={{ color: '#888', fontSize: '0.95em' }}>{[publicacion.usuario?.ciudad, publicacion.usuario?.pais].filter(Boolean).join(', ')}</div>
              </div>
              <span className={`badge ${publicacion.estado === 'ACTIVO' ? 'bg-primary' : 'bg-secondary'}`} style={{ fontSize: '0.95em', marginLeft: 'auto' }}>{publicacion.estado}</span>
            </div>
            <h3 className="fw-bold mb-2" style={{ color: '#1976d2' }}>{publicacion.titulo}</h3>
            <div className="mb-2">
              <span className="badge bg-light text-dark border me-2" style={{ fontWeight: 500, fontSize: '0.95em', background: '#e3f2fd', color: '#1976d2' }}>{publicacion.categoria || 'Sin categoría'}</span>
              <span className={`badge ${publicacion.condicion === 'Nuevo' ? 'bg-success' : 'bg-secondary'}`} style={{ fontWeight: 500, fontSize: '0.95em' }}>{publicacion.condicion || 'Condición'}</span>
            </div>
            <div className="mb-2">
              <div style={{ marginBottom: '4px' }}>
                <span style={{ fontWeight: 600, color: '#1976d2', fontSize: '1.15em' }}>Precio actual: ${formatearMonto(precioActual)}</span>
                <span className="ms-3" style={{ color: '#1565c0', fontSize: '0.98em' }}>Incremento mínimo: ${formatearMonto(incremento)}</span>
              </div>
              <div style={{ color: '#666', fontSize: '0.95em' }}>
                <span role="img" aria-label="base">📊</span> Precio base: ${formatearMonto(publicacion.precioInicial)}
              </div>
            </div>
            <div className="mb-2" style={{ color: '#222', fontSize: '1.05em' }}>
              <span role="img" aria-label="fin">⏰</span> Finaliza: {publicacion.fechaFin ? new Date(publicacion.fechaFin).toLocaleString() : 'Sin fecha'}
            </div>
            <div className="mb-2" style={{ color: '#222', fontSize: '1.05em' }}>
              <span role="img" aria-label="ofertas">💸</span> Ofertas totales: {ofertas.length}
            </div>
            {/* Formulario de oferta */}
            {publicacion.estado === 'ACTIVO' ? (
              <div className="mt-3">
                {usuarioYaOferto ? (
                  <div>
                    <div className="alert alert-warning mb-3" style={{ fontSize: '0.95em', border: '1px solid #ffeaa7', background: '#fff3cd' }}>
                      <div style={{ fontWeight: 600, color: '#856404', marginBottom: '8px' }}>
                        ⚠️ Ya has ofertado en esta subasta
                      </div>
                      <div style={{ color: '#856404', fontSize: '0.9em' }}>
                        Tu oferta más alta: ${formatearMonto(ofertas.filter(o => o.usuario?.id === user?.id).sort((a, b) => b.monto - a.monto)[0]?.monto || 0)}
                      </div>
                    </div>
                    
                    {/* Opción para hacer nueva oferta */}
                    <div className="mb-3">
                      <form onSubmit={e => handleOfertar(e, false)}>
                        <div className="input-group mb-2">
                          <span className="input-group-text">$</span>
                          <input
                            type="text"
                            className="form-control"
                            value={ofertaFormateada}
                            onChange={handleOfertaChange}
                            placeholder={`Mínimo $${formatearMonto(siguienteOferta)}`}
                            required
                            disabled={!user || ofertando}
                          />
                          <div className="input-group-append" style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={incrementarOferta}
                              disabled={!user || ofertando}
                              style={{ 
                                borderTopRightRadius: 0, 
                                borderBottomRightRadius: 0,
                                padding: '0.375rem 0.25rem',
                                fontSize: '0.75rem',
                                color: '#6c757d',
                                borderRight: 'none',
                                minWidth: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: '1',
                                height: '100%',
                                transform: 'none'
                              }}
                              title="Incrementar en $1.000"
                            >
                              ▲
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={decrementarOferta}
                              disabled={!user || ofertando}
                              style={{ 
                                borderTopLeftRadius: 0, 
                                borderBottomLeftRadius: 0,
                                padding: '0.375rem 0.25rem',
                                fontSize: '0.75rem',
                                color: '#6c757d',
                                minWidth: '28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                lineHeight: '1',
                                height: '100%',
                                transform: 'none'
                              }}
                              title="Decrementar en $1.000"
                            >
                              ▼
                            </button>
                          </div>
                          <button className="btn btn-primary" type="submit" disabled={!user || ofertando} style={{ fontWeight: 600, minWidth: 110 }}>
                            {ofertando ? 'Ofertando...' : '💰 Hacer nueva oferta'}
                          </button>
                        </div>
                        <div className="text-muted small" style={{ fontSize: '0.85em' }}>
                          💡 Solo pagarás la diferencia en seña
                        </div>
                        {!user && <div className="text-danger small">Debes iniciar sesión para ofertar.</div>}
                        {mensaje && <div className={`mt-2 ${mensaje.includes('éxito') ? 'text-success' : 'text-danger'}`}>{mensaje}</div>}
                      </form>
                    </div>
                    
                    {/* Opción para bajarse */}
                    <div style={{ borderTop: '1px solid #ffeaa7', paddingTop: 12 }}>
                      <button 
                        className="btn btn-outline-danger w-100" 
                        onClick={() => setShowModalBajarse(true)}
                        style={{ fontWeight: 600, fontSize: '0.95em' }}
                      >
                        🚪 Bajarse de la subasta
                      </button>
                      <div className="text-muted small mt-2" style={{ fontSize: '0.85em' }}>
                        ⚠️ Al bajarte perderás toda tu seña sin reembolso
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={e => handleOfertar(e, false)}>
                    <div className="input-group mb-2">
                      <span className="input-group-text">$</span>
                      <input
                        type="text"
                        className="form-control"
                        value={ofertaFormateada}
                        onChange={handleOfertaChange}
                        placeholder={`Mínimo $${formatearMonto(siguienteOferta)}`}
                        required
                        disabled={!user || ofertando}
                      />
                      <div className="input-group-append" style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={incrementarOferta}
                          disabled={!user || ofertando}
                          style={{ 
                            borderTopRightRadius: 0, 
                            borderBottomRightRadius: 0,
                            padding: '0.375rem 0.25rem',
                            fontSize: '0.75rem',
                            color: '#6c757d',
                            borderRight: 'none',
                            minWidth: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: '1',
                            height: '100%',
                            transform: 'none'
                          }}
                          title="Incrementar en $1.000"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={decrementarOferta}
                          disabled={!user || ofertando}
                          style={{ 
                            borderTopLeftRadius: 0, 
                            borderBottomLeftRadius: 0,
                            padding: '0.375rem 0.25rem',
                            fontSize: '0.75rem',
                            color: '#6c757d',
                            minWidth: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: '1',
                            height: '100%',
                            transform: 'none'
                          }}
                          title="Decrementar en $1.000"
                        >
                          ▼
                        </button>
                      </div>
                      <button className="btn btn-primary" type="submit" disabled={!user || ofertando} style={{ fontWeight: 600, minWidth: 110 }}>
                        {ofertando ? 'Ofertando...' : 'Ofertar'}
                      </button>
                    </div>
                    {!user && <div className="text-danger small">Debes iniciar sesión para ofertar.</div>}
                    {mensaje && <div className={`mt-2 ${mensaje.includes('éxito') ? 'text-success' : 'text-danger'}`}>{mensaje}</div>}
                  </form>
                )}
              </div>
            ) : (
              <div className="alert alert-info mt-3">La subasta no está activa.</div>
            )}
          </div>
          {/* Historial de ofertas debajo de la tarjeta de datos */}
          <div className="card p-3 mt-0" style={{ borderRadius: 14 }}>
            <h5 className="fw-bold mb-3" style={{ color: '#1976d2' }}>Historial de ofertas</h5>
            {ofertas.length === 0 ? (
              <div className="text-muted">No hay ofertas aún.</div>
            ) : (
              <ul className="list-group list-group-flush">
                {ofertas
                  .slice()
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .map((of) => {
                    let fecha = '';
                    let hora = '';
                    if (of.fecha) {
                      const d = new Date(of.fecha);
                      if (!isNaN(d)) {
                        fecha = d.toLocaleDateString();
                        hora = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      } else {
                        fecha = of.fecha;
                      }
                    }
                    return (
                      <li
                        key={of.id}
                        className="list-group-item px-3 py-3"
                        style={{ background: 'none', border: 'none', borderBottom: '1px solid #ececf3' }}
                      >
                        <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ rowGap: 6 }}>
                          <span className="fw-semibold" style={{ color: '#1976d2', fontSize: '1.04em', maxWidth: '60vw', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{of.usuario?.nombre || of.usuario?.username || 'Usuario'}</span>
                          <span style={{ fontWeight: 600, color: '#1976d2', fontSize: '1.13em', minWidth: 80, textAlign: 'right' }}>${formatearMonto(of.monto)}</span>
                        </div>
                        <div className="mt-1" style={{ color: '#888', fontSize: '0.97em', letterSpacing: 0.2 }}>
                          {fecha} {hora && <span style={{ marginLeft: 10 }}>{hora}</span>}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </div>
      {(showModal || modalClosing) && (
        <div className={`modal-overlay${modalClosing ? ' modal-overlay-out' : ''}`} onClick={handleCloseModal}>
          <div className={`modal-content${modalClosing ? ' modal-out' : ''}`} onClick={e => e.stopPropagation()}>
            <h2>Confirmar oferta</h2>
            <div className="modal-flex-row">
              {/* Desglose */}
              <div className="modal-desglose mb-3" style={{ width: '100%', margin: '0 auto', textAlign: 'left' }}>
                <div className="modal-desglose-title">Desglose de pago</div>
                
                {/* Información de oferta anterior si existe */}
                {ofertaAnterior && (
                  <div style={{ 
                    background: '#fff3cd', 
                    border: '1px solid #ffeaa7', 
                    borderRadius: 8, 
                    padding: '12px', 
                    marginBottom: '12px',
                    fontSize: '0.95em'
                  }}>
                    <div style={{ fontWeight: 600, color: '#856404', marginBottom: '4px' }}>
                      📋 Oferta anterior: ${formatearMonto(ofertaAnterior.monto)}
                    </div>
                    <div style={{ color: '#856404' }}>
                      Ya pagaste seña de: ${formatearMonto((parseFloat(ofertaAnterior.monto) * 0.10).toFixed(2))}
                    </div>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
                  <span>Monto ofertado:</span>
                  <span>${formatearMonto(ofertaModal)}</span>
                </div>
                
                {ofertaAnterior ? (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b26a00', fontWeight: 500, marginTop: 2 }}>
                      <span>Seña nueva (10%):</span>
                      <span>${formatearMonto((parseFloat(ofertaModal) * 0.10).toFixed(2))}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc3545', fontWeight: 500, marginTop: 2 }}>
                      <span>Seña ya pagada:</span>
                      <span>-${formatearMonto((parseFloat(ofertaAnterior.monto) * 0.10).toFixed(2))}</span>
                    </div>
                    <div style={{ borderTop: '1.5px solid #ececf3', margin: '10px 0 0 0', paddingTop: 7, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#28a745' }}>
                      <span>Diferencia a pagar:</span>
                      <span>${formatearMonto(calcularSenaAPagar(ofertaModal).toFixed(2))}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#b26a00', fontWeight: 500, marginTop: 2 }}>
                      <span>Seña (10%):</span>
                      <span>${formatearMonto((parseFloat(ofertaModal) * 0.10).toFixed(2))}</span>
                    </div>
                    <div style={{ borderTop: '1.5px solid #ececf3', margin: '10px 0 0 0', paddingTop: 7, display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1976d2' }}>
                      <span>Total a pagar ahora:</span>
                      <span>${formatearMonto((parseFloat(ofertaModal) * 0.10).toFixed(2))}</span>
                    </div>
                  </>
                )}
                
                <div style={{ fontSize: '0.97em', color: '#888', marginTop: 2 }}>
                  {ofertaAnterior 
                    ? 'Solo pagarás la diferencia de seña. Si ganas la subasta, coordinarás el pago del resto con el vendedor.'
                    : 'Solo abonarás la seña ahora. Si ganas la subasta, coordinarás el pago del resto con el vendedor.'
                  }
                </div>
              </div>
              {/* Selector de tarjetas */}
              <div className="modal-metodo mb-2" style={{ width: '100%', margin: '0 auto', textAlign: 'left' }}>
                <div className="modal-metodo-title">Selecciona una tarjeta para la seña:</div>
                {loadingTarjetas ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Cargando tarjetas...
                  </div>
                ) : errorTarjetas ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#dc3545' }}>
                    {errorTarjetas}
                  </div>
                ) : tarjetasUsuario.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ color: '#666', marginBottom: '15px' }}>
                      No tienes tarjetas guardadas. Agrega una para continuar.
                    </div>
                    <button 
                      className="btn btn-primary" 
                      onClick={handleAbrirModalAgregar}
                      style={{ borderRadius: 8, fontWeight: 600 }}
                    >
                      + Agregar tarjeta
                    </button>
                  </div>
                ) : (
                  <div className="tarjetas-lista" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tarjetasUsuario.map(t => (
                      <div
                        key={t.id}
                        className={`tarjeta-item${tarjetaSeleccionada === t.id ? ' seleccionada' : ''}`}
                        style={{
                          border: tarjetaSeleccionada === t.id ? '2.5px solid #1976d2' : '1.5px solid #e0e2e7',
                          borderRadius: 10,
                          padding: '0.8em 1.1em',
                          background: '#f7f8fa',
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          boxShadow: tarjetaSeleccionada === t.id ? '0 2px 12px rgba(25,118,210,0.10)' : 'none',
                          transition: 'border 0.2s, box-shadow 0.2s',
                          gap: 12,
                        }}
                        onClick={() => setTarjetaSeleccionada(t.id)}
                      >
                        <span style={{ fontSize: 22 }}>💳</span>
                        <span style={{ fontWeight: 600, fontSize: '1.08em', color: '#1976d2', marginRight: 8 }}>
                          {t.numero.slice(-4).startsWith('4') ? 'Visa' : 'Mastercard'}
                        </span>
                        <span style={{ color: '#888', fontSize: '1em', marginRight: 8 }}>
                          •••• {t.numero.slice(-4)}
                        </span>
                        <span style={{ color: '#888', fontSize: '0.97em' }}>{t.nombreCompleto}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Advertencia */}
            <div className="modal-warning">
              <p>⚠️ <b>Advertencia:</b> Las ofertas son <b>vinculantes</b>. No podrás cancelar ni modificar tu oferta una vez enviada.</p>
              <p>Si ganas la subasta, deberás cumplir con el pago y coordinar la entrega.</p>
            </div>
            {/* Acciones */}
            <div className="modal-actions">
              <button className="btn btn-primary" style={{ minWidth: 120 }} onClick={handleConfirmarOferta} disabled={ofertando || !tarjetaSeleccionada || procesandoPago}>Confirmar oferta</button>
              <button className="btn btn-secondary" style={{ minWidth: 120, marginLeft: 12 }} onClick={handleCloseModal} disabled={ofertando || procesandoPago}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
      
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
                      <span style={{ marginRight: 8 }}>🔐</span>Código de seguridad
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
                <div className="alert alert-danger mt-3" style={{ fontSize: '0.95em' }}>{errorTarjetas}</div>
              )}
              
              {successTarjeta && (
                <div className="alert alert-success mt-3" style={{ fontSize: '0.95em' }}>¡Tarjeta agregada exitosamente!</div>
              )}
              
              <div className="modal-actions">
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={loadingTarjeta}
                  style={{ minWidth: 120, fontWeight: 600 }}
                >
                  {loadingTarjeta ? 'Guardando...' : 'Guardar tarjeta'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCerrarModalTarjeta}
                  disabled={loadingTarjeta}
                  style={{ minWidth: 120, marginLeft: 12 }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pantalla de procesamiento de pago */}
      {procesandoPago && (
        <div className="procesamiento-pago">
          <div className="procesamiento-contenido">
            <div className={`procesamiento-icono ${pasoPago === 1 ? 'procesando' : 'confirmado'}`}>
              {pasoPago === 1 ? '💳' : '✅'}
            </div>
            <div className="procesamiento-titulo">
              {pasoPago === 1 ? 'Procesando pago...' : '¡Pago confirmado!'}
            </div>
            <div className="procesamiento-subtitulo">
              {pasoPago === 1 
                ? 'Estamos procesando tu seña de $' + formatearMonto(calcularSenaAPagar(ofertaModal).toFixed(2))
                : 'Tu oferta ha sido registrada exitosamente'
              }
            </div>
            {pasoPago === 1 && (
              <div className="procesamiento-progreso">
                <div className="procesamiento-barra"></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de confirmación para bajarse de la subasta */}
      {showModalBajarse && (
        <div className="modal-overlay" onClick={() => setShowModalBajarse(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 500, width: '95vw' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🚪</div>
              <h2 style={{ color: '#dc3545', fontWeight: 800, margin: 0 }}>Bajarse de la subasta</h2>
              <p style={{ color: '#666', margin: '12px 0 0 0', fontSize: '1.05em' }}>¿Estás seguro de que quieres bajarte?</p>
            </div>
            
            <div className="alert alert-danger" style={{ fontSize: '0.95em', border: '1px solid #f5c6cb', background: '#f8d7da' }}>
              <div style={{ fontWeight: 600, color: '#721c24', marginBottom: '8px' }}>
                ⚠️ ADVERTENCIA IMPORTANTE
              </div>
              <div style={{ color: '#721c24', fontSize: '0.9em' }}>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Todas tus ofertas serán eliminadas</li>
                  <li>Perderás <strong>TODA</strong> tu seña sin reembolso</li>
                  <li>No podrás volver a ofertar en esta subasta</li>
                  <li>Esta acción es <strong>IRREVERSIBLE</strong></li>
                </ul>
              </div>
            </div>

            <div style={{ background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 8, padding: '12px', marginBottom: '20px', fontSize: '0.95em' }}>
              <div style={{ fontWeight: 600, color: '#856404', marginBottom: '4px' }}>
                📊 Resumen de tu participación:
              </div>
              <div style={{ color: '#856404' }}>
                <div>• Ofertas realizadas: {ofertas.filter(o => o.usuario?.id === user?.id).length}</div>
                <div>• Seña total pagada: ${formatearMonto((ofertas.filter(o => o.usuario?.id === user?.id).sort((a, b) => b.monto - a.monto)[0]?.monto * 0.10 || 0).toFixed(2))}</div>
                <div>• Oferta más alta: ${formatearMonto(ofertas.filter(o => o.usuario?.id === user?.id).sort((a, b) => b.monto - a.monto)[0]?.monto || 0)}</div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-danger" 
                onClick={handleBajarseDeSubasta}
                disabled={procesandoBajarse}
                style={{ minWidth: 120, fontWeight: 600 }}
              >
                {procesandoBajarse ? 'Procesando...' : 'Sí, bajarme'}
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowModalBajarse(false)}
                disabled={procesandoBajarse}
                style={{ minWidth: 120, marginLeft: 12 }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helpers para obtener el tamaño del contenedor de la imagen
function rectWidth(ref) {
  return ref.current ? ref.current.offsetWidth : 1;
}
function rectHeight(ref) {
  return ref.current ? ref.current.offsetHeight : 1;
}

// CSS para ocultar el cursor cuando la lupa está activa y estilos para las flechas
const style = document.createElement('style');
style.innerHTML = `
  .lupa-activa { cursor: none !important; }
  
  .input-group-append .btn {
    padding: 0.375rem 0.25rem;
    font-size: 0.75rem;
    line-height: 1;
    border-radius: 0;
    transition: all 0.15s ease-in-out;
    min-width: 28px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fa;
    border-color: #ced4da;
    color: #6c757d;
    position: relative;
    vertical-align: middle;
    font-weight: 600;
    flex: 1;
  }
  
  .input-group-append .btn:hover {
    background-color: #e9ecef;
    border-color: #adb5bd;
    color: #495057;
  }
  
  .input-group-append .btn:active {
    background-color: #dee2e6;
    border-color: #adb5bd;
    transform: scale(0.95);
  }
  
  .input-group-append .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f8f9fa;
  }
  
  .input-group-append .btn:first-child {
    border-right: 1px solid #ced4da;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
  
  .input-group-append .btn:last-child {
    border-left: 1px solid #ced4da;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  
  .input-group-append {
    display: flex !important;
    flex-direction: row !important;
    align-items: stretch !important;
  }
`;
document.head.appendChild(style);

export default DetallePublicacion; 