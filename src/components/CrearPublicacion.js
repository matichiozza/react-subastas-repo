import React, { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import API_BASE_URL from '../config/api';
import './CrearPublicacion.css';

const pasos = [
  { label: 'Datos Básicos', icon: 'fas fa-edit' },
  { label: 'Detalles', icon: 'fas fa-file-alt' },
  { label: 'Imagen y Precio', icon: 'fas fa-dollar-sign' },
  { label: 'Confirmar', icon: 'fas fa-check' },
];

const categorias = [
  'ELECTRONICA',
  'COMPUTACION',
  'TELEFONOS',
  'HOGAR',
  'MUEBLES',
  'COCINA',
  'MODA',
  'CALZADO',
  'ACCESORIOS',
  'JOYERIA',
  'DEPORTES',
  'AIRE_LIBRE',
  'VEHICULOS',
  'HERRAMIENTAS',
  'JUGUETES',
  'BEBES',
  'MASCOTAS',
  'LIBROS',
  'MUSICA',
  'ARTE',
].sort((a, b) => a.localeCompare(b));

const CrearPublicacion = ({ onPublicacionCreada }) => {
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  
  const [form, setForm] = useState({
    titulo: '',
    categoria: '',
    condicion: '',
    descripcion: '',
    imagenes: [],
    precioInicial: '',
    incrementoMinimo: '',
    fechaFin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const [procesandoPublicacion, setProcesandoPublicacion] = useState(false);
  const [pasoProcesamiento, setPasoProcesamiento] = useState(1);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef();

  // Función para obtener la fecha mínima (mañana)
  const getFechaMinima = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  // Función para validar fecha
  const validarFecha = (fecha) => {
    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fechaSeleccionada > hoy;
  };

  // Función para formatear números con separadores de miles
  const formatearNumero = (valor) => {
    if (!valor) return '';
    return valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Función para limpiar formato de números
  const limpiarFormato = (valor) => {
    return valor.toString().replace(/\./g, '');
  };

  // Función para manejar cambio de precio con formato
  const handlePrecioChange = (campo, valor) => {
    const valorLimpio = limpiarFormato(valor);
    
    if (valorLimpio === '' || /^\d+$/.test(valorLimpio)) {
      setForm(prev => ({
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'fechaFin') {
      if (value && !validarFecha(value)) {
        setError('La fecha de finalización debe ser posterior al día actual');
        return;
      } else {
        setError(null);
      }
    }
    
    setForm({ ...form, [name]: value });
  };

  const handleImagenesChange = (e) => {
    const files = Array.from(e.target.files);
    if (form.imagenes.length + files.length > 5) {
      alert('Solo puedes subir hasta 5 imágenes.');
      return;
    }
    const nuevasImagenes = [...form.imagenes, ...files].slice(0, 5);
    setForm(f => ({ ...f, imagenes: nuevasImagenes }));
    
    const nuevasPreviews = [...imagenesPreview];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        nuevasPreviews.push(reader.result);
        if (nuevasPreviews.length === nuevasImagenes.length) {
          setImagenesPreview([...nuevasPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
    if (files.length === 0) setImagenesPreview([...nuevasPreviews]);
  };

  const handleEliminarImagen = idx => {
    const nuevasImagenes = form.imagenes.filter((_, i) => i !== idx);
    setForm(f => ({ ...f, imagenes: nuevasImagenes }));
    const nuevasPreviews = imagenesPreview.filter((_, i) => i !== idx);
    setImagenesPreview(nuevasPreviews);
  };

  // Funciones para drag and drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const nuevasImagenes = [...form.imagenes];
    const nuevasPreviews = [...imagenesPreview];
    
    // Mover imagen
    const imagenMovida = nuevasImagenes[draggedIndex];
    const previewMovido = nuevasPreviews[draggedIndex];
    
    nuevasImagenes.splice(draggedIndex, 1);
    nuevasPreviews.splice(draggedIndex, 1);
    
    nuevasImagenes.splice(dropIndex, 0, imagenMovida);
    nuevasPreviews.splice(dropIndex, 0, previewMovido);
    
    setForm(f => ({ ...f, imagenes: nuevasImagenes }));
    setImagenesPreview(nuevasPreviews);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const nextStep = () => setStep(s => Math.min(s + 1, pasos.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcesandoPublicacion(true);
    setPasoProcesamiento(1);
    setError(null);
    setSuccess(false);
    
    try {
      const formData = new FormData();
      const publicacionData = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        categoria: form.categoria,
        condicion: form.condicion,
        precioInicial: parseFloat(form.precioInicial),
        incrementoMinimo: parseFloat(form.incrementoMinimo),
        fechaFin: form.fechaFin,
      };
      formData.append('publicacion', new Blob([JSON.stringify(publicacionData)], { type: 'application/json' }));
      form.imagenes.forEach((img, idx) => {
        formData.append('imagenes', img);
      });
      
      const res = await fetch(`${API_BASE_URL}/publicaciones`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!res.ok) throw new Error('Error al crear la publicación');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setPasoProcesamiento(2);
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSuccess(true);
      setForm({
        titulo: '', categoria: '', condicion: '', descripcion: '', imagenes: [], precioInicial: '', incrementoMinimo: '', fechaFin: '',
      });
      setImagenesPreview([]);
      setStep(0);
      setProcesandoPublicacion(false);
      if (onPublicacionCreada) onPublicacionCreada();
      
      setTimeout(() => {
        navigate('/');
      }, 500);
    } catch (err) {
      setError(err.message);
      setProcesandoPublicacion(false);
    }
  };

  // Validaciones simples por paso
  const validStep = () => {
    if (step === 0) return form.titulo && form.categoria;
    if (step === 1) return form.condicion && form.descripcion;
    if (step === 2) {
      const fechaValida = form.fechaFin && validarFecha(form.fechaFin);
      return form.imagenes.length > 0 && form.precioInicial && form.incrementoMinimo && form.fechaFin && fechaValida;
    }
    return true;
  };

  // Componente de vista previa
  const VistaPrevia = () => (
    <div className="vista-previa-container">
      <div className="vista-previa-header">
        <div className="vista-previa-title">
          <div className="vista-previa-icon">
            <i className="fas fa-eye"></i>
          </div>
          <h3>Vista Previa</h3>
        </div>
      </div>
      
      <div className="vista-previa-content">
        {!form.titulo ? (
          <div className="vista-previa-empty">
            <div className="empty-icon">
              <i className="fas fa-edit"></i>
            </div>
            <h4>Comienza a crear tu publicación</h4>
            <p>Los datos que ingreses aparecerán aquí en tiempo real</p>
          </div>
        ) : (
          <div className="publicacion-preview">
            {/* Imágenes */}
            <div className="preview-imagenes">
              {imagenesPreview.length > 0 ? (
                <div className="preview-imagen-principal">
                  <img src={imagenesPreview[0]} alt="Principal" />
                  {imagenesPreview.length > 1 && (
                    <div className="preview-imagenes-miniaturas">
                      {imagenesPreview.slice(1, 4).map((img, idx) => (
                        <img key={idx} src={img} alt={`Miniatura ${idx + 1}`} />
                      ))}
                      {imagenesPreview.length > 4 && (
                        <div className="preview-imagen-extra">
                          +{imagenesPreview.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="preview-imagen-placeholder">
                  <div className="placeholder-icon">
                    <i className="fas fa-camera"></i>
                  </div>
                  <p>Sin imágenes</p>
                </div>
              )}
            </div>

            {/* Información del producto */}
            <div className="preview-info">
              <div className="preview-categoria">
                {form.categoria ? form.categoria.replace(/_/g, ' ').toLowerCase() : 'Sin categoría'}
              </div>
              
              <h2 className="preview-titulo">
                {form.titulo || 'Título de la publicación'}
              </h2>
              
              {form.condicion && (
                <div className="preview-condicion">
                  <span className={`condicion-badge ${form.condicion.toLowerCase()}`}>
                    {form.condicion}
                  </span>
                </div>
              )}
              
              <div className="preview-descripcion">
                {form.descripcion || 'Descripción del producto...'}
              </div>
              
              <div className="preview-precios">
                <div className="preview-precio-inicial">
                  <span className="precio-label">Precio inicial:</span>
                  <span className="precio-valor">
                    ${formatearPrecioMostrar(form.precioInicial) || '0'}
                  </span>
                </div>
                
                {form.incrementoMinimo && (
                  <div className="preview-incremento">
                    <span className="incremento-label">Incremento mínimo:</span>
                    <span className="incremento-valor">
                      ${formatearPrecioMostrar(form.incrementoMinimo)}
                    </span>
                  </div>
                )}
              </div>
              
              {form.fechaFin && (
                <div className="preview-fecha">
                  <span className="fecha-label">Finaliza:</span>
                  <span className="fecha-valor">
                    {new Date(form.fechaFin).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <div className="crear-publicacion-container">
        <div className="crear-publicacion-content">
                     {/* Modal izquierdo - Formulario */}
           <div className="formulario-container">
             {/* Título del formulario */}
             <div className="formulario-header">
               <h3>Crear Publicación</h3>
               <div className="formulario-badge">
                 Nueva subasta
               </div>
             </div>
             
             <div className="formulario-card">
               {/* Indicador de pasos */}
              <div className="pasos-indicador">
                {pasos.map((p, idx) => (
                  <div key={p.label} className={`paso-item ${idx <= step ? 'activo' : ''}`}>
                    <div className="paso-icono"><i className={p.icon}></i></div>
                    <div className="paso-label">{p.label}</div>
                  </div>
                ))}
                <div className="pasos-linea-progreso">
                  <div 
                    className="pasos-linea-activa" 
                    style={{ width: `${((step + 1) / pasos.length) * 100}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="formulario">
                {/* Paso 1: Datos básicos */}
                {step === 0 && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Título <span className="required">*</span></label>
                      <input 
                        type="text" 
                        name="titulo" 
                        className="form-control" 
                        placeholder="Ej: Zapatillas Nike Air Max" 
                        value={form.titulo} 
                        onChange={handleChange} 
                        required 
                      />
                      <small className="form-help">Elige un título claro y atractivo para tu publicación.</small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Categoría <span className="required">*</span></label>
                      <select name="categoria" className="form-select" value={form.categoria} onChange={handleChange} required>
                        <option value="">Selecciona una categoría</option>
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>
                            {cat.replace(/_/g, ' ').charAt(0) + cat.replace(/_/g, ' ').slice(1).toLowerCase()}
                          </option>
                        ))}
                      </select>
                      <small className="form-help">¿A qué categoría pertenece tu producto?</small>
                    </div>
                  </>
                )}

                {/* Paso 2: Detalles */}
                {step === 1 && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Condición <span className="required">*</span></label>
                      <select name="condicion" className="form-select" value={form.condicion} onChange={handleChange} required>
                        <option value="">Selecciona una opción</option>
                        <option value="Nuevo">Nuevo</option>
                        <option value="Usado">Usado</option>
                      </select>
                      <small className="form-help">¿El producto es nuevo o usado?</small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Descripción <span className="required">*</span></label>
                      <textarea 
                        name="descripcion" 
                        className="form-control" 
                        placeholder="Describe tu producto, estado, detalles relevantes..." 
                        value={form.descripcion} 
                        onChange={handleChange} 
                        required 
                        rows={3} 
                      />
                      <small className="form-help">Agrega detalles que ayuden a los compradores a decidirse.</small>
                    </div>
                  </>
                )}

                {/* Paso 3: Imagen y precio */}
                {step === 2 && (
                  <>
                                         <div className="form-group">
                       <label className="form-label">Imágenes <span className="required">*</span></label>
                                               <div className={`imagenes-preview ${draggedIndex !== null ? 'dragging' : ''}`}>
                          {imagenesPreview.map((img, idx) => {
                            let dragClass = '';
                            if (draggedIndex === idx) {
                              dragClass = 'dragging';
                            } else if (dragOverIndex === idx && draggedIndex !== null) {
                              dragClass = draggedIndex < idx ? 'drag-over' : 'drag-over-left';
                            }
                            
                            return (
                              <div 
                                key={idx} 
                                className={`imagen-preview-item ${dragClass}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={(e) => handleDrop(e, idx)}
                                onDragEnd={handleDragEnd}
                              >
                                <img src={img} alt={`preview-${idx}`} />
                                <div className="imagen-preview-overlay">
                                  <div className="imagen-preview-number">{idx + 1}</div>
                                  <button 
                                    type="button" 
                                    onClick={() => handleEliminarImagen(idx)}
                                    className="eliminar-imagen-btn"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                          {form.imagenes.length < 5 && (
                            <button 
                              type="button" 
                              className="agregar-imagen-btn"
                              onClick={() => fileInputRef.current.click()}
                            >
                              <span className="agregar-icon">+</span>
                              <span className="agregar-text">Agregar</span>
                            </button>
                          )}
                        </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        ref={fileInputRef}
                        onChange={handleImagenesChange}
                        disabled={form.imagenes.length >= 5}
                      />
                      <small className="form-help">Puedes subir hasta 5 imágenes. Arrastra o haz clic para seleccionar.</small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Precio Inicial <span className="required">*</span></label>
                      <input 
                        type="text" 
                        name="precioInicial" 
                        className="form-control" 
                        placeholder="$1.000" 
                        value={formatearPrecioMostrar(form.precioInicial)} 
                        onChange={(e) => handlePrecioChange('precioInicial', e.target.value)} 
                        required 
                      />
                      <small className="form-help">Precio inicial de la subasta</small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Incremento Mínimo <span className="required">*</span></label>
                      <input 
                        type="text" 
                        name="incrementoMinimo" 
                        className="form-control" 
                        placeholder="$100" 
                        value={formatearPrecioMostrar(form.incrementoMinimo)} 
                        onChange={(e) => handlePrecioChange('incrementoMinimo', e.target.value)} 
                        required 
                      />
                      <small className="form-help">Monto mínimo que debe incrementar cada oferta</small>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Fecha de Finalización <span className="required">*</span></label>
                      <input 
                        type="date" 
                        name="fechaFin" 
                        className={`form-control ${form.fechaFin && !validarFecha(form.fechaFin) ? 'is-invalid' : ''}`}
                        value={form.fechaFin} 
                        onChange={handleChange} 
                        min={getFechaMinima()}
                        required 
                      />
                      <small className="form-help">La fecha debe ser posterior al día actual.</small>
                      {form.fechaFin && !validarFecha(form.fechaFin) && (
                        <div className="invalid-feedback">
                          La fecha de finalización debe ser posterior al día actual.
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Paso 4: Confirmación */}
                {step === 3 && (
                  <>
                    <div className="confirmacion-container">
                      <div className="alert alert-info">
                        <strong>Revisa tu publicación antes de confirmar:</strong>
                      </div>
                      <ul className="resumen-lista">
                        <li><strong>Título:</strong> {form.titulo}</li>
                        <li><strong>Categoría:</strong> {form.categoria}</li>
                        <li><strong>Condición:</strong> {form.condicion}</li>
                        <li><strong>Descripción:</strong> {form.descripcion}</li>
                        <li><strong>Imágenes:</strong> {form.imagenes.length} seleccionada(s)</li>
                        <li><strong>Precio Inicial:</strong> ${formatearPrecioMostrar(form.precioInicial)}</li>
                        <li><strong>Incremento Mínimo:</strong> ${formatearPrecioMostrar(form.incrementoMinimo)}</li>
                        <li><strong>Fecha de Finalización:</strong> {form.fechaFin}</li>
                      </ul>
                      <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle" style={{ marginRight: 8 }}></i> Una vez creada la publicación, no podrás modificar algunos datos clave.
                      </div>
                    </div>
                    
                    <div className="form-actions">
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        onClick={prevStep}
                      >
                        <i className="fas fa-arrow-left" style={{ marginRight: 8 }}></i>
                        Anterior
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={procesandoPublicacion}
                      >
                        {procesandoPublicacion ? (
                          <>
                            <i className="fas fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
                            Procesando...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-check" style={{ marginRight: 8 }}></i>
                            Confirmar y Publicar
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
                
                {/* Botones de navegación para otros pasos */}
                {step !== 3 && (
                  <>
                    {error && <div className="alert alert-danger">{error}</div>}
                    {success && <div className="alert alert-success">¡Publicación creada con éxito!</div>}
                    <div className="form-actions">
                      {step > 0 && (
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={prevStep}
                        >
                          <i className="fas fa-arrow-left" style={{ marginRight: 8 }}></i>
                          Anterior
                        </button>
                      )}
                      {step < pasos.length - 1 && (
                        <button 
                          type="button" 
                          className="btn btn-primary" 
                          onClick={nextStep} 
                          disabled={!validStep()}
                        >
                          <i className="fas fa-arrow-right" style={{ marginRight: 8 }}></i>
                          Siguiente
                        </button>
                      )}
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>

          {/* Modal derecho - Vista previa */}
          <VistaPrevia />
        </div>
      </div>
      
      {/* Pantalla de procesamiento de publicación */}
      {procesandoPublicacion && (
        <div className="procesamiento-pago">
          <div className="procesamiento-contenido">
            <div className={`procesamiento-icono ${pasoProcesamiento === 1 ? 'procesando' : 'confirmado'}`}>
              {pasoProcesamiento === 1 ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>}
            </div>
            <div className="procesamiento-titulo">
              {pasoProcesamiento === 1 ? 'Creando publicación...' : '¡Publicación creada!'}
            </div>
            <div className="procesamiento-subtitulo">
              {pasoProcesamiento === 1 
                ? 'Estamos procesando tu publicación y subiendo las imágenes'
                : 'Tu publicación ha sido creada exitosamente'
              }
            </div>
            {pasoProcesamiento === 1 && (
              <div className="procesamiento-progreso">
                <div className="procesamiento-barra"></div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default CrearPublicacion; 